
export enum ServiceStatus {
    ACTIVE = 'ACTIVE', // Running during market hours
    INACTIVE = 'INACTIVE', // Outside market hours
    ERROR = 'ERROR', // An error occurred
}

export interface StatusData {
    status: ServiceStatus;
    lastChecked: string;
    marketOpen: boolean;
    cumulativeDrop: number;
}

export interface TickerData {
    price: number;
    change: number;
    changePercent: number;
}

export type MarketData = Record<string, TickerData>;

export interface OpportunitySignal {
  id: string;
  indicator: string;
  value: string;
  title: string;
  description: string;
  applicableTo: string[];
}
