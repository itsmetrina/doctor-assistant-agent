import { useState } from "react";
import type { ChatInputProps } from "../types";
import { FiSend } from "react-icons/fi";

const ChatInput = ({ onSend }: ChatInputProps) => {
	const [input, setInput] = useState("");

	const handleSend = () => {
		if (!input.trim()) return;
		onSend(input);
		setInput("");
	};

	return (
		<div className="p-3 bg-white flex items-center gap-3 border-t shadow-inner">
			<input
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && handleSend()}
				placeholder="Type a message..."
				className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
			/>
			<button
				onClick={handleSend}
				className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
			>
				<FiSend size={20} />
			</button>
		</div>
	);
}

export default ChatInput