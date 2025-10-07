import { Home, Star, LayoutGrid, Bell } from "lucide-react";

export default function Sidebar() {
	return (
		<div className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
			<div className="p-4 flex items-center gap-2 border-b border-gray-800">
				<div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center">
					<span className="text-white font-bold text-sm">D</span>
				</div>
				<span className="text-white font-semibold">DEX Analytics</span>
			</div>

			<nav className="flex-1 py-4">
				{/* <NavItem icon={<Home size={18} />} label="Home" /> */}
				{/* <NavItem icon={<Star size={18} />} label="Starred" /> */}
				<NavItem icon={<LayoutGrid size={18} />} label="Dashboards" active />
				{/* <NavItem icon={<Bell size={18} />} label="Alerting" /> */}
			</nav>
		</div>
	);
}

function NavItem({
	icon,
	label,
	active = false,
}: {
	icon: React.ReactNode;
	label: string;
	active?: boolean;
}) {
	return (
		<button
			className={`w-full px-4 py-2 flex items-center gap-3 text-sm ${
				active
					? "bg-gray-800 text-white"
					: "text-gray-400 hover:bg-gray-800/50 hover:text-white"
			} transition-colors`}
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}
