'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook for chat functionality
 * Handles message state, streaming, emotion analysis, and safety checks
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableEmotionAnalysis - Enable emotion detection (default: true)
 * @param {boolean} options.enableTTS - Enable text-to-speech (default: true)
 * @param {string[]} options.safetyKeywords - Keywords to trigger safety warnings
 * 
 * @returns {Object} Chat state and handlers
 * 
 * @example
 * const { messages, isLoading, sendMessage, clearChat } = useChat();
 */
export function useChat(options = {}) {
  const {
    enableEmotionAnalysis = true,
    enableTTS = true,
    safetyKeywords = ['kill myself', 'suicide', 'end it all', "don't want to live"],
  } = options;

  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi there. I'm Lumea, your mental health companion. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [isSelfHarmRisk, setIsSelfHarmRisk] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Analyze emotion from user message
  const analyzeEmotion = useCallback(async (text) => {
    if (!enableEmotionAnalysis) return null;

    try {
      const response = await fetch('http://localhost:8000/api/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Emotion analysis error:', err);
      return null;
    }
  }, [enableEmotionAnalysis]);

  // Check for safety triggers
  const checkSafety = useCallback((text) => {
    const lowerText = text.toLowerCase();
    return safetyKeywords.some(keyword => lowerText.includes(keyword));
  }, [safetyKeywords]);

  // Text-to-speech helper
  const speakText = useCallback((text) => {
    if (!enableTTS || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [enableTTS]);

  // Send message handler
  const sendMessage = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);
    setError(null);

    // Optimistic UI update
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      // Analyze emotion if enabled
      let emotionData = null;
      if (enableEmotionAnalysis) {
        emotionData = await analyzeEmotion(userMessage);
        
        if (emotionData?.emotion) {
          setCurrentEmotion(emotionData.emotion);
          // Tag the last user message with emotion
          setMessages(prev => prev.map((msg, idx) => 
            idx === prev.length - 1 
              ? { ...msg, emotion: emotionData.emotion, score: emotionData.score } 
              : msg
          ));
        }
      }

      // Safety check
      if (checkSafety(userMessage)) {
        setIsSelfHarmRisk(true);
      }

      // Call AI chat API
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          current_emotion: emotionData?.emotion 
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get stream response.");
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";

      // Add placeholder for assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponseText += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: aiResponseText };
          return updated;
        });
      }

      // Auto TTS if enabled
      if (enableTTS) {
        speakText(aiResponseText);
      }

    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "*(Sorry, I had trouble connecting to my AI core.)*" 
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, analyzeEmotion, checkSafety, enableEmotionAnalysis, enableTTS, speakText]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([
      { role: 'assistant', content: "Hi there. I'm Lumea, your mental health companion. How are you feeling today?" }
    ]);
    setCurrentEmotion(null);
    setIsSelfHarmRisk(false);
    setError(null);
  }, []);

  // Clear safety warning
  const clearSafetyWarning = useCallback(() => {
    setIsSelfHarmRisk(false);
  }, []);

  return {
    // State
    messages,
    input,
    setInput,
    loading,
    currentEmotion,
    isSelfHarmRisk,
    error,
    
    // Refs
    messagesEndRef,
    
    // Actions
    sendMessage,
    clearChat,
    clearSafetyWarning,
  };
}

export default useChat;