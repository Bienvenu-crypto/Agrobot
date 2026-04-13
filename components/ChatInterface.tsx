'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Image from 'next/image';
import { Send, User, Bot, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { AGROBOT_SYSTEM_INSTRUCTION } from '@/lib/gemini';
import { useAuth } from '@/components/AuthProvider';
import { sendGAEvent } from '@next/third-parties/google';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  image?: string;
}

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hello! I am AgroBot, your AI farming assistant. I can help you in English, Luganda, Swahili, or Kinyarwanda. How can I help you with your crops today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user?.email) {
        try {
          const res = await fetch(`/api/chats?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.chats && data.chats.length > 0) {
              setMessages(data.chats);
            }
          }
        } catch (error) {
          console.error("Failed to fetch chat history:", error);
        }
      }
    };
    fetchHistory();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userEmail = user ? user.email : 'anonymous@agrobot.local';

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    sendGAEvent({ event: 'chat_interaction', value: 'send_message' });

    // Save user message to DB
    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userMessage,
          user_email: userEmail
        }),
      });
    } catch (e) {
      console.error("Failed to save user message:", e);
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      let promptParts: any[] = [{ text: input || "Analyze this crop image and provide agricultural advice." }];

      if (userMessage.image) {
        const base64Data = userMessage.image.split(',')[1];
        promptParts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        });
      }

      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const dynamicSystemInstruction = `${AGROBOT_SYSTEM_INSTRUCTION}\n\nToday's date is: ${currentDate}. Always use this date when answering questions about time, seasons, or current events.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: promptParts }],
        config: {
          systemInstruction: dynamicSystemInstruction,
        },
      });

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: response.text || "I'm sorry, I couldn't process that request. Please try again.",
      };

      setMessages((prev) => [...prev, botMessage]);

      // Save bot message to DB
      try {
        await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...botMessage,
            user_email: userEmail
          }),
        });
      } catch (e) {
        console.error("Failed to save bot message:", e);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', content: "Sorry, I encountered an error. Please check your connection and try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-bottom border-black/5 bg-emerald-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-emerald-900">AgroBot Advisor</h2>
            <p className="text-xs text-emerald-700">Online • Expert AI Support</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${m.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-white border border-black/5 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
              >
                {m.image && (
                  <div className="relative w-full h-48 mb-2">
                    <Image
                      src={m.image}
                      alt="Uploaded"
                      fill
                      className="object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="prose prose-sm max-w-none prose-emerald">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-black/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="animate-spin text-emerald-600" size={16} />
              <span className="text-xs text-gray-500">AgroBot is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-black/5">
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <div className="relative w-20 h-20">
              <Image
                src={selectedImage}
                alt="Preview"
                fill
                className="object-cover rounded-lg border border-emerald-200"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md z-10"
            >
              <span className="text-[10px]">✕</span>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
            title="Upload crop image"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your crops..."
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
