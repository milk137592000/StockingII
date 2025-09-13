import React from 'react';
import type { StatusData, TickerData, MarketData } from '../types';

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const PriceDisplay: React.FC<{ data: TickerData }> = ({ data }) => {
    const isUp = data.change >= 0;
    // In Taiwan stocks, red signifies an increase and green signifies a decrease.
    const colorClass = isUp ? 'text-red-400' : 'text-green-400';
    const sign = isUp && data.change > 0 ? '+' : '';

    return (
        <div className="text-right">
            <p className={`text-2xl lg:text-3xl font-bold font-mono ${colorClass}`}>{data.price.toFixed(2)}</p>
            <p className={`text-sm font-mono ${colorClass}`}>
                {sign}{data.change.toFixed(2)} ({sign}{data.changePercent.toFixed(2)}%)
            </p>
        </div>
    );
};

interface TickerCardProps {
    name: string;
    symbol: string;
    data: TickerData | undefined;
    isLoading: boolean;
    className?: string;
    linkUrl?: string;
}

const TickerCard: React.FC<TickerCardProps> = ({ name, symbol, data, isLoading, className = '', linkUrl }) => {
    const cardClasses = `bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col transition-all duration-300 ${className}`;

    return (
        <div className={cardClasses}>
            <div className="flex justify-between items-baseline mb-2">
                <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-gray-200">{name}</h4>
                    {linkUrl && (
                        <a href={linkUrl} target="_blank" rel="noopener noreferrer" aria-label={`追蹤 ${name} 於 Yahoo Finance`} className="text-gray-500 hover:text-cyan-400 transition-colors">
                            <ExternalLinkIcon />
                        </a>
                    )}
                </div>
                <span className="font-mono text-xs text-gray-400">{symbol}</span>
            </div>
            <div className="flex-grow flex items-center justify-center">
                {isLoading ? (
                    <p className="text-gray-400 text-sm animate-pulse">正在載入即時資料...</p>
                ) : data ? (
                    <div className="w-full">
                       <PriceDisplay data={data} />
                    </div>
                ) : (
                    <p className="text-amber-400 text-sm">無法載入資料</p>
                )}
            </div>
        </div>
    );
};

const ChronicBleedCounter: React.FC<{ cumulativeDrop: number | undefined; isLoading: boolean }> = ({ cumulativeDrop, isLoading }) => {
    const drop = cumulativeDrop ?? 0;
    const isUp = drop >= 0;
    // In Taiwan stocks, red signifies an increase and green signifies a decrease.
    const cumulativeDropColor = isUp ? 'text-red-400' : 'text-green-400';
    
    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 flex items-center space-x-3">
            <InfoIcon />
            <div>
                <h4 className="font-semibold text-gray-300">慢性失血計數器</h4>
                <div className="text-sm text-gray-400 h-5">
                    {isLoading ? (
                        <div className="h-4 bg-gray-700 rounded-md animate-pulse w-48 mt-1"></div>
                     ) : (
                        <span>
                            目前累積: <span className={`font-mono font-bold ${cumulativeDropColor}`}>{drop.toFixed(2)} 點</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

interface MarketOverviewProps {
    statusData: StatusData | null;
    marketData: MarketData | null;
    isLoading: boolean;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ statusData, marketData, isLoading }) => {
    const etfs = [
        { name: '元大台灣50', symbol: '0050.TW', linkUrl: 'https://tw.stock.yahoo.com/quote/0050.TW' },
        { name: '元大S&P500', symbol: '00646.TW', linkUrl: 'https://tw.stock.yahoo.com/quote/00646.TW' },
        { name: '國泰永續高股息', symbol: '00878.TW', linkUrl: 'https://tw.stock.yahoo.com/quote/00878.TW' },
        { name: '國泰10Y+金融債', symbol: '00933B.TW', linkUrl: 'https://tw.stock.yahoo.com/quote/00933B.TW' },
    ];

    return (
        <div className="space-y-6">
            <section aria-labelledby="market-status-heading">
                <h2 id="market-status-heading" className="text-xl font-bold text-gray-200 mb-3">市場狀態</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-300 mb-2 sr-only">大盤指數</h3>
                        <TickerCard 
                            name="台灣加權指數" 
                            symbol="^TWII" 
                            data={marketData?.['^TWII']} 
                            isLoading={isLoading}
                            className="h-40"
                            linkUrl="https://tw.stock.yahoo.com/quote/^TWII"
                        />
                    </div>
                    <ChronicBleedCounter cumulativeDrop={statusData?.cumulativeDrop} isLoading={isLoading || !statusData} />
                </div>
            </section>

            <section aria-labelledby="etf-monitoring-heading">
                <h2 id="etf-monitoring-heading" className="text-xl font-bold text-gray-200 mb-3">監控中的 ETF</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {etfs.map(etf => (
                        <TickerCard 
                            key={etf.symbol}
                            name={etf.name}
                            symbol={etf.symbol}
                            data={marketData?.[etf.symbol]}
                            isLoading={isLoading}
                            className="h-32"
                            linkUrl={etf.linkUrl}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};