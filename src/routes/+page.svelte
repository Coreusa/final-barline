<script>
	import Barline from '$lib/Barline.svelte';

	const chartData = [
		{
			label: 'Depth',
			values: [0, -4, -10, -15, -25, -15, -60, -20, -10, 0]
		}
	];
</script>

<h1>Final Barline</h1>

<Barline
	data={chartData}
	type="line"
	height={400}
	width={600}
	responsive={false}
	title="Search for Atlantis dive"
	yValueSuffix="m"
	lineWidth={2}
	yMaxValuePadding={1}
	yValuePrecision={1}
	yValueCulling={10}
/>
