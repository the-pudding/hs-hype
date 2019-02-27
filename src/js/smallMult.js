import loadData from './load-data';
import './pudding-chart/smallMult_template';

let data = [];
const $sel = [];
let nested = null;

// selections
const $container = d3.select('.smallMultiples');
const $keyContainer = d3.select('.multKey');

function resize() {}

function addLevels(leaves, level) {
	let total = 0;

	const nbaLevels = ['bad', 'good', 'great'];

	const map = leaves.map(d => {
		if (nbaLevels.includes(level)) {
			if (level === 'bad') {
				if (d.bad != '' || d.good != '' || d.great != '' || d.allstar != '')
					total += 1;
			} else if (level === 'good') {
				if (d.good !== '' || d.great !== '' || d.allstar !== '') total += 1;
			} else if (level === 'great') {
				if (d.great !== '' || d.allstar !== '') total += 1;
			}
		} else if (d[level] !== '') total += 1;
	});
	return total;
}

function setupChart() {
	const filtered = data.filter(d => +d.smallMult === 1);

	const uk = filtered.filter(d => d.college === 'University of Kentucky');
	const jules = data.filter(d => d.name === 'Jules Camara');
	// console.log({uk, jules})

	nested = d3
		.nest()
		.key(d => d.college)
		.rollup(leaves => [
			{
				level: 'highSchool',
				count: addLevels(leaves, 'highSchool'),
				percent:
						addLevels(leaves, 'highSchool') / addLevels(leaves, 'highSchool') // d3.sum(leaves, e => e.highSchool)
			},
			{
				level: 'college',
				count: addLevels(leaves, 'coll'),
				percent: addLevels(leaves, 'coll') / addLevels(leaves, 'highSchool')
			},
			{
				level: 'draft',
				count: addLevels(leaves, 'draft'),
				percent: addLevels(leaves, 'draft') / addLevels(leaves, 'highSchool')
			},
			{
				level: 'rookie',
				count: addLevels(leaves, 'rookie'),
				percent: addLevels(leaves, 'rookie') / addLevels(leaves, 'highSchool')
			},
			{
				level: 'bad',
				count: addLevels(leaves, 'bad'),
				percent: addLevels(leaves, 'bad') / addLevels(leaves, 'highSchool')
			},
			{
				level: 'good',
				count: addLevels(leaves, 'good'),
				percent: addLevels(leaves, 'good') / addLevels(leaves, 'highSchool')
			},
			{
				level: 'great',
				count: addLevels(leaves, 'great'),
				percent: addLevels(leaves, 'great') / addLevels(leaves, 'highSchool')
			},
			{
				level: 'allstar',
				count: addLevels(leaves, 'allstar'),
				percent:
						addLevels(leaves, 'allstar') / addLevels(leaves, 'highSchool')
			}
		])
		.entries(filtered)
		.sort((a, b) => d3.descending(a.value[0].count, b.value[0].count));

	// console.log({nested})
	const charts = $container
		.selectAll('.multiple')
		.data(nested)
		.enter()
		.append('div')
		.attr('class', 'multiple')
		.smallMultiple();
}

function setupKey() {
	const keyData = nested[0].value;

	const scaleX = d3
		.scaleLinear()
		.range([1, 130])
		.domain([0, 100]);

	const meta = $keyContainer
		.append('p')
		.attr('class', 'meta')
		.text('NBA Career');

	const chart = $keyContainer.append('div').attr('class', 'barChart');

	const bars = chart.append('div').attr('class', 'barsOnly');

	const barContainer = bars
		.selectAll('.barContainer')
		.data(keyData)
		.enter()
		.append('div')
		.attr('class', d => `barContainer barContainer-${d.level}`);

	barContainer
		.append('div')
		.attr('class', 'bar')
		.style('width', d => `${Math.round(scaleX(d.percent * 100))}px`)
		.style('height', '10px');

	const labels = chart.append('div').attr('class', 'labelsOnly');

	const label = labels
		.selectAll('.label')
		.data(keyData)
		.enter()
		.append('div')
		.attr('class', d => `label label-${d.level}`)
		.text(d => {
			if (d.level === 'highSchool') return 'high school';
			if (d.level === 'bad') return 'below average';
			if (d.level === 'good') return 'mediocre';
			if (d.level === 'great') return 'great';
			if (d.level === 'allstar') return 'superstar';
			if (d.level === 'draft') return 'drafted';
			if (d.level === 'rookie') return '< 3 years in NBA';
			return d.level;
		});

	// const barGroup = chart.selectAll('.g-bar')
	//   .data(keyData)
	//   .enter()
	//   .append('div')
	//   .attr('class', d => `g-bar g-bar-${d.level}`)
	//
	// barGroup.append('div')
	//   .attr('class', 'bar')
	//   .style('width', d => `${Math.round(scaleX(d.percent * 100))}px`)
	//   .style('height', '10px')
	//
	// barGroup.append('p')
	//   .attr('class', 'bar-label')
	//   .text(d => {
	//     if(d.level === 'highSchool') return 'high school'
	//     else if (d.level === 'bad') return 'below average NBA career'
	//     else if (d.level === 'good') return 'mediocre NBA career'
	//     else if (d.level === 'great') return 'great NBA career'
	//     else if (d.level === 'allstar') return 'superstar NBA career'
	//     else if (d.level === 'draft') return `drafted`
	//     else if (d.level === 'rookie') return `< 2 years in NBA`
	//     else return d.level})
}

function init() {
	Promise.all([loadData()])
		.then(results => {
			data = results[0];
			const jules = data.filter(d => d.name === 'Jules Camara');
			console.log({ jules });
			setupChart();
			setupKey();
		})
		.catch(err => console.log(err));
}

export default { init, resize };
