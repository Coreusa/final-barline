<!-- 
  Basic SVG Chart component that supports lines and bar type of charts.
  Charts can be customized through various properties like padding, line width and much more.
-->
<script lang="ts">
	import type { DataSeriesInterface } from './types/DataSeriesInterface.ts';

	let {
		data = [
			{
				label: '',
				values: [0]
			}
		],
		title = '',
		type = 'line',
		width = 400,
		height = 200,
		xMin = undefined,
		xMax = undefined,
		yMin = undefined,
		yMax = undefined,
		yMaxValuePadding = 0,
		timeFormatting = false,
		showLegend = true,
		lineWidth = 3,
		palette = ['#4BEF8F', '#d62728', '#FFC83B', '#17becf', '#dbdb8d', '#D4484B', '#9edae5'],
		xValueSuffix = '',
		yValueSuffix = '',
		xValueCulling = 10,
		xValuePrecision = 1,
		yValuePrecision = 1,
		xValues = [],
		paddingSides = {
			top: 20,
			bottom: 0,
			right: 10,
			left: 20
		},
		showHorizontalGridLines = true,
		showVerticalGridLines = true,
		yValueCulling = 6,
		responsive = true
	}: {
		data: DataSeriesInterface[];
		type: 'line' | 'bar';
		title?: string;
		width?: number;
		height?: number;
		xMin?: number;
		xMax?: number;
		yMin?: number;
		yMax?: number;
		yMaxValuePadding?: number; // How much extra space to add on top of the computed max y value
		timeFormatting?: boolean;
		showLegend?: boolean;
		lineWidth?: number;
		palette?: string[];
		xValueSuffix?: string;
		yValueSuffix?: string;
		// Number of x axis values to display (max)
		xValueCulling?: number;
		// Number of y axis values to display (max)
		yValueCulling?: number;
		// Number precision for x values
		xValuePrecision?: number;
		// Number precision for y values
		yValuePrecision?: number;
		// Optionally provide the x values corresponding to each data point, otherwise assume that x values are 0, 1, 2, etc.)
		xValues?: number[];
		paddingSides?: {
			top: number;
			bottom: number;
			left: number;
			right: number;
		};
		showHorizontalGridLines?: boolean;
		showVerticalGridLines?: boolean;
		// Whether the chart resizes to parent container responsively or not (default true)
		responsive?: boolean;
	} = $props();

	let chartContainerWidth = $state(0);
	let showGraphGrid = $state(true);
	let svgChartElement: SVGSVGElement;
	// Start position of the X/Y axis, to the right of the Y axis
	const chartSafetyMarginX = 50;
	const chartSafetyMarginBottom = 20;

	let chartWidth = $derived.by(() => {
		if (responsive) {
			return chartContainerWidth;
		} else {
			return width;
		}
	});

	// The inner width of the chart (where X starts (min, to the left) and ends (max, to the right)
	let innerWidth = $derived.by(() => {
		return chartWidth - (paddingSides.left + paddingSides.right + chartSafetyMarginX);
	});

	// The inner height of the chart (where Y starts (min, bottom) and ends (max, top). Additionally adds a safety margin at the bottom so x values can be shown
	const innerHeight = $derived.by(
		() => height - (paddingSides.top + paddingSides.bottom) - chartSafetyMarginBottom
	);

	let isEnoughDataForPresentation = $derived.by(() => {
		// Ensure there is at least one data series and that series has at least 1 data point
		return data?.length > 0 && data[0]?.values?.length > 1;
	});

	/**
	 * Scales an x value based on the width of the chart and the min/max x values observed in the data set
	 * @param x
	 */
	const xScale = (x: number) => {
		// TODO: Add padding to computedXMax if need for padding on the right side
		// NOTE: Added padding to the right side to ensure scale factor has enough room
		const ratio = (x - computedXMin) / (computedXMax + 1 - computedXMin);
		const res =
			chartSafetyMarginX / 2 + paddingSides.left + paddingSides.right + ratio * chartWidth;
		// Clamp to the drawable area
		return Math.max(paddingSides.left + paddingSides.right, Math.min(chartWidth, res));
	};

	const yScale = (y: number) => {
		const ratio = (y - computedYMin) / (computedYMax - computedYMin);
		const res = innerHeight + (paddingSides.top + paddingSides.bottom) - ratio * innerHeight;
		return isNaN(res) ? 0 : res;
	};

	// All numeric values across every series – used for autoscaling y‑axis
	const allValues = $derived.by(() => {
		if (data?.length && data[0].values?.length > 2) {
			return data.flatMap((d) => {
				return d.values;
			});
		} else {
			return [0];
		}
	});

	// X‑axis is based on the number of points (assumes all series share the same length)
	const pointCount = $derived.by(() => {
		// Test if there are x values present (custom x ticks provided)
		if (xValues?.length > 0) {
			return xValues.length;
		} else if (data?.length && data[0]?.values?.length > 0) {
			// Sample only the first data series. Point count must be the same across all data series
			return data[0]?.values?.length;
		} else {
			return 0;
		}
	});

	// What data index is currently under the mouse cursor
	let dataHoverIndex = $state(-1);

	/**
	 * Variables related to tooltip position and mouse hovering the chart
	 */
	let mouseHoverX = $derived(dataHoverIndex >= 0 ? xScale(dataHoverIndex) : 0);

	let tooltipX = $derived(mouseHoverX + 10);
	let tooltipY = $state(0);

	let isHoveringChart = $state(false);

	// Handle all values if they are undefined
	const computedXMin = $derived(xMin ?? 0);
	const computedXMax = $derived(xMax ?? pointCount - 1);
	const computedYMin = $derived(yMin ?? Math.min(...allValues));
	const computedYMax = $derived(yMax ?? Math.max(...allValues) + yMaxValuePadding);

	/* 
  /**
   * Returns an array of SVG path strings, one per series
   */
	const graphLines = $derived.by(() => {
		// Iterate each data series and create paths
		const paths = data.map((series) => {
			const points = series.values;
			if (points?.length < 2) {
				// Empty line if there's not enough data
				return 'M 0 0';
			}
			// Create a line for each data series and concatinate to a SVG path string
			return points
				.map((value, index) => {
					const x = xScale(index);
					const y = yScale(value);
					return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
				})
				.join(' ');
		});
		return paths;
	});

	/**
	 * Mouse handler for when the user hovers the chart (to show tooltip and vertical index/position line)
	 * @param event
	 */
	const onMouseMove = (event: MouseEvent) => {
		const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
		const mouseX = event.clientX - rect.left - chartSafetyMarginX + paddingSides.left;
		// Convert from the dimensions of the image to a corresponding data index in the chart
		const relative = mouseX / chartWidth;
		const index = Math.round(computedXMin + relative * (computedXMax - computedXMin));
		tooltipY = event.clientY - rect.top + 10; // 10px below the mouse
		dataHoverIndex = Math.max(0, Math.min(pointCount - 1, index));
		isHoveringChart = true;
	};

	const onMouseLeave = () => {
		isHoveringChart = false;
		dataHoverIndex = -1;
	};

	/**
	 * Bar chart groups. Do not calculate them if the chart type is not bar
	 */
	const graphBars = $derived.by(() => {
		if (type !== 'bar' || !isEnoughDataForPresentation) {
			return [];
		}

		const barWidth = innerWidth / pointCount;

		const groups = Array.from({ length: pointCount }, (_, dataSeriesIndex) => {
			const xBaseLine = xScale(dataSeriesIndex);
			return data.map((series, seriesIndex) => {
				const v = series.values[dataSeriesIndex];
				const x = xBaseLine + seriesIndex * barWidth - barWidth / 2;
				const y = Math.abs(yScale(v));
				const h = innerHeight + (paddingSides.top + paddingSides.bottom) - y;
				return {
					x,
					y,
					w: barWidth,
					h
				};
			});
		});
		return groups;
	});

	/**
	 * Creates values for X, taking into account any x culling settings
	 */
	const xTicks = $derived.by(() => {
		const range = computedXMax - computedXMin;
		const step = Math.max(1, Math.floor(range / xValueCulling));

		const indexes = Array.from({ length: xValueCulling + 1 }, (_, i) => computedXMin + i * step);

		// Use a set to ensure unique values
		const unique = Array.from(new Set(indexes));

		return unique.map((index) => {
			// TODO: Using base index as fallback will cause issues when adding a xValuePadding and using custom xValues
			const value = xValues?.[index] !== undefined ? xValues[index] : index;
			return {
				value:
					timeFormatting && value === 0
						? 'Now'
						: `${value.toFixed(xValuePrecision)}${xValueSuffix}`,
				position: xScale(index)
			};
		});
	});

	/**
	 * Creates values for Y, taking into account any y culling settings
	 */
	const yTicks = $derived.by(() => {
		return Array.from({ length: yValueCulling }, (_, i) => {
			const value = computedYMin + (i / (yValueCulling - 1)) * (computedYMax - computedYMin);
			return {
				value,
				y: yScale(value)
			};
		});
	});

	/**
	 * Map legend data series labels and corresponding color in the palette
	 */
	const legend = $derived.by(() => {
		return data.map((series, index) => {
			return {
				label: series.label,
				color: palette[index % palette.length]
			};
		});
	});

	const legendWidth = $derived.by(() => {
		if (legend.length > 0) {
			// Determine how long each legend can be based on the number of data series and the chart width (minus padding on each side)
			return Math.min(
				100,
				(innerWidth - 2 * paddingSides.left + paddingSides.right) / legend.length
			);
		} else {
			return 0;
		}
	});

	/**
	 * Determine where to start placing the legend (far end of chart)
	 */
	const legendStartX = $derived.by(() => {
		if (legend.length > 0) {
			// Center the legend in the remaining space after taking into account the legend width and padding on each side
			return paddingSides.left + paddingSides.right + (innerWidth - legendWidth * legend.length);
		} else {
			return 0;
		}
	});

	let chartFilename = $derived.by(() => {
		const timeNow = Date.now();
		let fileNamePrefix = 'chart-export-';
		if (title?.length) {
			fileNamePrefix = title.toLowerCase().replace(/\s+/g, '-');
		}
		return `${fileNamePrefix}-${timeNow}.svg`;
	});

	const exportSvg = (svgElement: SVGSVGElement) => {
		const clone = svgElement.cloneNode(true) as SVGSVGElement;
		const serializer = new XMLSerializer();

		/**
		 * TODO: Consider adding a toggle whether or not to default coloring of exported
		 * chart to avoid removing custom user profiling / styles
		 */
		const darkColour = '#222';
		// Change all text to dark so the chart can be read properly
		clone.querySelectorAll('text').forEach((txt) => {
			// If the element already has a fill, overwrite it; otherwise just set it
			txt.setAttribute('fill', darkColour);
			txt.setAttribute('font-family', 'Open Sans');
			// Some charts use stroke for text – set that as well just in case
			txt.setAttribute('stroke', darkColour);
		});

		const svgString = serializer.serializeToString(clone);
		// Add XML declaration + optional DOCTYPE for better compatibility
		const svgBlob = new Blob(
			[
				'<?xml version="1.0" encoding="UTF-8"?>\n',
				'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"\n',
				'  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n',
				svgString
			],
			{ type: 'image/svg+xml;charset=utf-8' }
		);

		const url = URL.createObjectURL(svgBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = chartFilename;
		link.click();
		URL.revokeObjectURL(url);
	};
	const horizontalPadding = $derived.by(() => paddingSides.left + paddingSides.right);
	const verticalPadding = $derived.by(() => paddingSides.top + paddingSides.bottom);
</script>

<div bind:clientWidth={chartContainerWidth} class="barline-chart">
	<svg
		bind:this={svgChartElement}
		width={chartWidth}
		{height}
		viewBox={`0 0 ${chartWidth} ${height}`}
		xmlns="http://www.w3.org/2000/svg"
	>
		<!-- Title -->
		<text
			x={chartWidth / 2}
			y={paddingSides.top / 2}
			text-anchor="middle"
			font-size="14"
			class="barline-chart-title fw-bold"
			fill="#222">{title}</text
		>

		<!-- Only plot graph if there is at least 1 data series with 1 data point -->
		{#if isEnoughDataForPresentation}
			<!-- Axis labels and grid lines -->
			<!-- X-axis -->
			{#each xTicks as { value, position }, index (`x-axis-label-${index}`)}
				{#if showGraphGrid}
					<!-- LINES - Vertical -->
					<line
						x1={position}
						x2={position}
						y1={showVerticalGridLines ? verticalPadding : height - verticalPadding + 5}
						y2={height - paddingSides.bottom - chartSafetyMarginBottom}
						stroke="#e0e0e0"
						stroke-width="1"
					/>
				{/if}
				<!-- LABELS - X axis -->
				<text
					x={position}
					y={innerHeight + verticalPadding + 15}
					text-anchor="middle"
					font-size="12"
					transform={`rotate(0, ${position + 5}, ${height})`}
					fill="#222"
				>
					{value}
				</text>
			{/each}

			<!-- Y‑axis -->
			{#each yTicks as { value, y }, index (`y-axis-label-${index}`)}
				{#if showGraphGrid}
					<!-- LINES - Horizontal -->
					<line
						x1={showHorizontalGridLines ? chartSafetyMarginX / 2 + 20 : verticalPadding}
						x2={showHorizontalGridLines ? chartWidth + chartSafetyMarginX : horizontalPadding - 5}
						y1={y}
						y2={y}
						stroke="#ccc"
						stroke-width="1"
					/>
				{/if}
				<!-- LABELS - Y axis. NOTE: Add margin for last (top Y value) in case no top padding is in place -->
				<text
					x={chartSafetyMarginX - 10}
					y={index === yTicks.length - 1 ? y + 10 : y + 5}
					text-anchor="end"
					font-size="12"
					font-family="open sans"
					fill="#222"
				>
					{value.toFixed(1)}
					{yValueSuffix}
				</text>
			{/each}

			{#if type === 'line'}
				{#each graphLines as path, lineIndex (`line-${lineIndex}`)}
					<path
						d={path}
						fill="none"
						stroke={palette[lineIndex % palette.length]}
						stroke-width={lineWidth}
						stroke-linejoin="round"
					/>
				{/each}
			{:else if type === 'bar'}
				{#each graphBars as group, groupIndex (`bar-group-${groupIndex}`)}}
					{#each group as { x, y, w, h }, barIndex (`bar-group-${barIndex}-bar-${barIndex}`)}
						<rect {x} {y} width={w} height={h} fill={palette[barIndex % palette.length]} />
					{/each}
				{/each}
			{/if}
		{:else}
			<!-- Not enough data, show message -->
			Please provide at least 1 data series with at least 1 data point in them.
		{/if}

		<!-- Add data series legend (if enabled) -->
		{#if showLegend}
			<!-- Background area behind legend for better eligibility -->
			<rect
				width={legendWidth * legend.length}
				height="40"
				x={legendStartX - (paddingSides.left + paddingSides.right) / 2}
				y={paddingSides.top + 8}
				fill="#222"
				opacity="0.9"
			/>
			{#each legend as { label, color }, index (`data-series-legend-${index}`)}
				<g transform={`translate(${legendStartX + legendWidth * index}, ${paddingSides.top + 20})`}>
					<!-- Colored square matching the color of the corresponding data series -->
					<rect width="14" height="14" fill={color} />
					<!-- Name of the data series -->
					<text x="20" y="13" font-size="16" class="fw-bold" fill="#fff">
						{label}
					</text>
				</g>
			{/each}
		{/if}

		<!-- Vertical and horizontal line upon mouse hover -->
		{#if mouseHoverX > 0}
			<!-- Vertical hover line -->
			<line
				x1={mouseHoverX}
				x2={mouseHoverX}
				y1={verticalPadding}
				y2={height - verticalPadding}
				stroke="#2B9C6A"
				stroke-width="1"
				stroke-dasharray="4 4"
			/>
			<!-- Horizontal hover line -->
			<line
				x1={0}
				x2={chartContainerWidth}
				y1={tooltipY - 10}
				y2={tooltipY - 10}
				stroke="#2B9C6A"
				stroke-width="1"
				stroke-dasharray="4 4"
			/>
		{/if}

		<!-- Transparent overlay to capture mouse events -->
		<rect
			x={0}
			y={0}
			width={chartContainerWidth}
			{height}
			fill="transparent"
			role="presentation"
			onmousemove={onMouseMove}
			onmouseleave={onMouseLeave}
		/>
	</svg>
	<!-- Tooltip for the graph -->
	{#if isHoveringChart && dataHoverIndex >= 0}
		<div
			class="barline-tooltip"
			style="
      left: {tooltipX}px;
      top: {tooltipY}px;
      pointer-events: none;
    "
		>
			<h6 class="barline-tooltip-header">
				<!-- If custom X Values have been provided (and there's no x max), use the hover index and lookup the value in that array. Otherwise use the data series index -->
				{xValues?.length > 0 && xMax === undefined
					? xValues[dataHoverIndex].toFixed(xValuePrecision)
					: dataHoverIndex.toFixed(xValuePrecision)}
				{xValueSuffix}
			</h6>
			<div class="barline-tooltip-content">
				<dd>
					{#each data as dataSeries, seriesIndex (`data-series-tooltip-${seriesIndex}`)}
						<dl>
							<span style="color:{palette[seriesIndex % palette.length]}">&#9632; </span>
							<strong>
								{dataSeries.label}
								{dataSeries.values[dataHoverIndex].toFixed(yValuePrecision)}
								{yValueSuffix}
							</strong>
						</dl>
					{/each}
				</dd>
			</div>
		</div>
	{/if}
	<div class="d-flex justify-content-center">
		<button
			class="barline-export-chart-button"
			onclick={() => {
				exportSvg(svgChartElement);
			}}
		>
			Export graph
		</button>
	</div>
</div>

<style>
	.barline-chart {
		font-family: 'Open Sans', 'Lato', 'Helvetica', 'Ubuntu', sans-serif;
	}

	.barline-export-chart-button {
		background-color: #222;
		color: #fff;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
		cursor: pointer;
	}

	.barline-export-chart-button:hover {
		background-color: #3f3f3f;
		color: #ffac11;
		transition: all 0.25s ease-in-out;
	}

	.barline-tooltip {
		position: absolute;
		background-color: #fff;
		color: #222;
		text-wrap: nowrap;
		box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.4);
		border-radius: 4px;
		z-index: 500;
	}

	.barline-chart-title {
		font-weight: bold;
	}

	.barline-tooltip-header {
		/*bg-dark-blue-horizontal-gradient text-white p-2*/
		background-color: #222;
		color: #fff;
		font-size: 1.1rem;
		padding: 5px 10px;
		margin: 0;
		text-align: center;
	}

	.barline-tooltip-content {
		padding: 10px;
	}

	.barline-tooltip-content dd {
		margin: 0;
	}
</style>
