import { env } from '../config/env';

const BASE = `${env.ZAPI_BASE_URL}/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_TOKEN}`;

async function zapi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Z-API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function sendTextMessage(phone: string, message: string) {
  return zapi<{ zaapId: string; messageId: string; id: string }>('/send-text', {
    method: 'POST',
    body: JSON.stringify({ phone, message }),
  });
}

export async function getConnectionStatus() {
  return zapi<{ connected: boolean; smartphoneConnected: boolean }>('/status');
}

export async function getQrCode(): Promise<{ value: string }> {
  const res = await fetch(`${BASE}/qr-code/image`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Z-API ${res.status}: ${text}`);
  }
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return { value: `data:image/png;base64,${base64}` };
}

export async function setWebhookReceived(webhookUrl: string) {
  return zapi<{ value: boolean }>('/update-webhook-received', {
    method: 'PUT',
    body: JSON.stringify({ value: webhookUrl }),
  });
}
