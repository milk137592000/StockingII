
import type { StatusData, MarketData, TickerData, OpportunitySignal } from '../types';
import { ServiceStatus } from '../types';

// This state will be updated with live data from the TWSE API.
const defaultTickerData: TickerData = { price: 0, change: 0, changePercent: 0 };
let liveMarketData: MarketData = {
    '^TWII': { ...defaultTickerData },
    '0050.TW': { ...defaultTickerData },
    '00646.TW': { ...defaultTickerData },
    '00878.TW': { ...defaultTickerData },
    '00933B.TW': { ...defaultTickerData },
};
let cumulativeDrop: number = 0;

// Map app symbols to TWSE API query params
const symbolMap: { [key: string]: string } = {
    '^TWII': 'tse_t00.tw',
    '0050.TW': 'tse_0050.tw',
    '00646.TW': 'tse_00646.tw',
    '00878.TW': 'tse_00878.tw',
    '00933B.TW': 'otc_00933B.tw',
};

// Map TWSE API response codes back to app symbols
const reverseSymbolMap: { [key: string]: string } = {
    't00': '^TWII',
    '0050': '0050.TW',
    '00646': '00646.TW',
    '00878': '00878.TW',
    '00933B': '00933B.TW',
};

/**
 * Fetches real-time market data from the Taiwan Stock Exchange API.
 */
const fetchRealTimeData = async (): Promise<void> => {
    const apiQueryString = Object.values(symbolMap).join('|');
    // The TWSE API does not provide the necessary CORS headers for direct browser requests.
    // To work around this, we route the request through a public CORS proxy.
    const twseUrl = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${apiQueryString}&_=${Date.now()}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(twseUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`CORS proxy or TWSE API request failed with status ${response.status}`);
        }
        const data = await response.json();

        if (!data.msgArray || data.msgArray.length === 0) {
            console.warn('TWSE API returned no data in msgArray');
            return;
        }

        const newMarketData: MarketData = { ...liveMarketData };

        for (const item of data.msgArray) {
            const appSymbol = reverseSymbolMap[item.c];
            if (appSymbol) {
                const price = parseFloat(item.z);
                const prevClose = parseFloat(item.y);

                if (!isNaN(price) && !isNaN(prevClose) && prevClose > 0) {
                    const change = price - prevClose;
                    const changePercent = (change / prevClose) * 100;

                    newMarketData[appSymbol] = {
                        price: price,
                        change: change,
                        changePercent: changePercent,
                    };

                    if (appSymbol === '^TWII') {
                        cumulativeDrop = change;
                    }
                }
            }
        }
        liveMarketData = newMarketData;

    } catch (error) {
        console.error("Failed to fetch real-time market data:", error);
        throw error;
    }
};

const isMarketHours = (): boolean => {
    const now = new Date();
    const taipeiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    
    const day = taipeiTime.getDay();
    const hour = taipeiTime.getHours();
    const minute = taipeiTime.getMinutes();

    if (day < 1 || day > 5) return false; 
    
    const timeInMinutes = hour * 60 + minute;
    const marketOpenTime = 9 * 60;
    const marketCloseTime = 13 * 60 + 30;

    return timeInMinutes >= marketOpenTime && timeInMinutes <= marketCloseTime;
};

const simulateDelay = <T,>(data: T, min = 200, max = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), min + Math.random() * (max - min)));
};

export const getStatus = async (): Promise<StatusData> => {
    const marketOpen = isMarketHours();
    const status: StatusData = {
        status: marketOpen ? ServiceStatus.ACTIVE : ServiceStatus.INACTIVE,
        lastChecked: new Date().toISOString(),
        marketOpen: marketOpen,
        cumulativeDrop: cumulativeDrop
    };
    if (Math.random() > 0.98) status.status = ServiceStatus.ERROR; 
    return simulateDelay(status);
};

export const getMarketData = async (): Promise<MarketData> => {
    await fetchRealTimeData();
    return Promise.resolve(JSON.parse(JSON.stringify(liveMarketData)));
};

export const getOpportunitySignals = async (): Promise<OpportunitySignal[]> => {
    try {
        const response = await fetch('/api/signals');
        if (!response.ok) {
            console.warn(`Failed to fetch signals with status: ${response.status}`);
            return [];
        }
        const signals = await response.json();
        return signals || [];
    } catch (error) {
        console.error("Failed to fetch opportunity signals:", error);
        return [];
    }
};
