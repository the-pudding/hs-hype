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
    let rectHeight = 0
		const marginTop = 32;
		const marginBottom = 16;
		const marginLeft = 16;
		const marginRight = 16;

    const breakPoints = {
      highSchool: 0/7,
      college: 1/7,
      draft: 2/7,
      rookie: 3/7,
      bad: 4/7,
      good: 5/7,
      great: 6/7,
      allstar: 7/7,
    }

    let stopSectionWidth = null

		// scales
		const scaleX = d3.scaleLinear();
    const scaleXSuccess = d3.scaleLinear()
		const scaleY = null;

    const colorScale = d3.scaleSequential()
      .domain([100, 1])
      .interpolator(d3.interpolateCool)

		// dom elements
		let $svg = null;
		let $axis = null;
		let $vis = null;
    let $stops = null;
    let $labels = null

		// helper functions

    function translateAlong(path){
			let length = path.getTotalLength(); // Get the length of the path
			let r = d3.interpolate(0, length); //Set up interpolation from 0 to the path length
			return function(t){
				let point = path.getPointAtLength(r(t)); // Get the next point along the path
        return `translate(${point.x}, ${point.y})`
			}
    }

		const Chart = {
			// called once at start
			init() {
				$svg = $sel.append('svg').attr('class', 'pudding-chart');
        const $allLabels = $svg.append('g').attr('class', 'g-labels')

        $allLabels.attr('transform', `translate(${marginLeft}, ${marginTop})`)

				const $g = $svg.append('g');

				// offset chart for margins
				$g.attr('transform', `translate(${marginLeft}, ${marginTop})`);

				// create axis
				$axis = $svg.append('g').attr('class', 'g-axis');

        const $allStops = $svg.append('g').attr('class', 'g-stops')

        const bpKeys = Object.keys(breakPoints)
        //const popped = bpKeys.pop()

        // $stops = $allStops.selectAll('.stop-group')
        //   .data(bpKeys)
        //   .enter()
        //   .append('g')
        //   .attr('class', 'stop-group')
        //   .attr('data-bp', (d, i) => bpKeys[i])
        //
        // $stops
        //   .append('rect')


        $labels = $allLabels.selectAll('.label')
          .data(bpKeys)
          .enter()
          .append('text')
          .attr('class', 'label')
          .text(d => {
            if(d === 'highSchool') return 'high school'
            else if (d === 'bad' || d === 'good' || d === 'great' || d === "allstar"){
              return `${d} in NBA`
            }
            else return d})
          .attr('alignment-baseline', 'middle')
          .attr('text-anchor', 'middle')


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

        stopSectionWidth = 0

        scaleX
          .range([width - stopSectionWidth, 0])
          .domain([1, 100])

        scaleXSuccess
          .range([width - stopSectionWidth, 0])
          .domain([1, 4])

        rectHeight = height * 0.05

        // scale up the stop boxes
        // $stops.selectAll('rect')
        //   .attr('width', stopSectionWidth)
        //   .attr('height', rectHeight)
        //   .attr('transform', (d, i) => `translate(0, ${(height * breakPoints[d]) - (rectHeight / 2)})`)

        $labels
          .attr('transform', (d, i) => `translate(${width / 2}, ${(height * breakPoints[d]) - (rectHeight / 2)})`)


				return Chart;
			},
			// update scales and render chart
			render() {
        //let sub = data.slice(0, 500)
        let sub = data.filter(d => d.recruit_year >= 2005)
        console.log({data, sub})

        const groups = $vis.selectAll('.player')
          .data(data)
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
            let draftStopW = d.draft == 0 || d.draft == "" ? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.rank)
            let rookieStopW = d.rookie == 0 || d.rookie == ""? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.rank)
            let successStopW = d.success == 0 || d.success == "" ? stopSectionWidth + scaleX(d.rank) : stopSectionWidth + scaleXSuccess(d.success)
            let xPos = scaleX(d.rank)

            const path = [
              // move over based on HS rank
              "M", [xPos, breakPoints.highSchool],
              // move straight down to the top of the HS section
              "L", [xPos, Math.min(height * breakPoints.highSchool, height * breakPoints[d.highest])],
              // move straight to the top of the college section
              "L", [xPos, Math.min(height * breakPoints.college, height * breakPoints[d.highest])],
              // // move straight to the top of the draft section
              "L", [xPos, Math.min(height * breakPoints.draft, height * breakPoints[d.highest])],
              // // move straight to the rookie section
              "L", [xPos, Math.min(height * breakPoints.rookie, height * breakPoints[d.highest])],
              // // move to bad section
              "L", [xPos, Math.min(height * breakPoints.bad, height * breakPoints[d.highest])],
              "L", [xPos, Math.min(height * breakPoints.good, height * breakPoints[d.highest])],
              "L", [xPos, Math.min(height * breakPoints.great, height * breakPoints[d.highest])],
              "L", [xPos, Math.min(height * breakPoints.allstar, height * breakPoints[d.highest])]
            ]
            const joined = path.join(" ")
            return joined
          })

        const dots = groups
          .append('circle')
          .attr('r', radius)
          .style('fill', '#F46C23')//d => colorScale(d.rank))
          .attr('opacity', 0.3)
          .attr('transform', d => `translate(${scaleX(d.rank)}, ${breakPoints.highSchool})`)
          .transition()
          .duration(5000)
          .delay((d, i) => Math.random() * 25000)
          .ease(d3.easeBounceOut)
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
