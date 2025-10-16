import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Positions from "./pages/Positions";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
// import Home from "./pages/Home"; // if you already have a home/dashboard
// import Positions from "./pages/Positions";

export default function App() {
	return (
		<div>
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
				<Routes>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/" element={<Positions />} />
					<Route path="/:address" element={<Positions />} />
				</Routes>
			</div>
		</div>
	);
}
