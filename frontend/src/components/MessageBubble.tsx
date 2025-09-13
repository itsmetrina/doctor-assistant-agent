import type { MessageBubbleProps } from "../types";

const MessageBubble = ({ sender, text }: MessageBubbleProps) => {
	const isAssistant = sender === "assistant";

	return (
		<div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
			<div
				className={`px-4 py-2 max-w-[70%] rounded-2xl break-words
        ${isAssistant ? "bg-gray-200 text-gray-900 rounded-bl-none" : "bg-blue-600 text-white rounded-br-none"}`}
			>
				{text}
			</div>
		</div>
	);
}

export default MessageBubble