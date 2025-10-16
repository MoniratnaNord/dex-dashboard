import { useEffect, useState } from "react";
import {
	fetchHyperliquidUserPositions,
	fetchLighterFundingRate,
	fetchLighterUserPositions,
	fetchMarketFees,
	fetchPnlData,
	fetchTokenFundings,
	fetchHlTrades,
	fetchLighterTrades,
} from "../api/positions";
import { fetchHyperliquidMarkets, fetchLighterMarkets } from "../services/api";
import { useParams } from "react-router-dom";
import { isAddress } from "ethers";
import { BarChart3, TrendingUp, Wallet, DollarSign } from "lucide-react";
import FundingTable from "../components/FundingTable";
import { TradesTable } from "../components/TradesTable";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

type TabType = "positions" | "funding" | "summary" | "trades" | "allFunding";

export default function Positions() {
	const params = useParams();
	const [activeTab, setActiveTab] = useState<TabType>("summary");
	const [address, setAddress] = useState("");
	const [hlPositions, setHlPositions] = useState<any[]>([]);
	const [ltPositions, setLtPositions] = useState<any[]>([]);
	const [tokenFundingHl, setTokenFundingHl] = useState<any[]>([]);
	const [tokenFundingLighter, setTokenFundingLighter] = useState<any[]>([]);
	const [overallFundingDetails, setOverallFundingDetails] = useState<any>(null);
	const [allFundingTab, setAllFundingTab] = useState<string>("Hyperliquid");
	const [marketFees, setMarketFees] = useState<any[]>([]);
	const [hlTrades, setHlTrades] = useState<any[]>([]);
	const [ltTrades, setLtTrades] = useState<any[]>([]);
	const [pnlData, setPnlData] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [invalidAddress, setInvalidAddress] = useState(false);

	const handleFetch = async () => {
		setError(null);
		setLoading(true);
		setHlPositions([]);
		setLtPositions([]);
		setTokenFundingHl([]);
		setTokenFundingLighter([]);
		setMarketFees([]);
		setHlTrades([]);
		setLtTrades([]);
		try {
			const [
				hl,
				lt,
				pnlData,
				tokenFunding,
				marketFees,
				hlTradesData,
				ltTradesData,
			] = await Promise.all([
				fetchHyperliquidUserPositions(address),
				fetchLighterUserPositions(address),
				fetchPnlData(address),
				fetchTokenFundings(address),
				fetchMarketFees(address),
				fetchHlTrades(address, 1),
				fetchLighterTrades(address, 1),
			]);
			setHlPositions(hl);
			setLtPositions(lt);
			setTokenFundingHl(tokenFunding.data.hyperliquid_token_wise || []);
			setTokenFundingLighter(tokenFunding.data.lighter_token_wise || []);
			setOverallFundingDetails(tokenFunding.data.overall_funding || null);
			setMarketFees(marketFees.data.hl_fees || []);
			setHlTrades(hlTradesData.data || []);
			setLtTrades(ltTradesData.data || []);
			setPnlData(pnlData);
		} catch (e: any) {
			setError(e.message || "Error fetching positions");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (params.address) {
			const isValidAddress = isAddress(params.address);
			if (isValidAddress) {
				setAddress(params.address);
				setInvalidAddress(false);
			} else {
				setAddress("");
				setPnlData(null);
				setHlPositions([]);
				setLtPositions([]);
				setTokenFundingHl([]);
				setTokenFundingLighter([]);
				setMarketFees([]);
				setHlTrades([]);
				setLtTrades([]);
				setInvalidAddress(true);
			}
		} else {
			setAddress("");
			setPnlData(null);
			setHlPositions([]);
			setLtPositions([]);
			setTokenFundingHl([]);
			setTokenFundingLighter([]);
			setMarketFees([]);
			setHlTrades([]);
			setLtTrades([]);
			setInvalidAddress(false);
		}
	}, [params]);

	useEffect(() => {
		if (address && params.address) {
			handleFetch();
		}
	}, [address]);

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
				try {
					const markets = await fetchLighterMarkets();
					const filterMarket = markets.filter(
						(i: any) => i.lighter.symbol.toLowerCase() === symbol.toLowerCase()
					);
					if (
						filterMarket.length === 0 ||
						!filterMarket[0].lighter?.market_id
					) {
						setFundingRate("N/A");
						return;
					}
					const endTime = Date.now();
					const startTime = endTime - 60 * 60 * 1000;
					const rate = await fetchLighterFundingRate(
						filterMarket[0].lighter.market_id,
						startTime,
						endTime
					);
					setFundingRate(rate.fundings?.[0]?.rate || "N/A");
				} catch {
					setFundingRate("Error");
				}
			})();
		}, [symbol]);

		return (
			<td className="px-4 py-3">
				{fundingRate ? `${fundingRate}%` : "Loading..."}
			</td>
		);
	}

	const tabs = [
		{ id: "summary" as TabType, label: "Summary", icon: BarChart3 },
		{ id: "positions" as TabType, label: "Positions", icon: Wallet },
		{ id: "funding" as TabType, label: "Funding Summary", icon: DollarSign },
		{ id: "allFunding" as TabType, label: "All Funding", icon: DollarSign },
		{ id: "trades" as TabType, label: "Trades", icon: TrendingUp },
	];

	return (
		// <div className="min-h-screen bg-[#141414] flex text-white">
		// 	<Sidebar />

		// 	<div className="flex-1 flex flex-col">
		// 		<Header />
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
						DEX Analytics
					</h1>

					<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 mb-6">
						<div className="flex items-center gap-3">
							<div className="flex-1">
								<label className="text-sm text-slate-400 mb-1 block">
									Wallet Address
								</label>
								<div className="text-slate-200 font-mono text-sm break-all">
									{address || "No address provided"}
								</div>
							</div>
							{address && (
								<div className="flex items-center gap-2">
									{loading ? (
										<span className="flex items-center gap-2 font-semibold text-blue-400">
											<span>Fetching</span>
											<span className="flex gap-1">
												<span
													className="animate-bounce"
													style={{ animationDelay: "0ms" }}
												>
													.
												</span>
												<span
													className="animate-bounce"
													style={{ animationDelay: "150ms" }}
												>
													.
												</span>
												<span
													className="animate-bounce"
													style={{ animationDelay: "300ms" }}
												>
													.
												</span>
											</span>
										</span>
									) : (
										<span className="flex items-center gap-2 font-semibold text-green-400">
											<span>Fetched</span>
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</span>
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex gap-2 mb-6 overflow-x-auto">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
										activeTab === tab.id
											? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50"
											: "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
									}`}
								>
									<Icon size={18} />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{error && (
					<div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
						<p className="text-red-400">{error}</p>
					</div>
				)}

				{invalidAddress && (
					<div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
						<p className="text-red-400">
							The address entered is invalid. Please enter a valid address.
						</p>
					</div>
				)}

				{!invalidAddress && pnlData ? (
					<div className="space-y-6">
						{activeTab === "summary" && (
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-6">
										<div className="text-sm text-blue-300 mb-2">
											Total Deposit
										</div>
										<div className="text-3xl font-bold text-white">
											$
											{Number(
												Number(pnlData.data.hyperliquid.total_deposits) +
													Number(pnlData.data.lighter.total_deposits)
											).toFixed(2)}
										</div>
									</div>
									<div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6">
										<div className="text-sm text-green-300 mb-2">Total PNL</div>
										<div className="text-3xl font-bold text-white">
											{Number(pnlData.data.total_pnl_percent).toFixed(2)}%
										</div>
									</div>
									<div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
										<div className="text-sm text-purple-300 mb-2">
											Total APR
										</div>
										<div className="text-3xl font-bold text-white">
											{Number(pnlData.data.total_apr).toFixed(2)}%
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
										<h3 className="text-xl font-bold text-blue-400 mb-4">
											Hyperliquid
										</h3>
										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-slate-400">Total Deposit</span>
												<span className="text-white font-semibold">
													$
													{Number(
														pnlData.data.hyperliquid.total_deposits
													).toFixed(2)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">Current Balance</span>
												<span className="text-white font-semibold">
													$
													{Number(
														pnlData.data.hyperliquid.account_balance
													).toFixed(2)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">PNL</span>
												<span className="text-green-400 font-semibold">
													${Number(pnlData.data.hyperliquid.pnl).toFixed(2)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">PNL %</span>
												<span className="text-green-400 font-semibold">
													{Number(pnlData.data.hyperliquid.pnl_percent).toFixed(
														2
													)}
													%
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">APR</span>
												<span className="text-purple-400 font-semibold">
													{Number(pnlData.data.hyperliquid.apr).toFixed(2)}%
												</span>
											</div>
										</div>
									</div>

									<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
										<h3 className="text-xl font-bold text-purple-400 mb-4">
											Lighter
										</h3>
										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-slate-400">Total Deposit</span>
												<span className="text-white font-semibold">
													$
													{Number(pnlData.data.lighter.total_deposits).toFixed(
														2
													)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">Current Balance</span>
												<span className="text-white font-semibold">
													$
													{Number(pnlData.data.lighter.account_balance).toFixed(
														2
													)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">PNL</span>
												<span className="text-green-400 font-semibold">
													${Number(pnlData.data.lighter.pnl).toFixed(2)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">PNL %</span>
												<span className="text-green-400 font-semibold">
													{Number(pnlData.data.lighter.pnl_percent).toFixed(2)}%
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">APR</span>
												<span className="text-purple-400 font-semibold">
													{Number(pnlData.data.lighter.apr).toFixed(2)}%
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "positions" && (
							<div className="space-y-6">
								<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
									<div className="p-6 border-b border-slate-700/50">
										<h3 className="text-xl font-bold text-blue-400">
											Hyperliquid Positions
										</h3>
									</div>
									{hlPositions.filter((p) => Number(p.position.szi) !== 0)
										.length === 0 ? (
										<div className="p-6 text-center text-slate-400">
											No active positions found.
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead className="bg-slate-900/50">
													<tr className="text-left text-slate-400 text-sm">
														<th className="px-4 py-3 font-medium">Symbol</th>
														<th className="px-4 py-3 font-medium">
															Entry Price
														</th>
														<th className="px-4 py-3 font-medium">Size</th>
														<th className="px-4 py-3 font-medium">Value</th>
														<th className="px-4 py-3 font-medium">ROE</th>
														<th className="px-4 py-3 font-medium">
															Unrealized PnL
														</th>
														<th className="px-4 py-3 font-medium">
															Liquidation Price
														</th>
														<th className="px-4 py-3 font-medium">
															Funding Rate
														</th>
													</tr>
												</thead>
												<tbody className="text-slate-200">
													{hlPositions
														.filter((p) => Number(p.position.szi) !== 0)
														.map((p, i) => (
															<tr
																key={i}
																className="border-t border-slate-700/50 hover:bg-slate-700/30"
															>
																<td className="px-4 py-3 font-medium">
																	{p.position.coin}
																</td>
																<td className="px-4 py-3">
																	{p.position.entryPx}
																</td>
																<td className="px-4 py-3">{p.position.szi}</td>
																<td className="px-4 py-3">
																	{p.position.positionValue}
																</td>
																<td className="px-4 py-3">
																	<span
																		className={
																			Number(p.position.returnOnEquity) >= 0
																				? "text-green-400"
																				: "text-red-400"
																		}
																	>
																		{(
																			Number(p.position.returnOnEquity) * 100
																		).toFixed(2)}
																		%
																	</span>
																</td>
																<td className="px-4 py-3">
																	<span
																		className={
																			Number(p.position.unrealizedPnl) >= 0
																				? "text-green-400"
																				: "text-red-400"
																		}
																	>
																		{p.position.unrealizedPnl}
																	</span>
																</td>
																<td className="px-4 py-3">
																	{p.position.liquidationPx}
																</td>
																<td className="px-4 py-3">
																	{Number(
																		Number(
																			fundingMap[p.position.coin.toLowerCase()]
																		) * 100
																	).toFixed(4)}
																	%
																</td>
															</tr>
														))}
												</tbody>
											</table>
										</div>
									)}
								</div>

								<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
									<div className="p-6 border-b border-slate-700/50">
										<h3 className="text-xl font-bold text-purple-400">
											Lighter Positions
										</h3>
									</div>
									{ltPositions.filter((p) => Number(p.position) !== 0)
										.length === 0 ? (
										<div className="p-6 text-center text-slate-400">
											No active positions found.
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead className="bg-slate-900/50">
													<tr className="text-left text-slate-400 text-sm">
														<th className="px-4 py-3 font-medium">Symbol</th>
														<th className="px-4 py-3 font-medium">
															Entry Price
														</th>
														<th className="px-4 py-3 font-medium">Size</th>
														<th className="px-4 py-3 font-medium">Value</th>
														<th className="px-4 py-3 font-medium">
															Unrealized PnL
														</th>
														<th className="px-4 py-3 font-medium">
															Liquidation Price
														</th>
														<th className="px-4 py-3 font-medium">
															Funding Rate
														</th>
													</tr>
												</thead>
												<tbody className="text-slate-200">
													{ltPositions
														.filter((p) => Number(p.position) !== 0)
														.map((p, i) => (
															<tr
																key={i}
																className="border-t border-slate-700/50 hover:bg-slate-700/30"
															>
																<td className="px-4 py-3 font-medium">
																	{p.symbol}
																</td>
																<td className="px-4 py-3">
																	{p.avg_entry_price}
																</td>
																<td className="px-4 py-3">{p.position}</td>
																<td className="px-4 py-3">
																	{p.position_value}
																</td>
																<td className="px-4 py-3">
																	<span
																		className={
																			Number(p.unrealized_pnl) >= 0
																				? "text-green-400"
																				: "text-red-400"
																		}
																	>
																		{p.unrealized_pnl}
																	</span>
																</td>
																<td className="px-4 py-3">
																	{p.liquidation_price}
																</td>
																<LighterFundingRateCell symbol={p.symbol} />
															</tr>
														))}
												</tbody>
											</table>
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === "funding" && (
							<div className="space-y-6">
								<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
									<div className="p-6 border-b border-slate-700/50">
										<h3 className="text-xl font-bold text-blue-400">
											Hyperliquid Token Funding
										</h3>
									</div>
									{tokenFundingHl.length === 0 ? (
										<div className="p-6 text-center text-slate-400">
											No funding data available.
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead className="bg-slate-900/50">
													<tr className="text-left text-slate-400 text-sm">
														<th className="px-4 py-3 font-medium">
															Total Funding Earned
														</th>
														<th className="px-4 py-3 font-medium">
															Total Funding Paid
														</th>
														<th className="px-4 py-3 font-medium">
															Net Funding
														</th>
													</tr>
												</thead>
												<tbody className="text-slate-200">
													<tr className="border-t border-slate-700/50 hover:bg-slate-700/30">
														<td className="px-4 py-3 font-medium">
															{
																overallFundingDetails.hyperliquid
																	.totalFundingEarned
															}
														</td>
														<td className="px-4 py-3 text-red-400">
															{
																overallFundingDetails.hyperliquid
																	.totalFundingPaid
															}
														</td>
														<td className="px-4 py-3 text-green-400">
															{overallFundingDetails.hyperliquid.netFunding}
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									)}
								</div>
								<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
									<div className="p-6 border-b border-slate-700/50">
										<h3 className="text-xl font-bold text-blue-400">
											Hyperliquid Funding
										</h3>
									</div>
									{tokenFundingHl.length === 0 ? (
										<div className="p-6 text-center text-slate-400">
											No funding data available.
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead className="bg-slate-900/50">
													<tr className="text-left text-slate-400 text-sm">
														<th className="px-4 py-3 font-medium">Token</th>
														<th className="px-4 py-3 font-medium">
															Funding Paid
														</th>
														<th className="px-4 py-3 font-medium">
															Funding Earned
														</th>
														<th className="px-4 py-3 font-medium">
															Net Funding
														</th>
													</tr>
												</thead>

												<tbody className="text-slate-200">
													{tokenFundingHl.map((f, i) => (
														<tr
															key={i}
															className="border-t border-slate-700/50 hover:bg-slate-700/30"
														>
															<td className="px-4 py-3 font-medium">
																{f.token}
															</td>
															<td className="px-4 py-3 text-red-400">
																{f.fundingPaid}
															</td>
															<td className="px-4 py-3 text-green-400">
																{f.fundingEarned}
															</td>
															<td className="px-4 py-3">
																<span
																	className={
																		Number(f.netFunding) >= 0
																			? "text-green-400"
																			: "text-red-400"
																	}
																>
																	{f.netFunding}
																</span>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</div>

								<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
									<div className="p-6 border-b border-slate-700/50">
										<h3 className="text-xl font-bold text-purple-400">
											Lighter Token Funding
										</h3>
									</div>
									{tokenFundingLighter.length === 0 ? (
										<div className="p-6 text-center text-slate-400">
											No funding data available.
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead className="bg-slate-900/50">
													<tr className="text-left text-slate-400 text-sm">
														<th className="px-4 py-3 font-medium">
															Total Funding Earned
														</th>
														<th className="px-4 py-3 font-medium">
															Total Funding Paid
														</th>
														<th className="px-4 py-3 font-medium">
															Net Funding
														</th>
													</tr>
												</thead>
												<tbody className="text-slate-200">
													<tr className="border-t border-slate-700/50 hover:bg-slate-700/30">
														<td className="px-4 py-3 font-medium">
															{overallFundingDetails.lighter.totalFundingEarned}
														</td>
														<td className="px-4 py-3 text-red-400">
															{overallFundingDetails.lighter.totalFundingPaid}
														</td>
														<td className="px-4 py-3 text-green-400">
															{overallFundingDetails.lighter.netFunding}
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									)}
								</div>
								<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
									<div className="p-6 border-b border-slate-700/50">
										<h3 className="text-xl font-bold text-purple-400">
											Lighter Token Funding
										</h3>
									</div>
									{tokenFundingLighter.length === 0 ? (
										<div className="p-6 text-center text-slate-400">
											No funding data available.
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead className="bg-slate-900/50">
													<tr className="text-left text-slate-400 text-sm">
														<th className="px-4 py-3 font-medium">Token</th>
														<th className="px-4 py-3 font-medium">
															Funding Paid
														</th>
														<th className="px-4 py-3 font-medium">
															Funding Earned
														</th>
														<th className="px-4 py-3 font-medium">
															Net Funding
														</th>
													</tr>
												</thead>
												<tbody className="text-slate-200">
													{tokenFundingLighter.map((f, i) => (
														<tr
															key={i}
															className="border-t border-slate-700/50 hover:bg-slate-700/30"
														>
															<td className="px-4 py-3 font-medium">
																{f.token}
															</td>
															<td className="px-4 py-3 text-red-400">
																{f.fundingPaid}
															</td>
															<td className="px-4 py-3 text-green-400">
																{f.fundingEarned}
															</td>
															<td className="px-4 py-3">
																<span
																	className={
																		Number(f.netFunding) >= 0
																			? "text-green-400"
																			: "text-red-400"
																	}
																>
																	{f.netFunding}
																</span>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</div>
							</div>
						)}
						{activeTab === "allFunding" && (
							<div className="space-y-6">
								{/* Toggle Tabs */}
								<div className="flex gap-2 mb-4">
									{["Hyperliquid", "Lighter"].map((platform) => (
										<button
											key={platform}
											onClick={() => setAllFundingTab(platform)}
											className={`px-6 py-2 rounded-xl font-medium transition-all ${
												allFundingTab === platform
													? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
													: "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
											}`}
										>
											{platform}
										</button>
									))}
								</div>
								{allFundingTab === "Hyperliquid" && (
									<FundingTable title="Hyperliquid Fundings" platform="hl" />
								)}
								{allFundingTab === "Lighter" && (
									<FundingTable title="Lighter Fundings" platform="lighter" />
								)}
							</div>
						)}

						{activeTab === "trades" && (
							<div className="space-y-6">
								{/* Toggle Tabs */}
								<div className="flex gap-2 mb-4">
									{["Hyperliquid", "Lighter"].map((platform) => (
										<button
											key={platform}
											onClick={() => setAllFundingTab(platform)}
											className={`px-6 py-2 rounded-xl font-medium transition-all ${
												allFundingTab === platform
													? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
													: "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
											}`}
										>
											{platform}
										</button>
									))}
								</div>
								{allFundingTab === "Hyperliquid" && (
									<TradesTable title="Hyperliquid Trades" platform="hl" />
								)}
								{allFundingTab === "Lighter" && (
									<TradesTable title="Lighter Trades" platform="lighter" />
								)}
							</div>
						)}
					</div>
				) : (
					!invalidAddress && (
						<div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
							<p className="text-slate-400 text-lg">
								No data to display. Please enter an address and fetch positions.
							</p>
						</div>
					)
				)}
			</div>
		</div>
		// </div>
		// </div>
	);
}
