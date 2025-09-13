import Session from "./Session.js";
import Patient from "./Patient.js";
import { findSymptomFuzzy } from "./findSymptom.js";
// import { createCalendarEvent } from "./googleCalendar.js";

export function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("Patient connected:", socket.id);

        socket.on("start", async () => {
            console.log("New conversation started:", socket.id);
            io.to(socket.id).emit("typing", true);
            setTimeout(() => {
                io.to(socket.id).emit("typing", false);
                io.to(socket.id).emit("assistantMessage", "Hi! I’m your digital assistant. What is your name?");
            }, 1000);

            await Session.create({
                socketId: socket.id,
                step: "collectingDetails",
                data: { name: "", email: "", symptom: "", responses: {} },
            });
        });

        socket.on("patientMessage", async (msg) => {
            console.log(`[${socket.id}] Patient said:`, msg);
            const session = await Session.findOne({ socketId: socket.id });
            if (!session) return;

            // Step 1: Collect name + email
            if (session.step === "collectingDetails") {
                if (!session.data.name) {
                    session.data.name = msg;
                    await session.save();
                    console.log("Name saved:", session.data.name);
                    io.to(socket.id).emit("assistantMessage", "Thanks! Can you also share your email?");
                    return;
                } else if (!session.data.email) {
                    session.data.email = msg;
                    session.step = "symptom";
                    await session.save();
                    console.log("Email saved:", session.data.email);
                    io.to(socket.id).emit("assistantMessage", "Great! What symptom are you facing?");
                    return;
                }
            }

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
                        console.log("📥 Final conversation pushed to DB:", session);
                        await Session.deleteOne({ socketId: socket.id });
                        io.to(socket.id).emit(
                            "assistantMessage",
                            "Sorry, no follow-up questions available."
                        );
                        return;
                    }

                    await session.save();

                    // Emit first message **only once**
                    io.to(socket.id).emit(
                        "assistantMessage",
                        `Let's start with ${session.currentCategory[0].replace("_", " ")} questions.`
                    );

                    // Emit the first question and remove it from the array
                    const firstQuestion = session.questions.shift();
                    if (firstQuestion) {
                        io.to(socket.id).emit("assistantMessage", firstQuestion);
                        await session.save(); // save updated questions array
                    }

                } else {
                    io.to(socket.id).emit(
                        "assistantMessage",
                        "Sorry, I don’t have follow-up questions for this symptom yet."
                    );
                    session.step = "done";
                    await session.save();
                    await Patient.create(session.data);
                    await Session.deleteOne({ socketId: socket.id });
                }

                return;
            }


            // Step 3: Follow-up questions
            if (session.step === "followups") {
                const [category] = session.currentCategory;
                if (!session.data.responses[category]) session.data.responses[category] = [];
                session.data.responses[category].push(msg);

                if (session.questions.length > 0) {
                    io.to(socket.id).emit("assistantMessage", session.questions.shift());
                    await session.save();
                    return;
                }

                if (session.categories.length > 0) {
                    session.currentCategory = session.categories.shift();
                    session.questions = [...session.currentCategory[1]];
                    io.to(socket.id).emit("assistantMessage", `Now, ${session.currentCategory[0]}:`);
                    io.to(socket.id).emit("assistantMessage", session.questions.shift());
                    await session.save();
                    return;
                }

                // All follow-ups collected
                session.step = "completed";
                await Patient.create(session.data);
                await Session.deleteOne({ socketId: socket.id });

                //Send Notification to Doctor in WhatsApp
                // try {
                //     const whatsappEvent = await sendWhatsAppMessage('+917864822328', "Hello I'm Doctor Assistant!");
                //     console.log("whatsappEvent", whatsappEvent)
                //     io.to(socket.id).emit("appointmentNotified", { msg: "I've notified doctor and will soon share calender event." });
                // } catch (err) {
                //     console.error("WhatsApp Notification error:", err.message);
                //     io.to(socket.id).emit("assistantMessage", "Appointment saved but could not sent notification to Doctor. Please wait while I try Agian!");
                // }

                // Schedule event 1 hour later
                // const start = new Date(Date.now() + 3600000);
                // const end = new Date(start.getTime() + 15 * 60000);

                // try {
                //     const event = await createCalendarEvent({
                //         summary: `Appointment: ${session.data.name}`,
                //         description: `Symptom: ${session.data.symptom}`,
                //         startDateTime: start.toISOString(),
                //         endDateTime: end.toISOString(),
                //         // attendees: [session.data.email],
                //     });

                //     io.to(socket.id).emit("appointmentScheduled", { link: event.htmlLink });
                // } catch (err) {
                //     console.error("Calendar event error:", err.message);
                //     io.to(socket.id).emit("assistantMessage", "Appointment saved but could not add to calendar.");
                // }
            }

        });

        socket.on("disconnect", async () => {
            console.log("Patient disconnected:", socket.id);
            await Session.deleteOne({ socketId: socket.id });
        });
    });
}