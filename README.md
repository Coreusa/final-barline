# Final Barline

A high-performance SVG Chart library for Svelte 5. Supports bar and line type of graphs with option to export the graph and a wide support for customization. Responsive by default.

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
import Barline from '@coreusa/final-barline';
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
