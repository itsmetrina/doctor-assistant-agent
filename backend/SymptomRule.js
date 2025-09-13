import mongoose from "mongoose";

const symptomRuleSchema = new mongoose.Schema({
  symptom: { type: String, required: true },
  follow_up_questions: { type: Object, required: true },
  severity: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const SymptomRule = mongoose.model("SymptomRule", symptomRuleSchema, "symptomrules");
export default SymptomRule;