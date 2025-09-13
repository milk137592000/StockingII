
import React from 'react';
import type { OpportunitySignal } from '../types';

const SignalIcon: React.FC<{ indicator: string }> = ({ indicator }) => {
    // Return a different icon based on the indicator type
    if (indicator.includes('景氣')) return <span aria-label="Economy light icon">💡</span>;
    if (indicator.includes('VIX')) return <span aria-label="Fear gauge icon">😨</span>;
    if (indicator.includes('淨值比')) return <span aria-label="Value scale icon">⚖️</span>;
    if (indicator.includes('利率')) return <span aria-label="Interest rate cycle icon">🔄</span>;
    return <span aria-label="Signal icon">🔔</span>;
};


const SignalCard: React.FC<{ signal: OpportunitySignal }> = ({ signal }) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-3">
                <div className="text-xl"><SignalIcon indicator={signal.indicator} /></div>
                <div>
                    <h4 className="font-bold text-cyan-400">{signal.indicator}</h4>
                    <p className="text-sm font-mono text-gray-300">{signal.value}</p>
                </div>
            </div>
            <div>
                <h5 className="font-semibold text-gray-200">{signal.title}</h5>
                <p className="text-sm text-gray-400">{signal.description}</p>
            </div>
            <div className="pt-2">
                <p className="text-xs text-gray-500">適用標的: <span className="font-mono">{signal.applicableTo.join(', ')}</span></p>
            </div>
        </div>
    );
}

interface OpportunitiesCardProps {
    signals: OpportunitySignal[];
    isLoading: boolean;
}

export const OpportunitiesCard: React.FC<OpportunitiesCardProps> = ({ signals, isLoading }) => {
    if (isLoading) {
        return (
            <section aria-labelledby="opportunities-heading">
                <h2 id="opportunities-heading" className="text-xl font-bold text-gray-200 mb-3">進場機會分析</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center animate-pulse">
                    <p className="text-gray-500">正在分析市場訊號...</p>
                </div>
            </section>
        );
    }

    if (signals.length === 0) {
        return (
            <section aria-labelledby="opportunities-heading">
                <h2 id="opportunities-heading" className="text-xl font-bold text-gray-200 mb-3">進場機會分析</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">✅ 目前市場穩定，無明確的長線進場訊號。</p>
                </div>
            </section>
        );
    }
    
    return (
        <section aria-labelledby="opportunities-heading">
            <h2 id="opportunities-heading" className="text-xl font-bold text-gray-200 mb-3">進場機會分析</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map(signal => (
                    <SignalCard key={signal.id} signal={signal} />
                ))}
            </div>
        </section>
    );
};
