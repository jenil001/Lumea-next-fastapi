'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';
import GlassCard from '@/components/GlassCard';

export default function JournalPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState([]);
  const [reflections, setReflections] = useState({});
  
  // Enhancement State
  const [imageFile, setImageFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [tags, setTags] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Calendar & Filtering State
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date()); // For month navigation
  const [entryDates, setEntryDates] = useState(new Set()); // Days with entries in current month
  const [viewingEntry, setViewingEntry] = useState(null); // Full view modal
  const [mediaUrls, setMediaUrls] = useState({ img: null, aud: null }); // Signed URLs for modal

  useEffect(() => {
    fetchEntries();
    fetchEntryDates();
  }, [selectedDate, viewDate]);

  // Clear media preview when entry is closed
  useEffect(() => {
    if (!viewingEntry) {
      setMediaUrls({ img: null, aud: null });
      return;
    }
    setMediaUrls({ img: viewingEntry.image_url || null, aud: viewingEntry.audio_url || null });
  }, [viewingEntry]);

  const fetchEntryDates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString();
      const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).toISOString();

      const { data, error } = await supabase
        .from('journal_entries')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', firstDay)
        .lte('created_at', lastDay);

      if (error) throw error;
      const dates = new Set(data.map(d => new Date(d.created_at).getDate()));
      setEntryDates(dates);
    } catch (err) {
      console.error("Error fetching entry dates:", err);
    }
  };

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedDate) {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
        query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      } else {
        query = query.limit(5);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      // Fallback mock data
      setEntries([
        { id: 1, created_at: new Date().toISOString(), title: "A peaceful morning", content: "Today I woke up feeling refreshed. Wrote down some goals for the week.", is_private: true },
        { id: 2, created_at: new Date(Date.now() - 86400000).toISOString(), title: "Untitled Reflection", content: "Had a long day at work but managed to meditate for 10 minutes.", is_private: true }
      ]);
    }
  };

  const uploadFile = async (file, bucket, path) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Could not start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
      recorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!content.trim() && !audioBlob && !imageFile) {
      alert("Please write something or attach media before saving.");
      return;
    }

    setLoading(true);
    setMessage('');
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let uploadedImageUrl = null;
      let uploadedAudioUrl = null;

      // 1. Upload Image
      if (imageFile) {
        const path = `${user.id}/img_${Date.now()}`;
        uploadedImageUrl = await uploadFile(imageFile, 'journal-assets', path);
      }

      // 2. Upload Audio
      if (audioBlob) {
        const path = `${user.id}/aud_${Date.now()}.webm`;
        uploadedAudioUrl = await uploadFile(audioBlob, 'journal-assets', path);
      }

      // 3. Save Entry
      const { error } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        title: title || 'Untitled Reflection',
        content: content,
        is_private: isPrivate,
        image_url: uploadedImageUrl,
        audio_url: uploadedAudioUrl,
        tags: tags
      });

      if (error) throw error;

      setMessage("✅ Journal entry saved elegantly!");
      setTitle('');
      setContent('');
      setImageFile(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setTags('');
      fetchEntries(); // Refresh list
    } catch (err) {
      console.error("Error saving journal:", err);
      setMessage("❌ Failed to save. Ensure SQL updates were run and storage bucket exists.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleAiReflection = async (entryId, text) => {
    setReflections(prev => ({ ...prev, [entryId]: "Generating reflection..." }));
    
    try {
      // Mocking get_journal_reflection
      setTimeout(() => {
        setReflections(prev => ({ 
          ...prev, 
          [entryId]: "That sounds like a constructive moment of mindfulness. Keep tracking your thoughts!" 
        }));
      }, 1500);
    } catch (err) {
      setReflections(prev => ({ ...prev, [entryId]: "Error generating reflection." }));
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem', position: 'relative' }}>
      
      <PageHeader 
        title="Deep"
        subtitle="Reflection"
        description="A sacred space for your thoughts to wander and settle like the evening mist."
      />

      {/* 2. Bento Layout Grid */}
      <div className="bento-grid" style={{ gap: '3rem' }}>
        
        {/* Column 1: Editor Column (8 Col) */}
        <div className="bento-8">
          
          <GlassCard style={{ padding: '2.5rem' }}>
            
            {/* Tactile Notebook Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: theme.colors.primary, fontWeight: '700' }}>Current Entry</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <input 
                      type="text" 
                      placeholder="Title your reflection..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        color: theme.colors.foreground, 
                        padding: 0, 
                        outline: 'none', 
                        boxShadow: 'none', 
                        width: '100%',
                        marginBottom: 0
                      }}
                    />
                  </div>
                </div>
                
                {/* Save Button */}
                <button type="submit" onClick={handleSaveEntry} disabled={loading} style={{ 
                  background: `linear-gradient(135deg, ${theme.colors.primaryContainer} 0%, #293676 100%)`, 
                  border: 'none', 
                  borderRadius: theme.borderRadius.lg, 
                  padding: '0.6rem 1.2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  color: 'var(--foreground)', 
                  fontWeight: '600', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 12px var(--primary-glow)',
                  opacity: loading ? 0.6 : 1
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>check</span>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>

              {/* Enhancement Tools Tools */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: theme.borderRadius.lg, border: `1px solid var(--glass-border)` }}>
                {/* Photo Upload */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: imageFile ? theme.colors.primary : theme.colors.muted, cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '12px', background: imageFile ? 'rgba(129, 140, 248, 0.1)' : 'transparent' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>image</span>
                  {imageFile ? 'Image Selected' : 'Add Photo'}
                  <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files[0])} />
                </label>

                {/* Voice Recording */}
                <button 
                  type="button" 
                  onClick={isRecording ? stopRecording : startRecording}
                  style={{ background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'transparent', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', color: isRecording ? '#ef4444' : audioUrl ? theme.colors.primary : theme.colors.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', animation: isRecording ? 'pulse 1.5s infinite' : 'none' }}>{isRecording ? 'stop_circle' : 'mic'}</span>
                  {isRecording ? 'Stop Recording' : audioUrl ? 'Voice Recorded' : 'Record Voice'}
                </button>

                {/* Tags Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '200px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: theme.colors.muted }}>sell</span>
                  <input 
                    type="text" 
                    placeholder="Add tags (separated by commas)..." 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.75rem', color: theme.colors.foreground, width: '100%', padding: 0 }} 
                  />
                </div>
              </div>

              {/* Previews */}
              {(imageFile || audioUrl) && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  {imageFile && (
                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.colors.glassBorder}` }}>
                      <img src={URL.createObjectURL(imageFile)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => setImageFile(null)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                    </div>
                  )}
                  {audioUrl && (
                    <div style={{ flex: 1, background: 'var(--glass-bg)', borderRadius: '12px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid var(--glass-border)` }}>
                      <audio src={audioUrl} controls style={{ height: '30px', flex: 1 }} />
                      <button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Editor Body */}
            <div style={{ position: 'relative' }}>
              <textarea 
                placeholder="Begin your reflection here..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  background: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  boxShadow: 'none', 
                  color: theme.colors.foreground, 
                  fontSize: '1.1rem', 
                  lineHeight: '2.2rem', 
                  minHeight: '380px', 
                  resize: 'none', 
                  padding: 0, 
                  position: 'relative', 
                  zIndex: 2,
                  marginBottom: 0
                }}
              />
              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, borderTop: `1px solid ${theme.colors.foreground}`, backgroundSize: '100% 2.2rem', backgroundImage: `linear-gradient(${theme.colors.foreground} 1px, transparent 1px)`, pointerEvents: 'none', zIndex: 1 }}></div>
            </div>

            {message && <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', textAlign: 'center', color: message.startsWith('✅') ? theme.colors.accent : '#ef4444' }}>{message}</p>}
          </GlassCard>

        </div>

        {/* Column 2: Archive & Lunar Timeline (4 Col) */}
        <div className="bento-4" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Archive Calendar Display */}
          <div style={{ 
            background: 'var(--glass-bg)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '20px', 
            padding: '1.5rem', 
            border: '1px solid var(--glass-border)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--foreground)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--primary)' }}>📅</span> {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>chevron_left</span>
                </button>
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>chevron_right</span>
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => <span key={idx} style={{ fontWeight: '700', fontSize: '0.7rem' }}>{d}</span>)}
              
              {/* Calendar Days */}
              {(() => {
                const year = viewDate.getFullYear();
                const month = viewDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                
                // Adjust for Monday start (Original mock had M-S)
                const offset = firstDay === 0 ? 6 : firstDay - 1;
                
                return [
                  ...Array(offset).fill(null).map((_, i) => <span key={`empty-${i}`} />),
                  ...Array(daysInMonth).fill(0).map((_, i) => {
                    const day = i + 1;
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                    const isSelected = selectedDate && selectedDate.toDateString() === new Date(year, month, day).toDateString();
                    const hasEntry = entryDates.has(day);

                    return (
                      <button 
                        key={day} 
                        onClick={() => {
                          const newDate = new Date(year, month, day);
                          if (selectedDate && selectedDate.toDateString() === newDate.toDateString()) {
                            setSelectedDate(null); // Deselect to clear filter
                          } else {
                            setSelectedDate(newDate);
                          }
                        }}
                        style={{ 
                          background: isSelected ? 'var(--primary)' : 'none', 
                          border: isToday ? '1px solid var(--primary)' : 'none', 
                          borderRadius: '8px', 
                          padding: '0.5rem 0', 
                          color: isSelected ? '#fff' : hasEntry ? 'var(--foreground)' : 'var(--muted)', 
                          fontSize: '0.75rem', 
                          cursor: 'pointer',
                          fontWeight: isSelected || hasEntry ? '700' : '500',
                          position: 'relative',
                          transition: 'all 0.2s'
                        }}
                      >
                        {day}
                        {hasEntry && !isSelected && (
                          <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: '#818cf8' }}></div>
                        )}
                      </button>
                    );
                  })
                ];
              })()}
            </div>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                style={{ width: '100%', marginTop: '1rem', background: 'var(--primary-glow)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', padding: '0.4rem', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Lunar Phases Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary)' }}>🌙</span> {selectedDate ? 'Selected Date' : 'Recent Reflections'}
            </h3>

            <div style={{ position: 'relative', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'linear-gradient(to bottom, rgba(99,102,241,0.3), rgba(255,255,255,0.05))' }}></div>

              {entries.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: '600' }}>No historical phases logged yet.</p>
              ) : (
                entries.map((entry, idx) => (
                  <div key={entry.id} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setViewingEntry(entry)}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-29px', 
                      top: '4px', 
                      width: '16px', 
                      height: '16px', 
                      background: idx === 0 ? '#818cf8' : '#1e293b', 
                      border: '2px solid #818cf8', 
                      borderRadius: '50%', 
                      boxShadow: idx === 0 ? '0 0 10px rgba(99,102,241,0.6)' : 'none' 
                    }}></div>
                    <div className="entry-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', transition: 'all 0.2s', padding: '0.4rem', borderRadius: '12px', marginLeft: '-0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8', fontWeight: '700' }}>
                        {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>{entry.title || 'Untitled Reflection'}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{entry.content}"</p>
                      
                      {/* Media Badges in List */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                        {entry.image_url && <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: theme.colors.primary }}>image</span>}
                        {entry.audio_url && <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: theme.colors.tertiary }}>mic</span>}
                        {entry.tags && entry.tags.split(',').map((tag, tIdx) => (
                          <span key={tIdx} style={{ fontSize: '0.6rem', color: '#818cf8', opacity: 0.8 }}>#{tag.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>



    {/* Entry Detail Modal */}
    {viewingEntry && (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.3s ease-out'
      }} onClick={() => setViewingEntry(null)}>
        <GlassCard 
          style={{ 
            maxWidth: '700px', 
            width: '100%', 
            maxHeight: '90vh', 
            overflow: 'auto', 
            padding: '3rem', 
            position: 'relative',
            cursor: 'default'
          }} 
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => setViewingEntry(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">close</span>
          </button>

          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme.colors.primary, fontWeight: '700' }}>
            Reflection from {new Date(viewingEntry.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--foreground)', marginTop: '0.5rem', marginBottom: '2rem' }}>{viewingEntry.title || 'Untitled Reflection'}</h2>
          
          <div style={{ color: 'var(--foreground)', fontSize: '1.2rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '2.5rem' }}>
            {viewingEntry.content}
          </div>

          {/* Signed Media Attachments */}
          {(mediaUrls.img || mediaUrls.aud) && (
            <div style={{ borderTop: `1px solid ${theme.colors.glassBorder}`, paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {mediaUrls.img && (
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${theme.colors.glassBorder}` }}>
                  <img src={mediaUrls.img} alt="Journal Attachment" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
              {mediaUrls.aud && (
                <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: `1px solid var(--glass-border)` }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Voice Recording</p>
                  <audio src={mediaUrls.aud} controls style={{ width: '100%' }} />
                </div>
              )}
            </div>
          )}

          {viewingEntry.tags && (
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              {viewingEntry.tags.split(',').map((tag, idx) => (
                <span key={idx} style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    )}

    <style>{`
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .entry-hover:hover {
        background: rgba(129, 140, 248, 0.05);
        transform: translateX(5px);
      }
    `}</style>
    </div>
  );
}
