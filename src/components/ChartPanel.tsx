import { useEffect, useRef } from "react";
import { PlatformData, OpenInterestPlatform } from "../types";
import { ScoringTable } from "./ScoringTable";

interface ChartPanelProps {
	title: string;
	data: PlatformData[] | OpenInterestPlatform[];
	type: "funding" | "openInterest";
	market: string;
}

export default function ChartPanel({
	title,
	data,
	type,
	market,
}: ChartPanelProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	console.log("ChartPanel data:", data);
	useEffect(() => {
		if (!canvasRef.current) return;
		// defensive: if no data, still clear canvas
		if (!data || !data.length) {
			const c = canvasRef.current!;
			const ctx = c.getContext("2d");
			if (ctx) {
				const rect = c.getBoundingClientRect();
				c.width = rect.width * (window.devicePixelRatio || 1);
				c.height = rect.height * (window.devicePixelRatio || 1);
				ctx.clearRect(0, 0, rect.width, rect.height);
			}
			return;
		}

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Normalize data: convert timestamps -> number (ms), values -> number
		// create a sanitized copy so we do not mutate props
		const normalized = (data as any[]).map((platform) => {
			const pdata = (platform.data || [])
				.map((pt: any) => {
					const ts =
						typeof pt.timestamp === "number"
							? pt.timestamp
							: Date.parse(pt.timestamp);
					const value = Number(pt.value ?? pt.rate ?? pt.annualized_rate ?? 0);
					if (isNaN(ts) || isNaN(value)) return null;
					return { ...pt, timestamp: ts, value };
				})
				.filter(Boolean) as { timestamp: number; value: number }[];

			// compute quick stats
			let min = Infinity,
				max = -Infinity,
				sum = 0;
			pdata.forEach((p) => {
				if (p.value < min) min = p.value;
				if (p.value > max) max = p.value;
				sum += p.value;
			});
			const mean = pdata.length ? sum / pdata.length : 0;
			return {
				...platform,
				data: pdata,
				min: pdata.length ? min : null,
				max: pdata.length ? max : null,
				mean: pdata.length ? mean : null,
			};
		});

		// Device pixel ratio + canvas sizing (use CSS pixels for drawing after ctx.scale)
		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		// ensure canvas has explicit size in backing pixels
		canvas.width = Math.max(1, Math.floor(rect.width * dpr));
		canvas.height = Math.max(1, Math.floor(rect.height * dpr));

		// Reset transform and scale so drawing coordinates = CSS pixels
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);

		const width = rect.width;
		const height = rect.height;
		const padding = { top: 20, right: 20, bottom: 40, left: 60 };
		const chartWidth = Math.max(10, width - padding.left - padding.right);
		const chartHeight = Math.max(10, height - padding.top - padding.bottom);

		// collect overall value/time ranges from normalized data
		const allValues = normalized.flatMap((p) =>
			(p.data || []).map((d) => d.value)
		);
		if (!allValues.length) {
			// nothing to plot
			ctx.clearRect(0, 0, width, height);
			return;
		}
		const minValue = Math.min(...allValues);
		const maxValue = Math.max(...allValues);
		const valueRange = Math.max(1e-9, maxValue - minValue); // avoid 0

		const allTimes = normalized
			.flatMap((p) => (p.data || []).map((d) => d.timestamp))
			.sort((a, b) => a - b);
		if (!allTimes.length) return;
		const minTime = allTimes[0];
		const maxTime = allTimes[allTimes.length - 1];
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

		// draw function (hoverX is CSS pixels)
		const draw = (hoverX: number | null) => {
			ctx.clearRect(0, 0, rect.width, rect.height);

			// background grid
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
			ctx.textBaseline = "middle";
			for (let i = 0; i <= 5; i++) {
				const y = padding.top + (chartHeight / 5) * i;
				const value = maxValue - (valueRange / 5) * i;
				ctx.fillText(formatYAxis(value), padding.left - 10, y);
			}

			// X labels
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			const ticks = 6;
			for (let i = 0; i < ticks; i++) {
				const t = minTime + (timeRange * i) / (ticks - 1);
				const x = xForTime(t);
				ctx.fillText(formatTime(t), x, height - 20);
			}

			// draw data lines
			normalized.forEach((platform) => {
				if (!platform.data || !platform.data.length) return;
				ctx.beginPath();
				ctx.strokeStyle = platform.color ?? "#fff";
				ctx.lineWidth = 2;
				let started = false;
				// ensure points sorted by timestamp
				const points = platform.data
					.slice()
					.sort((a, b) => a.timestamp - b.timestamp);
				points.forEach((point) => {
					const x = xForTime(point.timestamp);
					const y = yForValue(point.value);
					if (!started) {
						ctx.moveTo(x, y);
						started = true;
					} else {
						ctx.lineTo(x, y);
					}
				});
				ctx.stroke();
			});

			// hover: vertical line, dots and tooltip
			if (hoverX !== null) {
				// clamp to chart area in CSS pixels
				const cx = Math.max(
					padding.left,
					Math.min(hoverX, width - padding.right)
				);
				// draw vertical line
				ctx.strokeStyle = "#6b7280";
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(cx, padding.top);
				ctx.lineTo(cx, height - padding.bottom);
				ctx.stroke();

				// compute hover time from cx
				const hoverTime =
					minTime + ((cx - padding.left) / chartWidth) * timeRange;

				// build tooltip contents and draw dots
				const tooltipLines: string[] = [];
				normalized.forEach((platform) => {
					if (!platform.data || !platform.data.length) return;
					// find nearest point by timestamp
					let nearestIdx = 0;
					let nearestDist = Infinity;
					for (let i = 0; i < platform.data.length; i++) {
						const pt = platform.data[i];
						const dx = Math.abs(pt.timestamp - hoverTime);
						if (dx < nearestDist) {
							nearestDist = dx;
							nearestIdx = i;
						}
					}
					const pt = platform.data[nearestIdx];
					if (!pt) return;
					const px = xForTime(pt.timestamp);
					const py = yForValue(pt.value);

					// dot
					ctx.beginPath();
					ctx.fillStyle = platform.color ?? "#fff";
					ctx.arc(px, py, 3, 0, Math.PI * 2);
					ctx.fill();

					// label line for tooltip
					const label = `${platform.name}: ${formatYAxis(pt.value)}`;
					tooltipLines.push(label);
				});

				// tooltip header time
				const d = new Date(hoverTime);
				const yyyy = d.getUTCFullYear();
				const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
				const dd = String(d.getUTCDate()).padStart(2, "0");
				const hh = String(d.getUTCHours()).padStart(2, "0");
				const min = String(d.getUTCMinutes()).padStart(2, "0");
				const header = `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;

				const lines = [header, ...tooltipLines];

				// draw tooltip box
				ctx.font = "12px sans-serif";
				const padX = 8;
				const padY = 6;
				const lineH = 16;
				const measuredWidths = lines.map((s) => ctx.measureText(s).width);
				const boxW = Math.max(...measuredWidths) + padX * 2;
				const boxH = padY * 2 + lineH * lines.length;

				// place tooltip to the right of vertical line, but keep inside chart
				const boxX = Math.min(cx + 10, width - padding.right - boxW);
				const boxY = padding.top + 8;

				ctx.fillStyle = "rgba(17,24,39,0.95)";
				ctx.fillRect(boxX, boxY, boxW, boxH);
				ctx.strokeStyle = "#374151";
				ctx.strokeRect(boxX, boxY, boxW, boxH);

				ctx.fillStyle = "#e5e7eb";
				ctx.textAlign = "left";
				ctx.textBaseline = "top";
				lines.forEach((s, i) => {
					ctx.fillText(s, boxX + padX, boxY + padY + i * lineH);
				});
			}
		};

		// initial draw
		draw(null);

		// set cursor
		canvas.style.cursor = "crosshair";

		// pointer mapping: because we scaled ctx by dpr, drawing coordinates are CSS pixels.
		// So compute x in CSS pixels: (evt.clientX - rect.left)
		// We must recompute rect inside handler since layout can change
		const handleMove = (evt: MouseEvent) => {
			const r = canvas.getBoundingClientRect();
			const xCss = evt.clientX - r.left;
			draw(xCss);
		};
		const handleLeave = () => draw(null);

		canvas.addEventListener("mousemove", handleMove);
		canvas.addEventListener("mouseleave", handleLeave);

		// redraw on resize to keep sizes in sync
		const handleResize = () => {
			// re-run the whole effect by forcing a draw with current mouse null
			// (we simply call draw(null) after resizing canvas to new rect)
			const r = canvas.getBoundingClientRect();
			canvas.width = Math.max(1, Math.floor(r.width * dpr));
			canvas.height = Math.max(1, Math.floor(r.height * dpr));
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(dpr, dpr);
			draw(null);
		};
		window.addEventListener("resize", handleResize);

		return () => {
			canvas.removeEventListener("mousemove", handleMove);
			canvas.removeEventListener("mouseleave", handleLeave);
			window.removeEventListener("resize", handleResize);
		};
	}, [data, type]);

	const formatValue = (val: number | string) => {
		if (typeof val === "string") return val;
		return type === "funding" ? `${val.toFixed(4)}` : `$${val}K`;
	};
	const currentFunding = (platform: PlatformData) => {
		if (!platform.data || platform.data.length === 0) return null;
		// find latest point by timestamp
		let latestPoint = platform.data[0];
		platform.data.forEach((pt) => {
			if (pt.timestamp > latestPoint.timestamp) {
				latestPoint = pt;
			}
		});
		return latestPoint.value;
	};
	return (
		<div className="bg-[#1f1f1f] rounded-lg border border-gray-800">
			<div className="p-4 border-b border-gray-800 flex items-center justify-between">
				<h3 className="text-lg font-semibold mt-10 mb-3 text-blue-400">
					{title}
				</h3>
				<p className="text-gray-400 text-sm">{"Funding Rate (%) 24h Time"}</p>
			</div>

			<div className="p-4">
				<div className="relative w-full" style={{ height: 300 }}>
					<canvas ref={canvasRef} className="w-full h-full block" />
				</div>

				<div className="mt-4">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-gray-400 border-b border-gray-800">
								<th className="text-left py-2 font-medium">Platform</th>
								<th className="text-right py-2 font-medium text-emerald-400">
									Current
								</th>
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
							{(data as any[]).map((platform) => {
								return (
									<tr
										key={platform.name}
										className="border-b border-gray-800/50"
									>
										<td className="py-2 flex items-center gap-2">
											<div
												className="w-3 h-0.5"
												style={{ backgroundColor: platform.color }}
											/>
											<span className="text-gray-300">
												{platform.name.toUpperCase()}
											</span>
										</td>
										<td className="text-right text-gray-300">
											{platform.data && platform.data.length > 0 ? (
												formatValue(currentFunding(platform) ?? 0)
											) : (
												<span className="text-red-400">No data</span>
											)}
										</td>
										<td className="text-right text-gray-300">
											{platform.data && platform.data.length > 0 ? (
												formatValue(platform.min ?? 0)
											) : (
												<span className="text-red-400">No data</span>
											)}
										</td>
										<td className="text-right text-gray-300">
											{platform.data && platform.data.length > 0 ? (
												formatValue(platform.max ?? 0)
											) : (
												<span className="text-red-400">No data</span>
											)}
										</td>
										<td className="text-right text-gray-300">
											{platform.data && platform.data.length > 0 ? (
												formatValue(platform.mean ?? 0)
											) : (
												<span className="text-red-400">No data</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				<div>
					<ScoringTable title={"Scoring Details"} selectedMarket={market} />
				</div>
			</div>
		</div>
	);
}
