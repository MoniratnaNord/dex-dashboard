import { useEffect, useState } from "react";
import {
	fetchHyperliquidUserPositions,
	fetchLighterFundingRate,
	fetchLighterUserPositions,
	fetchPnl,
	fetchUserFundings,
	fetchUserTrades,
} from "../api/positions";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { fetchHyperliquidMarkets, fetchLighterMarkets } from "../services/api";
import { useLocation, useParams } from "react-router-dom";

export default function Positions() {
	const params = useParams();
	const [address, setAddress] = useState("");
	const [hlPositions, setHlPositions] = useState<any[]>([]);
	const [ltPositions, setLtPositions] = useState<any[]>([]);
	const [hlFundings, setHlFundings] = useState<any[]>([]);
	const [ltFundings, setLtFundings] = useState<any[]>([]);
	const [hlTrades, setHlTrades] = useState<any[]>([]);
	const [ltTrades, setLtTrades] = useState<any[]>([]);
	const [hlPnl, setHlPnl] = useState(0);
	const [lighterPnl, setLighterPnl] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFetch = async () => {
		setError(null);
		setLoading(true);
		setHlPositions([]);
		setLtPositions([]);
		setHlFundings([]);
		setLtFundings([]);
		setHlTrades([]);
		setLtTrades([]);
		try {
			const [hl, lt, fundings, trades, pnl] = await Promise.all([
				fetchHyperliquidUserPositions(
					"0xA2a95178FFED95ce9a2278bcA9bB5bef8C0DC95C"
				),
				fetchLighterUserPositions("0xA2a95178FFED95ce9a2278bcA9bB5bef8C0DC95C"),
				fetchUserFundings("0xA2a95178FFED95ce9a2278bcA9bB5bef8C0DC95C"),
				fetchUserTrades("0xA2a95178FFED95ce9a2278bcA9bB5bef8C0DC95C"),
				fetchPnl("0xA2a95178FFED95ce9a2278bcA9bB5bef8C0DC95C"),
			]);
			setHlPositions(hl);
			setLtPositions(lt);
			setHlFundings(fundings.data.hyperliquid_funding || []);
			setLtFundings(fundings.data.lighter_funding || []);
			setHlTrades(trades.data.hyperliquid_trades || []);
			setLtTrades(trades.data.lighter_trades || []);
			const hlTotal = sumRealizedPnL(pnl.data.hl);
			const lighterTotal = sumRealizedPnL(pnl.data.lighter);
			setHlPnl(Number(hlTotal));
			setLighterPnl(Number(lighterTotal));
		} catch (e: any) {
			setError(e.message || "Error fetching positions");
		} finally {
			setLoading(false);
		}
	};
	console.log("checking pnl", hlPnl, lighterPnl);
	const sumRealizedPnL = (obj) =>
		Object.values(obj).reduce(
			(sum, token: any) => sum + (token.realized_pnl_all_time || 0),
			0
		);
	const formatTimestamp = (ts: number) => new Date(ts).toLocaleString();
	useEffect(() => {
		handleFetch();
	}, []);

	const getTokenWiseFunding = (fundings: any[]) => {
		const summary: Record<string, { paid: number; earned: number }> = {};

		fundings.forEach((f) => {
			if (!summary[f.market]) {
				summary[f.market] = { paid: 0, earned: 0 };
			}
			if (Number(f.amount) < 0) {
				summary[f.market].paid += Number(f.amount);
			} else {
				summary[f.market].earned += Number(f.amount);
			}
		});

		// Convert to array for table
		return Object.entries(summary).map(([token, { paid, earned }]) => ({
			token,
			fundingPaid: paid.toFixed(6),
			fundingEarned: earned.toFixed(6),
			netFunding: (earned + paid).toFixed(6),
		}));
	};
	const overallFunding = (fundings: any[]) => {
		const totalFundingEarned = fundings
			.filter((f) => Number(f.amount) > 0)
			.reduce((acc, f) => acc + Number(f.amount), 0);
		const totalFundingPaid = fundings
			.filter((f) => Number(f.amount) < 0)
			.reduce((acc, f) => acc + Number(f.amount), 0);
		return {
			totalFundingEarned: totalFundingEarned.toFixed(6),
			totalFundingPaid: totalFundingPaid.toFixed(6),
			netFunding: (totalFundingEarned + totalFundingPaid).toFixed(6),
		};
	};
	const getMarketWiseFees = (trades: any[]) => {
		const summary: Record<string, number> = {};
		trades.forEach((t) => {
			const market = t.market || t.symbol || t.coin || "Unknown";
			const fee = Number(t.fee || 0);
			summary[market] = (summary[market] || 0) + fee;
		});
		return Object.entries(summary).map(([market, fee]) => ({
			market,
			fee: fee.toFixed(6),
		}));
	};

	// const getFundingRate = async(market: string) => {
	//         const [hlMarkets, ltMarkets] = await Promise.all([
	//             fetchHyperliquidMarkets(),
	//             fetchLighterMarkets(),
	//         ]);
	//         const funding = hlMarkets.filter(
	//             (i: any) => i.hyperliquid.name.toLowerCase() === market.toLowerCase()
	//         );
	//         const hlFunding = funding[0].funding;
	//         setHlFunding(hlFunding);
	// 	return {
	// 		hlFunding: hlFunding,
	// 		// lighterFunding:
	// 	};
	// 	// console.log("hl market", hlMarkets);
	// };
	// useEffect(()=>{
	//     getFundingRate()
	// },[hlPositions])
	const [fundingMap, setFundingMap] = useState<Record<string, number>>({});

	useEffect(() => {
		const loadFundingRates = async () => {
			const markets = await fetchHyperliquidMarkets();
			const map: Record<string, number> = {};
			markets.forEach((m: any) => {
				map[m.hyperliquid.name.toLowerCase()] = m.funding;
			});
			setFundingMap(map);
		};
		loadFundingRates();
	}, []);
	function LighterFundingRateCell({ symbol }: { symbol: string }) {
		const [fundingRate, setFundingRate] = useState<string | null>(null);
		useEffect(() => {
			(async () => {
				const markets = await fetchLighterMarkets();

				const filterMarket = markets.filter(
					(i: any) => i.lighter.symbol.toLowerCase() === symbol.toLowerCase()
				);

				const endTime = Date.now(); // current time in epoch (ms)
				const startTime = endTime - 60 * 60 * 1000; // 1 hour earlier

				const rate = await fetchLighterFundingRate(
					filterMarket[0].lighter?.market_id ?? 0,
					startTime,
					endTime
				);
				setFundingRate(rate.fundings[0].rate);
			})();
		}, [symbol]);

		return <td>{fundingRate ? `${fundingRate}%` : "Loading..."}</td>;
	}

	return (
		<div className="min-h-screen bg-[#141414] flex text-white">
			<Sidebar />

			<div className="flex-1 flex flex-col">
				<Header />

				<main className="flex-1 p-6 overflow-auto">
					<h1 className="text-2xl font-bold mb-6">User Positions</h1>

					{/* Input + Fetch */}
					<div className="flex gap-3 mb-6">
						<div
							// type="text"
							// placeholder="Enter wallet address (0x...)"
							// value={"0xA2a95178FFED95ce9a2278bcA9bB5bef8C0DC95C"}
							// onChange={(e) => setAddress(e.target.value)}
							className="bg-[#1f1f1f]  rounded-lg px-4 py-2 flex-1 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
						>
							Address: {"0xA2a95178FFED95ce9a2278bcA9bB5bef8C0DC95C"}{" "}
						</div>
						<button
							onClick={handleFetch}
							disabled={true}
							className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
						>
							{loading ? "Fetching..." : "Fetch Positions"}
						</button>
					</div>

					{error && <p className="text-red-500 mb-4">{error}</p>}

					{/* ---------------- Hyperliquid ---------------- */}
					<section className="mb-10">
						<div className="flex justify-between">
							<h2 className="text-xl font-semibold mb-3 text-green-400">
								Hyperliquid
							</h2>
							{/* <div>Overall Realized PNL: {hlPnl.toFixed(4)}</div> */}
						</div>

						{hlPositions.filter((p) => Number(p.position.szi) !== 0).length ===
						0 ? (
							<p className="text-gray-500">No active positions found.</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse border border-gray-700">
									<thead>
										<tr className="bg-gray-800 text-left">
											<th className="p-2 border border-gray-700">Symbol</th>
											<th className="p-2 border border-gray-700">
												Entry Price
											</th>
											<th className="p-2 border border-gray-700">Size</th>
											<th className="p-2 border border-gray-700">Value</th>
											<th className="p-2 border border-gray-700">ROE</th>
											<th className="p-2 border border-gray-700">
												Unrealized PnL
											</th>
											<th className="p-2 border border-gray-700">
												Liquidation Price
											</th>
											<th className="p-2 border border-gray-700">
												Funding Rate
											</th>
										</tr>
									</thead>
									<tbody>
										{hlPositions
											.filter((p) => Number(p.position.szi) !== 0)
											.map((p, i) => (
												<tr key={i} className="hover:bg-gray-700">
													<td className="p-2 border border-gray-700">
														{p.position.coin}
													</td>
													<td className="p-2 border border-gray-700">
														{p.position.entryPx}
													</td>
													<td className="p-2 border border-gray-700">
														{p.position.szi}
													</td>
													<td className="p-2 border border-gray-700">
														{p.position.positionValue}
													</td>
													<td className="p-2 border border-gray-700">
														{(Number(p.position.returnOnEquity) * 100).toFixed(
															2
														)}
														%
													</td>
													<td className="p-2 border border-gray-700">
														{p.position.unrealizedPnl}
													</td>
													<td className="p-2 border border-gray-700">
														{p.position.liquidationPx}
													</td>
													<td className="p-2 border border-gray-700">
														{Number(
															Number(
																fundingMap[p.position.coin.toLowerCase()]
															) * 100
														).toFixed(4)}{" "}
														%
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{/* ---------------- Lighter ---------------- */}
					<section>
						<div className="flex justify-between">
							<h2 className="text-xl font-semibold mb-3 text-blue-400">
								Lighter
							</h2>
							{/* <div>Overall Realized PNL: {lighterPnl.toFixed(4)}</div> */}
						</div>

						{ltPositions.filter((p) => Number(p.position) !== 0).length ===
						0 ? (
							<p className="text-gray-500">No active positions found.</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse border border-gray-700">
									<thead>
										<tr className="bg-gray-800 text-left">
											<th className="p-2 border border-gray-700">Symbol</th>
											<th className="p-2 border border-gray-700">
												Entry Price
											</th>
											<th className="p-2 border border-gray-700">Size</th>
											<th className="p-2 border border-gray-700">Value</th>
											{/* <th className="p-2 border border-gray-700">ROE</th> */}
											<th className="p-2 border border-gray-700">
												Unrealized PnL
											</th>
											<th className="p-2 border border-gray-700">
												Liquidation Price
											</th>
											<th className="p-2 border border-gray-700">
												Funding Rate
											</th>
										</tr>
									</thead>
									<tbody>
										{ltPositions
											.filter((p) => Number(p.position) !== 0)
											.map((p, i) => {
												const roe =
													Number(p.position_value) !== 0
														? (
																(Number(p.unrealized_pnl) /
																	Number(p.position_value)) *
																100
														  ).toFixed(2)
														: "0.00";
												return (
													<tr key={i} className="hover:bg-gray-700">
														<td className="p-2 border border-gray-700">
															{p.symbol}
														</td>
														<td className="p-2 border border-gray-700">
															{p.avg_entry_price}
														</td>
														<td className="p-2 border border-gray-700">
															{p.position}
														</td>
														<td className="p-2 border border-gray-700">
															{p.position_value}
														</td>
														{/* <td className="p-2 border border-gray-700">
															{roe}%
														</td> */}
														<td className="p-2 border border-gray-700">
															{p.unrealized_pnl}
														</td>
														<td className="p-2 border border-gray-700">
															{p.liquidation_price}
														</td>
														{/* <td className="p-2 border border-gray-700">
															{calculateAprLt(p.symbol)}
														</td> */}
														<LighterFundingRateCell symbol={p.symbol} />
													</tr>
												);
											})}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{/* ---------------- Hyperliquid Token-wise Funding ---------------- */}
					<section className="mb-10">
						<h2 className="text-xl font-semibold mt-10 mb-3 text-green-400">
							Hyperliquid Funding Summary (Token-wise)
						</h2>
						<div className="grid grid-cols-3 gap-4 mb-4 text-center text-green-400 font-bold">
							{/* <div className="text-gray-500">Overall Funding</div> */}
							<div className="text-green-400">Total Funding Earned</div>
							<div className="text-green-400">Total Funding Paid</div>
							<div className="text-green-400">Net Funding</div>
							<div className="text-green-400">
								{overallFunding(hlFundings).totalFundingEarned}
							</div>
							<div className="text-green-400">
								{overallFunding(hlFundings).totalFundingPaid}
							</div>
							<div className="text-green-400">
								{overallFunding(hlFundings).netFunding}
							</div>
						</div>
						{hlFundings.length === 0 ? (
							<p className="text-gray-500">No funding data available.</p>
						) : (
							<div className="overflow-y-auto max-h-[400px] border border-gray-700 rounded">
								<table className="w-full border-collapse">
									<thead className="bg-gray-800 sticky top-0">
										<tr>
											<th className="p-2 border border-gray-700">Token</th>
											<th className="p-2 border border-gray-700">
												Funding Paid
											</th>
											<th className="p-2 border border-gray-700">
												Funding Earned
											</th>
											<th className="p-2 border border-gray-700">
												Net Funding
											</th>
										</tr>
									</thead>
									<tbody>
										{getTokenWiseFunding(hlFundings).map((f, i) => (
											<tr key={i} className="hover:bg-gray-700">
												<td className="p-2 border border-gray-700">
													{f.token}
												</td>
												<td className="p-2 border border-gray-700">
													{f.fundingPaid}
												</td>
												<td className="p-2 border border-gray-700">
													{f.fundingEarned}
												</td>
												<td className="p-2 border border-gray-700">
													{f.netFunding}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{/* ---------------- Lighter Token-wise Funding ---------------- */}
					<section className="mb-10">
						<h2 className="text-xl font-semibold mb-3 text-blue-400">
							Lighter Funding Summary (Token-wise)
						</h2>
						<div className="grid grid-cols-3 gap-4 mb-4 text-center text-green-400 font-bold">
							{/* <div className="text-gray-500">Overall Funding</div> */}
							<div className="text-green-400">Total Funding Earned</div>
							<div className="text-green-400">Total Funding Paid</div>
							<div className="text-green-400">Net Funding</div>
							<div className="text-green-400">
								{overallFunding(ltFundings).totalFundingEarned}
							</div>
							<div className="text-green-400">
								{overallFunding(ltFundings).totalFundingPaid}
							</div>
							<div className="text-green-400">
								{overallFunding(ltFundings).netFunding}
							</div>
						</div>
						{ltFundings.length === 0 ? (
							<p className="text-gray-500">No funding data available.</p>
						) : (
							<div className="overflow-y-auto max-h-[400px] border border-gray-700 rounded mb-4">
								<table className="w-full border-collapse">
									<thead className="bg-gray-800 sticky top-0">
										<tr>
											<th className="p-2 border border-gray-700">Token</th>
											<th className="p-2 border border-gray-700">
												Funding Paid
											</th>
											<th className="p-2 border border-gray-700">
												Funding Earned
											</th>
											<th className="p-2 border border-gray-700">
												Net Funding
											</th>
										</tr>
									</thead>
									<tbody>
										{getTokenWiseFunding(ltFundings).map((f, i) => (
											<tr key={i} className="hover:bg-gray-700">
												<td className="p-2 border border-gray-700">
													{f.token}
												</td>
												<td className="p-2 border border-gray-700">
													{f.fundingPaid}
												</td>
												<td className="p-2 border border-gray-700">
													{f.fundingEarned}
												</td>
												<td className="p-2 border border-gray-700">
													{f.netFunding}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{/* ---------------- Hyperliquid Fundings ---------------- */}
					<section className="mb-10">
						<h2 className="text-xl font-semibold mt-10 mb-3 text-green-400">
							Hyperliquid Fundings
						</h2>
						{hlFundings.length === 0 ? (
							<p className="text-gray-500">
								No funding data found or error fetching Hyperliquid funding.
							</p>
						) : (
							<div className="overflow-y-auto max-h-[400px] border border-gray-700 rounded">
								<table className="w-full border-collapse">
									<thead className="bg-gray-800 sticky top-0">
										<tr className="bg-gray-800 text-left">
											<th className="p-2 border border-gray-700">Market</th>
											<th className="p-2 border border-gray-700">Side</th>
											<th className="p-2 border border-gray-700">Change</th>
											<th className="p-2 border border-gray-700">
												Funding Rate
											</th>
											<th className="p-2 border border-gray-700">Timestamp</th>
											{/* <th className="p-2 border border-gray-700">
												Position Size
											</th> */}
										</tr>
									</thead>
									<tbody>
										{hlFundings.map((f, i) => (
											<tr key={i} className="hover:bg-gray-700">
												<td className="p-2 border border-gray-700">
													{f.market}
												</td>
												<td className="p-2 border border-gray-700">{f.side}</td>
												<td className="p-2 border border-gray-700">
													{Number(f.amount).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{Number(f.funding_rate).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{formatTimestamp(f.timestamp)}
												</td>
												{/* <td className="p-2 border border-gray-700">
													{f.position_size}
												</td> */}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{/* ---------------- Lighter Fundings ---------------- */}
					<section>
						<h2 className="text-xl font-semibold mb-3 text-blue-400">
							Lighter Fundings
						</h2>
						{ltFundings.length === 0 ? (
							<p className="text-gray-500">No funding data found.</p>
						) : (
							<div className="overflow-y-auto max-h-[400px] border border-gray-700 rounded">
								<table className="w-full border-collapse">
									<thead className="bg-gray-800 sticky top-0">
										<tr>
											<th className="p-2 border border-gray-700">Market</th>
											<th className="p-2 border border-gray-700">Side</th>
											<th className="p-2 border border-gray-700">Change</th>
											<th className="p-2 border border-gray-700">
												Funding Rate
											</th>
											<th className="p-2 border border-gray-700">Timestamp</th>
											{/* <th className="p-2 border border-gray-700">
												Position Size
											</th> */}
										</tr>
									</thead>
									<tbody>
										{ltFundings.map((f, i) => (
											<tr key={i} className="hover:bg-gray-700">
												<td className="p-2 border border-gray-700">
													{f.market}
												</td>
												<td className="p-2 border border-gray-700">{f.side}</td>
												<td className="p-2 border border-gray-700">
													{Number(f.amount).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{Number(f.funding_rate).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{formatTimestamp(f.timestamp)}
												</td>
												{/* <td className="p-2 border border-gray-700">
													{f.position_size}
												</td> */}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{hlTrades.length > 0 && (
						<div className="overflow-x-auto mb-4">
							<h3 className="text-lg font-semibold text-green-300 mb-2">
								Market-wise Fees (Hyperliquid)
							</h3>
							<table className="min-w-full text-sm text-gray-300 border border-gray-700 rounded-xl">
								<thead className="bg-gray-800 text-gray-200">
									<tr>
										<th className="px-4 py-2 text-left">Market</th>
										<th className="px-4 py-2 text-right">Total Fees</th>
									</tr>
								</thead>
								<tbody>
									{getMarketWiseFees(hlTrades).map((item) => (
										<tr key={item.market} className="border-t border-gray-700">
											<td className="px-4 py-2">{item.market}</td>
											<td className="px-4 py-2 text-right">{item.fee}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					{/* ---------------- Hyperliquid Trades ---------------- */}
					<section className="mb-10">
						<h2 className="text-xl font-semibold mt-10 mb-3 text-green-400">
							Hyperliquid Trades
						</h2>
						{hlTrades.length === 0 ? (
							<p className="text-gray-500">No Trades data found.</p>
						) : (
							<div className="overflow-y-auto max-h-[400px] border border-gray-700 rounded">
								<table className="w-full border-collapse">
									<thead className="bg-gray-800 sticky top-0">
										<tr className="bg-gray-800 text-left">
											<th className="p-2 border border-gray-700">Market</th>
											<th className="p-2 border border-gray-700">Side</th>
											<th className="p-2 border border-gray-700">Amount</th>
											<th className="p-2 border border-gray-700">Price</th>
											<th className="p-2 border border-gray-700">Fee</th>
											<th className="p-2 border border-gray-700">Timestamp</th>
											{/* <th className="p-2 border border-gray-700">
												Position Size
											</th> */}
										</tr>
									</thead>
									<tbody>
										{hlTrades.map((f, i) => (
											<tr key={i} className="hover:bg-gray-700">
												<td className="p-2 border border-gray-700">
													{f.market}
												</td>
												<td className="p-2 border border-gray-700">{f.side}</td>
												<td className="p-2 border border-gray-700">
													{Number(f.amount).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{Number(f.price).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{Number(f.fee).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{formatTimestamp(f.buy_time)}
												</td>
												{/* <td className="p-2 border border-gray-700">
													{f.position_size}
												</td> */}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{/* ---------------- Lighter Trades ---------------- */}
					<section>
						<h2 className="text-xl font-semibold mb-3 text-blue-400">
							Lighter Trades
						</h2>
						{ltTrades.length === 0 ? (
							<p className="text-gray-500">No trades data found.</p>
						) : (
							<div className="overflow-y-auto max-h-[400px] border border-gray-700 rounded">
								<table className="w-full border-collapse">
									<thead className="bg-gray-800 sticky top-0">
										<tr>
											<th className="p-2 border border-gray-700">Market</th>
											<th className="p-2 border border-gray-700">Side</th>
											<th className="p-2 border border-gray-700">Amount</th>
											<th className="p-2 border border-gray-700">Price</th>
											<th className="p-2 border border-gray-700">Fee</th>
											<th className="p-2 border border-gray-700">Timestamp</th>
											{/* <th className="p-2 border border-gray-700">
												Position Size
											</th> */}
										</tr>
									</thead>
									<tbody>
										{ltTrades.map((f, i) => (
											<tr key={i} className="hover:bg-gray-700">
												<td className="p-2 border border-gray-700">
													{f.market}
												</td>
												<td className="p-2 border border-gray-700">{f.side}</td>
												<td className="p-2 border border-gray-700">
													{Number(f.amount).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{Number(f.price).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{Number(f.fee).toFixed(5)}
												</td>
												<td className="p-2 border border-gray-700">
													{formatTimestamp(f.buy_time)}
												</td>
												{/* <td className="p-2 border border-gray-700">
													{f.position_size}
												</td> */}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>
				</main>
			</div>
		</div>
	);
}
