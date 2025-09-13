import { useEffect, useRef } from "react";
import type { ChatMessagesProps } from "../types";
import MessageBubble from "./MessageBubble";

const ChatMessages = ({ messages, typing }: ChatMessagesProps) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
		}
	}, [messages, typing]);

	return (
		<div
			ref={containerRef}
			className="flex-1 overflow-y-auto p-4 bg-gray-100 flex flex-col gap-2"
		>
			{messages.map((msg, idx) => (
				<MessageBubble key={idx} sender={msg.sender} text={msg.text} />
			))}

			{typing && (
				<div className="flex items-center gap-2 justify-start animate-pulse">
					<div className="w-8 h-8 rounded-full bg-gray-300"></div>
					<div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-xl">...</div>
				</div>
			)}
		</div>
	);
};

export default ChatMessages