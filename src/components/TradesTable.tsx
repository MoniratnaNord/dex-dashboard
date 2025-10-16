import { useEffect, useState } from "react";
import { fetchHlTrades, fetchLighterTrades } from "../api/positions";
import { useParams } from "react-router-dom";

export function TradesTable({
	title,
	platform,
}: {
	title: string;
	platform: string;
}) {
	const params = useParams();
	// console.log("checking params", params);
	const [error, setError] = useState("");
	const [address, setAddress] = useState("");
	const formatTimestamp = (ts: number) => new Date(ts).toLocaleString();
	const [totalPages, setTotalPages] = useState(1);
	const [page, setPage] = useState(1);
	type Trade = {
		market: string;
		side: string;
		amount: number | string;
		price: number | string;
		fee: number | string;
		buy_time: number;
		// position_size?: number | string;
	};

	const [data, setData] = useState<Trade[]>([]);
	const [loading, setLoading] = useState(false);
	const handleFetch = async () => {
		setLoading(true);
		setLoading(true);
		try {
			if (platform === "hl") {
				const [trades] = await Promise.all([fetchHlTrades(address, page)]);
				setData(trades.data.hyperliquid_trades || []);
				setTotalPages(trades.data?.pagination.total_pages);
			} else {
				const [trades] = await Promise.all([fetchLighterTrades(address, page)]);
				setData(trades.data.lighter_trades || []);
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
		<section className="mb-10">
			<h2 className="text-xl font-semibold mt-10 mb-3 text-green-400">
				{title}
			</h2>
			{data.length === 0 ? (
				<p className="text-gray-500">No Trades data found.</p>
			) : (
				<>
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
								{data.map((f, i) => (
									<tr key={i} className="hover:bg-gray-700">
										<td className="p-2 border border-gray-700">{f.market}</td>
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
			)}
		</section>
	);
}
