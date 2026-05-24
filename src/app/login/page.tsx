'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BRAND } from '@/lib/theme';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src="/logo-wordmark.svg" alt="Repti-Track" style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block', margin: '0 auto' }} />
        <div style={{ fontSize: 14, color: BRAND.ash, marginTop: 8 }}>
          {mode === 'signin' ? 'Sign in to your collection' : 'Create your account'}
        </div>
      </div>

      <div style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid ${BRAND.cream}` }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: BRAND.ash, letterSpacing: 0.5, marginBottom: 6 }}>EMAIL</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: `1px solid ${BRAND.cream}`, fontSize: 15, marginBottom: 16,
          }}
        />

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: BRAND.ash, letterSpacing: 0.5, marginBottom: 6 }}>PASSWORD</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: `1px solid ${BRAND.cream}`, fontSize: 15, marginBottom: 16,
          }}
        />

        {error && <div style={{ color: BRAND.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ color: BRAND.ok, fontSize: 13, marginBottom: 12 }}>{message}</div>}

        <button onClick={submit} disabled={loading || !email || !password} style={{
          width: '100%', padding: 14, background: BRAND.green, color: 'white',
          border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
          cursor: 'pointer', opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{
          width: '100%', padding: 12, background: 'transparent', color: BRAND.ash,
          border: 'none', fontSize: 13, marginTop: 12, cursor: 'pointer',
        }}>
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
