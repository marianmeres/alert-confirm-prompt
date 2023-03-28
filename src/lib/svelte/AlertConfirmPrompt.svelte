<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import { createClog } from '@marianmeres/clog';
	import { Type } from '$lib/stores/alert-confirm-prompt';
	import Spinner from '$lib/svelte/Spinner.svelte';

	const clog = createClog('AlertConfirmPrompt');

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

	$: if (dialog && _dialogEl) {
		!_dialogEl.hasAttribute('open') && _dialogEl.showModal();
	}

	// make sure to close if no dialog in stack
	$: if (!dialog && _dialogEl) {
		_dialogEl.close('cleanup');
	}

	afterUpdate(() => {
		focusable = [_buttonOkEl, _buttonCancelEl, _inputEl].filter(Boolean);
		// is this ok?
		if (!_inputEl) {
			_buttonCancelEl ? _buttonCancelEl.focus() : _buttonOkEl?.focus();
		}
	});

	const onKeyDown = (e) => {
		if (!dialog) return;

		e.stopPropagation();
		if (e.key === 'Escape' && !isPending) {
			return acp.close();
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
			// esc pressed (educated guess, not standard)
			if (_dialogEl.returnValue === '') {
				acp.shift();
			}
		});
		// prevent built in escape
		_dialogEl.addEventListener('cancel', (event) => {
			event.preventDefault();
		});

		// but catch manually so we can do proper cleanup
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

	// $: clog($acp);
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
			{#if isPending}
				<div class="spinner rotating-cw"><Spinner /></div>
			{/if}
			<div class="title"><strong>{dialog.title}</strong></div>
			{#if dialog.content}
				<div class="content">{@html dialog.content}</div>
			{/if}
			{#if dialog.type === Type.PROMPT}
				<div class="inputbox">
					<input type="text" use:select bind:value bind:this={_inputEl} />
				</div>
			{/if}
			<menu>
				<li>
					<button
						type="submit"
						value="OK"
						data-type="ok"
						bind:this={_buttonOkEl}
						on:click|preventDefault={async () => {
							isPending = true;
							await Promise.resolve(dialog.onOk(value));
							isPending = false;
							value = null;
						}}
						disabled={isPending}
					>
						{@html dialog.labelOk}
					</button>
				</li>
				{#if dialog.type !== Type.ALERT}
					<li>
						<button
							on:click={acp.close}
							type="reset"
							data-type="cancel"
							bind:this={_buttonCancelEl}
							disabled={isPending}
						>
							{@html dialog.labelCancel}
						</button>
					</li>
				{/if}
			</menu>
		</form>
	{/if}
</dialog>

<style lang="scss">
	// https://stackoverflow.com/questions/58818299/css-variables-not-working-in-dialogbackdrop
	::backdrop {
		--backdrop_bg: rgba(0, 0, 0, 0.2);
	}
	dialog.theme-default {
		--box_width: 300px;
		--box_border_radius: 0.5rem;
		--box_filter: none; // drop-shadow(2px 2px 1px rgb(0 0 0 / .3));
		--box_border: 2px solid rgba(0, 0, 0, 0.3);
		--box_bg: white;
		--box_color: inherit;
		--box_bg_alert: var(--box_bg);
		--box_bg_confirm: var(--box_bg);
		--box_bg_prompt: var(--box_bg);

		--input_border: 1px solid rgba(0, 0, 0, 0.1);
		--input_bg: white;
		--input_bg_hover: rgba(0, 0, 0, 0.05);
		--input_border_radius: 0.3rem;
		--input_padding: 0.15rem 0.5rem;

		--buttons_space_between: 0.5rem;
		--button_border: 1px solid transparent;
		--button_border_radius: 0.3rem;
		--button_font_size: 0.9rem;
		--button_bg: rgba(0, 0, 0, 0.1);
		--button_bg_hover: rgba(0, 0, 0, 0.15);
		--button_color: var(--box_color);

		--focus_ring_color: rgba(0, 0, 0, 0.2);
		--focus_ring_offset_width: 3px;

		--button_bg_cancel: var(--button_bg);
		--button_bg_cancel_hover: var(--button_bg_hover);
		--button_color_cancel: var(--button_color);

		--button_bg_ok: var(--button_bg);
		--button_bg_ok_hover: var(--button_bg_hover);
		--button_color_ok: var(--button_color);

		width: var(--box_width);

		background: var(--box_bg);
		border: var(--box_border);
		border-radius: var(--box_border_radius);
		filter: var(--box_filter);
		color: var(--box_color);

		&::backdrop {
			background: var(--backdrop_bg);
		}

		&.is-pending {
			opacity: 0.75;
		}

		form {
			position: relative;
		}

		.spinner {
			position: absolute;
			top: 0;
			right: 0;
			width: 16px;
			height: 16px;
			line-height: 1;
			display: flex;
			justify-items: center;
			align-items: center;
			pointer-events: none;
			opacity: 0.5;
		}

		.title {
			margin: 0 0 1rem 0;
			padding: 0;
			font-size: 1rem;
			display: block;
			text-align: center;
		}

		.content {
			margin: 0 0 0.75rem 0;
			text-align: center;
			line-height: inherit;
		}

		.inputbox {
			margin: 0 0 1rem 0;
			input {
				display: block;
				width: 100%;
				border: var(--input_border);
				background: var(--input_bg);
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
			margin: 1rem 0 0 0;
			padding: 0;

			& > * + * {
				margin-top: var(--buttons_space_between);
			}

			li {
				list-style: none;
				display: block;
			}

			button {
				display: block;
				width: 100%;
				border: var(--button_border);
				border-radius: var(--button_border_radius);
				background: var(--button_bg);
				color: var(--button_color);
				margin: 0;
				padding: 0.3rem;
				line-height: inherit;
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
						background: var(--button_bg_hover);
					}
				}
				&[data-type='cancel'] {
					background: var(--button_bg_cancel);
					color: var(--button_color_cancel);
					&:hover,
					&:focus {
						background: var(--button_bg_hover);
					}
				}
			}
		}

		&[data-type='alert'] {
			&::backdrop {
				background: var(--backdrop_bg_alert, var(--backdrop_bg));
			}
			background: var(--box_bg_alert);
			border: var(--box_border_alert, var(--box_border));
			border-radius: var(--box_border_radius_alert, var(--box_border_radius));
			filter: var(--box_filter_alert, var(--box_filter));
			menu {
				button {
					&[data-type='ok'] {
						background: var(--button_bg_ok_alert, var(--button_bg_ok));
						&:hover,
						&:focus {
							background: var(--button_bg_ok_hover_alert, var(--button_bg_ok_hover));
						}
					}
					&[data-type='cancel'] {
						background: var(--button_bg_cancel_alert, var(--button_bg_cancel));
						&:hover,
						&:focus {
							background: var(
								--button_bg_cancel_hover_alert,
								var(--button_bg_cancel_hover)
							);
						}
					}
				}
			}
		}

		&[data-type='confirm'] {
			&::backdrop {
				background: var(--backdrop_bg_confirm, var(--backdrop_bg));
			}
			background: var(--box_bg_confirm);
			border: var(--box_border_confirm, var(--box_border));
			border-radius: var(--box_border_radius_confirm, var(--box_border_radius));
			filter: var(--box_filter_confirm, var(--box_filter));
			menu {
				button {
					&[data-type='ok'] {
						background: var(--button_bg_ok_confirm, var(--button_bg_ok));
						&:hover,
						&:focus {
							background: var(--button_bg_ok_hover_confirm, var(--button_bg_ok_hover));
						}
					}
					&[data-type='cancel'] {
						background: var(--button_bg_cancel_confirm, var(--button_bg_cancel));
						&:hover,
						&:focus {
							background: var(
								--button_bg_cancel_hover_confirm,
								var(--button_bg_cancel_hover)
							);
						}
					}
				}
			}
		}

		&[data-type='prompt'] {
			&::backdrop {
				background: var(--backdrop_bg_prompt, var(--backdrop_bg));
			}
			background: var(--box_bg_prompt);
			border: var(--box_border_prompt, var(--box_border));
			border-radius: var(--box_border_radius_prompt, var(--box_border_radius));
			filter: var(--box_filter_prompt, var(--box_filter));
			menu {
				button {
					&[data-type='ok'] {
						background: var(--button_bg_ok_prompt, var(--button_bg_ok));
						&:hover,
						&:focus {
							background: var(--button_bg_ok_hover_prompt, var(--button_bg_ok_hover));
						}
					}
					&[data-type='cancel'] {
						background: var(--button_bg_cancel_prompt, var(--button_bg_cancel));
						&:hover,
						&:focus {
							background: var(
								--button_bg_cancel_hover_prompt,
								var(--button_bg_cancel_hover)
							);
						}
					}
				}
			}
		}
	}

	// prettier-ignore
	@keyframes -global-rotating-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
	// prettier-ignore
	//@keyframes rotating-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
	// prettier-ignore
	.rotating-cw { animation: rotating-cw 0.75s linear infinite; }
</style>
