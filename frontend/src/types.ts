export interface MessageBubbleProps {
  sender: "patient" | "assistant";
  text: string;
};
export interface FormData {
  name: string;
  gender: string;
  email: string;
  phone: string;
}

export interface Message {
  sender: "assistant" | "patient";
  text: string;
}

export interface ChatInputProps {
  onSend: (text: string) => void;
}

export interface ChatMessagesProps {
  messages: Message[];
  typing: boolean;
}

export interface FormOverlayProps {
  onProceed: (data: FormData) => void;
}

export interface ChatLayoutProps {
  userData: FormData;
  initialMessages?: Message[];
}

export interface ChatHeaderProps {
  userData?: FormData;
  isAssistantTyping?: boolean;
}