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