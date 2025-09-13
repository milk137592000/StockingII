
import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { OpportunitySignal } from '../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OpportunitySignal[] | { message: string }>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // FIX: Changed kv.get to kv.GET as the method name is uppercase.
    const signals: OpportunitySignal[] | null = await kv.GET('latest_signals');
    res.status(200).json(signals || []);
  } catch (error) {
    console.error('Failed to retrieve signals from KV:', error);
    res.status(500).json({ message: 'Failed to retrieve signals.' });
  }
}
