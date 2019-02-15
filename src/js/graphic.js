import loadData from './load-data'
import './pudding-chart/flow'

let data = []
let $sel = []

// selections
const $charts = d3.selectAll('.chart__flow')
let chart = null

function setupCharts(){
	$sel = d3.select(this)
	const filter = $sel.attr('data-filter')
	console.log({filter})

	let filteredData = null
	if (filter == "ranked") filteredData = data.filter(d => d.top === 1)
	if (filter == "top10") filteredData = data.filter(d => d.top === 1 && d.rank <= 10)
	if (filter == "none") filteredData = data
	if (filter == "unc") filteredData = data.filter(d => d.college === 'University of North Carolina')
	if (filter == "uk") filteredData = data.filter(d => d.college === 'University of Kentucky')
	if (filter == "duke") filteredData = data.filter(d => d.college === 'Duke University')
	if (filter == 'kansas') filteredData = data.filter(d => d.college === 'University of Kansas')

	let indicators = {filteredData, filter}
	console.log({indicators})

	chart = $sel
		.datum(indicators)
		.createFlow()
}

function resize() {
	chart.resize()
}

function init() {
	Promise.all([loadData()])
			.then((results) => {
				data = results[0]
				$charts.each(setupCharts)
			})
			.catch(err => console.log(err))
}

export default { init, resize };
