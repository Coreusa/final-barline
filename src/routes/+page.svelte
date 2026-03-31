<script lang="ts">
	import Barline from '$lib/Barline.svelte';
	import { onDestroy, onMount } from 'svelte';

	let timerId: ReturnType<typeof setInterval> | undefined = $state();
	const createRandomValues = (length: number = 10) => {
		return Array.from({ length: length }, () => Math.floor(Math.random() * 100));
	};
	let chartData = $state([
		{
			label: 'Depth',
			values: createRandomValues(5)
		},
		{
			label: 'Pressure',
			values: createRandomValues(10)
		},
		{
			label: 'Visibility',
			values: createRandomValues(10)
		}
	]);

	let rapidlyChangingData = $state([
		{
			label: 'Depth',
			values: createRandomValues(5)
		},
		{
			label: 'Pressure',
			values: createRandomValues(10)
		},
		{
			label: 'Visibility',
			values: createRandomValues(10)
		}
	]);

	onMount(() => {
		timerId = setInterval(() => {
			rapidlyChangingData.forEach((series) => {
				series.values = createRandomValues(10);
			});
		}, 200);
	});
	onDestroy(() => {
		clearInterval(timerId);
		timerId = undefined;
	});
</script>

<div class="page-example">
	<h1>Final Barline Examples</h1>

	<div class="container-top">
		<div>
			<h4>Lines</h4>
			<Barline
				data={chartData}
				type="line"
				height={400}
				title="Search for Atlantis"
				yValueSuffix="m"
				lineWidth={2}
				showLegend={true}
				yValuePrecision={1}
			/>
		</div>
		<div>
			<h4>Bars</h4>
			<Barline
				data={chartData}
				type="bar"
				height={400}
				title="Search for Atlantis"
				yValueSuffix="m"
				lineWidth={2}
				yValuePrecision={1}
				showLegend={true}
			/>
		</div>
	</div>

	<div class="container-bottom">
		<h4>Quickly Changing data</h4>
		<Barline
			data={rapidlyChangingData}
			type="line"
			height={400}
			title="Rapid data changes"
			yValueSuffix="m"
			lineWidth={2}
			yValuePrecision={1}
			showLegend={true}
		/>
	</div>
</div>

<style scoped>
	h4 {
		margin: 2px 0;
	}
	.page-example {
		padding: 10px;
		font-family: 'Open sans', 'Lato', 'Helvetica', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.container-top {
		display: flex;
		gap: 20px;
		width: 100%;
	}

	.container-top > div {
		flex: 1;
	}

	.container-bottom {
		margin-top: 40px;
	}
</style>
