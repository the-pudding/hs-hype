/*
 USAGE (example: line chart)
 1. c+p this template to a new file (line.js)
 2. change puddingChartName to puddingChartLine
 3. in graphic file: import './pudding-chart/line'
 4a. const charts = d3.selectAll('.thing').data(data).puddingChartLine();
 4b. const chart = d3.select('.thing').datum(datum).puddingChartLine();
*/

d3.selection.prototype.smallMultiple = function init(options) {
	function createChart(el) {
		const $sel = d3.select(el);
		let data = $sel.datum();
		// dimension stuff
		let width = 0;
		let height = 0;
		const marginTop = 0;
		const marginBottom = 0;
		const marginLeft = 0;
		const marginRight = 0;

		// scales
		const scaleX = d3.scaleLinear();
		const scaleY = null;

		// dom elements
		let $svg = null;
		let $axis = null;
		let $vis = null;

		// helper functions

		const Chart = {
			// called once at start
			init() {
        const meta = $sel.append('div')
          .attr('class', 'meta')

        meta.append('p')
          .attr('class', 'schoolName')
          .text(d => d.key)

        meta.append('p')
          .attr('class', 'studentCount')
          .text(d => `${d.value[0].count} students`)


        const chart = $sel.append('div')
          .attr('class', 'barChart')

        const barGroup = chart.selectAll('.g-bar')
          .data(d => {
            const val = d.value
            // val.shift()
            return val})
          .enter()
          .append('div')
          .attr('class', d => `g-bar g-bar-${d.level}`)

        barGroup.append('div')
          .attr('class', 'bar')

        barGroup.append('p')
          .attr('class', 'bar-label')
          .text(d => d.level === 'highSchool' ? `${Math.round(d.percent * 100)}%` : `${Math.round(d.percent * 100)}`)



				Chart.resize();
				Chart.render();
			},
			// on resize, update new dimensions
			resize() {
				// defaults to grabbing dimensions from container element
        scaleX
          .range([1, 100])
          .domain([0, 1])

        console.log(scaleX(1))
        console.log(scaleX(0.5))

        d3.selectAll('.bar')
          .style('width', d => `${Math.round(scaleX(d.percent))}px`)
          .style('height', '10px')
				return Chart;
			},
			// update scales and render chart
			render() {
				return Chart;
			},
			// get / set data
			data(val) {
				if (!arguments.length) return data;
				data = val;
				$sel.datum(data);
				Chart.render();
				return Chart;
			}
		};
		Chart.init();

		return Chart;
	}

	// create charts
	const charts = this.nodes().map(createChart);
	return charts.length > 1 ? charts : charts.pop();
};
