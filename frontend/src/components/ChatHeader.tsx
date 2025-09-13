import assistantImg from "../assets/assistant.jpg";
import type { ChatHeaderProps } from "../types";

const ChatHeader = ({ isAssistantTyping = false }: ChatHeaderProps) => {
	return (
		<div className="flex items-center justify-between bg-white p-4 shadow-md border-b sticky top-0 z-10">
			<div className="flex items-center gap-3">
				<img
					src={assistantImg}
					alt="Assistant"
					className="w-12 h-12 rounded-full"
				/>
				<div className="flex flex-col">
					<span className="font-semibold text-gray-900 text-lg">Dr. AI Assistant</span>
					<span className="text-sm text-green-500">
						{isAssistantTyping ? "Typing..." : "Online"}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ChatHeader