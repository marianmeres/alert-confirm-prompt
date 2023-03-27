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
	<button on:click={() => acp.alert({ title: 'foo' })}>alert</button>
	<button
		on:click={() => {
			acp.alert({ title: `This is alert. You will need to confirm shortly.` });
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

<AlertConfirmPrompt {acp} />
