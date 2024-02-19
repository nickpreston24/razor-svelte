<svelte:options tag="big-header"/>
<script>
    export let message = 'Your message here';
    export let id;
</script>

<main>
    <h1 id="{id}">{message}!</h1>
</main>

<style>
    h1 {
        font-size: 5em;
    }
</style>
