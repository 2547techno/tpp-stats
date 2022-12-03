<script>
    export let headers;
    export let data;
</script>

<main>
    <table>
        <thead>
            <tr>
                <th></th>
                {#each headers as header}
                    <th class="bold">{header.toUpperCase()}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each data as row}
                <tr>
                    <td class="bold">{row.label.toUpperCase()}</td>
                    {#each row.entires as entry}
                        <td>{entry}</td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</main>

<style lang="scss">
    table {
        th, td {
            background-color: #555555;
            padding: 10px;
            text-align: center;
            min-width: 40px;
        }
        
        th {
            background-color: #4d4d4d;
        }
        
    }
            
    .bold {
        font-weight: bold;
    }
</style>