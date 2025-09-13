
import React from 'react';

interface CardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
    return (
        <div className={`bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {icon && <span className="text-cyan-400">{icon}</span>}
                    <h2 className="text-lg font-bold text-gray-200">{title}</h2>
                </div>
            </div>
            <div className="p-4 md:p-6">
                {children}
            </div>
        </div>
    );
};
   