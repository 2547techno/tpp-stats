<script>
    import Card from "./Card.svelte";
    import Table from "./Table.svelte";
    export let data;
</script>

<main>
    <Card>
        <h3 class="title">{data.displayName}'s Stats</h3>
        <Table headers={Object.keys(data.count)} data={[{
            label: "count",
            entires: Object.values(data.count)
        },
        {
            label: "% of Chat",
            entires: Object.keys(data.count).map(k => `${Math.round(data.count[k] / data.totalCount[k] * 100000) / 1000}%`)
        }]}/>
        <!-- TODO: add pie charts -->
    </Card>
</main>

<style lang="scss">
    .title {
        text-align: center;
        margin: 14px;
    }
</style>