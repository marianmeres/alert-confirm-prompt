<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import { Type } from '$lib/stores/alert-confirm-prompt';

	// instance created by createAlertConfirmPromptStore()
	export let acp;

	//
	export let theme = 'default';
	export let themeVars = {};
	export let style = '';
	export let cssClasses = '';

	$: dialog = $acp[0];

	let _dialogEl;
	let _buttonOkEl;
	let _buttonCancelEl;
	let _inputEl;
	let focusable;

	let value = null;
	let isPending = false;

	$: if (dialog?.type === Type.PROMPT) {
		if (value === null) value = dialog.value;
	} else {
		value = null;
	}

	// point here is, that we're manipulating the store stack only, not the dom el directly...
	// in other words the open/close works just by watching the stack
	$: if (dialog && _dialogEl) !_dialogEl.hasAttribute('open') && _dialogEl.showModal();
	$: if (!dialog && _dialogEl) _dialogEl.close('cleanup');

	//
	afterUpdate(() => {
		focusable = [_inputEl, _buttonCancelEl, _buttonOkEl].filter(Boolean);
		!_inputEl && _buttonOkEl && _buttonOkEl.focus();
	});

	const onKeyDown = (e) => {
		if (!dialog) return;

		e.stopPropagation();
		if (e.key === 'Escape' && !isPending) {
			return acp.escape();
		}

		if (e.key === 'Tab') {
			e.preventDefault();
			const focused = document.activeElement;
			const idx = focusable.indexOf(focused);
			const next = focusable[idx + 1] || focusable[0];
			return next.focus();
		}
	};

	onMount(() => {
		_dialogEl.addEventListener('close', async () => {
			// not relevant anymore i think (after stopping using the form.submit approach)
			if (_dialogEl.returnValue === '') {
				acp.escape();
			}
		});
		// prevent built in escape
		_dialogEl.addEventListener('cancel', (event) => event.preventDefault());

		//
		document.addEventListener('keydown', onKeyDown, true);
		return () => document.removeEventListener('keydown', onKeyDown, true);
	});

	const select = (el) => el.select();

	$: cssVars = Object.entries(themeVars || {})
		.reduce((m, [k, v]) => {
			m.push(`--${k}:${v}`);
			return m;
		}, [])
		.join(';');

	// https://github.com/marianmeres/icons-fns
	// prettier-ignore
	export const iconHeroOutlineArrowPath = (cls = null, size = null, style = null) => `<svg style="${style || ''}" class="${cls || ''}" width="${size || 24}" height="${size || 24}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>`;
</script>

<dialog
	bind:this={_dialogEl}
	class="theme-{theme} {cssClasses}"
	data-type={dialog?.type}
	style="{cssVars} {style}"
	class:is-pending={isPending}
>
	{#if dialog}
		<!--since we're not using the native form submit, the <form> is not necessary-->
		<form method="dialog" class:is-pending={isPending}>
			<div class="title"><strong>{@html dialog.title}</strong></div>
			{#if dialog.content}
				<div class="content">
					{#if dialog.content?.component}
						<svelte:component
							this={dialog.content.component}
							{...dialog.content?.props || {}}
							{dialog}
							{acp}
						/>
					{:else}
						{@html dialog.content}
					{/if}
				</div>
			{/if}
			{#if dialog.type === Type.PROMPT}
				<div class="inputbox">
					<input type="text" use:select bind:value bind:this={_inputEl} />
				</div>
			{/if}
			<menu>
				{#if dialog.type !== Type.ALERT}
					<li>
						<button
							on:click|preventDefault={async () => {
								isPending = true;
								await Promise.resolve(dialog.onCancel(false));
								isPending = false;
								value = null;
							}}
							type="reset"
							data-type="cancel"
							bind:this={_buttonCancelEl}
							disabled={isPending}
						>
							{@html dialog.labelCancel}
						</button>
					</li>
				{/if}
				<li>
					<button
						type="submit"
						value="OK"
						data-type="ok"
						bind:this={_buttonOkEl}
						on:click|preventDefault={async () => {
							isPending = true;
							await Promise.resolve(
								dialog.onOk(dialog.type === Type.PROMPT ? value : true)
							);
							isPending = false;
							value = null;
						}}
						disabled={isPending}
					>
						{@html dialog.labelOk}
					</button>
				</li>
			</menu>
			{#if isPending}
				<div class="spinner">
					<div class="icon rotating-cw">{@html iconHeroOutlineArrowPath(null, 32)}</div>
				</div>
			{/if}
		</form>
	{/if}
</dialog>

<style lang="scss">
	dialog.theme-default {
		--box_width: 400px;
		--box_min_width: none;
		--box_max_width: none;
		--box_filter: none; // drop-shadow(2px 2px 1px rgb(0 0 0 / .3));
		--box_bg: white;
		--box_color: black;

		--box_border_radius: 3px;
		--box_border_style: solid;
		--box_border_color: rgba(0, 0, 0, 0.3);
		--box_border_width: 0;

		--title_font_size: 1.1rem;
		--content_font_size: 1rem;

		--input_border: 1px solid rgba(0, 0, 0, 0.1);
		--input_bg: white;
		--input_color: black;
		--input_bg_hover: white;
		--input_border_radius: 3px;
		--input_padding: 0.15rem 0.5rem;

		--focus_ring_color: rgba(0, 0, 0, 0.2);
		--focus_ring_offset_width: 0px;

		--buttons_space_between_x: 0.5rem;
		--buttons_space_between_y: 0;
		--buttons_justify: flex-end;
		--buttons_display: flex;
		--buttons_flex_direction: row;

		--button_border_radius: 3px;
		--button_border_style: solid;
		--button_border_color: rgba(0, 0, 0, 0.3);
		--button_border_width: 0px;
		//--button_border: 1px solid transparent;
		//--button_border_radius: 3px;
		--button_font_size: 1rem;
		--button_padding: 0.25rem 1rem;

		--button_bg: rgba(0, 0, 0, 0.1);
		--button_bg_hover: rgba(0, 0, 0, 0.15);
		--button_color: var(--box_color);
		--button_color_hover: var(--box_color);

		// cancel
		--button_bg_cancel: var(--button_bg);
		--button_bg_cancel_hover: var(--button_bg_hover);
		--button_color_cancel: var(--button_color);
		--button_color_cancel_hover: var(--button_color_hover);

		// ok
		--button_bg_ok: #444444;
		--button_bg_ok_hover: black;
		--button_color_ok: white;
		--button_color_ok_hover: white;

		//
		--spinner_bg: rgba(0, 0, 0, 0.3);
		--spinner_color: white;

		width: var(--box_width);
		max-width: var(--box_max_width);
		min-width: var(--box_min_width);
		background: var(--box_bg);
		border-style: var(--box_border_style);
		border-color: var(--box_border_color);
		border-width: var(--box_border_width);
		border-radius: var(--box_border_radius);
		filter: var(--box_filter);
		color: var(--box_color);
		position: relative;

		form {
			inset: 0;
			padding: 0;
		}

		.spinner {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			background: var(--spinner_bg);
			color: var(--spinner_color);
		}

		.title {
			margin: 0 0 1rem 0;
			padding: 0;
			font-size: var(--title_font_size);
			display: block;
			text-align: center;
		}

		.content {
			margin: 0 0 1rem 0;
			font-size: var(--content_font_size);
			text-align: center;
			line-height: inherit;
			max-height: 40vh;
			overflow-y: auto;
		}

		.inputbox {
			margin: 0 0 1rem 0;
			input {
				display: block;
				width: 100%;
				border: var(--input_border);
				background: var(--input_bg);
				color: var(--input_color);
				border-radius: var(--input_border_radius);
				padding: var(--input_padding);
				&:hover,
				&:focus {
					background: var(--input_bg_hover);
					outline: none;
				}
				&:focus {
					box-shadow: 0 0 0 var(--focus_ring_offset_width) var(--focus_ring_color);
				}
			}
		}

		menu {
			margin: 1.5rem 0 0 0;
			padding: 0;
			display: var(--buttons_display);
			flex-direction: var(--buttons_flex_direction);
			justify-items: center;
			justify-content: var(--buttons_justify);

			li {
				list-style: none;
				display: block;
				&:nth-of-type(2) {
					margin-top: var(--buttons_space_between_y);
					margin-left: var(--buttons_space_between_x);
				}
			}

			button {
				display: block;
				width: 100%;
				margin: 0;
				line-height: inherit;
				border-radius: var(--button_border_radius);
				border-style: var(--button_border_style);
				border-color: var(--button_border_color);
				border-width: var(--button_border_width);

				background: var(--button_bg);
				color: var(--button_color);
				padding: var(--button_padding);
				font-size: var(--button_font_size);
				&:hover,
				&:focus {
					background: var(--button_bg_hover);
					outline: none;
				}
				&:focus {
					box-shadow: 0 0 0 var(--focus_ring_offset_width) var(--focus_ring_color);
				}

				&[disabled] {
					cursor: not-allowed;
				}

				&[data-type='ok'] {
					background: var(--button_bg_ok);
					color: var(--button_color_ok);
					&:hover,
					&:focus {
						background: var(--button_bg_ok_hover);
						color: var(--button_color_ok_hover);
					}
				}
				&[data-type='cancel'] {
					background: var(--button_bg_cancel);
					color: var(--button_color_cancel);
					&:hover,
					&:focus {
						background: var(--button_bg_cancel_hover);
						color: var(--button_color_cancel_hover);
					}
				}
			}
		}
	}

	// prettier-ignore
	@keyframes -global-rotating-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
	.rotating-cw {
		animation: rotating-cw 0.75s linear infinite;
	}
</style>
