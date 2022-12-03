<script>
    import Card from "./Card.svelte";
    export let data;
</script>

<main>
    <Card>
        data
        {JSON.stringify(data)}
    </Card>
</main>

<style lang="scss">
</style>