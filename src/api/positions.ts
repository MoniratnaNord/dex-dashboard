export async function fetchHyperliquidUserPositions(address: string) {
	const body = {
		type: "clearinghouseState",
		user: address,
	};

	const res = await fetch("https://api.hyperliquid.xyz/info", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!res.ok) throw new Error("Failed to fetch Hyperliquid data");
	const data = await res.json();
	return data.assetPositions || [];
}

export async function fetchLighterUserPositions(address: string) {
	const url = `https://mainnet.zklighter.elliot.ai/api/v1/account?by=l1_address&value=${address}`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();

	if (!data.accounts?.[0]?.positions) return [];
	return data.accounts[0].positions;
}

export async function fetchHlFundings(address: string, page: number) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/get-hl-fundings?page=${page}`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
export async function fetchLighterFundings(address: string, page: number) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/get-lighter-fundings?page=${page}`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
export async function fetchHlTrades(address: string, page: number) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/get-hl-trades?page=${page}`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
export async function fetchLighterTrades(address: string, page: number) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/get-lighter-trades?page=${page}`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
export async function fetchLighterFundingRate(
	market: number,
	startTime: number,
	endTime: number
) {
	const url = `https://mainnet.zklighter.elliot.ai/api/v1/fundings?market_id=${market}&resolution=1h&start_timestamp=${startTime}&end_timestamp=${endTime}&count_back=1`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
export async function fetchPnl(address: string) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/get-realized-pnl`;
	const res = await fetch(url);
	if (!res.ok) throw new Error("Failed to fetch PNL");
	const data = await res.json();
	return data;
}
export async function fetchPnlData(address: string) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/calculate-pnl`;
	const res = await fetch(url);
	if (!res.ok) throw new Error("Failed to fetch PNL");
	console.log("checking response", res);
	const data = await res.json();
	return data;
}
export async function fetchTokenFundings(address: string) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/token-wise-fundings`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
export async function fetchMarketFees(address: string) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/market-wise-fees`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
export async function fetchMarketFundings() {
	const url = `${
		import.meta.env.VITE_FUNDING_API_URL
	}/api/funding-rates/latest-batch`;
	const res = await fetch(url, {
		method: "GET",
		headers: {
			"X-Access-Key": import.meta.env.VITE_ACCESS_KEY,
			"X-Secret-Key": import.meta.env.VITE_SECRET_KEY,
		},
	});
	// const res = await fetch(url);
	console.log("fetching market fundings from", url);
	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}

export async function fetchAllMarkets() {
	const url = `${
		import.meta.env.VITE_FUNDING_API_URL
	}/api/funding-rates/markets`;
	const res = await fetch(url, {
		method: "GET",
		headers: {
			"X-Access-Key": import.meta.env.VITE_ACCESS_KEY,
			"X-Secret-Key": import.meta.env.VITE_SECRET_KEY,
		},
	});
	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}

export async function fetchScoring(symbol: string) {
	const url = `${
		import.meta.env.VITE_FUNDING_API_URL
	}/api/funding-rates/score-market?market=${symbol}`;
	const res = await fetch(url, {
		method: "GET",
		headers: {
			"X-Access-Key": import.meta.env.VITE_ACCESS_KEY,
			"X-Secret-Key": import.meta.env.VITE_SECRET_KEY,
		},
	});
	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
