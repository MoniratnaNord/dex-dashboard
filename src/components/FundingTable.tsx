import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchHlFundings, fetchLighterFundings } from "../api/positions";

type Funding = {
	market: string;
	side: string;
	amount: number | string;
	funding_rate: number | string;
	timestamp: number;
	// position_size?: string | number;
};

type FundingTableProps = {
	title?: string;
	platform: string;
};
export default function FundingTable({
	title = "Hyperliquid Fundings",
	platform,
}: FundingTableProps) {
	const params = useParams();
	// console.log("checking params", params);
	const [totalPages, setTotalPages] = useState(1);
	const [error, setError] = useState("");
	const [address, setAddress] = useState("");
	const formatTimestamp = (ts: number) => new Date(ts).toLocaleString();
	const [page, setPage] = useState(1);
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const handleFetch = async () => {
		setLoading(true);
		setLoading(true);
		try {
			if (platform === "hl") {
				const [trades] = await Promise.all([fetchHlFundings(address, page)]);
				setData(trades.data.hyperliquid_fundings || []);
				setTotalPages(trades.data?.pagination.total_pages);
			} else {
				const [trades] = await Promise.all([
					fetchLighterFundings(address, page),
				]);
				setData(trades.data.lighter_fundings || []);
				setTotalPages(trades.data?.pagination.total_pages);
			}

			setLoading(false);
			// setTotalPages(Math.ceil((trades.data?.total || 0) / 10));
		} catch (e: any) {
			setError(e.message || "Error fetching positions");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		if (params.address) {
			setAddress(params.address);
		}
	}, [params.address]);
	useEffect(() => {
		if (address) {
			handleFetch();
		}
	}, [address, page]);
	return (
		<>
			<section className="mb-10">
				<h2 className="text-xl font-semibold mt-10 mb-3 text-blue-400">
					{title}
				</h2>
				{data.length === 0 ? (
					<p className="text-gray-500">
						No funding data found or error fetching Hyperliquid funding.
					</p>
				) : (
					<div className="overflow-x-auto overflow-y-auto max-h-[400px]">
						<table className="w-full">
							<thead className="bg-slate-900/50 sticky top-0">
								<tr className="bg-slate-900/50 text-left text-slate-400 text-sm">
									<th className="px-4 py-3 font-medium">Market</th>
									<th className="px-4 py-3 font-medium">Side</th>
									<th className="px-4 py-3 font-medium">Change</th>
									<th className="px-4 py-3 font-medium">Funding Rate</th>
									<th className="px-4 py-3 font-medium">Time</th>
								</tr>
							</thead>
							<tbody className="text-slate-200">
								{data.map((f: Funding, i) => (
									<tr
										key={i}
										className="border-t border-slate-700/50 hover:bg-slate-700/30"
									>
										<td className="px-4 py-3 font-medium">{f.market}</td>
										<td className="px-4 py-3 text-red-400">
											<span
												className={
													f.side.toUpperCase() === "LONG"
														? "text-green-400"
														: "text-red-400"
												}
											>
												{f.side}
											</span>
										</td>
										<td className="px-4 py-3 text-green-400">
											{Number(f.amount).toFixed(5)}
										</td>
										<td className="px-4 py-3">
											<span
												className={
													Number(f.funding_rate) >= 0
														? "text-green-400"
														: "text-red-400"
												}
											>
												{Number(f.funding_rate).toFixed(5)}
											</span>
										</td>
										<td className="px-4 py-3 text-green-400">
											{formatTimestamp(f.timestamp)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
			<div className="flex justify-center items-center mt-4 gap-2">
				<button
					className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page === 1}
				>
					Prev
				</button>
				<span className="text-gray-300">
					Page {page} of {totalPages}
				</span>
				<button
					className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					disabled={page === totalPages}
				>
					Next
				</button>
			</div>
		</>
	);
}
