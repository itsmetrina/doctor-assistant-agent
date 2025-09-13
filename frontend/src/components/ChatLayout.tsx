import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import type { Message } from "../types";
import { getSocket } from "../socket";

const ChatLayout = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [typing, setTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const socket = getSocket();

		const handleAssistant = (msg: string) =>
			setMessages(prev => [...prev, { sender: "assistant", text: msg }]);
		const handleTyping = (status: boolean) => setTyping(status);
		const handleNotification = () =>
			setMessages(prev => [...prev, { sender: "assistant", text: "Doctor has been notified!" }]);
		const handleAppointment = (data: { link: string }) =>
			setMessages(prev => [...prev, { sender: "assistant", text: `Appointment scheduled! Check: ${data.link}` }]);

		socket.on("assistantMessage", handleAssistant);
		socket.on("typing", handleTyping);
		socket.on("appointmentNotified", handleNotification);
		socket.on("appointmentScheduled", handleAppointment);

		return () => {
			socket.off("assistantMessage", handleAssistant);
			socket.off("typing", handleTyping);
			socket.off("appointmentNotified", handleNotification);
			socket.off("appointmentScheduled", handleAppointment);
		};
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, typing]);

	const sendMessage = (text: string) => {
		if (!text.trim()) return;
		setMessages(prev => [...prev, { sender: "patient", text }]);
		getSocket().emit("patientMessage", text);
	};

	return (
		<div className="flex flex-col h-screen w-screen">
			<ChatHeader isAssistantTyping={typing} />
			<div className="flex-1 overflow-y-auto p-4 bg-gray-100">
				<ChatMessages messages={messages} typing={typing} />
				<div ref={messagesEndRef} />
			</div>
			<ChatInput onSend={sendMessage} />
		</div>
	);
};

export default ChatLayout