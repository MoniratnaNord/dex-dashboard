import { LayoutGrid, Bell } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar() {
	const params = useParams();
	const location = useLocation();
	const [active, setActive] = useState(location.pathname === "/positions");
	const [tab, setTab] = useState("positions");
	const navigate = useNavigate();
	useEffect(() => {
		setActive(location.pathname === "/positions");
	}, [location.pathname]);
	useEffect(() => {
		if (params.address) {
			setTab("positions");
		} else {
			setTab("dashboard");
		}
	}, [params.address]);

	return (
		<div className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
			<div className="p-4 flex items-center gap-2 border-b border-gray-800">
				<div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center">
					<span className="text-white font-bold text-sm">D</span>
				</div>
				<h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
					DEX Analytics{" "}
				</h1>
			</div>

			<nav className="flex-1 py-4 gap-4">
				{/* <NavItem icon={<Home size={18} />} label="Home" /> */}
				{/* <NavItem icon={<Star size={18} />} label="Starred" /> */}
				<NavItem
					icon={<LayoutGrid size={18} />}
					label="Dashboard"
					active={tab}
					onClick={() => {
						setTab("dashboard");
						navigate("/dashboard");
					}}
				/>
				<NavItem
					icon={<LayoutGrid size={18} />}
					label="Positions"
					active={tab}
					onClick={() => {
						setTab("positions");
						navigate("/positions");
					}}
				/>
			</nav>
		</div>
	);
}

function NavItem({
	icon,
	label,
	active = "",
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	active?: string;
	onClick?: () => void;
}) {
	console.log(active, label);
	return (
		<button
			className={`w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
				active === label.toLowerCase()
					? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50"
					: "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
			}`}
			onClick={onClick}
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}
