
import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';

// Define the structure for an opportunity signal
interface OpportunitySignal {
  id: string;
  indicator: string;
  value: string;
  title: string;
  description: string;
  applicableTo: string[];
}

// --- SIMULATION OF EXTERNAL DATA ---
const getSimulatedMarketIndicators = () => {
    const random = Math.random();
    let gdpLight: '藍燈' | '黃藍燈' | '綠燈' = '綠燈';
    if (random < 0.1) gdpLight = '藍燈';
    else if (random < 0.25) gdpLight = '黃藍燈';
    const vixIndex = 12 + Math.random() * 23;
    const taiexPbRatio = 1.4 + Math.random();
    let fedPolicyCycle: '升息末期' | '持平觀察' | '降息初期' = '持平觀察';
    if (random < 0.3) fedPolicyCycle = '升息末期';
    
    return { gdpLight, vixIndex, taiexPbRatio, fedPolicyCycle };
};

// --- NEW: REAL LINE MESSAGING API SENDER ---
const sendLinePushMessage = async (message: string) => {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const userId = process.env.LINE_USER_ID;

    if (!channelAccessToken || !userId) {
        console.error('LINE_CHANNEL_ACCESS_TOKEN or LINE_USER_ID is not set in environment variables.');
        return;
    }

    try {
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({
                to: userId,
                messages: [{ type: 'text', text: message }],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to send Line message:', errorData.message, errorData.details);
        } else {
            console.log('Successfully sent Line message via Messaging API.');
        }
    } catch (error) {
        console.error('Error sending Line message:', error);
    }
};


// --- CORE ANALYSIS LOGIC (Updated to use new sender) ---
const analyzeAndNotify = async (): Promise<OpportunitySignal[]> => {
    const indicators = getSimulatedMarketIndicators();
    const signals: OpportunitySignal[] = [];
    const stockEtfs = ['0050.TW', '00646.TW', '00878.TW'];
    const bondEtfs = ['00933B.TW'];

    if (indicators.gdpLight === '藍燈' || indicators.gdpLight === '黃藍燈') {
        signals.push({
            id: 'gdp_low', indicator: '國發會景氣對策信號', value: indicators.gdpLight,
            title: '景氣低迷，浮現長線佈局價值',
            description: '景氣燈號顯示經濟活動放緩，股市通常處於相對低檔，適合長期投資者分批佈局。',
            applicableTo: stockEtfs,
        });
    }

    if (indicators.vixIndex > 25) {
        signals.push({
            id: 'vix_high', indicator: 'VIX恐慌指數', value: `> 25 (現值: ${indicators.vixIndex.toFixed(2)})`,
            title: '市場極度恐慌，逆向投資機會',
            description: 'VIX 指數飆升代表市場充滿恐懼，往往是股市的相對底部，符合「別人恐懼我貪婪」的投資原則。',
            applicableTo: stockEtfs,
        });
    }
    
    if (indicators.taiexPbRatio < 1.6) {
        signals.push({
            id: 'pbr_low', indicator: '大盤股價淨值比', value: `< 1.6 (現值: ${indicators.taiexPbRatio.toFixed(2)})`,
            title: '整體市場價值被低估',
            description: '大盤股價淨值比處於歷史低位，代表整體股市價格便宜，提供了具吸引力的長期安全邊際。',
            applicableTo: stockEtfs,
        });
    }

    if (indicators.fedPolicyCycle === '升息末期') {
        signals.push({
            id: 'fed_end_hike', indicator: 'Fed利率政策週期', value: '升息循環末期',
            title: '鎖定高殖利率，迎接降息資本利得',
            description: '市場預期聯準會即將停止升息並轉向降息，此時佈局長天期債券，可鎖定較高殖利率，并賺取未來價格上漲的空間。',
            applicableTo: bondEtfs,
        });
    }
    
    // --- Check KV and Send Notifications ---
    for (const signal of signals) {
        const key = `signal_sent:${signal.id}`;
        const hasBeenNotified = await kv.get(key);

        if (!hasBeenNotified) {
            const message = `📈 股市進場機會警報 📉

訊號類型: ${signal.indicator}
目前狀態: ${signal.value}
投資觀點: ${signal.title}
適用標的: ${signal.applicableTo.join(', ')}

[免責聲明：本通知僅為資訊參考，不構成任何投資建議。]`;
            await sendLinePushMessage(message); // Using the new function
            // Set a key in Vercel KV with a 12-hour expiration to prevent spam
            await kv.set(key, true, { ex: 43200 }); // 12 hours * 60 mins * 60 secs
        } else {
            console.log(`Signal [${signal.id}] has already been notified recently. Skipping.`);
        }
    }

    return signals;
};

// --- API HANDLER for Vercel Cron Job ---
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    console.log("Cron job started at:", new Date().toISOString());
    const signals = await analyzeAndNotify();
    
    // Store latest signals in KV for the frontend to fetch
    await kv.set('latest_signals', signals, { ex: 43200 }); // 12 hours TTL

    response.status(200).json({
      message: 'Cron job executed successfully.',
      foundSignals: signals.length,
      signals: signals.map(s => s.id),
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    // Clear signals on failure to avoid showing stale data
    await kv.set('latest_signals', []);
    response.status(500).json({ message: 'Cron job execution failed.' });
  }
}
