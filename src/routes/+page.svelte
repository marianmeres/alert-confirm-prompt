<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import AlertConfirmPrompt from '$lib/svelte/AlertConfirmPrompt.svelte';
	import { createAlertConfirmPromptStore } from '../lib/index.js';
	import { onMount } from 'svelte';
	import {
		createWindowAlertLike,
		createWindowConfirmLike,
		createWindowPromptLike,
	} from '../lib/stores/alert-confirm-prompt.js';

	export let data;

	const clog = createClog('page');
	const acp = createAlertConfirmPromptStore();

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	// $: clog($acp);

	const themes = {
		default: {},
		theme1: {
			button_bg_ok: '#dc2626',
			button_bg_ok_hover: '#ef4444',
			button_color_ok: 'white',
			button_color_ok_hover: '#ffc',
			buttons_justify: 'center',
			box_filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
		},
		theme2: {
			box_width: '250px',
			box_bg: '#d9f99d',
			box_border_radius: '0',
			box_border_width: '0 5px 5px 0',
			button_border_radius: '0',

			button_border_color: '#65a30d',
			button_border_width: '0 2px 2px 0',
			button_bg_ok: 'black',
			button_bg_ok_hover: 'black',
			button_color_ok: 'white',
			button_color_ok_hover: 'silver',

			focus_ring_offset_width: '0',
			input_border_radius: '0',
			input_border: '2px solid black',

			buttons_space_between_x: '0',
			buttons_space_between_y: '.5rem',
			buttons_justify: 'center',
			buttons_display: 'flex',
			buttons_flex_direction: 'column',

			spinner_bg: '#ef444499',
			spinner_color: '#fed7aa',
		},
	};

	let theme = 'default';

	$: clog(theme, themes[theme]);

	onMount(() => {
		window.alert = createWindowAlertLike(acp);
		window.confirm = createWindowConfirmLike(acp);
		window.prompt = createWindowPromptLike(acp);
	});
</script>

<svelte:head>
	<title>Alert / Confirm / Prompt test</title>
</svelte:head>

<div style="padding: 1rem;">
	<h1 style="font-size: 1rem;">
		<a href="https://github.com/marianmeres/alert-confirm-prompt"
			>@marianmeres/alert-confirm-prompt</a
		>
		example <small style="opacity: .33">(v{data.VERSION})</small>
	</h1>
	<hr />
	<button on:click={() => {
		acp.alert('This is basic alert');
	}}>alert</button>
	<button
		on:click={() => {
			acp.alert({
				title: 'This is another alert.',
				content: `And there is a confirm waiting for you already.`,
			});
			acp.confirm(
				async () => {
					await sleep(3000);
					acp.close();
					acp.alert({ title: `Good morning!` });
				},
				{
					title: 'Are you sure?',
					content: 'This will sleep for 3 seconds.',
					labelOk: 'Yawn',
				}
			);
		}}>alert and confirm</button
	>
	<button on:click={() => acp.confirm(() => {
		acp.close();
		acp.alert('You clicked OK');
	}, {
		onCancel: () => {
			acp.close();
			acp.alert('You clicked Cancel');
		},
		onEscape: () => {
			// acp.close in NOT expected here (as opposed to `onOk` and `onCancel`)
			acp.alert('You hit Escape');
		}
	})}>confirm</button>
	<button
		on:click={() =>
			acp.prompt(
				(value) => {
					acp.close();
					acp.alert({ title: 'You said: ' + value });
				},
				{ value: 'hey ho' }
			)}>prompt</button
	>
	<hr />
	Theming example:
	<select bind:value={theme}>
		<option>default</option>
		<option>theme1</option>
		<option>theme2</option>
	</select>
	<small style="opacity: .5">(see console for details)</small>
	<hr />
	Dialog backdrop needs to be styled globally, for example:
	<pre style="font-size: .8rem; padding: 1rem;">dialog::backdrop {`{
    background: rgba(0, 0, 0, 0.5);
}`}</pre>
	<hr />
	Patched:
	<button
		on:click={async () => {
			clog('alert', await alert('This one was called as window.alert'));
		}}><code>window.alert</code></button
	>
	<button
		on:click={async () => {
			clog('confirm', await confirm('This one was called as window.confirm'));
		}}><code>window.confirm</code></button
	>
	<button
		on:click={async () => {
			clog(
				'prompt',
				await prompt('This one was called as window.prompt', 'Use at your own risk')
			);
		}}><code>window.prompt</code></button
	>
</div>

<AlertConfirmPrompt {acp} themeVars={themes[theme]} />

<style lang="scss">
	// keeping the default here, but it can be styled if needed
	//:global(dialog::backdrop) {
	//	background: rgba(0, 0, 0, 0.5);
	//}
</style>
