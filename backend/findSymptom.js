import fs from "fs";
import path from "path";
import stringSimilarity from "string-similarity";

const filePath = path.join(process.cwd(), "symptomRules.json");

function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

export async function findSymptomFuzzy(input) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const symptoms = data.map(r => r.symptom).filter(Boolean).map(normalize);
    if (!symptoms.length) return null;
    const normalizedInput = normalize(input);
    const { bestMatch } = stringSimilarity.findBestMatch(normalizedInput, symptoms);
    if (bestMatch.rating >= 0.2) {
        return data.find(r => normalize(r.symptom) === bestMatch.target);
    }
    return null;
}

// import SymptomRule from "./SymptomRule.js";
// import stringSimilarity from "string-similarity";

// function normalize(str) {
//     if (!str) return "";
//     return str.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "");
// }

// export async function findSymptomFuzzy(input) {
//     const rules = await SymptomRule.find({});
//     console.log("Fetched rules:", rules);

//     if (!rules.length) return null;

//     // Normalize symptoms from DB
//     const normalizedSymptoms = rules.map(r => normalize(r.symptom));
//     const normalizedInput = normalize(input);

//     console.log("Normalized input:", normalizedInput);
//     console.log("Normalized symptoms:", normalizedSymptoms);

//     const { bestMatch } = stringSimilarity.findBestMatch(normalizedInput, normalizedSymptoms);

//     console.log("Best match:", bestMatch);

//     if (bestMatch.rating >= 0.2) {
//         // Find the original rule corresponding to the normalized best match
//         return rules.find(r => normalize(r.symptom) === bestMatch.target);
//     }

//     return null;
// }