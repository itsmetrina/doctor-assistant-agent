import mongoose from "mongoose";

const symptomRuleSchema = new mongoose.Schema({
    symptom: { type: String, required: true },
    follow_up_questions: { type: Object, default: {} },
    severity: { type: String, default: null }
}, { timestamps: true });

const SymptomRule = mongoose.model("SymptomRule", symptomRuleSchema, "symptomrules"); 
export default SymptomRule;