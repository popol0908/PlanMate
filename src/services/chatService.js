import { sendMessageToGemini, resetConversation as resetGeminiConversation } from './geminiService';

// Simple message history to maintain context
let messageHistory = [];

export const sendMessageToAI = async (messages) => {
  try {
    // Get the latest user message (last in the array)
    const latestMessage = Array.isArray(messages) && messages.length > 0 
      ? messages[messages.length - 1]?.parts?.[0]?.text || ''
      : '';
    
    if (!latestMessage || !latestMessage.trim()) {
      console.error('Empty or invalid message:', messages);
      throw new Error('Please enter a message');
    }
    
    // Format the message for Gemini
    const userMessage = {
      role: 'user',
      parts: [{ text: latestMessage }]
    };
    
    // Send message to Gemini
    const response = await sendMessageToGemini(userMessage);
    
    if (!response) {
      throw new Error('No response from AI');
    }
    
    return response;
  } catch (error) {
    console.error('Error in chat service:', error);
    throw new Error(error.message || 'I\'m having trouble processing your request. Please try again.');
  }
};

export const resetChatHistory = () => {
  messageHistory = [];
  resetGeminiConversation();
};
