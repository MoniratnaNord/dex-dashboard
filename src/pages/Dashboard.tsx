import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import ChartPanel from "../components/ChartPanel";
import { PlatformData, PlatformMarketOption, FundingSeries } from "../types";
import {
	fetchHyperliquidMarkets,
	fetchLighterMarkets,
	fetchFundingSeries,
} from "../services/api";

function Dashboard() {
	const [fundingData, setFundingData] = useState<PlatformData[]>([]);
	const [loading, setLoading] = useState(true);

	// Combined markets from both platforms
	const [markets, setMarkets] = useState<PlatformMarketOption[]>([]);
	const [selectedMarketId, setSelectedMarketId] = useState<string | undefined>(
		undefined
	);
	// Date range (UTC ISO yyyy-mm-dd)
	const toIso = (d: Date) =>
		`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
			2,
			"0"
		)}-${String(d.getUTCDate()).padStart(2, "0")}`;
	const today = new Date();
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const [startDate, setStartDate] = useState<string>(toIso(sevenDaysAgo));
	const [endDate, setEndDate] = useState<string>(toIso(today));

	useEffect(() => {
		loadAllMarkets();
	}, []);

	useEffect(() => {
		// intentionally not adding loadData to deps to avoid re-creation
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMarketId, startDate, endDate]);

	const dateIsoToMsUtc = (iso: string) => {
		const [y, m, d] = iso.split("-").map(Number);
		return Date.UTC(y, (m || 1) - 1, d || 1);
	};

	const loadAllMarkets = async () => {
		try {
			setLoading(true);

			const [hlMarkets, ltMarkets] = await Promise.all([
				fetchHyperliquidMarkets(),
				fetchLighterMarkets(),
			]);

			// Create a set of display symbols for quick lookup
			const lighterSymbols = new Set(ltMarkets.map((m) => m.display));
			const hyperSymbols = new Set(hlMarkets.map((m) => m.display));

			// Find intersection of symbols
			const commonSymbols = [...hyperSymbols].filter((symbol) =>
				lighterSymbols.has(symbol)
			);

			// Filter both lists to include only common ones
			const filteredHL = hlMarkets.filter((m) =>
				commonSymbols.includes(m.display)
			);
			const filteredLT = ltMarkets.filter((m) =>
				commonSymbols.includes(m.display)
			);

			// Combine both filtered lists
			const combined = [...filteredHL, ...filteredLT];

			setMarkets(combined);

			// Select the first common Hyperliquid market by default
			const firstHL = filteredHL[0];
			if (firstHL) {
				setSelectedMarketId(firstHL.id);
			} else {
				setSelectedMarketId(undefined);
			}

			console.log(
				`Loaded ${filteredHL.length} common markets shared between both platforms.`
			);
		} catch (e) {
			console.error("Error loading markets", e);
			setMarkets([]);
			setSelectedMarketId(undefined);
		} finally {
			setLoading(false);
		}
	};

	const loadData = async () => {
		setLoading(true);
		try {
			const start = dateIsoToMsUtc(startDate);
			const end = dateIsoToMsUtc(endDate) + 24 * 60 * 60 * 1000 - 1; // inclusive end of day

			let funding: PlatformData[] = [];

			if (selectedMarketId) {
				console.log("Selected market ID:", selectedMarketId);

				const baseSymbol = selectedMarketId.replace(/^(hl:|lt:)/, "");

				const hlMarket = markets.find(
					(m) => m.platform === "hyperliquid" && m.display === baseSymbol
				);
				const ltMarket = markets.find(
					(m) => m.platform === "lighter" && m.display === baseSymbol
				);

				const promises: Promise<FundingSeries>[] = [];
				if (hlMarket) {
					promises.push(
						fetchFundingSeries("hyperliquid", hlMarket.display, start, end)
					);
				}
				if (ltMarket) {
					const marketId = ltMarket.lighter?.market_id?.toString() || "";
					promises.push(fetchFundingSeries("lighter", marketId, start, end));
				}

				if (promises.length > 0) {
					const seriesList = await Promise.allSettled(promises);

					const validSeries = seriesList
						.filter(
							(r): r is PromiseFulfilledResult<FundingSeries> =>
								r.status === "fulfilled"
						)
						.map((r) => r.value);

					funding = validSeries.map((s) => {
						// Filter strictly within selected date range
						const filteredPoints = s.points
							.filter((p) => p.timestamp >= start && p.timestamp <= end)
							.sort((a, b) => a.timestamp - b.timestamp);

						return {
							name: s.platform,
							color: s.platform === "hyperliquid" ? "#10b981" : "#3b82f6",
							data: filteredPoints.map((p) => ({
								timestamp: p.timestamp,
								value: p.value,
							})),
							min: filteredPoints.length
								? Math.min(...filteredPoints.map((p) => p.value))
								: 0,
							max: filteredPoints.length
								? Math.max(...filteredPoints.map((p) => p.value))
								: 0,
							mean: filteredPoints.length
								? filteredPoints.reduce((a, b) => a + b.value, 0) /
								  filteredPoints.length
								: 0,
						};
					});

					console.log("Filtered funding data by selected range:", funding);
				}
			}

			setFundingData(funding);
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className="min-h-screen bg-[#141414] flex">
			<Sidebar />

			<div className="flex-1 flex flex-col">
				<Header />

				<main className="flex-1 p-6 overflow-auto">
					<FilterBar
						markets={markets}
						selectedMarketId={selectedMarketId}
						onMarketChange={setSelectedMarketId}
						startDate={startDate}
						endDate={endDate}
						onStartDateChange={setStartDate}
						onEndDateChange={setEndDate}
						onRefresh={loadData}
					/>

					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="text-gray-400">Loading...</div>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 gap-6 mb-6">
								<ChartPanel
									title="Funding Rate Comparison"
									data={fundingData}
									type="funding"
									selectedDateRange={
										startDate && endDate
											? { start: startDate, end: endDate }
											: undefined
									}
								/>
							</div>

							<div className="bg-[#1f1f1f] rounded-lg border border-gray-800 p-4">
								<h3 className="text-white font-medium">Platform Comparison</h3>
								<p className="text-gray-400 text-sm mt-2">
									Compare funding rates between Hyperliquid and Lighter
									platforms for the selected market and date range.
								</p>
							</div>
						</>
					)}
				</main>
			</div>
		</div>
	);
}

export default Dashboard;
