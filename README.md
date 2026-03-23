# Final Barline

A high-performance SVG Chart library for Svelte 5. Supports bar and line type of graphs.

## General use

```sh
# install Final Barline
pnpm / npm install final-barline
```

```sh
# import the component
import Barline from '@coreusa/barline';
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