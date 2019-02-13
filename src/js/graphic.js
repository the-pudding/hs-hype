import loadData from './load-data'
import './pudding-chart/flow'

let data = []
let $sel = []

// selections
const $charts = d3.selectAll('.chart__flow')

function setupCharts(){
	$sel = d3.select(this)

	const chart = $sel
		.datum(data)
		.createFlow()
}

function resize() {}

function init() {
	Promise.all([loadData()])
			.then((results) => {
				data = results[0]
				$charts.each(setupCharts)
			})
			.catch(err => console.log(err))
}

export default { init, resize };
