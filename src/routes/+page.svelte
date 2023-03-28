<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import AlertConfirmPrompt from '$lib/svelte/AlertConfirmPrompt.svelte';
	import { createAlertConfirmPromptStore } from '../lib/index.js';

	const clog = createClog('page');
	const acp = createAlertConfirmPromptStore();

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	// $: clog($acp);
</script>

<svelte:head>
	<title>Alert / Confirm / Prompt test</title>
</svelte:head>

<div style="padding: 1rem;">
	<button on:click={() => acp.alert('foo')}>alert</button>
	<button
		on:click={() => {
			acp.alert(`This is alert. You will need to confirm shortly.`);
			acp.confirm(
				async () => {
					await sleep(3000);
					acp.close();
					acp.alert({ title: `Let's go!` });
				},
				{
					content: 'Hey ho? (async)',
				}
			);
		}}>alert and confirm</button
	>
	<button on:click={() => acp.confirm(acp.close)}>confirm</button>
	<button
		on:click={() =>
			acp.prompt(
				(value) => {
					acp.close();
					acp.alert({ title: value });
				},
				{ value: 'hey ho' }
			)}>prompt</button
	>
</div>

<AlertConfirmPrompt
	{acp}
	themeVars={{
		// box_filter: 'drop-shadow(2px 2px 1px rgb(0 0 0 / .3))',
		backdrop_bg: 'rgba(0, 0, 0, 0.5)',
		button_bg_ok: '#dc2626',
		button_bg_ok_hover: '#ef4444',
		button_color_ok: 'white',
		// focus_ring_color: '#ffc',
	}}
/>
