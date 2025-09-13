import { google } from "googleapis";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const KEYFILEPATH = path.join(process.cwd(), "doctor-assistant.json");
const CALENDAR_ID = process.env.CALENDAR_ID;

console.log("Using calendar ID:", CALENDAR_ID);
if (!CALENDAR_ID) throw new Error("CALENDAR_ID is missing in .env");

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

export async function createCalendarEvent({ summary, description, startDateTime, endDateTime }) {
    try {
        const event = {
            summary,
            description,
            start: { dateTime: startDateTime },
            end: { dateTime: endDateTime },
            // No attendees
        };

        const response = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        console.log("Event created:", response.data.htmlLink);
        return response.data;
    } catch (err) {
        console.error("Error creating calendar event:", err);
        throw err;
    }
}