import React from 'react';

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export const WarningPanel: React.FC = () => {
    return (
        <div 
            className="bg-amber-900/30 border border-amber-400/50 text-amber-200 p-4 rounded-lg flex items-start space-x-3"
            role="alert"
            aria-live="polite"
        >
            <div className="text-amber-400">
                <WarningIcon />
            </div>
            <div>
                <h3 className="font-bold">免責聲明</h3>
                <p className="text-sm">
                    本儀表板顯示的資訊僅供參考，不構成任何投資建議。所有數據僅用於模擬和展示目的，不保證即時性與準確性。市場有風險，投資需謹慎。
                </p>
            </div>
        </div>
    );
};
