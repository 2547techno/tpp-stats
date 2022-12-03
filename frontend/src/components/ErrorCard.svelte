<script>
    import Card from "./Card.svelte";

    export let status;
    export let message;
</script>

<main>
    <Card>
        <div class="container">
            <p>{message}</p>
            {#if status != 404}
                <p>{status}</p>
            {/if}
        </div>
    </Card>
</main>

<style lang="scss">
    .container {
        $margin: 20px;

        min-width: 200px;
        margin-left: $margin;
        margin-right: $margin;
        text-align: center;
    }
</style>