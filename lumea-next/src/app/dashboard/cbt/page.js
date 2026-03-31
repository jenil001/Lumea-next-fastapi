'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';
import GlassCard from '@/components/GlassCard';

export default function MindsetReframePage() {
  const [trigger, setTrigger] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [reframeInput, setReframeInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAnalyzeThought = async (e) => {
    e.preventDefault();
    if (!automaticThought.trim()) return;

    setLoading(true);
    setAnalysis(null);
    setReframeInput('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/cbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought_text: automaticThought })
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error("CBT Analysis Error:", err);
      setAnalysis({
        distortion: "Thinking Pattern",
        description: "Your mind seems focused on this thought heavily right now.",
        reframe_prompt: "What is one alternative, kinder way to view this situation?"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReframe = async (e) => {
    e.preventDefault();
    if (!reframeInput.trim()) return;

    setSaveLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const cbtContent = `**Anxious Trigger**: ${trigger || 'A situation'}\n\n**Automatic Thought**: ${automaticThought}\n\n**Detected Pattern**: ${analysis.distortion}\n\n**Alternative Reframe**: ${reframeInput}`;

      const { error } = await supabase.from('journal_entries').insert({
        user_id: user ? user.id : 'guest',
        title: `🧩 CBT Reframe: ${analysis.distortion}`,
        content: cbtContent,
        is_private: true
      });

      if (error) throw error;
      setMessage("✅ Thought grounded and saved to your Journal!");
      setAnalysis(null);
      setTrigger('');
      setAutomaticThought('');
      setReframeInput('');
    } catch (err) {
      console.error("Error saving CBT reframe:", err);
      setMessage("❌ Failed to save to Journal.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '42rem', margin: '0 auto', color: theme.colors.foreground, fontFamily: "'Manrope', sans-serif" }}>
      
      {/* Decorative localized effects */}
      <div style={{
        position: 'absolute', top: '10%', right: '-10%', width: '300px', height: '300px', background: theme.colors.tertiary,
        filter: 'blur(120px)', opacity: 0.05, borderRadius: '50%', zIndex: -1
      }}></div>

      <PageHeader 
        title="Mindset"
        subtitle="Reframe"
        description="Step into the light of clarity. Let's gently explore the shadows of your thoughts and find a more balanced path."
      />

      {/* Step 1: Catch the Thought */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <span style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', 
            borderRadius: '50%', backgroundColor: theme.colors.primaryContainer, color: theme.colors.onPrimaryContainer, fontWeight: '800' 
          }}>1</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: theme.colors.foreground, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Catch the Thought</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Inputs with local styles mirroring the template */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.1em' }}>What triggered this anxiety/stress?</label>
            <textarea 
              style={{ width: '100%', backgroundColor: theme.colors.surfaceContainerHighest, border: `1px solid ${theme.colors.glassBorder}`, borderRadius: theme.borderRadius.md, padding: '1.25rem', color: theme.colors.foreground, transition: 'all 0.3s', outline: 'none' }} 
              placeholder="e.g., A missed deadline, a difficult conversation..." 
              rows="3"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.1em' }}>What is going through your mind? (Automatic Thought)</label>
            <textarea 
              style={{ width: '100%', backgroundColor: theme.colors.surfaceContainerHighest, border: `1px solid ${theme.colors.glassBorder}`, borderRadius: theme.borderRadius.md, padding: '1.25rem', color: theme.colors.foreground, transition: 'all 0.3s', outline: 'none' }} 
              placeholder="I'm not good enough, I'll never finish this..." 
              rows="4"
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
              required
            />
          </div>

          <button 
            onClick={handleAnalyzeThought}
            disabled={loading || !automaticThought.trim()}
            style={{ 
              width: '100%', padding: '1.25rem', borderRadius: '2rem', 
              background: 'var(--primary)', color: '#fff',
              fontWeight: '800', fontSize: '1.1rem', border: 'none', cursor: 'pointer',
              boxShadow: '0 10px 40px var(--primary-glow)', transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
            }}
          >
            <span className="material-symbols-outlined">{loading ? 'sync' : 'auto_awesome'}</span>
            {loading ? 'Analyzing Thought Pattern...' : 'Analyze Thought Pattern'}
          </button>
        </div>
      </section>

      {/* Step 2: Reframe Perspective */}
      <section style={{ 
        opacity: !analysis ? 0.6 : 1, filter: !analysis ? 'grayscale(0.5)' : 'none', transition: 'all 0.6s ease',
        marginBottom: '5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <span style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', 
            borderRadius: '50%', backgroundColor: analysis ? theme.colors.primaryContainer : theme.colors.surfaceContainerHigh, 
            color: analysis ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant, fontWeight: '800' 
          }}>2</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: analysis ? theme.colors.foreground : theme.colors.onSurfaceVariant, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reframe Perspective</h3>
        </div>

        <GlassCard style={{ padding: '2rem' }}>
          {!analysis && (
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'rgba(115, 116, 133, 0.3)', fontSize: '2rem' }}>lock</span>
            </div>
          )}
          
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: theme.colors.tertiaryDim, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Analysis Preview</p>
            {analysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <p style={{ color: theme.colors.primary, fontWeight: '800', fontSize: '1.25rem' }}>Detected Pattern: {analysis.distortion}</p>
                <p style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic', lineHeight: '1.6' }}>"{analysis.description}"</p>
                <div style={{ 
                  display: 'flex', alignItems: 'start', gap: '0.75rem', color: 'var(--primary)', 
                  backgroundColor: 'var(--primary-glow)', padding: '1.25rem', borderRadius: theme.borderRadius.md, border: `1px solid var(--glass-border)` 
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>lightbulb</span>
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.5' }}>{analysis.reframe_prompt}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
                Complete step one to illuminate the cognitive patterns within your thoughts.
              </p>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${theme.colors.glassBorder}`, paddingTop: '2rem', opacity: analysis ? 1 : 0.5 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: theme.colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Your Balanced Perspective</label>
            {analysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <textarea 
                  style={{ width: '100%', backgroundColor: theme.colors.surfaceContainerHighest, border: 'none', borderRadius: theme.borderRadius.md, padding: '1.25rem', color: theme.colors.foreground, outline: 'none' }} 
                  placeholder="Try to reframe: 'It's a challenge, but I've handled tight spots before...'" 
                  rows="4"
                  value={reframeInput}
                  onChange={(e) => setReframeInput(e.target.value)}
                  required
                />
                <button 
                  onClick={handleSaveReframe}
                  disabled={saveLoading || !reframeInput.trim()}
                  style={{ 
                    width: '100%', padding: '1.25rem', borderRadius: '2rem', backgroundColor: 'var(--primary)', 
                    color: '#fff', fontWeight: '800', fontSize: '1.1rem', border: 'none', cursor: 'pointer',
                    transition: 'all 0.3s', boxShadow: '0 10px 30px var(--primary-glow)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>save</span>
                  {saveLoading ? 'Grounding Thought...' : 'Save Reframe & Ground'}
                </button>
              </div>
            ) : (
              <div style={{ width: '100%', height: '8rem', backgroundColor: 'var(--glass-bg)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Awaiting analysis...</span>
              </div>
            )}
          </div>
        </GlassCard>
      </section>

      {message && (
        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'rgba(186, 195, 255, 0.1)', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.glassBorder}`, marginBottom: '4rem' }}>
          <p style={{ color: theme.colors.primary, fontWeight: '700' }}>{message}</p>
        </div>
      )}

      {/* Decorative Quote */}
      <section style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
        <div style={{ width: '3rem', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(186, 195, 255, 0.3), transparent)' }}></div>
        <blockquote style={{ fontSize: '1.25rem', fontWeight: '800', fontStyle: 'italic', color: theme.colors.tertiary, maxWidth: '24rem', lineHeight: '1.4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          "The moon does not fight the shadows; it simply glows through them."
        </blockquote>
        <div style={{ width: '3rem', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(186, 195, 255, 0.3), transparent)' }}></div>
      </section>
    </div>
  );
}
