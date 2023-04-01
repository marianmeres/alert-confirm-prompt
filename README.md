# @marianmeres/alert-confirm-prompt

Just like `alert/confirm/prompt(...)` but with better control, custom styling and async support.

Both store and Svelte render component.

See live preview at [acp.meres.sk](https://acp.meres.sk/)

## Install
```shell
$ npm i @marianmeres/alert-confirm-prompt
```

## Quick example
Live preview [acp.meres.sk](https://acp.meres.sk/)
```html
<script>
    import { createAlertConfirmPromptStore } from "@marianmeres/alert-confirm-prompt";
    import AlertConfirmPrompt from "@marianmeres/alert-confirm-prompt/AlertConfirmPrompt.svelte";
    const acp = createAlertConfirmPromptStore();
</script>

<button on:click={() => acp.alert("Let's go!")}>Hey ho</button>

<AlertConfirmPrompt {acp} themeVars={{ /*see source for theme options*/ }} />
```

## Custom theming

See [AlertConfirmPrompt.svelte](https://github.com/marianmeres/alert-confirm-prompt/blob/master/src/lib/svelte/AlertConfirmPrompt.svelte)
or [+page.svelte](https://github.com/marianmeres/alert-confirm-prompt/blob/master/src/routes/%2Bpage.svelte)
for the complete list of supported css vars.


## API

See also [+page.svelte](https://github.com/marianmeres/alert-confirm-prompt/blob/master/src/routes/%2Bpage.svelte)
for examples.

```typescript
interface Dialog extends Record<string, any> {
    // Required for confirm and prompt.
    // For type prompt it receives the input value as a first argument.
    // Can return promise in which case the UI will be in `isPending` state until
    // the promise is resolved.
    onOk?: Function;
    
    //
    type: Type.ALERT | Type.CONFIRM | Type.PROMPT;
    title: string; // defaults to Camel cased `type`
    content?: string; // defaults to undefined
    labelOk?: string; // defaults to "OK"
    labelCancel?: string; // defaults to "Cancel"
    
    // initial value for prompt
    value?: any;
    
    // if you need to destinguish cancel and/or escape, use these handlers:
    onCancel?: Function;
    onEscape?: Function;
}

const acp = createAlertConfirmPromptStore();

// sugar api

// string as arg will be considered as title
acp.alert(o?: Partial<Dialog> | string): void;
// Note, that it is the responsibility of the `onOk` (and `onCancel`, but NOT `onEscape`) 
// handler to close the dialog (e.g. by calling acp.close())
acp.confirm(onOk: Function, o?: Partial<Dialog>): void;
acp.prompt(onOk: Function, o?: Partial<Dialog>): void;

// stack api

// Even if multiple dialogs are in the stack only one UI instance is rendered 
// at a time.
acp.push(o: Dialog);
acp.shift(); // will remove current dialog from stack
acp.close(); // alias to shift
acp.reset(stack: Dialog[] = []);

// store api
acp.subscribe((stack: Dialog[]) => { /*...*/ });
```

## `window.alert/confirm/prompt` monkey patching
This is kind of experimental, and by definition will not work exactly equal, but you can
do something like below.

Note, that all patched functions return promises, so you must await until they resolve
(this is to simulate the native javascript execution pause).

```javascript
const acp = createAlertConfirmPromptStore();

//
onMount(() => {
    window.alert = createWindowAlertLike(acp);
    window.confirm = createWindowConfirmLike(acp);
    window.prompt = createWindowPromptLike(acp);
});

// and later call
console.log(await prompt("What's your name?", 'Bond, James Bond'));
```
