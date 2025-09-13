import { useState } from "react";
import ChatLayout from "./components/ChatLayout";
import assistantImg from "./assets/assistant.jpg";
import { initSocket } from "./socket";

const App = () => {
	const [started, setStarted] = useState(false);

	const handleStart = () => {
		const socket = initSocket();
		socket.emit("start");
		setStarted(true);
	};

	const handleConversationEnd = () => {
		setStarted(false); // go back to landing page
	};

	return (
		<div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
			{!started ? (
				<div className="flex flex-col items-center justify-center text-center p-6 max-w-md bg-white rounded-2xl shadow-lg">
					<h1 className="text-2xl font-bold mb-4">Hello!</h1>
					<h2 className="text-xl mb-4">I’m your Digital Assistant</h2>
					<div className="md:w-1/2 relative flex items-center justify-center">
						<img
							src={assistantImg}
							alt="Cardiac Assistant"
							className="w-72 h-72 md:w-64 md:h-64 sm:w-48 sm:h-48 max-[480px]:w-36 max-[480px]:h-36 rounded-full shadow-lg"
						/>
					</div>
					<p className="text-gray-600 mb-6">
						I’ll guide you step by step to collect your health details and connect you with the right doctor.
					</p>
					<button
						onClick={handleStart}
						className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
					>
						Start Now
					</button>
				</div>
			) : (
				<ChatLayout onConversationEnd={handleConversationEnd} />
			)}
		</div>
	);
};

export default App