<svelte:options tag="options-panel"/>
<script>
    export let name = 'Options Panel';
    export let xdata = 'options: {show: false}';
    export let options = {foo: true};
    export let id;

    function blah() {
        console.log("xdata :>> ", xdata)
    }
</script>

<style>
    h1 {
        font-size: 1.5em;
    }

    .panel {
        background: #6f42c1;
        opacity: 30%;
    }
</style>
<main>
    <div class="panel">
        <h1 class="text-primary" id="{id}">{name}</h1>
        <button on:click="{blah}" class="btn btn-primary">Get</button>
        <ul>
            {#each Object.entries(options) as [key, value], i}
                <h3>{key}</h3>
                <input key="{i}" value="{value}" type="checkbox" class="form-control toggle toggle-accent">
            {/each}
        </ul>

        <!--        <div x-data="{xdata}">-->
        <!--            &lt;!&ndash;            alpine template goes here&ndash;&gt;-->
        <!--            <template x-for="[key, value] of Object.entries(options)">-->
        <!--                <div class="mb-3">-->
        <!--                    <h3 x-text="key" class="form-label" :for="key">-->
        <!--                        &lt;!&ndash; ok svelte, here is some child content&ndash;&gt;-->
        <!--                    </h3>-->
        <!--                    <span x-text="key">This is for debugging only and can be omitted</span>-->
        <!--                    <input type="checkbox" class="form-control toggle toggle-accent" :for="key">-->
        <!--                </div>-->
        <!--            </template>-->
        <!--        </div>-->
    </div>
</main>

