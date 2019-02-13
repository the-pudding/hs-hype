/*
 USAGE (example: line chart)
 1. c+p this template to a new file (line.js)
 2. change puddingChartName to puddingChartLine
 3. in graphic file: import './pudding-chart/line'
 4a. const charts = d3.selectAll('.thing').data(data).puddingChartLine();
 4b. const chart = d3.select('.thing').datum(datum).puddingChartLine();
*/

d3.selection.prototype.createFlow = function init(options) {
	function createChart(el) {
		const $sel = d3.select(el);
		let data = $sel.datum();
		// dimension stuff
		let width = 0;
		let height = 0;
    let radius = 3
		const marginTop = 16;
		const marginBottom = 0;
		const marginLeft = 16;
		const marginRight = 16;

    const breakPoints = {
      highSchool: 1/6,
      college: 2/6,
      draft: 3/6,
      rookie: 4/6,
      success: 5/6
    }

    let stopSectionWidth = null

		// scales
		const scaleX = d3.scaleLinear();
    const scaleXSuccess = d3.scaleLinear()
		const scaleY = null;

    const colorScale = d3.scaleSequential()
      .domain([100, 1])
      .interpolator(d3.interpolatePlasma)

		// dom elements
		let $svg = null;
		let $axis = null;
		let $vis = null;

		// helper functions

    function translateAlong(path){
			let length = path.getTotalLength(); // Get the length of the path
			let r = d3.interpolate(0, length); //Set up interpolation from 0 to the path length
			return function(t){
				let point = path.getPointAtLength(r(t)); // Get the next point along the path
				console.log({point})
        return `translate(${point.x}, ${point.y})`
			}
    }

		const Chart = {
			// called once at start
			init() {
				$svg = $sel.append('svg').attr('class', 'pudding-chart');
				const $g = $svg.append('g');

				// offset chart for margins
				$g.attr('transform', `translate(${marginLeft}, ${marginTop})`);

				// create axis
				$axis = $svg.append('g').attr('class', 'g-axis');

				// setup viz group
				$vis = $g.append('g').attr('class', 'g-vis');

				Chart.resize();
				Chart.render();
			},
			// on resize, update new dimensions
			resize() {
				// defaults to grabbing dimensions from container element
				width = $sel.node().offsetWidth - marginLeft - marginRight;
				height = $sel.node().offsetHeight - marginTop - marginBottom;
				$svg
					.attr('width', width + marginLeft + marginRight)
					.attr('height', height + marginTop + marginBottom);

        stopSectionWidth = width * 0.1

        scaleX
          .range([width - stopSectionWidth, 0])
          .domain([1, 100])

        scaleXSuccess
          .range([width - stopSectionWidth, 0])
          .domain([1, 4])

				return Chart;
			},
			// update scales and render chart
			render() {
        let sub = data.slice(0, 500)
        //let sub = data.filter(d => d.recruit_year == 2003)

        const groups = $vis.selectAll('.player')
          .data(sub)
          .enter()
          .append('g')
          .attr('class', 'player')

        const paths = groups
          .append('path')
          .attr('class', d => `path__player path__player-${d.name}`)
          //.style('stroke', d => colorScale(d.rank))
          .attr('d', function(d){
            let hsStopW = d.highSchool == 0 || d.highSchool == "" ? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.rank)
            let collStopW = d.coll == 0 || d.coll == "" ? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.rank)
            let draftStopW = d.draft == 0 || d.draft == "" ? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.draft_pk)
            let rookieStopW = d.rookie == 0 || d.rookie == ""? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.draft_pk)
            let successStopW = d.success == 0 || d.success == "" ? stopSectionWidth / 2 : stopSectionWidth + scaleXSuccess(d.success)

            const path = [
              // move over based on HS rank
              "M", [stopSectionWidth + scaleX(d.rank), marginTop],
              // move straight down to the top of the HS section
              "L", [hsStopW, Math.min(height * breakPoints.highSchool, height * breakPoints[d.highest])],
              // move straight to the top of the college section
              "L", [collStopW, Math.min(height * breakPoints.college, height * breakPoints[d.highest])],
              // // move straight to the top of the draft section
              "L", [draftStopW, Math.min(height * breakPoints.draft, height * breakPoints[d.highest])],
              // // move straight to the rookie section
              "L", [rookieStopW, Math.min(height * breakPoints.rookie, height * breakPoints[d.highest])],
              // // move to success section
              "L", [successStopW, Math.min(height * breakPoints.success, height * breakPoints[d.highest])]
            ]
            const joined = path.join(" ")
            return joined
          })

        const dots = groups
          .append('circle')
          .attr('r', radius)
          .style('fill', d => colorScale(d.rank))
          .attr('transform', d => `translate(${stopSectionWidth + scaleX(d.rank)}, ${marginTop})`)
          .transition()
          .duration(2000)
          .delay((d, i) => i * 100)
          .ease(d3.easeCubicInOut)
          .attrTween('transform', function(d){
            //const parent = d3.select(this).node().parentNode
            const sibling = d3.select(this).node().previousSibling
            //const path = parent.childNodes[0]
            let response = translateAlong(sibling)

            return response//translateAlong(sibling)
          })

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
