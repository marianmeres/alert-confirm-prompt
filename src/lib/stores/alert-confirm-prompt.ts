import { createStore } from '@marianmeres/store';

export enum Type {
	ALERT = 'alert',
	CONFIRM = 'confirm',
	PROMPT = 'prompt',
}

interface Dialog extends Record<string, any> {
	type: Type.ALERT | Type.CONFIRM | Type.PROMPT;
	title: string;
	onOk: Function;
	content?: string;
	labelOk?: string;
	labelCancel?: string;
	value?: any;
}

const isFn = (v) => typeof v === 'function';

export const createAlertConfirmPromptStore = () => {
	// fifo
	const _stack = createStore<Dialog[]>([]);

	const push = (o: Dialog) => {
		if (o.type === Type.ALERT && !isFn(o.onOk)) {
			o.onOk = shift;
		}
		_stack.update((old) => [...old, o]);
	};

	const shift = () =>
		_stack.update((old) => {
			old.shift();
			return [...old];
		});

	const reset = (stack: Dialog[] = []) => _stack.set(stack);

	// defaults
	const labelOk = 'OK';
	const labelCancel = 'Cancel';

	return {
		subscribe: _stack.subscribe,
		get: _stack.get,
		push,
		shift,
		reset,
		// human alias
		close: shift,
		// sugar below
		//
		alert: (o?: Partial<Dialog>) =>
			push({
				onOk: shift,
				labelOk,
				title: 'Alert',
				...o,
				type: Type.ALERT,
			}),
		//
		confirm: (onOk: Function, o?: Partial<Dialog>) =>
			push({
				onOk,
				labelOk,
				labelCancel,
				title: 'Confirm',
				value: false,
				...o,
				type: Type.CONFIRM,
			}),
		//
		prompt: (onOk: Function, o?: Partial<Dialog>) =>
			push({
				onOk,
				labelOk,
				labelCancel,
				title: 'Prompt',
				value: '',
				...o,
				type: Type.PROMPT,
			}),
	};
};
