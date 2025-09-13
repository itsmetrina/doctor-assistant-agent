Here’s an updated **README** for your project with all the latest changes, including WhatsApp notifications and conversation flow improvements:

---

# 🩺 Tricog Doctor’s AI Assistant

An AI-powered digital assistant that helps *cardiologists* manage patient consults efficiently by collecting structured symptom data, asking follow-up questions from a medical rule database, sending notifications, and scheduling appointments automatically.

This project was built for *Chhalaang 4.0 Hackathon (Final Round)* 🚀.

---

## 🌟 Features

* 💬 **Chat-based interface for patients** (React)
* 🗂 **Symptom Rule DB** → structured follow-up questions
* 📝 **Collects & stores patient details** (name, email, symptoms, answers)
* 📲 **Sends WhatsApp notification** to the cardiologist when a new patient starts a consult
* 📅 **Creates a Google Calendar appointment** for the doctor
* 🔐 **Responsible AI design** → LLM used for conversational flow only (not for medical inference)
* 🔄 **Conversation flow end** → redirects patient back to home page with a summary message

---

## 🛠 Tech Stack

* **Frontend:** React + Socket.io
* **Backend:** Node.js + Express + Socket.io
* **Database:** MongoDB (Symptom Rule DB + patient data + session tracking)
* **AI:** Hugging Face GPT (for chat flow), Questions strictly from rule DB
* **Integrations:** Twilio WhatsApp API, Google Calendar API

---

## ⚡ Features Flow

1. Patient opens the assistant and starts a chat.
2. The assistant collects **name, email, and symptom**.
3. Based on the symptom, the assistant asks **structured follow-up questions** from the rule DB.
4. **WhatsApp notification** is sent to the cardiologist with patient info.
5. Once the consultation data is collected, a **Google Calendar appointment** is automatically scheduled.
6. The **chat ends**, and the patient is redirected to the home page with a thank-you message.

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/itsmetrina/doctor-assistant-agent.git
cd doctor-assistant-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables (`.env`)

```env
MONGO_URI=your_mongodb_uri
CALENDAR_ID=your_google_calendar_id
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### 4. Google Service Account

* Download `doctor-assistant.json` from your Google Cloud project
* Give the service account **edit access** to your Google Calendar

### 5. Run the app

```bash
npm run dev
```

---

## 🤖 Usage

* Open the frontend in your browser
* Click **Start Now**
* Chat with the assistant step by step
* After the session ends, you'll see a confirmation message and appointment link

---

## 📚 Folder Structure

```
backend/
  ├─ Patient.js
  ├─ Session.js
  ├─ socketHandler.js  # Main Socket.io logic
  ├─ calender.js       # Google Calendar API integration
  ├─ whatsapp.js       # Twilio WhatsApp notifications
  └─ findSymptom.js    # Symptom fuzzy match & rule lookup

frontend/
  ├─ components/       # Chat UI components
  ├─ assets/           # Images and icons
  └─ App.tsx           # Main app entry point
```
