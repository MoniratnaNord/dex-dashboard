import {
	ChevronDown,
	Clock,
	ChevronLeft,
	ChevronRight,
	RefreshCw,
} from "lucide-react";
import { PlatformMarketOption } from "../types";

interface FilterBarProps {
	markets: PlatformMarketOption[];
	selectedMarketId?: string;
	onMarketChange: (id: string) => void;
	startDate: string; // YYYY-MM-DD (UTC)
	endDate: string; // YYYY-MM-DD (UTC)
	onStartDateChange: (isoDate: string) => void;
	onEndDateChange: (isoDate: string) => void;
	onRefresh?: () => void;
}

export default function FilterBar({
	markets,
	selectedMarketId,
	onMarketChange,
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
	onRefresh,
}: FilterBarProps) {
	return (
		<div className="flex items-center justify-between mb-6">
			<div className="flex items-center gap-4">
				<span className="text-gray-400 text-sm">Compare platforms:</span>

				<select
					value={selectedMarketId}
					onChange={(e) => onMarketChange(e.target.value)}
					className="bg-[#1f1f1f] text-white px-4 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
				>
					<option value="">Select market</option>
					{markets.map((m) => (
						<option key={m.id} value={m.id}>
							{m.display}
						</option>
					))}
				</select>

				<input
					type="date"
					value={startDate}
					onChange={(e) => onStartDateChange(e.target.value)}
					className="bg-[#1f1f1f] text-white px-4 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
				<span className="text-gray-400">to</span>
				<input
					type="date"
					value={endDate}
					onChange={(e) => onEndDateChange(e.target.value)}
					className="bg-[#1f1f1f] text-white px-4 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
			</div>

			<div className="flex items-center gap-2">
				<button className="p-2 text-gray-400 hover:text-white transition-colors">
					<ChevronLeft size={18} />
				</button>

				<button className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] text-white rounded border border-gray-700 text-sm hover:bg-gray-800 transition-colors">
					<Clock size={16} />
					<span>
						{startDate} → {endDate}
					</span>
					<ChevronDown size={16} />
				</button>

				<button className="p-2 text-gray-400 hover:text-white transition-colors">
					<ChevronRight size={18} />
				</button>

				<button
					className="p-2 text-gray-400 hover:text-white transition-colors"
					onClick={onRefresh}
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M8 2a6 6 0 110 12A6 6 0 018 2zm0 1a5 5 0 100 10A5 5 0 008 3z" />
					</svg>
				</button>

				<button className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] text-white rounded border border-gray-700 text-sm hover:bg-gray-800 transition-colors">
					<RefreshCw size={16} />
					<span>Refresh</span>
					<ChevronDown size={16} />
				</button>
			</div>
		</div>
	);
}
