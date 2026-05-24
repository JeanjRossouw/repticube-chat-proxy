import webpush from 'web-push';

let configured = false;

export function configureWebPush() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:repticube@gmail.com';
  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not set in environment');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export type StoredSub = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Sends a push to a subscription. Returns true on success, false if subscription is dead (and should be cleaned up).
 */
export async function sendPushToSub(sub: StoredSub, payload: PushPayload): Promise<{ ok: boolean; gone: boolean }> {
  configureWebPush();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 }, // 24h
    );
    return { ok: true, gone: false };
  } catch (e: any) {
    const statusCode = e.statusCode;
    // 404/410 = subscription expired or revoked
    if (statusCode === 404 || statusCode === 410) {
      return { ok: false, gone: true };
    }
    console.error('Push send failed:', e.message);
    return { ok: false, gone: false };
  }
}
