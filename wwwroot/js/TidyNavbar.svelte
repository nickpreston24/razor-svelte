<svelte:options tag="tidy-navbar" />

<script>
  // export let foo;
</script>

<div class="navbar bg-base-100">
  <div class="navbar-start">
    <slot>...</slot>
  </div>
</div>

<style>
  .navbar {
    /* height: 12px; */
    background: #6f42c1;
    display: inline;
    /* border: green 4px solid; */
  }
</style>
