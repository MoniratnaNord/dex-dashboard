import {
	PlatformData,
	OpenInterestPlatform,
	CurrentFundingRow,
	MeanFundingRow,
	Platform,
	PlatformMarketOption,
	HyperliquidMarketMeta,
	LighterOrderBookMarketMeta,
	FundingSeries,
} from "../types";

// ---- Real APIs ----

const HL_INFO_ENDPOINT = "https://api.hyperliquid.xyz/info";
const LIGHTER_BASE = "https://mainnet.zklighter.elliot.ai/api/v1";

export async function fetchHyperliquidMarkets(): Promise<
	PlatformMarketOption[]
> {
	const resp = await fetch(HL_INFO_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ type: "metaAndAssetCtxs" }),
	});
	if (!resp.ok) throw new Error("Failed to fetch Hyperliquid markets");
	const json = await resp.json();
	console.log("checking json", json);
	// json expected shape includes assets/coins metadata; be defensive
	const assets: any[] = json[0].universe ?? json?.assetCtxs ?? [];
	const options: PlatformMarketOption[] = assets
		.map((a: any) => {
			const meta: HyperliquidMarketMeta = {
				name: a?.name ?? a?.coin ?? "",
				szDecimals: a?.szDecimals ?? a?.szDecs ?? 0,
				maxLeverage: a?.maxLeverage ?? 0,
			};
			return {
				id: `hl:${meta.name}`,
				display: meta.name,
				platform: "hyperliquid",
				hyperliquid: meta,
			};
		})
		.filter((o) => o.display);
	return options;
}

export async function fetchLighterMarkets(): Promise<PlatformMarketOption[]> {
	const resp = await fetch(`${LIGHTER_BASE}/orderBooks`);
	if (!resp.ok) throw new Error("Failed to fetch Lighter markets");
	const json = await resp.json();
	const books: any[] = json?.order_books ?? [];
	const options: PlatformMarketOption[] = books
		.map((b: any) => {
			const meta: LighterOrderBookMarketMeta = {
				symbol: b?.symbol,
				market_id: b?.market_id,
				status: b?.status,
				supported_size_decimals:
					b?.supported_size_decimals ?? b?.supported_size_decimals,
				supported_price_decimals: b?.supported_price_decimals,
				supported_quote_decimals: b?.supported_quote_decimals,
			};
			return {
				id: `lt:${meta.market_id}`,
				display: meta.symbol,
				platform: "lighter",
				lighter: meta,
			};
		})
		.filter((o) => o.display);
	return options;
}

export async function fetchFundingSeries(
	platform: Platform,
	symbolOrId: string,
	startTimeMs: number,
	endTimeMs?: number
): Promise<FundingSeries> {
	console.log("start end", startTimeMs, endTimeMs);
	if (platform === "hyperliquid") {
		const coin = symbolOrId; // coin symbol, e.g. 'ETH'
		const body = {
			type: "fundingHistory",
			coin,
			startTime: startTimeMs,
			...(endTimeMs ? { endTime: endTimeMs } : {}),
		} as const;
		const resp = await fetch(HL_INFO_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		if (!resp.ok) throw new Error("Failed to fetch Hyperliquid funding");
		const json = await resp.json();
		console.log("checking funding json", json);
		const raw = (json?.funding ?? json ?? []) as any[];
		const points = raw
			.map((p: any) => {
				const ts = Number(p?.time ?? p?.t ?? p?.timestamp ?? 0);
				const timestamp = ts < 1e12 ? ts * 1000 : ts; // normalize to ms
				const rate = p?.fundingRate ?? p?.rate ?? 0;
				const value = (typeof rate === "number" ? rate : Number(rate)) * 100;
				return { timestamp, value };
			})
			.sort((a, b) => a.timestamp - b.timestamp);
		return { platform, market: coin, points };
	}
	console.log(symbolOrId);
	// lighter
	const [prefix, idStr] = symbolOrId.includes(":")
		? symbolOrId.split(":")
		: ["lt", symbolOrId];
	const marketId = Number(idStr);
	const params = new URLSearchParams({
		market_id: String(marketId),
		resolution: "1h",
		start_timestamp: String(Math.floor(startTimeMs / 1000)),
		...(endTimeMs
			? { end_timestamp: String(Math.floor(endTimeMs / 1000)) }
			: {}),
		count_back: "1000",
	});
	const resp = await fetch(`${LIGHTER_BASE}/fundings?${params.toString()}`);
	if (!resp.ok) throw new Error("Failed to fetch Lighter funding");
	const json = await resp.json();
	console.log("checking lighter json", json);
	const series = Array.isArray(json)
		? json
		: json?.fundings ?? json?.data ?? [];
	const points = series
		.map((p: any) => {
			const ts = Number(p?.timestamp ?? p?.time ?? 0);
			const timestamp = ts < 1e12 ? ts * 1000 : ts; // normalize to ms
			const rate = p?.rate ?? p?.fundingRate ?? 0;
			const value = (typeof rate === "number" ? rate : Number(rate)) * 100;
			return { timestamp, value };
		})
		.sort((a, b) => a.timestamp - b.timestamp);
	return { platform, market: String(marketId), points };
}

export const fetchFundingRateData = async (
	market: string,
	timeRange: string
): Promise<PlatformData[]> => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const now = Date.now();
	const hours = 24;
	const dataPoints = 100;

	const generateData = (baseRate: number, volatility: number) => {
		const data = [];
		for (let i = 0; i < dataPoints; i++) {
			const timestamp =
				now -
				hours * 60 * 60 * 1000 +
				(i * (hours * 60 * 60 * 1000)) / dataPoints;
			const noise = (Math.random() - 0.5) * volatility;
			const spike = i > 40 && i < 50 ? Math.random() * 3 : 0;
			const value = Math.max(0, baseRate + noise + spike);
			data.push({ timestamp, value });
		}
		return data;
	};

	const asterdexData = generateData(0.77, 1.5);
	const pacificaData = generateData(0.11, 0.02);

	return [
		{
			name: "asterdex",
			color: "#10b981",
			data: asterdexData,
			min: 21.9,
			max: 528,
			mean: 77.0,
		},
		{
			name: "pacifica",
			color: "#3b82f6",
			data: pacificaData,
			min: 11.0,
			max: 11.0,
			mean: 10.9,
		},
	];
};

export const fetchOpenInterestData = async (
	market: string,
	timeRange: string
): Promise<OpenInterestPlatform[]> => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const now = Date.now();
	const hours = 24;
	const dataPoints = 100;

	const generateOIData = (baseValue: number, volatility: number) => {
		const data = [];
		for (let i = 0; i < dataPoints; i++) {
			const timestamp =
				now -
				hours * 60 * 60 * 1000 +
				(i * (hours * 60 * 60 * 1000)) / dataPoints;
			const noise = (Math.random() - 0.5) * volatility;
			const value = baseValue + noise;
			data.push({ timestamp, value });
		}
		return data;
	};

	const asterdexData = generateOIData(202000, 30000);
	const pacificaData = generateOIData(198000, 60000);

	return [
		{
			name: "asterdex",
			color: "#10b981",
			data: asterdexData,
			min: "$192K",
			max: "$228K",
			mean: "$202K",
		},
		{
			name: "pacifica",
			color: "#3b82f6",
			data: pacificaData,
			min: "$157K",
			max: "$261K",
			mean: "$198K",
		},
	];
};

export const fetchCurrentFunding = async (
	page: number = 1
): Promise<{ data: CurrentFundingRow[]; total: number }> => {
	await new Promise((resolve) => setTimeout(resolve, 300));

	const allData: CurrentFundingRow[] = [
		{ market: "OPEN-USD", delta: null, extended: "", rate: "422%" },
		{ market: "UB-USD", delta: null, extended: "", rate: "394%" },
		{ market: "G-USD", delta: null, extended: "", rate: "151%" },
		{ market: "APT-USD", delta: 11.4, extended: "", rate: "133%" },
		{ market: "VVV-USD", delta: null, extended: "", rate: "126%" },
	];

	return {
		data: allData.slice((page - 1) * 5, page * 5),
		total: 121,
	};
};

export const fetchMeanFunding = async (
	page: number = 1
): Promise<{ data: MeanFundingRow[]; total: number }> => {
	await new Promise((resolve) => setTimeout(resolve, 300));

	const allData: MeanFundingRow[] = [
		{ market: "COAI-USD", delta: "0%", extended: "" },
		{ market: "LYN-USD", delta: "0%", extended: "" },
		{ market: "PORT3-USD", delta: "0%", extended: "" },
		{ market: "TOSHI-USD", delta: "0%", extended: "" },
		{ market: "ESPORTS-USD", delta: "0%", extended: "" },
	];

	return {
		data: allData.slice((page - 1) * 5, page * 5),
		total: 121,
	};
};
