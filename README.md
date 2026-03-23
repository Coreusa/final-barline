# Final Barline

A high-performance SVG Chart library for Svelte 5. Supports bar and line type of graphs.

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