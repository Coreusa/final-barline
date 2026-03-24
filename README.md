# Final Barline

<img width="764" height="209" alt="image" src="https://github.com/user-attachments/assets/d2e7626f-95d9-4579-89eb-e8747d8008ab" />

A high-performance SVG Chart library for Svelte 5. Supports bar and line type of graphs with option to export the graph and a wide support for customization. Responsive by default.

**NOTE**: Final Barline is in early development 🛠️. Please file [issues](https://github.com/Coreusa/final-barline/issues) and we'll get to them as soon as we can. 

<img width="630" height="496" alt="image" src="https://github.com/user-attachments/assets/ffe674c0-9fbc-4799-87ec-9bf275faa361" />

<img width="630" height="496" alt="image" src="https://github.com/user-attachments/assets/2d67a102-5b6b-42f7-a49d-f5fcac708da7" />

## Get started

```sh
# install Final Barline
#pnpm
pnpm add @coreusa/final-barline

# or npm
npm install @coreusa/final-barline

# or yarn
yarn add @coreusa/final-barline
```

## General use

```sh
# import the component
import { Barline } from '@coreusa/final-barline';
```

```sh
# Configure and setup the component

<Barline
	data={data}
	type="line"
	height={400}
	width={600}
	title="Chart title"
	lineWidth={2}
	yMaxValuePadding={1}
/>
```

## Data series

Data is expected as an array of data series objects. Please note that each data series must have the same length, as different lengths is not currently supported.

```sh
# Data structure
data = [
 {
   label: 'Some interesting data',
   values: [0, 1, 2, 3, 4, 5]
 },
 {
   label: 'Even more interesting data',
   values: [15, 22, 14, 30, 20, 18]
 },
...and so on...
]
```

## Custom X values
By default x values are set to the index of the dataseries, meaning the X-axis will go from 0 -> N where N is the data series length. You can provide custom X values if the standard x values aren't desired:

```sh
# Setup custom X Values
let customXValues = ['A', 'B', 'C', 'D', 'E', 'F']

<Barline
	data={data}
	xValues={customXValues}
	type="line"
	height={400}
	width={600}
	title="Chart title"
	lineWidth={2}
	yMaxValuePadding={1}
/>
```

## Options
Final Barline has a wide array of customization options to alter the chart to your liking.

- `responsive` - Turn responsiveness of the chart on or off. Default: `TRUE`
- `title` - Title of the chart. Placed top center if provided. Default: NONE
- `width` - Provide a custom width for the chart. Note that this requires `responsive` to be `FALSE`
- `height` - Provide a custom height for the chart. Default: `220`
- `xValueSuffix` - Text placed after each X tick label (also shown in tooltip when hovering the graph)
- `yValueSuffix` - Text placed after each Y tick label (also shown in tooltip header when hovering the graph)
- `lineWidth` - Width of each data serie's graph line. Only applicable when `type = line` (line graph)
- `paddingSides` - Provide your own padding to each side of the chart. Options are:
- `paddingSides.left` - Padding to the left of the chart
- `paddingSides.right` - Padding to the right of the chart
- `paddingSides.top` - Padding to the top of the chart
- `paddingSides.bottom` - Padding to the bottom of the chart
- `xValueCulling` - By default all x values are shown. Sometimes when there are alot of data points, the graph will get unreadable. Use xValueCulling to limit how many x values are shown
- `yValueCulling` - Same as `xValueCulling`, but for the y values
- `xMin, xMax, yMin, yMax` - By default Final Barline calculates the min/max for x and y. If you'd instead like to set these values yourself, use these
- `showLegend` - Turn on/off the data series legend. Default: `TRUE`
- `xValuePrecision, yValuePrecision` - Number precision formatting to apply to the x and y values
- `showHorizontalGridLines` - Whether or not to display horizontal (Y axis and to the right) gridlines. Default: `TRUE`
- `showVerticalGridLines` - Whether or not to display vertical gridlines (X axis and down). Default: `TRUE`
- `yMaxValuePadding` - Apply padding to the max value of Y. Useful if some additional space is needed at the top. Not to be confused with `paddingSides.top` which alters where the chart starts. Default: `0`

_Header image credit: Square Enix_
