<!-- 
  Basic SVG Chart component that supports lines and bar type of charts.
  Charts can be customized through various properties like padding, line width and much more.
-->
<script lang="ts">
	import type { BarlinePropsInterface } from './types/BarlinePropsInterface.ts';
	import type { DataSeriesInterface } from './types/DataSeriesInterface.ts';

	interface TooltipState {
		pointerX: number;
		pointerY: number;
		xAxisValue: number;
		entries: Array<{
			seriesLabel: string;
			dataValue: number;
			color: string;
		}>;
	}

	const {
		data,
		type,
		title,
		width = 600,
		height = 400,
		xMin,
		xMax,
		yMin,
		yMax,
		yMaxValuePadding = 0,
		timeFormatting = false,
		showZeroLine = false,
		showTitle = true,
		showLegend = false,
		lineWidth = 2,
		palette = [
			'#3DB6E6',
			'#ED3780',
			'#6B2E80',
			'#dd604c',
			'#2a318b',
			'#990B75',
			'#f86e00',
			'#73EB91'
		],
		xValueSuffix = '',
		yValueSuffix = '',
		xValueCulling,
		yValueCulling,
		xValuePrecision = 2,
		yValuePrecision = 2,
		xValues,
		hoverLineColor = '#f86e00',
		paddingSides = {
			top: 20,
			bottom: 20,
			left: 45,
			right: 20
		},
		showHorizontalGridLines = true,
		showVerticalGridLines = false,
		responsive = true
	}: BarlinePropsInterface = $props();

	const clipPathId = `barline-${Math.random().toString(36).slice(2, 9)}`;

	let containerElement: HTMLDivElement | undefined = $state(undefined);
	let chartContainerWidth = $state(0);
	let measuredHeight = $derived(height);
	let svgChartElement: SVGSVGElement | undefined = $state(undefined);

	let chartWidth = $derived(responsive ? chartContainerWidth : width);
	let chartHeight = $derived(responsive ? measuredHeight : height);

	let padding = $derived(paddingSides);
	let titleHeight = $derived(title ? 30 : 0);
	let legendHeight = $derived(showLegend && data.length ? 28 : 0);

	let chartLeft = $derived(padding.left);
	let chartTop = $derived(padding.top + titleHeight);
	let chartInnerWidth = $derived(Math.max(1, chartWidth - padding.left - padding.right));
	let chartInnerHeight = $derived(
		Math.max(1, chartHeight - padding.top - padding.bottom - titleHeight - legendHeight)
	);

	// Data ranges
	let maxSeriesLength = $derived(
		data.length ? Math.max(...data.map((series) => series.values.length)) : 0
	);

	let xAxisValues = $derived(
		xValues?.length ? xValues : Array.from({ length: maxSeriesLength }, (_, index) => index)
	);

	let allYValues = $derived(data.flatMap((series) => series.values).filter(Number.isFinite));

	let yRangeMin = $derived(
		yMin !== undefined ? yMin : allYValues.length ? Math.min(...allYValues) : 0
	);

	let yRangeMax = $derived(
		(yMax !== undefined ? yMax : allYValues.length ? Math.max(...allYValues) : 1) + yMaxValuePadding
	);

	let xRangeMin = $derived(
		xMin !== undefined ? xMin : xAxisValues.length ? Math.min(...xAxisValues) : 0
	);
	let xRangeMax = $derived(
		xMax !== undefined
			? xMax
			: xAxisValues.length
				? Math.max(...xAxisValues)
				: Math.max(maxSeriesLength - 1, 1)
	);

	// Scale functions. Maps data values to SVG pixel coordinates
	function scaleX(dataX: number): number {
		const range = xRangeMax - xRangeMin;
		return chartLeft + (range === 0 ? 0.5 : (dataX - xRangeMin) / range) * chartInnerWidth;
	}

	function scaleY(dataY: number): number {
		const range = yRangeMax - yRangeMin;
		return (
			chartTop +
			chartInnerHeight -
			(range === 0 ? 0.5 : (dataY - yRangeMin) / range) * chartInnerHeight
		);
	}

	// Tick values
	let yTickCount = $derived(Math.max(1, yValueCulling ?? 5));
	let yTickValues = $derived(
		Array.from(
			{ length: yTickCount + 1 },
			(_, i) => yRangeMin + (yRangeMax - yRangeMin) * (i / yTickCount)
		)
	);

	let xTickValues = $derived.by<number[]>(() => {
		if (!xAxisValues.length) return [];
		const maxTicks = Math.max(1, xValueCulling ?? xAxisValues.length);
		if (xAxisValues.length <= maxTicks) return [...xAxisValues];
		return Array.from(
			{ length: maxTicks },
			(_, i) => xAxisValues[Math.round((i * (xAxisValues.length - 1)) / (maxTicks - 1))]
		);
	});

	let slotWidth = $derived(
		xAxisValues.length ? chartInnerWidth / xAxisValues.length : chartInnerWidth
	);

	let groupWidth = $derived(slotWidth * 0.8);
	let barWidth = $derived(data.length ? groupWidth / data.length : groupWidth);

	function barSlotCenterX(valueIndex: number): number {
		const slotPx = chartInnerWidth / Math.max(xAxisValues.length, 1);
		return chartLeft + slotPx * valueIndex + slotPx / 2;
	}

	function barLeftEdgeX(valueIndex: number, seriesIndex: number): number {
		return barSlotCenterX(valueIndex) - groupWidth / 2 + seriesIndex * barWidth;
	}

	function barTopEdgeY(value: number): number {
		return Math.min(scaleY(Math.max(yRangeMin, 0)), scaleY(value));
	}

	function barRectHeight(value: number): number {
		return Math.max(1, Math.abs(scaleY(Math.max(yRangeMin, 0)) - scaleY(value)));
	}

	// Position of x tick labels.
	const xTickPixelPosition = (tickValue: number): number => {
		if (type === 'bar') {
			const index = xAxisValues.indexOf(tickValue);
			return index >= 0 ? barSlotCenterX(index) : scaleX(tickValue);
		} else {
			return scaleX(tickValue);
		}
	};

	// Graph lines
	const graphLines = (series: DataSeriesInterface): string => {
		const points = series.values.map((value, index) => {
			const pixelX = scaleX(xAxisValues[index] ?? index).toFixed(1);
			const pixelY = scaleY(value).toFixed(1);
			return `${pixelX}, ${pixelY}`;
		});
		return points.length ? `M ${points.join(' L ')}` : '';
	};

	function formatValue(
		value: number,
		precision: number,
		suffix: string,
		timeFormatting: boolean = false
	): string {
		if (value === 0 && timeFormatting) {
			return 'Now';
		} else {
			return value.toFixed(precision) + suffix;
		}
	}

	function formatXValue(value: number): string {
		return formatValue(value, xValuePrecision, xValueSuffix, timeFormatting);
	}

	function formatYValue(value: number): string {
		return formatValue(value, yValuePrecision, yValueSuffix);
	}

	let tooltip = $state<TooltipState | null>(null);
	let hoveredValueIndex = $state<number | null>(null);

	function onMouseOverColumn(event: MouseEvent, valueIndex: number) {
		const svgElement = (event.currentTarget as SVGElement).ownerSVGElement;
		if (!svgElement) return;
		const svgBounds = svgElement.getBoundingClientRect();
		const startLeft = event.clientX - svgBounds.left;
		const pointerX = startLeft > chartWidth / 2 ? startLeft - 150 : startLeft + 20;
		hoveredValueIndex = valueIndex;
		tooltip = {
			pointerX: pointerX,
			pointerY: event.clientY - svgBounds.top + 10,
			xAxisValue: xAxisValues[valueIndex] ?? valueIndex,
			entries: data
				.map((series, seriesIndex) => ({
					seriesLabel: series.label,
					dataValue: series.values[valueIndex],
					color: palette[seriesIndex % palette.length]
				}))
				.filter((series) => series.dataValue !== undefined)
		};
	}

	function handleMouseLeave() {
		tooltip = null;
		hoveredValueIndex = null;
	}

	let zeroLine = $derived(yRangeMin <= 0 ? scaleY(0) : null);

	let legendItems = $derived(
		data.map((series, index) => ({
			label: series.label,
			color: palette[index % palette.length]
		}))
	);

	/**
	 * Barline hit zones
	 * One invisible full-height strip per x-index.
	 */
	let hitZones = $derived.by(() =>
		xAxisValues.map((_, index) => {
			const currentPixelX = type === 'bar' ? barSlotCenterX(index) : scaleX(xAxisValues[index]);
			const previousPixelX =
				index > 0
					? type === 'bar'
						? barSlotCenterX(index - 1)
						: scaleX(xAxisValues[index - 1])
					: null;
			const nextPixelX =
				index < xAxisValues.length - 1
					? type === 'bar'
						? barSlotCenterX(index + 1)
						: scaleX(xAxisValues[index + 1])
					: null;
			const leftEdge = previousPixelX !== null ? (previousPixelX + currentPixelX) / 2 : chartLeft;
			const rightEdge =
				nextPixelX !== null ? (currentPixelX + nextPixelX) / 2 : chartLeft + chartWidth;
			return {
				leftEdge,
				width: rightEdge - leftEdge,
				index
			};
		})
	);
</script>

<div
	bind:this={containerElement}
	bind:clientWidth={chartContainerWidth}
	class="chart-wrap"
	class:barline-w-100={responsive}
	class:barline-h-100={responsive}
	style:width={responsive ? '' : `${width}px`}
	style:height={responsive ? '' : `${height}px`}
>
	<svg
		bind:this={svgChartElement}
		width={chartWidth}
		height={chartHeight}
		id={clipPathId}
		viewBox="0 0 {chartWidth} {chartHeight}"
		xmlns="http://www.w3.org/2000/svg"
		class="barline-chart-svg"
		role="img"
		aria-label={title ?? 'Chart'}
	>
		<defs>
			<clipPath>
				<rect x={chartLeft} y={chartTop} width={chartInnerWidth} height={chartInnerHeight} />
			</clipPath>
		</defs>

		<!-- Chart title -->
		{#if showTitle}
			<text
				x={chartWidth / 2}
				y={padding.top + titleHeight / 2}
				text-anchor="middle"
				dominant-baseline="central"
				class="chart-title">{title}</text
			>
		{/if}

		<!-- Y Axis -->
		{#each yTickValues as tickValue, index (`y-value-${index}`)}
			{@const pixelY = scaleY(tickValue)}
			{#if showHorizontalGridLines}
				<line
					x1={chartLeft}
					y1={pixelY}
					x2={chartLeft + chartInnerWidth}
					y2={pixelY}
					class="barline-grid-line"
				/>
			{/if}
			<line x1={chartLeft - 4} y1={pixelY} x2={chartLeft} y2={pixelY} class="tick-line" />
			<text
				x={chartLeft - 8}
				y={pixelY}
				text-anchor="end"
				dominant-baseline="central"
				class="axis-label"
			>
				{formatYValue(tickValue)}
			</text>
		{/each}

		<!-- X Axis -->
		{#each xTickValues as tickValue, index (`x-value-${index}`)}
			{@const pixelX = xTickPixelPosition(tickValue)}
			{#if showVerticalGridLines}
				<line
					x1={pixelX}
					y1={chartTop}
					x2={pixelX}
					y2={chartTop + chartInnerHeight}
					class="barline-grid-line"
				/>
			{/if}
			<line
				x1={pixelX}
				y1={chartTop + chartInnerHeight}
				x2={pixelX}
				y2={chartTop + chartInnerHeight + 5}
				class="tick-line"
			/>
			<text x={pixelX} y={chartTop + chartInnerHeight + 18} text-anchor="middle" class="axis-label">
				{formatXValue(tickValue)}
			</text>
		{/each}

		<line
			x1={chartLeft}
			y1={chartTop}
			x2={chartLeft}
			y2={chartTop + chartInnerHeight}
			class="axis-line"
		/>
		<line
			x1={chartLeft}
			y1={chartTop + chartInnerHeight}
			x2={chartLeft + chartInnerWidth}
			y2={chartTop + chartInnerHeight}
			class="axis-line"
		/>

		{#if showZeroLine && zeroLine !== null}
			<line
				x1={chartLeft}
				y1={zeroLine}
				x2={chartLeft + chartInnerWidth}
				y2={zeroLine}
				class="barline-zero-line"
			/>
		{/if}
		<g>
			{#if type === 'line'}
				{#each data as series, seriesIndex (`data-series-${seriesIndex}`)}}
					{@const seriesColor = palette[seriesIndex % palette.length]}
					<!-- Connecting line -->
					<path
						d={graphLines(series)}
						fill="none"
						stroke={seriesColor}
						stroke-width={lineWidth}
						stroke-linejoin="round"
						stroke-linecap="round"
					/>
					<!-- Hover points for each data series value -->
					{#each series.values as _, valueIndex (`data-series-${valueIndex}`)}
						{@const isHovered = hoveredValueIndex === valueIndex}
						<circle
							cx={scaleX(xAxisValues[valueIndex] ?? valueIndex)}
							cy={scaleY(series.values[valueIndex])}
							r={isHovered ? 8 : 2}
							fill={seriesColor}
							stroke="white"
							stroke-width={isHovered ? 2 : 0}
							class="barline-data-point"
							class:barline-data-point-hovered={isHovered}
						/>
					{/each}
				{/each}
			{:else}
				{#each data as series, seriesIndex (`data-series-${seriesIndex}`)}
					{@const seriesColor = palette[seriesIndex % palette.length]}
					{#each series.values as value, valueIndex (`data-series-${valueIndex}`)}
						<rect
							x={barLeftEdgeX(valueIndex, seriesIndex)}
							y={barTopEdgeY(value)}
							width={barWidth}
							height={barRectHeight(value)}
							fill={seriesColor}
							rx={2}
							class="bar-rect"
							role="button"
							tabindex={seriesIndex}
							onmouseleave={handleMouseLeave}
						/>
					{/each}
				{/each}
			{/if}
			<!-- Chart tooltip on hover -->
			{#if tooltip}
				<!-- Vertical hover line -->
				<line
					x1={scaleX(tooltip.xAxisValue)}
					y1={chartTop}
					x2={scaleX(tooltip.xAxisValue)}
					y2={chartTop + chartInnerHeight}
					stroke={hoverLineColor}
					stroke-width={1}
					stroke-dasharray="4 4"
				/>
			{/if}
			<!-- ── Hit zones: one invisible full-height strip per x-index ──────── -->
			{#each hitZones as hitZone, hitZoneIndex (`barline-hit-zone-${hitZoneIndex}`)}
				<rect
					x={hitZone.leftEdge}
					y={chartTop}
					width={hitZone.width}
					height={chartHeight}
					role="button"
					tabindex="-1"
					fill="transparent"
					class="hit-zone"
					onmousemove={(e) => onMouseOverColumn(e, hitZoneIndex)}
					onmouseleave={handleMouseLeave}
				/>
			{/each}
		</g>

		<!-- Display legend -->
		{#if showLegend && legendItems.length}
			{@const legendBaseY = chartHeight - padding.bottom + 10}
			{@const legendItemWidth = 100}
			{@const itemsPerRow = Math.max(1, Math.floor(chartInnerWidth / legendItemWidth))}
			{@const rowCount = Math.ceil(legendItems.length / itemsPerRow)}
			{#each legendItems as item, itemIndex (`legend-item-${itemIndex}`)}
				{@const columnIndex = itemIndex % itemsPerRow}
				{@const rowIndex = Math.floor(itemIndex / itemsPerRow)}
				{@const rowItemCount =
					rowIndex < rowCount - 1 ? itemsPerRow : legendItems.length - rowIndex * itemsPerRow}
				{@const legendItemX =
					chartLeft +
					(chartInnerWidth - rowItemCount * legendItemWidth) / 2 +
					columnIndex * legendItemWidth}
				{@const legendItemY = legendBaseY + rowIndex * 20}
				<rect x={legendItemX} y={legendItemY - 6} width={15} height={15} rx={2} fill={item.color} />
				<text x={legendItemX + 20} y={legendItemY + 5} class="legend-label">
					{item.label}
				</text>
			{/each}
		{/if}
	</svg>
	{#if tooltip}
		<div
			class="barline-tooltip"
			style="
      left: {tooltip?.pointerX}px;
      top: {tooltip?.pointerY}px;
      pointer-events: none;
    "
		>
			<h6 class="barline-tooltip-header">{formatXValue(tooltip?.xAxisValue)}</h6>
			<div class="barline-tooltip-content">
				<dd class="barline-tooltip-data-series-list">
					{#each tooltip.entries as dataSeries, seriesIndex (`data-series-tooltip-${seriesIndex}`)}
						<dl>
							<span style="color:{dataSeries.color}">&#9632; </span>
							<strong>
								{dataSeries.seriesLabel}:
								{formatYValue(dataSeries.dataValue)}
							</strong>
						</dl>
					{/each}
				</dd>
			</div>
		</div>
	{/if}
</div>

<!-- ─── Styles ───────────────────────────────────────────────────────────── -->

<style scoped>
	.chart-wrap {
		display: block;
		box-sizing: border-box;
		position: relative;
	}

	.barline-w-100 {
		width: 100%;
	}

	.barline-h-100 {
		height: 100%;
	}

	.chart-title {
		font-size: 15px;
		font-weight: 600;
	}

	.axis-label {
		font-size: 12px;
		fill: #222;
	}

	.legend-label {
		font-size: 12px;
	}

	.axis-line {
		stroke: #ccc;
		stroke-width: 1.5;
		fill: none;
	}

	.tick-line {
		stroke: #ccc;
		stroke-width: 1;
		fill: none;
	}

	.barline-grid-line {
		stroke: #ccc;
		stroke-width: 1;
		stroke-dasharray: 4 4;
		fill: none;
	}

	.barline-zero-line {
		stroke: yellow;
		stroke-width: 1;
		stroke-dasharray: 2 2;
	}

	.barline-data-point {
		pointer-events: none;
	}

	.bar-rect {
		opacity: 0.95;
		pointer-events: none;
	}

	.hit-zone {
		outline: none;
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

	.barline-tooltip-header {
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

	.barline-tooltip-data-series-list,
	.barline-tooltip-data-series-list dl {
		margin: 0;
		padding: 0;
	}

	.barline-data-point {
		pointer-events: none;
		transition:
			r 0.1s ease,
			stroke-width 0.5s ease;
	}
	.barline-data-point-hovered {
		box-shadow: 10px 10px 5px rgba(255, 255, 255, 0.8);
	}
</style>
