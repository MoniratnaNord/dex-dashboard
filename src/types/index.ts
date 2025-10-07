export interface FundingRateDataPoint {
	timestamp: number;
	value: number;
}

export interface PlatformData {
	name: string;
	color: string;
	data: FundingRateDataPoint[];
	min: number;
	max: number;
	mean: number;
}

export interface OpenInterestDataPoint {
	timestamp: number;
	value: number;
}

export interface OpenInterestPlatform {
	name: string;
	color: string;
	data: OpenInterestDataPoint[];
	min: string;
	max: string;
	mean: string;
}

export interface CurrentFundingRow {
	market: string;
	delta: number | null;
	extended: string;
	rate: string;
}

export interface MeanFundingRow {
	market: string;
	delta: string;
	extended: string;
}

// Platform selection
export type Platform = "hyperliquid" | "lighter";

// Market types
export interface HyperliquidMarketMeta {
	name: string; // e.g. "ETH"
	szDecimals: number;
	maxLeverage: number;
}

export interface LighterOrderBookMarketMeta {
	symbol: string; // e.g. "ETH"
	market_id: number;
	status: string;
	supported_size_decimals: number;
	supported_price_decimals: number;
	supported_quote_decimals: number;
}

export interface PlatformMarketOption {
	id: string; // unique key per platform (e.g. symbol or market_id prefixed)
	display: string; // user-facing label, e.g. "ETH"
	platform: Platform;
	// platform specific payloads for later use
	hyperliquid?: HyperliquidMarketMeta;
	lighter?: LighterOrderBookMarketMeta;
}

// Funding history types (normalized)
export interface FundingSample {
	timestamp: number; // ms
	value: number; // percentage value, not fraction
}

export interface FundingSeries {
	platform: Platform;
	market: string; // symbol/coin
	points: FundingSample[];
}
