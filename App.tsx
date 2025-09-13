import React, { useState, useEffect, useCallback } from 'react';
import { getStatus, getMarketData, getOpportunitySignals } from './services/api';
import type { StatusData, MarketData, OpportunitySignal } from './types';
import { MarketOverview } from './components/StatusCard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OpportunitiesCard } from './components/OpportunitiesCard';
import { WarningPanel } from './components/WarningPanel';

const App: React.FC = () => {
    const [statusData, setStatusData] = useState<StatusData | null>(null);
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [signals, setSignals] = useState<OpportunitySignal[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            // Don't set loading to true on refetch, to avoid UI flickering
            setError(null);
            const [status, fetchedMarketData, fetchedSignals] = await Promise.all([
                getStatus(),
                getMarketData(),
                getOpportunitySignals(),
            ]);
            setStatusData(status);
            setMarketData(fetchedMarketData);
            setSignals(fetchedSignals);
        } catch (err) {
            setError('無法從監控服務獲取資料。請稍後再試。');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    return (
        <div className="min-h-screen bg-gray-950 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <Header />
                <main className="grid grid-cols-1 gap-8">
                    <WarningPanel />
                    {error && <div className="bg-red-900/50 border border-red-400 text-red-300 p-4 rounded-lg text-center">{error}</div>}
                    <OpportunitiesCard signals={signals} isLoading={isLoading} />
                    <MarketOverview statusData={statusData} marketData={marketData} isLoading={isLoading} />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;
