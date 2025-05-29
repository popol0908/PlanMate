import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

const systemPrompt = `You are PlanMate AI, a helpful and friendly AI assistant focused on productivity and task management. 
You provide concise, actionable advice and engage in natural conversations.
You can help with setting goals, time management, productivity tips, and general questions.
Keep responses clear and to the point, but maintain a warm and encouraging tone.`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.7,
  },
  systemInstruction: systemPrompt
});

let chat = null;

const initializeChat = () => {
  chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'll help you with productivity and task management in a friendly and concise manner." }]
      }
    ]
  });
};

initializeChat();

export const sendMessageToGemini = async (userMessage) => {
  try {
    if (!chat) {
      initializeChat();
    }
    
    const result = await chat.sendMessage(userMessage.parts[0].text);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    try {
      initializeChat();
      const result = await chat.sendMessage(userMessage.parts[0].text);
      const response = await result.response;
      return response.text();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      throw new Error('I\'m having trouble connecting to the AI service. Please try again in a moment.');
    }
  }
};

export const resetConversation = () => {
  initializeChat();
};
