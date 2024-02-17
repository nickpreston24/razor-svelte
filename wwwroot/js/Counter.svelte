<svelte:options tag="custom-counter"/>

<script>
    let count = 0;

    function handleClick() {
        count += 1;
    }
</script>

<button
        class="btn btn-accent"
        on:click={handleClick}>
    Clicked {count}
    {count === 1 ? 'time' : 'times'}
</button>


<!--<main>-->
<!--    <div>-->
<!--        <h1 id="{id}">Hullo there {name}!</h1>-->
<!--        <span>{count}</span>-->
<!--        <button onclick="count++" class="btn btn-accent btn-circle">+</button>-->
<!--    </div>-->
<!--</main>-->

<!--<style>-->
<!--    h1 {-->
<!--        font-size: 2em;-->
<!--    }-->
<!--</style>-->


<!--<svelte:options tag="custom-counter"></svelte:options>-->

<!--<script>-->
<!--    export let name = 'foo';-->
<!--    // export let limit = 10;-->
<!--    let start = 0;-->
<!--    // export let scale = 1;-->
<!--    export let id;-->
<!--    count = start;-->
<!--    let scales = [1, 2, 5, 10, 25, 50, 100]-->
<!--</script>-->

<!--<div>-->
<!--    <h1>Blarg</h1>-->
<!--    <span id={id}>{name} counter</span>-->
<!--    -->
<!--    <button onclick="count&#45;&#45;" class="btn btn-accent btn-circle">-</button>-->
<!--</div>-->