import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { OpportunitySignal } from '../types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // FIX: Changed kv.get to kv.Get to resolve TypeScript error, likely due to an older @vercel/kv version with PascalCase methods.
    const signals: OpportunitySignal[] | null = await kv.Get('latest_signals');
    res.status(200).json(signals || []);
  } catch (error) {
    console.error('Failed to retrieve signals from KV:', error);
    res.status(500).json({ message: 'Failed to retrieve signals.' });
  }
}
