'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellOff, AlertCircle, Check, Smartphone, Trash2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, Section, btnPrimary, btnSecondary, btnDanger } from '@/components/UI';
import { BRAND } from '@/lib/theme';
import { AppContext } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

type Sub = { id: string; user_agent: string | null; created_at: string };

export default function NotificationsClient({ ctx, subscriptions }: {
  ctx: AppContext;
  subscriptions: Sub[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false);
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const subscribe = async () => {
    setBusy(true);
    setMessage('');

    try {
      // 1. Ask for permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setMessage('Permission denied. Enable notifications in your browser/phone settings.');
        setBusy(false);
        return;
      }

      // 2. Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 3. Get VAPID public key from server
      const keyRes = await fetch('/api/push/vapid-key');
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        setMessage('Notifications not configured on server yet. Tell Jean to set VAPID keys.');
        setBusy(false);
        return;
      }

      // 4. Subscribe to push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const subJson = sub.toJSON();
      // 5. Send to server (Supabase via our client)
      const { error } = await supabase.from('push_subscriptions').insert({
        user_id: ctx.userId,
        team_id: ctx.team.id,
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh,
        auth: subJson.keys!.auth,
        user_agent: navigator.userAgent,
      });

      if (error) {
        if (error.code === '23505') {
          setMessage('This device is already subscribed.');
        } else {
          setMessage('Could not save subscription: ' + error.message);
        }
      } else {
        setMessage('Notifications enabled! You will get feeding reminders at 8am daily.');
      }
    } catch (e: any) {
      setMessage('Error: ' + (e.message || 'Unknown'));
    } finally {
      setBusy(false);
      router.refresh();
    }
  };

  const removeSub = async (id: string) => {
    if (!confirm('Stop notifications on this device?')) return;
    await supabase.from('push_subscriptions').delete().eq('id', id);
    router.refresh();
  };

  const sendTest = async () => {
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/push/test', { method: 'POST' });
    const data = await res.json();
    setBusy(false);
    if (data.ok) setMessage(`Test sent to ${data.sent} device(s). Check your notifications.`);
    else setMessage('Test failed: ' + (data.error || 'unknown'));
  };

  if (!supported) {
    return (
      <>
        <AppHeader title="Notifications" back />
        <div style={{ padding: 20 }}>
          <Card>
            <AlertCircle size={32} color={BRAND.danger} />
            <h2 style={{ fontSize: 18, margin: '12px 0' }}>Not supported on this browser</h2>
            <p style={{ fontSize: 14, color: BRAND.ash, lineHeight: 1.5 }}>
              Push notifications need a modern browser. On iPhone, you must first install Repti-Track to your home screen via Safari's Share menu.
            </p>
          </Card>
        </div>
      </>
    );
  }

  const friendlyDevice = (ua: string | null) => {
    if (!ua) return 'Unknown device';
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/Android/i.test(ua)) return 'Android phone';
    if (/Mac/i.test(ua)) return 'Mac';
    if (/Windows/i.test(ua)) return 'Windows PC';
    return 'Web browser';
  };

  return (
    <>
      <AppHeader title="Notifications" back />
      <div style={{ padding: 20 }}>
        <Section title="Feeding reminders">
          <Card>
            <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
              Daily reminders at <strong>8:00 AM</strong> for reptiles due to feed today or overdue. Enable on each device you want notifications on.
            </div>

            {permission === 'denied' ? (
              <div style={{ background: '#fee', padding: 12, borderRadius: 8, fontSize: 13, color: BRAND.danger }}>
                <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Notifications are blocked. Enable them in your browser/phone settings, then come back.
              </div>
            ) : (
              <button onClick={subscribe} disabled={busy} style={btnPrimary}>
                <Bell size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {busy ? 'Setting up...' : 'Enable on this device'}
              </button>
            )}

            {message && (
              <div style={{
                marginTop: 12, padding: 10, borderRadius: 8, fontSize: 13,
                background: message.includes('enabled') || message.includes('sent') ? '#e8f5e9' : '#fff3cd',
                color: message.includes('enabled') || message.includes('sent') ? BRAND.ok : BRAND.dark,
              }}>
                {message}
              </div>
            )}
          </Card>
        </Section>

        {subscriptions.length > 0 && (
          <Section title={`Subscribed devices (${subscriptions.length})`}>
            {subscriptions.map(sub => (
              <Card key={sub.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Smartphone size={16} />
                      {friendlyDevice(sub.user_agent)}
                    </div>
                    <div style={{ fontSize: 12, color: BRAND.ash, marginTop: 4 }}>
                      Added {formatDate(sub.created_at)}
                    </div>
                  </div>
                  <button onClick={() => removeSub(sub.id)} style={{
                    background: 'transparent', border: 'none', color: BRAND.danger, cursor: 'pointer', padding: 6,
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
            <button onClick={sendTest} disabled={busy} style={{ ...btnSecondary, marginTop: 8 }}>
              {busy ? 'Sending...' : 'Send test notification'}
            </button>
          </Section>
        )}

        <div style={{ fontSize: 12, color: BRAND.ash, marginTop: 20, padding: 12, background: BRAND.cream, borderRadius: 8 }}>
          <strong>iPhone tip:</strong> Notifications only work if you first install Repti-Track to your home screen. In Safari, tap Share → Add to Home Screen. Then open from the home screen icon, not Safari.
        </div>
      </div>
    </>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
