import React from 'react';
import { Bot } from 'lucide-react';
const AssistantPage = () => (
  <div className="p-10 flex flex-col items-center justify-center h-[50vh] text-gray-400">
    <Bot className="w-16 h-16 mb-4 opacity-20" />
    <h2 className="text-xl font-bold">Asistente Virtual</h2>
    <p>Chatbot de ayuda al estudiante.</p>
  </div>
);
export default AssistantPage;