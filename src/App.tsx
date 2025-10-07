import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import ChartPanel from "./components/ChartPanel";
import DataTable from "./components/DataTable";
import {
	PlatformData,
	CurrentFundingRow,
	MeanFundingRow,
	Platform,
	PlatformMarketOption,
} from "./types";
import {
	fetchCurrentFunding,
	fetchMeanFunding,
	fetchHyperliquidMarkets,
	fetchLighterMarkets,
	fetchFundingSeries,
} from "./services/api";

function App() {
	const [fundingData, setFundingData] = useState<PlatformData[]>([]);
	// Open interest is currently not displayed. Remove when needed.
	const [currentFunding, setCurrentFunding] = useState<CurrentFundingRow[]>([]);
	const [meanFunding, setMeanFunding] = useState<MeanFundingRow[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [meanPage, setMeanPage] = useState(1);
	const [loading, setLoading] = useState(true);

	// New state for platform toggle and markets
	const [platform, setPlatform] = useState<Platform>("hyperliquid");
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
		loadMarkets(platform);
	}, [platform]);

	useEffect(() => {
		// intentionally not adding loadData to deps to avoid re-creation
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [platform, selectedMarketId, startDate, endDate]);

	const dateIsoToMsUtc = (iso: string) => {
		const [y, m, d] = iso.split("-").map(Number);
		return Date.UTC(y, (m || 1) - 1, d || 1);
	};

	const loadMarkets = async (p: Platform) => {
		try {
			setLoading(true);
			const list =
				p === "hyperliquid"
					? await fetchHyperliquidMarkets()
					: await fetchLighterMarkets();
			setMarkets(list);
			setSelectedMarketId(list[0]?.id);
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
			const end = dateIsoToMsUtc(endDate) + 24 * 60 * 60 * 1000 - 1; // end of day inclusive

			let funding: PlatformData[] = [];
			if (selectedMarketId) {
				if (platform === "hyperliquid") {
					const symbol = selectedMarketId.replace("hl:", "");
					const series = await fetchFundingSeries(
						"hyperliquid",
						symbol,
						start,
						end
					);
					console.log("checking series", series);
					funding = [
						{
							name: "hyperliquid",
							color: "#10b981",
							data: series.points.map((p) => ({
								timestamp: p.timestamp,
								value: p.value,
							})),
							min: Math.min(...series.points.map((p) => p.value)),
							max: Math.max(...series.points.map((p) => p.value)),
							mean:
								series.points.reduce((a, b) => a + b.value, 0) /
								(series.points.length || 1),
						},
					];
				} else {
					const marketId = selectedMarketId.replace("lt:", "");
					const series = await fetchFundingSeries(
						"lighter",
						marketId,
						start,
						end
					);
					funding = [
						{
							name: "lighter",
							color: "#3b82f6",
							data: series.points.map((p) => ({
								timestamp: p.timestamp,
								value: p.value,
							})),
							min: Math.min(...series.points.map((p) => p.value)),
							max: Math.max(...series.points.map((p) => p.value)),
							mean:
								series.points.reduce((a, b) => a + b.value, 0) /
								(series.points.length || 1),
						},
					];
				}
			}

			const [current, mean] = await Promise.all([
				fetchCurrentFunding(currentPage),
				fetchMeanFunding(meanPage),
			]);

			setFundingData(funding);
			setCurrentFunding(current.data);
			setMeanFunding(mean.data);
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCurrentPageChange = async (page: number) => {
		setCurrentPage(page);
		const { data } = await fetchCurrentFunding(page);
		setCurrentFunding(data);
	};

	const handleMeanPageChange = async (page: number) => {
		setMeanPage(page);
		const { data } = await fetchMeanFunding(page);
		setMeanFunding(data);
	};

	return (
		<div className="min-h-screen bg-[#141414] flex">
			<Sidebar />

			<div className="flex-1 flex flex-col">
				<Header />

				<main className="flex-1 p-6 overflow-auto">
					<FilterBar
						platform={platform}
						platforms={["hyperliquid", "lighter"]}
						onPlatformChange={setPlatform}
						markets={markets}
						selectedMarketId={selectedMarketId}
						onMarketChange={setSelectedMarketId}
						startDate={startDate}
						endDate={endDate}
						onStartDateChange={setStartDate}
						onEndDateChange={setEndDate}
						onRefresh={loadData}
					/>

					{/* <div className="mb-6 p-4 bg-[#1f1f1f] rounded-lg border border-gray-800">
            <p className="text-gray-300 text-sm">
              Suggestions, bug reports, updates and future tools available on{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300">Telegram</a>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Supported platforms:{' '}
              {['asterdex', 'coinbase', 'edgeX', 'extended', 'hyperliquid', 'ligter', 'pacifica', 'paradex', 'vestmarkets'].map((platform, i, arr) => (
                <span key={platform}>
                  <a href="#" className="text-emerald-400 hover:text-emerald-300">{platform}</a>
                  {i < arr.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div> */}

					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="text-gray-400">Loading...</div>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 gap-6 mb-6">
								<ChartPanel
									title="Funding Rate"
									data={fundingData}
									type="funding"
								/>
								{/* <ChartPanel
									title="Open Interest"
									data={openInterestData}
									type="openInterest"
									yAxisLabel="Value"
								/> */}
							</div>

							{/* <div className="grid grid-cols-2 gap-6 mb-6">
								<DataTable
									title="Current Funding"
									data={currentFunding}
									type="current"
									currentPage={currentPage}
									totalPages={121}
									onPageChange={handleCurrentPageChange}
								/>
								<DataTable
									title="Mean Funding"
									data={meanFunding}
									type="mean"
									currentPage={meanPage}
									totalPages={121}
									onPageChange={handleMeanPageChange}
								/>
							</div> */}
						</>
					)}
				</main>
			</div>
		</div>
	);
}

export default App;
