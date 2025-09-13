import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    socketId: { type: String, required: true },
    step: { type: String, default: "collectingDetails" },
    data: {
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        symptom: { type: String, default: "" },
        responses: { type: Object, default: {} },
    },
    categories: { type: Array, default: [] },
    currentCategory: { type: Array, default: [] },
    questions: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model("sessions", sessionSchema);

export default Session