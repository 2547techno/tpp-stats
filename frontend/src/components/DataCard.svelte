<script>
    import Card from "./Card.svelte";
    export let data;
</script>

<main>
    <Card>
        {#each Object.keys(data.count) as key}
            {#if key != "other"}
                <p>{key.charAt(0).toUpperCase() + key.slice(1)}: {data.count[key]}</p>
            {/if}
        {/each}
    </Card>
</main>

<style lang="scss">
</style>