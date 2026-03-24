# Final Barline

<img width="764" height="209" alt="image" src="https://github.com/user-attachments/assets/d2e7626f-95d9-4579-89eb-e8747d8008ab" />

A high-performance SVG Chart library for Svelte 5. Supports bar and line type of graphs with option to export the graph and a wide support for customization. Responsive by default.

**NOTE**: Final Barline is in early development. Please file [issues](https://github.com/Coreusa/final-barline/issues) and we'll get to them as soon as we can. 

<img width="630" height="496" alt="image" src="https://github.com/user-attachments/assets/ffe674c0-9fbc-4799-87ec-9bf275faa361" />

<img width="630" height="496" alt="image" src="https://github.com/user-attachments/assets/2d67a102-5b6b-42f7-a49d-f5fcac708da7" />

## General use

```sh
# install Final Barline
#pnpm
pnpm add @coreusa/final-barline

# or npm
npm install @coreusa/final-barline

# or yarn
yarn add @coreusa/final-barline
```

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
Data is expected as an array of data series. Please note that data series of different lengths is not currently supported.

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


_Image credit: Square Enix_
