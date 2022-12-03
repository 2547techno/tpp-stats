<script>
    import Card from "./Card.svelte";
    import Table from "./Table.svelte";
    export let data;

</script>

<main>
    <Card>
        <Table headers={Object.keys(data.count)} data={[{
            label: "count",
            entires: Object.values(data.count)
        }]}/>
        <!-- TODO: add pie charts -->
    </Card>
</main>

<style lang="scss">
</style>