import { LayoutGrid, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar() {
	const location = useLocation();
	const [active, setActive] = useState(location.pathname === "/positions");
	const navigate = useNavigate();
	useEffect(() => {
		setActive(location.pathname === "/positions");
	}, [location.pathname]);

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
				<NavItem
					icon={<LayoutGrid size={18} />}
					label="Dashboards"
					active={active}
					onClick={() => navigate("/")}
				/>
				<NavItem
					icon={<LayoutGrid size={18} />}
					label="Positions"
					active={active}
					onClick={() => navigate("/positions")}
				/>
			</nav>
		</div>
	);
}

function NavItem({
	icon,
	label,
	active = false,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	active?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			className={`w-full px-4 py-2 flex items-center gap-3 text-sm ${
				active
					? "bg-gray-800 text-white"
					: "text-gray-400 hover:bg-gray-800/50 hover:text-white"
			} transition-colors`}
			onClick={onClick}
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}
