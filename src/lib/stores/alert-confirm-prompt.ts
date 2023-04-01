import { createStore } from '@marianmeres/store';

export enum Type {
	ALERT = 'alert',
	CONFIRM = 'confirm',
	PROMPT = 'prompt',
}

interface Dialog extends Record<string, any> {
	type: Type.ALERT | Type.CONFIRM | Type.PROMPT;
	title?: string;
	onOk?: Function;
	content?: string;
	labelOk?: string;
	labelCancel?: string;
	value?: any;
	onCancel?: Function;
	// so we can distinguish the escape key hit (native browser sometimes does)
	onEscape?: Function;
}

const isFn = (v) => typeof v === 'function';
const ucf = (s: string) => `${s}`[0].toUpperCase() + `${s}`.slice(1);

export const createAlertConfirmPromptStore = () => {
	// fifo
	const _stack = createStore<Dialog[]>([]);

	// defaults
	const labelOk = 'OK';
	const labelCancel = 'Cancel';

	const push = (o: Dialog) => {
		if (!isFn(o.onOk)) o.onOk = shift;
		if (!isFn(o.onCancel)) o.onCancel = shift;
		if (!isFn(o.onEscape)) o.onEscape = () => undefined;
		if (o.labelOk === undefined) o.labelOk = labelOk;
		if (o.labelCancel === undefined) o.labelCancel = labelCancel;
		if (o.title === undefined) o.title = ucf(o.type);
		_stack.update((old) => [...old, o]);
	};

	const shift = () =>
		_stack.update((old) => {
			old.shift();
			return [...old];
		});

	const reset = (stack: Dialog[] = []) => _stack.set(stack);

	const escape = () => {
		if (_stack.get().length) _stack.get()[0].onEscape();
		shift();
	};

	return {
		subscribe: _stack.subscribe,
		get: _stack.get,
		push,
		shift,
		reset,
		escape,
		// human alias
		close: shift,
		// sugar below
		//
		alert: (o?: Partial<Dialog> | string) => {
			if (typeof o === 'string') o = { title: o };
			push({ ...(o || {}), type: Type.ALERT });
		},
		//
		confirm: (onOk: Function, o?: Partial<Dialog>) =>
			push({ onOk, value: false, ...o, type: Type.CONFIRM }),
		//
		prompt: (onOk: Function, o?: Partial<Dialog>) =>
			push({ onOk, value: '', ...o, type: Type.PROMPT }),
	};
};

// experimental helpers to path native window.alert/confirm/prompt

export const createWindowAlertLike = (acp) => (message) =>
	new Promise((resolve) =>
		acp.alert({
			onOk: () => {
				acp.close();
				resolve(undefined);
			},
			title: message,
			onEscape: () => {
				acp.close();
				resolve(undefined);
			},
		})
	);

export const createWindowConfirmLike =
	(acp): any =>
	(message) =>
		new Promise((resolve) =>
			acp.confirm(
				() => {
					acp.close();
					resolve(true);
				},
				{
					title: message,
					onCancel: () => {
						acp.close();
						resolve(false);
					},
					onEscape: () => {
						acp.close();
						resolve(false);
					},
				}
			)
		);

export const createWindowPromptLike =
	(acp): any =>
	(message, defaultValue) =>
		new Promise((resolve) =>
			acp.prompt(
				(value) => {
					acp.close();
					resolve(value);
				},
				{
					title: message,
					value: defaultValue,
					onCancel: () => {
						acp.close();
						resolve(null);
					},
					onEscape: () => {
						acp.close();
						resolve(null);
					},
				}
			)
		);
