import type { DataSeriesInterface } from './DataSeriesInterface.ts';

export interface BarlinePropsInterface {
	data: DataSeriesInterface[];
	type: 'line' | 'bar';
	title?: string;
	width?: number;
	height?: number;
	xMin?: number;
	xMax?: number;
	yMin?: number;
	yMax?: number;
	yMaxValuePadding?: number;
	timeFormatting?: boolean;
	showZeroLine?: boolean;
	showTitle?: boolean;
	showLegend?: boolean;
	lineWidth?: number;
	palette?: string[];
	xValueSuffix?: string;
	yValueSuffix?: string;
	xValueCulling?: number;
	yValueCulling?: number;
	xValuePrecision?: number;
	yValuePrecision?: number;
	xValues?: number[];
	hoverLineColor?: string;
	paddingSides?: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
	showHorizontalGridLines?: boolean;
	showVerticalGridLines?: boolean;
	responsive?: boolean;
}
