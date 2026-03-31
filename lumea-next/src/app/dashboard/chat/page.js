'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import LimitModal from '@/components/LimitModal';
import { isDistressDetected } from '@/lib/safetyPhrases';
import { theme } from '@/lib/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function ChatPage() {
  const { currentTheme } = useTheme();
  const [messages, setMessages] = useState([
    { role: "assistant", content: currentTheme.copy.aiGreeter }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [isSelfHarmRisk, setIsSelfHarmRisk] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Session Tracking State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
    } else {
      setSessions(data || []);
    }
  };

  const loadSession = async (sessionId) => {
    setLoading(true);
    setIsHistoryOpen(false);
    setCurrentSessionId(sessionId);

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      setMessages([{ role: "assistant", content: "*(Sorry, I had trouble loading this conversation.)*" }]);
    } else {
      setMessages(data.map(m => ({
        role: m.role,
        content: m.content,
        emotion: m.emotion,
        score: m.score
      })));
    }
    setLoading(false);
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      { role: "assistant", content: currentTheme.copy.aiGreeter }
    ]);
    setIsHistoryOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 0. Check Daily Limit
    const today = new Date().toLocaleDateString();
    const storedData = localStorage.getItem('lumea_usage');
    let currentCount = 0;
    
    if (storedData) {
      const { count, date } = JSON.parse(storedData);
      if (date === today) {
        currentCount = count;
      }
    }

    if (currentCount >= 100) {
      setIsLimitReached(true);
      return;
    }

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Increment count in localStorage
    localStorage.setItem('lumea_usage', JSON.stringify({ count: currentCount + 1, date: today }));

    // 1. Optimistic UI update for User message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let sessionId = currentSessionId;

      // Create session if it doesn't exist
      if (!sessionId && user) {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user.id,
            title: userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage
          })
          .select()
          .single();
        
        if (error) throw error;
        sessionId = data.id;
        setCurrentSessionId(sessionId);
        setSessions(prev => [data, ...prev]);
      }

      // 2. Analyze Emotion
      const emotionRes = await fetch('http://localhost:8000/api/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage })
      });
      const emotionData = await emotionRes.json();
      
      let emotion = null;
      let score = null;

      if (emotionData.emotion) {
        emotion = emotionData.emotion;
        score = emotionData.score;
        setCurrentEmotion(emotion);
        // Append emotion tagging to the last user message
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, emotion: emotion, score: score } : msg
        ));
      }

      // Save User Message to DB
      if (sessionId) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'user',
          content: userMessage,
          emotion: emotion,
          score: score
        });
      }

      // 3. Safety Check using the expanded 100+ phrases library
      if (isDistressDetected(userMessage)) {
        setIsSelfHarmRisk(true);
        setLoading(false);
        return; // HALT execution: AI will not respond when safety is a concern.
      }

      // 3. Wait for 2 seconds to simulate "reflection"
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsTyping(false);

      // 4. Call AI Stream
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          current_emotion: emotionData.emotion,
          themeId: currentTheme.id
        })
      });

      if (!response.ok) throw new Error("Failed to gets stream response.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";

      // Add a placeholder assistant message that we will stream into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponseText += chunk;

        // Update the last message (the AI assistant's stream)
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: aiResponseText };
          return updated;
        });
      }

      // Save Assistant Message to DB
      if (sessionId) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: aiResponseText
        });
      }

      // Browser TTS (Auto Read Reply)
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(aiResponseText);
        utterance.rate = 0.9; // empathetic tone slightly slower
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: "*(Sorry, I had trouble connecting to my AI core.)*" }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div style={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      paddingTop: '1rem', 
      paddingBottom: '10rem', // Space for fixed input and prompt pills
      width: '100%', 
      maxWidth: '850px', 
      margin: '0 auto', 
      position: 'relative', 
      height: 'calc(100vh - 4rem)' 
    }}>

      {/* Ambient Orbs */}
      <div className="neon-orb" style={{ width: '300px', height: '300px', background: 'var(--primary)', top: '-50px', left: '-100px', opacity: 0.1 }}></div>
      <div className="neon-orb" style={{ width: '300px', height: '300px', background: 'var(--secondary)', bottom: '100px', right: '-100px', opacity: 0.08 }}></div>

      {/* History Toggle Button */}
      <button 
        onClick={() => setIsHistoryOpen(true)}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '0.6rem 1rem',
          color: 'var(--primary)',
          cursor: 'pointer',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(10px)'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>history</span>
        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>History</span>
      </button>

      {/* History Sidebar Override/Drawer */}
      {isHistoryOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '300px',
          height: '100vh',
          background: 'var(--background)',
          backdropFilter: 'blur(40px)',
          zIndex: 200,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--glass-border)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--foreground)', fontSize: '1.2rem', fontWeight: '800' }}>Journey History</h3>
            <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <button 
            onClick={startNewChat}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              color: 'var(--foreground)',
              border: 'none',
              fontWeight: '700',
              marginBottom: '2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined">add</span> New Sanctuary
          </button>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => loadSession(session.id)}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: currentSessionId === session.id ? 'var(--primary-glow)' : 'transparent',
                  border: currentSessionId === session.id ? '1px solid var(--primary)' : '1px solid transparent',
                  color: currentSessionId === session.id ? 'var(--primary)' : 'var(--muted)',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}
              >
                <span style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{new Date(session.created_at).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '0.4rem', color: 'var(--foreground)' }}>
          {currentTheme.id === 'night-sky' ? "Celestial Sanctuary" : "Chat Reflection"}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', fontWeight: '500', opacity: 0.8 }}>
          {currentTheme.id === 'night-sky' ? "A safe space for your thoughts" : "A calm space for mindful conversation"}
        </p>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Safety Warning Panel */}
      {isSelfHarmRisk && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.4)',
          borderRadius: '16px',
          padding: '1.2rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ color: '#ef4444', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🤝 You matter to us</h4>
           <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>If you are feeling overwhelmed, you are not alone. Please consider reaching out:</p>
           <p style={{ fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: '600' }}>📞 Helplines inside India:</p>
           <ul style={{ fontSize: '0.9rem', color: 'var(--foreground)', paddingLeft: '1.4rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
             <li>Vandrevala Foundation: <span style={{ color: 'var(--foreground)' }}>9999 666 555</span></li>
             <li>AASRA: <span style={{ color: 'var(--foreground)' }}>9820466726</span></li>
           </ul>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="chat-scroll" style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        paddingRight: '0.5rem'
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isUser ? 'flex-end' : 'flex-start',
              width: '100%',
              maxWidth: '85%',
              marginLeft: isUser ? 'auto' : '0'
            }}>
              {/* Lumea Avatar Header */}
              {!isUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', marginLeft: '0.4rem' }}>
                  <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    <span style={{ fontSize: '14px' }}>{currentTheme.icon}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>Lumea</span>
                </div>
              )}

              {/* Message Bubble */}
              <div style={{
                padding: '1.2rem',
                borderRadius: '16px',
                borderTopLeftRadius: !isUser ? '4px' : '16px',
                borderTopRightRadius: isUser ? '4px' : '16px',
                background: isUser ? `var(--primary)` : 'var(--glass-bg)',
                border: !isUser ? `1px solid var(--glass-border)` : '1px solid var(--primary-glow)',
                color: isUser ? '#fff' : 'var(--foreground)',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                backdropFilter: !isUser ? 'blur(20px)' : 'none'
              }}>
                <p style={{ fontSize: '1rem', margin: 0 }}>{msg.content}</p>
                
              </div>

              {/* User Emotion Badge (Moved Outside) */}
              {isUser && msg.emotion && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'transparent',
                  fontSize: '0.75rem',
                  color: 'var(--primary)',
                  marginTop: '0.4rem',
                  marginRight: '0.4rem',
                  opacity: 0.9,
                  fontWeight: '500'
                }}>
                  <span style={{ fontSize: '1rem' }}>🎭</span> {msg.emotion} ({msg.score}%)
                </div>
              )}
              
              {/* Timestamp placeholder / Optional marker */}
              <span style={{ marginTop: '0.4rem', marginLeft: !isUser ? '0.4rem' : '0', marginRight: isUser ? '0.4rem' : '0', fontSize: '10px', color: 'var(--muted)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isUser ? 'Delivered' : 'Sent'}
              </span>
            </div>
          );
        })}
        {isTyping && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: '85%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', marginLeft: '0.4rem' }}>
              <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                <span style={{ fontSize: '14px' }}>{currentTheme.icon}</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                {currentTheme.id === 'night-sky' ? "Lumea is reflecting" : "Lumea is typing..."}
              </span>
            </div>
            <div style={{
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              borderTopLeftRadius: '4px',
              background: 'var(--glass-bg)',
              border: `1px solid var(--glass-border)`,
              backdropFilter: 'blur(20px)',
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'center'
            }}>
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'typing-wave 1.4s infinite ease-in-out' }}></div>
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'typing-wave 1.4s infinite ease-in-out', animationDelay: '0.2s' }}></div>
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'typing-wave 1.4s infinite ease-in-out', animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <style>{`
        @keyframes typing-wave {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      {/* Sticky Input Container fixed viewport bottom */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '0',
        width: '100%',
        padding: '0 0.5rem',
        zIndex: 40
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          {/* 4. Suggested Actions / Prompt Pills */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', paddingLeft: '0.5rem' }}>
            {['I want to try breathing', 'Just listening is enough', 'Can we talk about sleep?'].map((action, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => setInput(action)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '20px',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="pill-suggest"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Capsule Frame */}
          <form onSubmit={handleSubmit} style={{ 
            background: 'var(--glass-bg)', 
            backdropFilter: 'blur(30px)', 
            borderRadius: '24px', 
            padding: '0.5rem 0.8rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8rem', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)', 
            border: '1px solid var(--glass-border)' 
          }}>
            <button type="button" style={{ background: 'none', border: 'none', padding: 0, color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>➕</span>
            </button>

            <input 
              type="text" 
              placeholder="Share your thoughts with Lumea..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ 
                flexGrow: 1, 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                boxShadow: 'none', 
                color: 'var(--foreground)', 
                padding: '0.6rem', 
                fontSize: '0.95rem',
                width: '100%',
                marginBottom: 0
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button type="button" style={{ background: 'none', border: 'none', padding: 0, color: 'var(--muted)', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.4rem' }}>🎤</span>
              </button>
              <button type="submit" disabled={loading} style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
                border: 'none', 
                borderRadius: '12px', 
                width: '40px', 
                height: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                cursor: 'pointer', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                opacity: loading ? 0.6 : 1
              }}>
                <span style={{ fontSize: '1.2rem' }}>{loading ? '⌛' : '➤'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
      {/* Limit Reached Modal */}
      <LimitModal isOpen={isLimitReached} onClose={() => setIsLimitReached(false)} />

    </div>
  );
}

