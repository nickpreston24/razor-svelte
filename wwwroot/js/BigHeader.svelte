<svelte:options tag="big-header"/>
<script>
    export let message;
    export let id;
</script>

<main>
    <h1 id="{id}">Hello {message}!</h1>
</main>

<style>
    h1 {
        font-size: 5em;
    }
</style>
