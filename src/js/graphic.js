import loadData from './load-data';
import './pudding-chart/flow';
import EnterView from 'enter-view';

let data = [];
let $sel = [];

// selections
const $charts = d3.selectAll('.chart__flow');
const charts = {};

const $buttons = d3.selectAll('.chart__meta-replay');

function setupCharts() {
	$sel = d3.select(this);
	const filter = $sel.attr('data-filter');

	const big4 = [
		'University of North Carolina',
		'University of Kentucky',
		'Duke University',
		'University of Kansas'
	];
	

	let filteredData = null;
	if (filter == 'ranked') filteredData = data.filter(d => d.top === 1);
	if (filter == 'top10')
		filteredData = data.filter(d => d.top === 1 && d.rank <= 10);
	if (filter == 'none')
		filteredData = data.filter(
			d => d.top === 0 || (d.top === 1 && d.draft === 1)
		);
	if (filter == 'big4')
		filteredData = data.filter(d => big4.includes(d.college));
	if (filter == 'skipCollege') filteredData = data.filter(d => d.coll === 2);

	const indicators = { filteredData, filter };

	charts[filter] = $sel.datum(indicators).createFlow();
}

function setupFigureEnter() {
	EnterView({
		selector: '.chart__flow',
		enter(el, i) {
			// console.log({ el });
			// pause other charts
			Object.keys(charts).map(d => {
				const val = charts[d];
				val.pause();
			});
			const fil = d3.select(el).attr('data-filter');
			const rend = charts[fil];
			rend.render();
		},
		offset: 0.25,
		once: true
	});
}

function handleButtonClick() {
	const button = d3.select(this).attr('data-filter');
	charts[button].render();
}

function resize() {
	Object.keys(charts).forEach(d => charts[d].resize());
	// charts.each.resize()
}

function handleVidEnter() {
	const side = d3.select(this).attr('data-side');
	// console.log(side);
	d3.select(`.intro .prose span[data-side="${side}"]`).classed(
		'is-selected',
		true
	);
}

function handleSpanEnter() {
	const side = d3.select(this).attr('data-side');
	d3.select(`.intro__media[data-side="${side}"]`).classed('is-selected', true);
}

function setupVideo() {
	d3.selectAll('.intro__media')
		.on('mouseenter', handleVidEnter)
		.on('mouseout', () => {
			d3.selectAll('.intro .prose span').classed('is-selected', false);
		});
	d3.selectAll('.intro .prose span')
		.on('mouseenter', handleSpanEnter)
		.on('mouseout', () => {
			d3.selectAll('.intro__media').classed('is-selected', false);
		});
}

function init() {
	setupVideo();
	Promise.all([loadData()])
		.then(results => {
			data = results[0];
			$charts.each(setupCharts);
			$buttons.on('click', handleButtonClick);
			setTimeout(setupFigureEnter, 100);
		})
		.catch(err => console.log(err));
}

export default { init, resize };
