<script>
    import Card from "./Card.svelte";
    import Table from "./Table.svelte";
    import { onMount } from "svelte";
    import { Chart } from 'chart.js/auto'

    export let data;

    let chartElem;
    let ctx;

    onMount(async () => {
        ctx = chartElem.getContext('2d');

        const chart = new Chart(chartElem,
        {
            type: "doughnut",
            data: {
                labels: Object.keys(data.count).filter(x => x.toLowerCase() != "total"),
                datasets: [
                    {
                        label: "data",
                        data: Object.keys(data.count).filter(x => x.toLowerCase() != "total").map(k => data.count[k]),
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)'
                        ],
                        borderColor: [
                            '#e0e0e0'
                        ],
                        hoverBorderColor: [
                            '#ffffff'
                        ],
                        hoverOffset: 4,
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                        },
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: "% of Your Messages",
                        color: '#ffffff'
                    }
                }
            }
        })
    })
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
        <!-- <div class="chart-title">% of Your Messages</div> -->
        <div class="chart-container">
            <canvas bind:this={chartElem} id="chart"></canvas>
        </div>
    </Card>
</main>

<style lang="scss">
    .title {
        text-align: center;
        margin: 14px;
    }

    .chart-container {
        width: 100%;
        height: 400px;
        display: flex;
        justify-content: center;
    }
    
    .chart-title {
        width: 100%;
        display: flex;
        justify-content: center;
        transform: translateY(25px);
    }
</style>