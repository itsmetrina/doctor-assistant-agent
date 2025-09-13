import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
const MODEL = process.env.HUGGINGFACE_MODEL;

if (!HF_API_KEY) throw new Error("HUGGING_FACE_API_KEY not set in environment variables!");
if (!MODEL) throw new Error("HUGGINGFACE_MODEL not set in environment variables!");

export async function askHuggingFace(userMessage, datasetQuestions) {
    const prompt = `
You are Dr. AI Assistant, a friendly and professional doctor's assistant.
Your goal is to guide the patient through a medical intake conversation.

Rules:
- Ask follow-up questions in a natural, conversational way.
- ONLY use the dataset below. Do not invent new medical questions.
- Acknowledge patient’s answer briefly before asking the next question.
- Keep responses short and clear, like a real doctor’s assistant.

Dataset questions:
${datasetQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

The patient just said: "${userMessage}"

Dr. AI Assistant:
`;

    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: { max_new_tokens: 150, temperature: 0.4 },
            }),
        });
        console.log("Hugging Face response status:", response);

        // Most text-generation models return JSON array
        const data = await response.json().catch(() => null);

        if (!data) {
            console.error("Hugging Face response could not be parsed as JSON");
            return datasetQuestions[0] || "I'm sorry, I couldn’t process that.";
        }

        if (data.error) {
            console.error("HF API error:", data.error);
            return datasetQuestions[0] || "I'm sorry, I couldn’t process that.";
        }

        // data could be [{ generated_text: "..." }]
        const generatedText = data[0]?.generated_text || data.generated_text;

        if (!generatedText) {
            console.error("HF API returned no text:", data);
            return datasetQuestions[0] || "I'm sorry, I couldn’t process that.";
        }

        // Remove the prompt from the response if included
        const reply = generatedText.replace(prompt, "").trim();

        return reply || datasetQuestions[0] || "I'm sorry, I couldn’t process that.";

    } catch (err) {
        console.error("Hugging Face request failed:", err.message);
        return datasetQuestions[0] || "I'm sorry, I couldn’t process that.";
    }
}