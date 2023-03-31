<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import AlertConfirmPrompt from '$lib/svelte/AlertConfirmPrompt.svelte';
	import { createAlertConfirmPromptStore } from '../lib/index.js';

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
			box_border_radius: '0',
			box_border: '3px solid black',
			input_border_radius: '0',
			button_border_radius: '0',
			button_border: '2px solid black',
			box_bg: 'paleturquoise',
			button_bg_ok: 'black',
			button_bg_ok_hover: 'black',
			button_color_ok: 'white',
			button_color_ok_hover: 'silver',
			focus_ring_offset_width: '0',
			input_border: '2px solid black',

			buttons_space_between_x: '0',
			buttons_space_between_y: '.5rem',
			buttons_justify: 'center',
			buttons_display: 'flex',
			buttons_flex_direction: 'column',

			spinner_bg: '#4b008266',
			spinner_color: 'yellow',
		},
	};

	let theme = 'default';

	$: clog(theme, themes[theme]);
</script>

<svelte:head>
	<title>Alert / Confirm / Prompt test</title>
</svelte:head>

<div style="padding: 1rem;">
	<h1 style="font-size: 1rem;">
		<a href="https://github.com/marianmeres/alert-confirm-prompt"
			>@marianmeres/alert-confirm-prompt</a
		> example <small style="opacity: .33">(v{data.VERSION})</small>
	</h1>
	<hr />
	<button on:click={() => acp.alert('Alert has only one OK button!')}>alert</button>
	<button
		on:click={() => {
			acp.alert({
				title: 'This is another alert.',
				content: `And there is a confirm waiting for you.`,
			});
			acp.confirm(
				async () => {
					await sleep(3000);
					acp.close();
					acp.alert({ title: `Wake up!` });
				},
				{
					title: 'Are you sure?',
					content: 'This will sleep for 3 seconds.',
					labelOk: 'Yawn',
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
</div>

<AlertConfirmPrompt {acp} themeVars={themes[theme]} />

<style lang="scss">
	:global(dialog::backdrop) {
		// background: rgba(0, 0, 0, 0.5);
	}
</style>
