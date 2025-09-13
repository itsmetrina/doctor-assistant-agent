import Session from "./Session.js";
import Patient from "./Patient.js";
import { findSymptomFuzzy } from "./findSymptom.js";
import { createCalendarEvent } from "./calender.js";
import { askHuggingFace } from "./huggingface.js";
import { sendWhatsApp } from "./whatsapp.js";

export function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("Patient connected:", socket.id);

        // Start new conversation
        socket.on("start", async () => {
            console.log("New conversation started:", socket.id);
            io.to(socket.id).emit("typing", true);
            setTimeout(() => {
                io.to(socket.id).emit("typing", false);
                io.to(socket.id).emit("assistantMessage", "Hi! I’m Dr. AI Assistant. What’s your name?");
            }, 1000);

            await Session.create({
                socketId: socket.id,
                step: "collectingDetails",
                data: { name: "", email: "", symptom: "", responses: {} },
            });
        });

        // Patient messages
        socket.on("patientMessage", async (msg) => {
            console.log(`[${socket.id}] Patient said:`, msg);
            const session = await Session.findOne({ socketId: socket.id });
            if (!session) return;

            // 🔹 Step 1: Collect name + email
            if (session.step === "collectingDetails") {
                if (!session.data.name) {
                    session.data.name = msg;
                    await session.save();
                    console.log("Name saved:", session.data.name);

                    const nextQuestion = `Thanks, ${session.data.name}. Could you also share your email so I can keep your records safe?`;
                    const reply = await askHuggingFace(msg, [nextQuestion]).catch(() => nextQuestion);
                    io.to(socket.id).emit("assistantMessage", reply);
                    return;
                } else if (!session.data.email) {
                    session.data.email = msg;
                    session.step = "symptom";
                    await session.save();
                    console.log("Email saved:", session.data.email);

                    const nextQuestion = "Great. Can you tell me what symptom you’re experiencing right now?";
                    const reply = await askHuggingFace(msg, [nextQuestion]).catch(() => nextQuestion);
                    io.to(socket.id).emit("assistantMessage", reply);
                    return;
                }
            }

            // 🔹 Step 2: Collect symptom and prepare follow-ups
            if (session.step === "symptom") {
                session.data.symptom = msg;
                console.log("Symptom recorded:", session.data.symptom);

                const rule = await findSymptomFuzzy(msg);

                if (rule) {
                    session.step = "followups";
                    session.categories = Object.entries(rule.follow_up_questions);

                    if (session.categories.length > 0) {
                        session.currentCategory = session.categories.shift();
                        session.questions = [...session.currentCategory[1]];
                    } else {
                        session.step = "done";
                        await session.save();
                        await Patient.create(session.data);
                        await Session.deleteOne({ socketId: socket.id });

                        const reply = await askHuggingFace(
                            msg,
                            ["I don’t have follow-up questions for this symptom yet, but I’ll save your record."]
                        ).catch(() => "I don’t have follow-up questions for this symptom yet, but I’ll save your record.");
                        io.to(socket.id).emit("assistantMessage", reply);

                        // Notify conversation ended
                        io.to(socket.id).emit("conversationEnded", "Thank you for chatting! You will be redirected shortly.");
                        return;
                    }

                    await session.save();

                    // First follow-up question
                    const firstQuestion = session.questions.shift();
                    const reply = await askHuggingFace(msg, [firstQuestion]).catch(() => firstQuestion);
                    io.to(socket.id).emit(
                        "assistantMessage",
                        `Let’s start with some questions about ${session.currentCategory[0].replace("_", " ")}.`
                    );
                    io.to(socket.id).emit("assistantMessage", reply);
                    await session.save();
                } else {
                    session.step = "done";
                    await session.save();
                    await Patient.create(session.data);
                    await Session.deleteOne({ socketId: socket.id });

                    const reply = await askHuggingFace(
                        msg,
                        ["I don’t have follow-up questions for this symptom yet, but I’ll save your record."]
                    ).catch(() => "I don’t have follow-up questions for this symptom yet, but I’ll save your record.");
                    io.to(socket.id).emit("assistantMessage", reply);

                    io.to(socket.id).emit("conversationEnded", "Thank you for chatting! You will be redirected shortly.");
                }
                return;
            }

            // 🔹 Step 3: Follow-up questions
            if (session.step === "followups") {
                const [category] = session.currentCategory;
                if (!session.data.responses[category]) session.data.responses[category] = [];
                session.data.responses[category].push(msg);

                // More questions in this category
                if (session.questions.length > 0) {
                    const nextQuestion = session.questions[0]; // peek
                    const reply = await askHuggingFace(msg, [nextQuestion]).catch(() => nextQuestion);
                    io.to(socket.id).emit("assistantMessage", reply);

                    session.questions.shift(); // remove after asking
                    await session.save();
                    return;
                }

                // Move to next category
                if (session.categories.length > 0) {
                    session.currentCategory = session.categories.shift();
                    session.questions = [...session.currentCategory[1]];

                    const nextQuestion = session.questions[0];
                    const reply = await askHuggingFace(msg, [nextQuestion]).catch(() => nextQuestion);
                    io.to(socket.id).emit(
                        "assistantMessage",
                        `Now, let’s talk about ${session.currentCategory[0].replace("_", " ")}.`
                    );
                    io.to(socket.id).emit("assistantMessage", reply);

                    session.questions.shift();
                    await session.save();
                    return;
                }

                // ✅ All follow-ups done
                session.step = "completed";
                await Patient.create(session.data);
                await Session.deleteOne({ socketId: socket.id });

                // 🔹 Send WhatsApp notification BEFORE creating calendar event
                try {
                    const doctorWhatsApp = "whatsapp:+917864822328";
                    await sendWhatsApp(
                        doctorWhatsApp,
                        `New patient info:\nName: ${session.data.name}\nSymptom: ${session.data.symptom}\nTime: ${new Date().toLocaleString()}`
                    );
                    console.log("WhatsApp notification sent to doctor.");
                    // Emit event to frontend
                    io.to(socket.id).emit(
                        "assistantMessage",
                        "Doctor has been notified via WhatsApp about your details."
                    );
                } catch (err) {
                    console.error("Failed to send WhatsApp notification:", err.message);
                    io.to(socket.id).emit(
                        "assistantMessage",
                        "Failed to notify the doctor via WhatsApp."
                    );
                }

                // Auto-schedule appointment 1 hour later
                const start = new Date(Date.now() + 3600000);
                const end = new Date(start.getTime() + 15 * 60000);

                try {
                    const event = await createCalendarEvent({
                        summary: `Appointment: ${session.data.name}`,
                        description: `Symptom: ${session.data.symptom}`,
                        startDateTime: start.toISOString(),
                        endDateTime: end.toISOString(),
                    });

                    io.to(socket.id).emit("appointmentScheduled", { link: event.htmlLink });
                    io.to(socket.id).emit(
                        "assistantMessage",
                        "I’ve scheduled your appointment and added it to the doctor’s calendar."
                    );
                } catch (err) {
                    console.error("Calendar event error:", err.message);
                    io.to(socket.id).emit(
                        "assistantMessage",
                        "Your details were saved, but I couldn’t schedule the calendar event."
                    );
                }

                // 🔹 Notify conversation ended
                io.to(socket.id).emit(
                    "conversationEnded",
                    "Thank you for chatting! You will be redirected to the home page."
                );
            }
        });

        // Handle disconnect
        socket.on("disconnect", async () => {
            console.log("Patient disconnected:", socket.id);
            await Session.deleteOne({ socketId: socket.id });
        });
    });
}