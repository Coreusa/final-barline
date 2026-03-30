<script lang="ts">
	import Barline from '$lib/Barline.svelte';

	const createRandomValues = (length: number = 10) => {
		return Array.from({ length: length }, () => Math.floor(Math.random() * 100));
	};
	const chartData = [
		{
			label: 'Depth',
			values: createRandomValues(5)
		},
		{
			label: 'Pressure',
			values: createRandomValues(10)
		}
	];
</script>

<div class="page-example">
	<h1>Final Barline Example</h1>

	<h4>Lines</h4>
	<Barline
		data={chartData}
		type="line"
		height={400}
		title="Search for Atlantis dive"
		yValueSuffix="m"
		lineWidth={2}
		yValuePrecision={1}
	/>

	<h4>Bars</h4>
	<Barline
		data={chartData}
		type="bar"
		height={400}
		title="Search for Atlantis dive"
		yValueSuffix="m"
		lineWidth={2}
		yValuePrecision={1}
	/>
</div>

<style scoped>
	.page-example {
		padding: 10px;
		font-family: 'Open sans', 'Lato', 'Helvetica', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}
</style>
