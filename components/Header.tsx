
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2 tracking-tight">
                台灣股市監控儀表板
            </h1>
            <p className="text-lg text-gray-400">
                高效率、低延遲的市場異常偵測。
            </p>
        </header>
    );
};
