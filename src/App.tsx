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
			{/* <nav className="p-4 bg-white shadow flex justify-between">
				<Link to="/" className="font-semibold text-blue-600">
					Dashboard
				</Link>
				<Link to="/positions" className="font-semibold text-blue-600">
					Positions
				</Link>
			</nav> */}
			<div className="">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/positions/:address" element={<Positions />} />
				</Routes>
			</div>
		</div>
	);
}
