export interface SendMessageData {
    tripId: string;
    message: unknown;
}

export interface TypingData {
    tripId: string;
    user: string;
    isTyping: boolean;
}