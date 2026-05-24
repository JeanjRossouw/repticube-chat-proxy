'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Mail, Trash2, Plus, Copy, X, Check } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, Section, FormRow, inputStyle, btnPrimary, btnSecondary, btnDanger } from '@/components/UI';
import { BRAND } from '@/lib/theme';
import { AppContext, TeamInvitation, Facility } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

type Member = {
  id: string;
  user_id: string;
  role: 'owner' | 'staff';
  created_at: string;
  email: string;
  display_name: string | null;
};

export default function TeamClient({ ctx, members, invites }: {
  ctx: AppContext;
  members: Member[];
  invites: TeamInvitation[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [copiedToken, setCopiedToken] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>(ctx.facilities);
  const [newFacility, setNewFacility] = useState('');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://repticube.app';

  const sendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Enter a valid email address');
      return;
    }
    setInviting(true);

    // Generate a token
    const token = generateToken();

    const { error } = await supabase.from('team_invitations').insert({
      team_id: ctx.team.id,
      email: inviteEmail.toLowerCase().trim(),
      role: 'staff',
      invited_by: ctx.userId,
      token,
    });

    setInviting(false);
    if (error) {
      alert('Invite failed: ' + error.message);
      return;
    }
    setInviteEmail('');
    router.refresh();
  };

  const revokeInvite = async (id: string) => {
    if (!confirm('Revoke this invitation?')) return;
    await supabase.from('team_invitations').delete().eq('id', id);
    router.refresh();
  };

  const removeMember = async (memberId: string, name: string) => {
    if (!confirm(`Remove ${name} from the team? They will lose access immediately.`)) return;
    const { error } = await supabase.from('team_members').delete().eq('id', memberId);
    if (error) alert(error.message);
    else router.refresh();
  };

  const copyInviteLink = (token: string) => {
    const link = `${appUrl}/invite/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(''), 2000);
    });
  };

  const addFacility = async () => {
    if (!newFacility.trim()) return;
    const { data, error } = await supabase.from('facilities').insert({
      team_id: ctx.team.id,
      name: newFacility.trim(),
      display_order: facilities.length + 1,
    }).select().single();
    if (error) { alert(error.message); return; }
    setFacilities([...facilities, data]);
    setNewFacility('');
  };

  const removeFacility = async (id: string, name: string) => {
    if (!confirm(`Delete facility "${name}"? Reptiles assigned to it will become unassigned.`)) return;
    const { error } = await supabase.from('facilities').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setFacilities(facilities.filter(f => f.id !== id));
    router.refresh();
  };

  return (
    <>
      <AppHeader title="Team" back />
      <div style={{ padding: 20 }}>
        <Section title="Invite staff">
          <Card>
            <div style={{ fontSize: 13, color: BRAND.ash, marginBottom: 12 }}>
              Send an invitation. Staff can log feedings, weights, and view care guides. They cannot add/delete reptiles or see pairings.
            </div>
            <FormRow label="Email address">
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="staff@example.com"
                style={inputStyle}
              />
            </FormRow>
            <button onClick={sendInvite} disabled={inviting} style={{ ...btnPrimary, marginTop: 4 }}>
              <Mail size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {inviting ? 'Creating invite...' : 'Create invite link'}
            </button>
          </Card>
        </Section>

        {invites.length > 0 && (
          <Section title={`Pending invitations (${invites.length})`}>
            {invites.map(inv => (
              <Card key={inv.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{inv.email}</div>
                    <div style={{ fontSize: 12, color: BRAND.ash, marginTop: 4 }}>
                      Expires {formatDate(inv.expires_at)}
                    </div>
                  </div>
                  <button onClick={() => revokeInvite(inv.id)} style={{
                    background: 'transparent', border: 'none', color: BRAND.danger, cursor: 'pointer', padding: 4,
                  }}>
                    <X size={18} />
                  </button>
                </div>
                <button onClick={() => copyInviteLink(inv.token)} style={{
                  marginTop: 10, width: '100%', padding: '8px 12px',
                  background: copiedToken === inv.token ? BRAND.ok : BRAND.cream,
                  color: copiedToken === inv.token ? 'white' : BRAND.ink,
                  border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  {copiedToken === inv.token ? (
                    <><Check size={14} /> Link copied — paste it to the person</>
                  ) : (
                    <><Copy size={14} /> Copy invite link</>
                  )}
                </button>
              </Card>
            ))}
          </Section>
        )}

        <Section title={`Active members (${members.length})`}>
          {members.map(m => (
            <Card key={m.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>
                    {m.display_name || m.email.split('@')[0]}
                    {m.user_id === ctx.userId && <span style={{ color: BRAND.ash, fontWeight: 400 }}> (you)</span>}
                  </div>
                  <div style={{ fontSize: 13, color: BRAND.ash, marginTop: 2 }}>{m.email}</div>
                </div>
                <div style={{
                  background: m.role === 'owner' ? BRAND.green : BRAND.cream,
                  color: m.role === 'owner' ? 'white' : BRAND.ink,
                  padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {m.role}
                </div>
                {m.role !== 'owner' && (
                  <button onClick={() => removeMember(m.id, m.display_name || m.email)} style={{
                    background: 'transparent', border: 'none', color: BRAND.danger, cursor: 'pointer',
                    padding: 6, marginLeft: 8,
                  }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </Section>

        <Section title="Facilities">
          <Card>
            <div style={{ fontSize: 13, color: BRAND.ash, marginBottom: 12 }}>
              Where reptiles live. Used to filter the reptiles list.
            </div>
            {facilities.map(f => (
              <div key={f.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: `1px solid ${BRAND.cream}`,
              }}>
                <div style={{ fontWeight: 600 }}>{f.name}</div>
                <button onClick={() => removeFacility(f.id, f.name)} style={{
                  background: 'transparent', border: 'none', color: BRAND.danger, cursor: 'pointer', padding: 4,
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input
                type="text"
                value={newFacility}
                onChange={e => setNewFacility(e.target.value)}
                placeholder="Add facility..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={addFacility} style={{
                background: BRAND.green, color: 'white', border: 'none',
                padding: '0 16px', borderRadius: 10, cursor: 'pointer',
              }}>
                <Plus size={18} />
              </button>
            </div>
          </Card>
        </Section>
      </div>
    </>
  );
}

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
