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

export async function fetchUserFundings(address: string) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/get-user-fundings`;
	const res = await fetch(url);

	if (!res.ok) throw new Error("Failed to fetch Lighter data");
	const data = await res.json();
	return data;
}
export async function fetchUserTrades(address: string) {
	const url = `${
		import.meta.env.VITE_API_URL
	}/api/user/${address}/get-users-trades`;
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
