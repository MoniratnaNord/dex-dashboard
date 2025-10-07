// import { useEffect, useRef } from "react";
// import { PlatformData, OpenInterestPlatform } from "../types";

// interface ChartPanelProps {
// 	title: string;
// 	data: PlatformData[] | OpenInterestPlatform[];
// 	type: "funding" | "openInterest";
// }

// export default function ChartPanel({ title, data, type }: ChartPanelProps) {
// 	console.log("checking data", data);
// 	const canvasRef = useRef<HTMLCanvasElement>(null);

// 	// useEffect(() => {
// 	// 	if (!canvasRef.current || !data.length) return;

// 	// 	const canvas = canvasRef.current;
// 	// 	const ctx = canvas.getContext("2d");
// 	// 	if (!ctx) return;

// 	// 	const dpr = window.devicePixelRatio || 1;
// 	// 	const rect = canvas.getBoundingClientRect();
// 	// 	canvas.width = rect.width * dpr;
// 	// 	canvas.height = rect.height * dpr;
// 	// 	ctx.setTransform(1, 0, 0, 1, 0, 0);
// 	// 	ctx.scale(dpr, dpr);

// 	// 	const width = rect.width;
// 	// 	const height = rect.height;
// 	// 	const padding = { top: 20, right: 20, bottom: 40, left: 60 };
// 	// 	const chartWidth = width - padding.left - padding.right;
// 	// 	const chartHeight = height - padding.top - padding.bottom;

// 	// 	// Aggregate domains
// 	// 	const allValues = data.flatMap((p) => p.data.map((d) => d.value));
// 	// 	const minValue = Math.min(...allValues);
// 	// 	const maxValue = Math.max(...allValues);
// 	// 	const valueRange = maxValue - minValue || 1;

// 	// 	const allTimes = data.flatMap((p) => p.data.map((d) => d.timestamp));
// 	// 	const minTime = Math.min(...allTimes);
// 	// 	console.log("min time", minTime);
// 	// 	const maxTime = Math.max(...allTimes);
// 	// 	const timeRange = Math.max(1, maxTime - minTime);
// 	// 	console.log("time range", timeRange);
// 	// 	const xForTime = (t: number) =>
// 	// 		padding.left + ((t - minTime) / timeRange) * chartWidth;
// 	// 	const yForValue = (v: number) =>
// 	// 		padding.top + chartHeight - ((v - minValue) / valueRange) * chartHeight;

// 	// 	const formatYAxis = (val: number) =>
// 	// 		type === "funding"
// 	// 			? `${val.toFixed(2)}%`
// 	// 			: `$${(val / 1000).toFixed(0)}K`;
// 	// 	const formatTime = (t: number) => {
// 	// 		const spanDays = timeRange / (24 * 3600 * 1000);
// 	// 		const d = new Date(t);
// 	// 		if (spanDays > 180) {
// 	// 			// e.g. 'Jan 25' (UTC)
// 	// 			const mon = d.toLocaleString("en-US", {
// 	// 				month: "short",
// 	// 				timeZone: "UTC",
// 	// 			});
// 	// 			const yr = String(d.getUTCFullYear()).slice(-2);
// 	// 			return `${mon} ${yr}`;
// 	// 		}
// 	// 		if (spanDays > 7) {
// 	// 			// e.g. '01 Jan' (UTC)
// 	// 			const day = String(d.getUTCDate()).padStart(2, "0");
// 	// 			const mon = d.toLocaleString("en-US", {
// 	// 				month: "short",
// 	// 				timeZone: "UTC",
// 	// 			});
// 	// 			return `${day} ${mon}`;
// 	// 		}
// 	// 		// e.g. '13:45 UTC'
// 	// 		const hh = String(d.getUTCHours()).padStart(2, "0");
// 	// 		const mm = String(d.getUTCMinutes()).padStart(2, "0");
// 	// 		return `${hh}:${mm} UTC`;
// 	// 	};

// 	// 	const draw = (hoverX: number | null) => {
// 	// 		ctx.clearRect(0, 0, width, height);

// 	// 		// grid + y-axis labels
// 	// 		ctx.strokeStyle = "#374151";
// 	// 		ctx.lineWidth = 1;
// 	// 		for (let i = 0; i <= 5; i++) {
// 	// 			const y = padding.top + (chartHeight / 5) * i;
// 	// 			ctx.beginPath();
// 	// 			ctx.moveTo(padding.left, y);
// 	// 			ctx.lineTo(width - padding.right, y);
// 	// 			ctx.stroke();
// 	// 		}
// 	// 		ctx.font = "11px sans-serif";
// 	// 		ctx.fillStyle = "#9ca3af";
// 	// 		ctx.textAlign = "right";
// 	// 		for (let i = 0; i <= 5; i++) {
// 	// 			const y = padding.top + (chartHeight / 5) * i;
// 	// 			const value = maxValue - (valueRange / 5) * i;
// 	// 			ctx.fillText(formatYAxis(value), padding.left - 10, y + 4);
// 	// 		}

// 	// 		// x-axis ticks (6 ticks)
// 	// 		ctx.textAlign = "center";
// 	// 		const ticks = 6;
// 	// 		for (let i = 0; i < ticks; i++) {
// 	// 			const t = minTime + (timeRange * i) / (ticks - 1);
// 	// 			const x = xForTime(t);
// 	// 			ctx.fillText(formatTime(t), x, height - 20);
// 	// 		}

// 	// 		// lines
// 	// 		data.forEach((platform) => {
// 	// 			ctx.beginPath();
// 	// 			ctx.strokeStyle = platform.color;
// 	// 			ctx.lineWidth = 2;
// 	// 			platform.data.forEach((point, i) => {
// 	// 				const x = xForTime(point.timestamp);
// 	// 				const y = yForValue(point.value);
// 	// 				if (i === 0) ctx.moveTo(x, y);
// 	// 				else ctx.lineTo(x, y);
// 	// 			});
// 	// 			ctx.stroke();
// 	// 		});

// 	// 		// hover
// 	// 		if (hoverX !== null) {
// 	// 			// constrain to chart area
// 	// 			const cx = Math.max(
// 	// 				padding.left,
// 	// 				Math.min(hoverX, width - padding.right)
// 	// 			);
// 	// 			ctx.strokeStyle = "#6b7280";
// 	// 			ctx.lineWidth = 1;
// 	// 			ctx.beginPath();
// 	// 			ctx.moveTo(cx, padding.top);
// 	// 			ctx.lineTo(cx, height - padding.bottom);
// 	// 			ctx.stroke();

// 	// 			// nearest per platform
// 	// 			const hoverTime =
// 	// 				minTime + ((cx - padding.left) / chartWidth) * timeRange;
// 	// 			const tooltipLines: string[] = [];
// 	// 			data.forEach((platform) => {
// 	// 				if (!platform.data.length) return;
// 	// 				let nearestIdx = 0;
// 	// 				let nearestDist = Infinity;
// 	// 				platform.data.forEach((pt, i) => {
// 	// 					const dx = Math.abs(pt.timestamp - hoverTime);
// 	// 					if (dx < nearestDist) {
// 	// 						nearestDist = dx;
// 	// 						nearestIdx = i;
// 	// 					}
// 	// 				});
// 	// 				const pt = platform.data[nearestIdx];
// 	// 				const px = xForTime(pt.timestamp);
// 	// 				const py = yForValue(pt.value);
// 	// 				// point dot
// 	// 				ctx.fillStyle = platform.color;
// 	// 				ctx.beginPath();
// 	// 				ctx.arc(px, py, 3, 0, Math.PI * 2);
// 	// 				ctx.fill();
// 	// 				tooltipLines.push(`${platform.name}: ${formatYAxis(pt.value)}`);
// 	// 			});

// 	// 			// tooltip box
// 	// 			const tooltipText = tooltipLines.join("  ");
// 	// 			ctx.font = "12px sans-serif";
// 	// 			const textWidth = ctx.measureText(tooltipText).width + 12;
// 	// 			const boxX = Math.min(cx + 10, width - padding.right - textWidth);
// 	// 			const boxY = padding.top + 8;
// 	// 			ctx.fillStyle = "rgba(17,24,39,0.9)";
// 	// 			ctx.fillRect(boxX, boxY, textWidth, 22);
// 	// 			ctx.strokeStyle = "#374151";
// 	// 			ctx.strokeRect(boxX, boxY, textWidth, 22);
// 	// 			ctx.fillStyle = "#e5e7eb";
// 	// 			ctx.fillText(tooltipText, boxX + 6, boxY + 15);
// 	// 		}
// 	// 	};

// 	// 	draw(null);

// 	// 	const handleMove = (evt: MouseEvent) => {
// 	// 		const r = canvas.getBoundingClientRect();
// 	// 		const x = evt.clientX - r.left;
// 	// 		draw(x);
// 	// 	};
// 	// 	const handleLeave = () => draw(null);

// 	// 	canvas.addEventListener("mousemove", handleMove);
// 	// 	canvas.addEventListener("mouseleave", handleLeave);

// 	// 	return () => {
// 	// 		canvas.removeEventListener("mousemove", handleMove);
// 	// 		canvas.removeEventListener("mouseleave", handleLeave);
// 	// 	};
// 	// }, [data, type]);

// 	useEffect(() => {
// 		if (!canvasRef.current || !data.length) return;

// 		const canvas = canvasRef.current;
// 		const ctx = canvas.getContext("2d");
// 		if (!ctx) return;

// 		const dpr = window.devicePixelRatio || 1;
// 		const rect = canvas.getBoundingClientRect();
// 		canvas.width = rect.width * dpr;
// 		canvas.height = rect.height * dpr;
// 		ctx.setTransform(1, 0, 0, 1, 0, 0);
// 		ctx.scale(dpr, dpr);

// 		const width = rect.width;
// 		const height = rect.height;
// 		const padding = { top: 20, right: 20, bottom: 40, left: 60 };
// 		const chartWidth = width - padding.left - padding.right;
// 		const chartHeight = height - padding.top - padding.bottom;

// 		// ✅ Ensure all numeric
// 		const normalizedData = data.map((p) => ({
// 			...p,
// 			data: p.data.map((d) => ({
// 				// Convert seconds → ms if necessary
// 				timestamp:
// 					d.timestamp < 10_000_000_000 ? d.timestamp * 1000 : d.timestamp,
// 				value: typeof d.value === "string" ? parseFloat(d.value) : d.value,
// 			})),
// 		}));

// 		const allValues = normalizedData.flatMap((p) => p.data.map((d) => d.value));
// 		const minValue = Math.min(...allValues);
// 		const maxValue = Math.max(...allValues);
// 		const valueRange = maxValue - minValue || 1;

// 		const allTimes = normalizedData.flatMap((p) =>
// 			p.data.map((d) => d.timestamp)
// 		);
// 		const minTime = Math.min(...allTimes);
// 		const maxTime = Math.max(...allTimes);
// 		const timeRange = Math.max(1, maxTime - minTime);

// 		const xForTime = (t: number) =>
// 			padding.left + ((t - minTime) / timeRange) * chartWidth;
// 		const yForValue = (v: number) =>
// 			padding.top + chartHeight - ((v - minValue) / valueRange) * chartHeight;

// 		const formatYAxis = (val: number) =>
// 			type === "funding"
// 				? `${val.toFixed(2)}%`
// 				: `$${(val / 1000).toFixed(0)}K`;

// 		const formatTime = (t: number) => {
// 			const d = new Date(t);
// 			const spanDays = timeRange / (24 * 3600 * 1000);
// 			if (spanDays > 180)
// 				return `${d.toLocaleString("en-US", { month: "short" })} '${String(
// 					d.getUTCFullYear()
// 				).slice(-2)}`;
// 			if (spanDays > 7)
// 				return `${String(d.getUTCDate()).padStart(2, "0")} ${d.toLocaleString(
// 					"en-US",
// 					{ month: "short" }
// 				)}`;
// 			return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
// 				d.getUTCMinutes()
// 			).padStart(2, "0")} UTC`;
// 		};

// 		const draw = (hoverX: number | null) => {
// 			ctx.clearRect(0, 0, width, height);

// 			// grid
// 			ctx.strokeStyle = "#374151";
// 			ctx.lineWidth = 1;
// 			for (let i = 0; i <= 5; i++) {
// 				const y = padding.top + (chartHeight / 5) * i;
// 				ctx.beginPath();
// 				ctx.moveTo(padding.left, y);
// 				ctx.lineTo(width - padding.right, y);
// 				ctx.stroke();
// 			}

// 			// Y labels
// 			ctx.font = "11px sans-serif";
// 			ctx.fillStyle = "#9ca3af";
// 			ctx.textAlign = "right";
// 			for (let i = 0; i <= 5; i++) {
// 				const y = padding.top + (chartHeight / 5) * i;
// 				const value = maxValue - (valueRange / 5) * i;
// 				ctx.fillText(formatYAxis(value), padding.left - 10, y + 4);
// 			}

// 			// X labels
// 			ctx.textAlign = "center";
// 			const ticks = 6;
// 			for (let i = 0; i < ticks; i++) {
// 				const t = minTime + (timeRange * i) / (ticks - 1);
// 				const x = xForTime(t);
// 				ctx.fillText(formatTime(t), x, height - 20);
// 			}

// 			// data lines
// 			normalizedData.forEach((platform) => {
// 				ctx.beginPath();
// 				ctx.strokeStyle = platform.color;
// 				ctx.lineWidth = 2;
// 				platform.data.forEach((point, i) => {
// 					const x = xForTime(point.timestamp);
// 					const y = yForValue(point.value);
// 					if (i === 0) ctx.moveTo(x, y);
// 					else ctx.lineTo(x, y);
// 				});
// 				ctx.stroke();
// 			});

// 			// Hover
// 			if (hoverX !== null) {
// 				const cx = Math.max(
// 					padding.left,
// 					Math.min(hoverX, width - padding.right)
// 				);
// 				ctx.strokeStyle = "#6b7280";
// 				ctx.lineWidth = 1;
// 				ctx.beginPath();
// 				ctx.moveTo(cx, padding.top);
// 				ctx.lineTo(cx, height - padding.bottom);
// 				ctx.stroke();

// 				const hoverTime =
// 					minTime + ((cx - padding.left) / chartWidth) * timeRange;
// 				const tooltipLines: string[] = [];

// 				normalizedData.forEach((platform) => {
// 					if (!platform.data.length) return;
// 					let nearestIdx = 0;
// 					let nearestDist = Infinity;
// 					platform.data.forEach((pt, i) => {
// 						const dx = Math.abs(pt.timestamp - hoverTime);
// 						if (dx < nearestDist) {
// 							nearestDist = dx;
// 							nearestIdx = i;
// 						}
// 					});
// 					const pt = platform.data[nearestIdx];
// 					const px = xForTime(pt.timestamp);
// 					const py = yForValue(pt.value);
// 					ctx.fillStyle = platform.color;
// 					ctx.beginPath();
// 					ctx.arc(px, py, 3, 0, Math.PI * 2);
// 					ctx.fill();
// 					tooltipLines.push(`${platform.name}: ${formatYAxis(pt.value)}`);
// 				});

// 				const tooltipText = tooltipLines.join("  ");
// 				ctx.font = "12px sans-serif";
// 				const textWidth = ctx.measureText(tooltipText).width + 12;
// 				const boxX = Math.min(cx + 10, width - padding.right - textWidth);
// 				const boxY = padding.top + 8;
// 				ctx.fillStyle = "rgba(17,24,39,0.9)";
// 				ctx.fillRect(boxX, boxY, textWidth, 22);
// 				ctx.strokeStyle = "#374151";
// 				ctx.strokeRect(boxX, boxY, textWidth, 22);
// 				ctx.fillStyle = "#e5e7eb";
// 				ctx.fillText(tooltipText, boxX + 6, boxY + 15);
// 			}
// 		};

// 		draw(null);

// 		const handleMove = (evt: MouseEvent) => {
// 			const r = canvas.getBoundingClientRect();
// 			const x = evt.clientX - r.left;
// 			draw(x);
// 		};
// 		const handleLeave = () => draw(null);

// 		canvas.addEventListener("mousemove", handleMove);
// 		canvas.addEventListener("mouseleave", handleLeave);

// 		return () => {
// 			canvas.removeEventListener("mousemove", handleMove);
// 			canvas.removeEventListener("mouseleave", handleLeave);
// 		};
// 	}, [data, type]);
// 	const formatValue = (val: number | string) => {
// 		if (typeof val === "string") return val;
// 		return type === "funding" ? `${val.toFixed(1)}%` : `$${val}K`;
// 	};

// 	return (
// 		<div className="bg-[#1f1f1f] rounded-lg border border-gray-800">
// 			<div className="p-4 border-b border-gray-800 flex items-center justify-between">
// 				<h3 className="text-white font-medium">{title}</h3>
// 			</div>

// 			<div className="p-4">
// 				<canvas
// 					ref={canvasRef}
// 					className="w-full"
// 					style={{ height: "300px" }}
// 				/>

// 				<div className="mt-4">
// 					<table className="w-full text-sm">
// 						<thead>
// 							<tr className="text-gray-400 border-b border-gray-800">
// 								<th className="text-left py-2 font-medium">Name</th>
// 								<th className="text-right py-2 font-medium text-emerald-400">
// 									Min
// 								</th>
// 								<th className="text-right py-2 font-medium text-emerald-400">
// 									Max
// 								</th>
// 								<th className="text-right py-2 font-medium text-emerald-400">
// 									Mean
// 								</th>
// 							</tr>
// 						</thead>
// 						<tbody>
// 							{data.map((platform) => (
// 								<tr key={platform.name} className="border-b border-gray-800/50">
// 									<td className="py-2 flex items-center gap-2">
// 										<div
// 											className="w-3 h-0.5"
// 											style={{ backgroundColor: platform.color }}
// 										/>
// 										<span className="text-gray-300">{platform.name}</span>
// 									</td>
// 									<td className="text-right text-gray-300">
// 										{formatValue(platform.min)}
// 									</td>
// 									<td className="text-right text-gray-300">
// 										{formatValue(platform.max)}
// 									</td>
// 									<td className="text-right text-gray-300">
// 										{formatValue(platform.mean)}
// 									</td>
// 								</tr>
// 							))}
// 						</tbody>
// 					</table>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }

import { useEffect, useRef } from "react";
import { PlatformData, OpenInterestPlatform } from "../types";

interface ChartPanelProps {
	title: string;
	data: PlatformData[] | OpenInterestPlatform[];
	type: "funding" | "openInterest";
}

export default function ChartPanel({ title, data, type }: ChartPanelProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!canvasRef.current || !data.length) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);

		const width = rect.width;
		const height = rect.height;
		const padding = { top: 20, right: 20, bottom: 40, left: 60 };
		const chartWidth = width - padding.left - padding.right;
		const chartHeight = height - padding.top - padding.bottom;

		// ✅ Data already in correct format
		const allValues = data.flatMap((p) => p.data.map((d) => d.value));
		const minValue = Math.min(...allValues);
		const maxValue = Math.max(...allValues);
		const valueRange = maxValue - minValue || 1;

		const allTimes = data.flatMap((p) => p.data.map((d) => d.timestamp));
		const minTime = Math.min(...allTimes);
		const maxTime = Math.max(...allTimes);
		const timeRange = Math.max(1, maxTime - minTime);

		const xForTime = (t: number) =>
			padding.left + ((t - minTime) / timeRange) * chartWidth;
		const yForValue = (v: number) =>
			padding.top + chartHeight - ((v - minValue) / valueRange) * chartHeight;

		const formatYAxis = (val: number) =>
			type === "funding" ? `${val.toFixed(4)}` : `$${(val / 1000).toFixed(0)}K`;

		const formatTime = (t: number) => {
			const d = new Date(t);
			const spanDays = timeRange / (24 * 3600 * 1000);
			if (spanDays > 180)
				return `${d.toLocaleString("en-US", {
					month: "short",
				})} ${d.getUTCFullYear()}`;
			if (spanDays > 7)
				return `${String(d.getUTCDate()).padStart(2, "0")} ${d.toLocaleString(
					"en-US",
					{ month: "short" }
				)} ${d.getUTCFullYear()}`;
			return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
				d.getUTCMinutes()
			).padStart(2, "0")} UTC`;
		};

		const draw = (hoverX: number | null) => {
			ctx.clearRect(0, 0, width, height);

			// grid lines
			ctx.strokeStyle = "#374151";
			ctx.lineWidth = 1;
			for (let i = 0; i <= 5; i++) {
				const y = padding.top + (chartHeight / 5) * i;
				ctx.beginPath();
				ctx.moveTo(padding.left, y);
				ctx.lineTo(width - padding.right, y);
				ctx.stroke();
			}

			// Y labels
			ctx.font = "11px sans-serif";
			ctx.fillStyle = "#9ca3af";
			ctx.textAlign = "right";
			for (let i = 0; i <= 5; i++) {
				const y = padding.top + (chartHeight / 5) * i;
				const value = maxValue - (valueRange / 5) * i;
				ctx.fillText(formatYAxis(value), padding.left - 10, y + 4);
			}

			// X labels
			ctx.textAlign = "center";
			const ticks = 6;
			for (let i = 0; i < ticks; i++) {
				const t = minTime + (timeRange * i) / (ticks - 1);
				const x = xForTime(t);
				ctx.fillText(formatTime(t), x, height - 20);
			}

			// data lines
			data.forEach((platform) => {
				ctx.beginPath();
				ctx.strokeStyle = platform.color;
				ctx.lineWidth = 2;
				platform.data.forEach((point, i) => {
					const x = xForTime(point.timestamp);
					const y = yForValue(point.value);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				});
				ctx.stroke();
			});

			// hover effect
			if (hoverX !== null) {
				const cx = Math.max(
					padding.left,
					Math.min(hoverX, width - padding.right)
				);
				ctx.strokeStyle = "#6b7280";
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(cx, padding.top);
				ctx.lineTo(cx, height - padding.bottom);
				ctx.stroke();

				const hoverTime =
					minTime + ((cx - padding.left) / chartWidth) * timeRange;
				const tooltipLines: string[] = [];
				const formatTooltipTime = (t: number) => {
					const d = new Date(t);
					const yyyy = d.getUTCFullYear();
					const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
					const dd = String(d.getUTCDate()).padStart(2, "0");
					const hh = String(d.getUTCHours()).padStart(2, "0");
					const min = String(d.getUTCMinutes()).padStart(2, "0");
					return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
				};

				data.forEach((platform) => {
					if (!platform.data.length) return;
					let nearestIdx = 0;
					let nearestDist = Infinity;
					platform.data.forEach((pt, i) => {
						const dx = Math.abs(pt.timestamp - hoverTime);
						if (dx < nearestDist) {
							nearestDist = dx;
							nearestIdx = i;
						}
					});
					const pt = platform.data[nearestIdx];
					const px = xForTime(pt.timestamp);
					const py = yForValue(pt.value);
					ctx.fillStyle = platform.color;
					ctx.beginPath();
					ctx.arc(px, py, 3, 0, Math.PI * 2);
					ctx.fill();
					tooltipLines.push(`${platform.name}: ${formatYAxis(pt.value)}`);
				});

				const header = formatTooltipTime(hoverTime);
				const lines = [header, ...tooltipLines];
				ctx.font = "12px sans-serif";
				const padX = 8;
				const padY = 6;
				const lineH = 16;
				const boxW =
					Math.max(...lines.map((s) => ctx.measureText(s).width)) + padX * 2;
				const boxH = padY * 2 + lineH * lines.length;
				const boxX = Math.min(cx + 10, width - padding.right - boxW);
				const boxY = padding.top + 8;
				ctx.fillStyle = "rgba(17,24,39,0.9)";
				ctx.fillRect(boxX, boxY, boxW, boxH);
				ctx.strokeStyle = "#374151";
				ctx.strokeRect(boxX, boxY, boxW, boxH);
				ctx.fillStyle = "#e5e7eb";
				lines.forEach((s, i) => {
					ctx.fillText(s, boxX + padX, boxY + padY + (i + 0.8) * lineH);
				});
			}
		};

		draw(null);

		const handleMove = (evt: MouseEvent) => {
			const r = canvas.getBoundingClientRect();
			const x = evt.clientX - r.left;
			draw(x);
		};
		const handleLeave = () => draw(null);

		canvas.addEventListener("mousemove", handleMove);
		canvas.addEventListener("mouseleave", handleLeave);

		return () => {
			canvas.removeEventListener("mousemove", handleMove);
			canvas.removeEventListener("mouseleave", handleLeave);
		};
	}, [data, type]);

	const formatValue = (val: number | string) => {
		if (typeof val === "string") return val;
		return type === "funding" ? `${val.toFixed(4)}` : `$${val}K`;
	};

	return (
		<div className="bg-[#1f1f1f] rounded-lg border border-gray-800">
			<div className="p-4 border-b border-gray-800 flex items-center justify-between">
				<h3 className="text-white font-medium">{title}</h3>
			</div>

			<div className="p-4">
				<canvas
					ref={canvasRef}
					className="w-full"
					style={{ height: "300px" }}
				/>

				<div className="mt-4">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-gray-400 border-b border-gray-800">
								<th className="text-left py-2 font-medium">Name</th>
								<th className="text-right py-2 font-medium text-emerald-400">
									Min
								</th>
								<th className="text-right py-2 font-medium text-emerald-400">
									Max
								</th>
								<th className="text-right py-2 font-medium text-emerald-400">
									Mean
								</th>
							</tr>
						</thead>
						<tbody>
							{data.map((platform) => (
								<tr key={platform.name} className="border-b border-gray-800/50">
									<td className="py-2 flex items-center gap-2">
										<div
											className="w-3 h-0.5"
											style={{ backgroundColor: platform.color }}
										/>
										<span className="text-gray-300">{platform.name}</span>
									</td>
									<td className="text-right text-gray-300">
										{formatValue(platform.min)}
									</td>
									<td className="text-right text-gray-300">
										{formatValue(platform.max)}
									</td>
									<td className="text-right text-gray-300">
										{formatValue(platform.mean)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
