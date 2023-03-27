# @marianmeres/alert-confirm-prompt

Just like `alert/confirm/prompt(...)` but with custom styling and async support.
Both store and Svelte render component.

Work in progress...

## Install
```shell
$ npm i @marianmeres/alert-confirm-prompt
```

## Example

```sveltehtml
<script>
    import { createAlertConfirmPromptStore } from "@marianmeres/alert-confirm-prompt";
    import AlertConfirmPrompt from "@marianmeres/alert-confirm-prompt/AlertConfirmPrompt.svelte";
    
    const acp = createAlertConfirmPromptStore();
</script>

<button on:click={() => acp.alert({ title: 'Hey ho!' })}>Alert</button>

<AlertConfirmPrompt {acp} />
```
