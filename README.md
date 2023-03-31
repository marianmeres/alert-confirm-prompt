# @marianmeres/alert-confirm-prompt

Just like `alert/confirm/prompt(...)` but with better control, custom styling and async support.

Both store and Svelte render component. 

See example at: [acp.meres.sk](https://acp.meres.sk/)

## Install
```shell
$ npm i @marianmeres/alert-confirm-prompt
```

## Example

```html
<script>
    import { createAlertConfirmPromptStore } from "@marianmeres/alert-confirm-prompt";
    import AlertConfirmPrompt from "@marianmeres/alert-confirm-prompt/AlertConfirmPrompt.svelte";
    
    const acp = createAlertConfirmPromptStore();
</script>

<button on:click={() => acp.alert('Hey ho!')}>Alert</button>

<AlertConfirmPrompt 
    {acp}
    themeVars={{
        // see source for theme options
    }}
/>
```

## Custom theming

See [this](https://github.com/marianmeres/alert-confirm-prompt/blob/master/src/lib/svelte/AlertConfirmPrompt.svelte) 
or [this](https://github.com/marianmeres/alert-confirm-prompt/blob/master/src/routes/%2Bpage.svelte).
