import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: String,
    symptom: String,
    responses: { type: Object, default: {} },
    step: String,
    categories: Array,
    currentCategory: Array,
    questions: Array,
    socketId: String
}, { timestamps: true });

const Patient = mongoose.model("patients", patientSchema);
export default Patient;