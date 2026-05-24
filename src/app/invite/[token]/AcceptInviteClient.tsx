'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, AlertCircle, Check } from 'lucide-react';
import { Card, FormRow, inputStyle, btnPrimary } from '@/components/UI';
import { BRAND } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';

type InviteData = {
  id: string;
  team_id: string;
  email: string;
  expires_at: string;
  accepted_at: string | null;
  teams: { name: string };
};

export default function AcceptInviteClient({ token, invite }: {
  token: string;
  invite: InviteData | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!invite) {
    return (
      <div style={{ padding: 30, textAlign: 'center', maxWidth: 480, margin: '40px auto' }}>
        <AlertCircle size={48} color={BRAND.danger} />
        <h1 style={{ fontSize: 22, marginTop: 16 }}>Invitation not found</h1>
        <p style={{ color: BRAND.ash, fontSize: 14 }}>
          This invite link is invalid or has been revoked. Ask the team owner to send a new one.
        </p>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div style={{ padding: 30, textAlign: 'center', maxWidth: 480, margin: '40px auto' }}>
        <Check size={48} color={BRAND.ok} />
        <h1 style={{ fontSize: 22, marginTop: 16 }}>Already accepted</h1>
        <p style={{ color: BRAND.ash, fontSize: 14 }}>
          This invitation has already been used.
        </p>
        <button onClick={() => router.push('/login')} style={{ ...btnPrimary, marginTop: 20, maxWidth: 200 }}>
          Sign in
        </button>
      </div>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div style={{ padding: 30, textAlign: 'center', maxWidth: 480, margin: '40px auto' }}>
        <AlertCircle size={48} color={BRAND.danger} />
        <h1 style={{ fontSize: 22, marginTop: 16 }}>Invitation expired</h1>
        <p style={{ color: BRAND.ash, fontSize: 14 }}>
          This invite has expired. Ask the team owner to send a new one.
        </p>
      </div>
    );
  }

  const accept = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    setError('');

    // Sign up — the database trigger will read team_invitations by email and add them as staff
    const { error: signupErr } = await supabase.auth.signUp({
      email: invite.email,
      password,
      options: {
        data: {
          display_name: displayName || invite.email.split('@')[0],
          invite_token: token,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (signupErr) {
      // Maybe they already have an account — try sign-in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: invite.email,
        password,
      });
      if (signInErr) {
        setError('Signup/login failed: ' + signupErr.message);
        setSubmitting(false);
        return;
      }
      // Logged in — manually add to team via the team_members insert
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('team_members').insert({
          team_id: invite.team_id,
          user_id: user.id,
          role: 'staff',
        });
        await supabase.from('team_invitations').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id);
      }
    }

    setSuccess(true);
    setTimeout(() => router.push('/'), 1500);
  };

  if (success) {
    return (
      <div style={{ padding: 30, textAlign: 'center', maxWidth: 480, margin: '40px auto' }}>
        <Check size={48} color={BRAND.ok} />
        <h1 style={{ fontSize: 22, marginTop: 16 }}>Welcome to {invite.teams.name}!</h1>
        <p style={{ color: BRAND.ash, fontSize: 14 }}>Taking you to the app...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: '20px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Mail size={48} color={BRAND.green} />
        <h1 style={{ fontSize: 24, marginTop: 12 }}>You've been invited</h1>
        <p style={{ color: BRAND.ash, fontSize: 15, marginTop: 8 }}>
          Join <strong>{invite.teams.name}</strong> as a staff member to help track reptiles.
        </p>
      </div>

      <Card>
        <FormRow label="Email">
          <input type="email" value={invite.email} disabled style={{ ...inputStyle, opacity: 0.7 }} />
        </FormRow>
        <FormRow label="Your name">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="e.g. Sarah"
            style={inputStyle}
          />
        </FormRow>
        <FormRow label="Create a password">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            style={inputStyle}
          />
        </FormRow>
        {error && (
          <div style={{ color: BRAND.danger, fontSize: 13, marginBottom: 12, padding: 10, background: '#fee', borderRadius: 8 }}>
            {error}
          </div>
        )}
        <button onClick={accept} disabled={submitting || !password} style={{
          ...btnPrimary,
          opacity: (submitting || !password) ? 0.5 : 1,
        }}>
          {submitting ? 'Joining team...' : 'Accept invitation & sign up'}
        </button>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: BRAND.ash }}>
        Already have an account? <a href="/login" style={{ color: BRAND.green, fontWeight: 600 }}>Sign in instead</a>
      </div>
    </div>
  );
}
