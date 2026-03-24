<script>
	import Barline from '$lib/Barline.svelte';

	const chartData = [
		{
			label: 'Depth',
			values: [0, 4, 10, 15, 1, 4]
		}
	];
</script>

<h1>Final Barline</h1>

<Barline
	data={chartData}
	type="line"
	height={400}
	title="Search for Atlantis dive"
	yValueSuffix="m"
	lineWidth={2}
	yValuePrecision={1}
/>
