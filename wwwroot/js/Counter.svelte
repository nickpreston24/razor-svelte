<svelte:options tag="custom-counter" />

<script>
  // we write export let to say that this is a property
  // that means we can change it later!
  export let step = 5;
  export let x = 0;
  export let name = "counter";
  const addToCounter = function (amount) {
    x += amount;
  };
</script>

<span>{name}</span>
<button id="counter" on:click={() => addToCounter(step)}>{x}</button>

<!-- <button id="counter" on:click={addToCounter(5)}>{x}</button> -->

<!-- 
<script>
  export let count;
  export let name = "counter";

  console.log("count :>> ", typeof count);

  function handleClick() {
    console.log("count :>> ", typeof count);
    if (typeof count !== typeof number) return;
    count += 1;
  }
</script>

<div class="flex">
  <span>{name}</span>
  <button class="btn btn-accent" on:click={handleClick}>
    Clicked {count}
    {count === 1 ? "time" : "times"}
  </button>
</div> -->

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
