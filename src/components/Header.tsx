import { Search, Clock, RefreshCw } from "lucide-react";

export default function Header() {
	return (
		<div className="bg-[#1a1a1a] border-b border-gray-800 px-6 py-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 text-sm text-gray-400">
					<span className="text-white">Home</span>
					{/* <span>/</span>
          <span className="text-white">Dashboards</span>
          <span>/</span>
          <span className="text-white">Perp DEX-es funding rate</span> */}
				</div>

				<div className="flex items-center gap-4">
					{/* <div className="relative">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
							size={16}
						/>
						<input
							type="text"
							placeholder="Search..."
							className="bg-gray-800 text-white pl-9 pr-4 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
						/>
					</div> */}

					{/* <button className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors">
						Export
					</button>

					<button className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors">
						Share
					</button>

					<button className="text-gray-300 hover:text-white transition-colors">
						Sign in
					</button> */}
				</div>
			</div>
		</div>
	);
}
