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
		const marginTop = 0;
		const marginBottom = 0;
		const marginLeft = 16;
		const marginRight = 16;

    const breakPoints = {
      highSchool: 1/5,
      college: 2/5,
      draft: 3/5,
      rookie: 4/5,
      success: 5/5
    }

    let stopSectionWidth = null

		// scales
		const scaleX = d3.scaleLinear();
    const scaleXSuccess = d3.scaleLinear()
		const scaleY = null;

		// dom elements
		let $svg = null;
		let $axis = null;
		let $vis = null;

		// helper functions

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
          .range([width, 0])
          .domain([1, 4])

				return Chart;
			},
			// update scales and render chart
			render() {
        let sub = data.slice(0, 100)
        console.log({sub})

        const paths = $vis.selectAll('.path__player')
          .data(sub)
          .enter()
          .append('path')
          .attr('class', 'path__player')
          .attr('d', function(d){
            let hsStopW = d.highSchool == 0 ? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.rank)
            let collStopH = d.highSchool > 0 ? height * breakPoints.college : height * breakPoints.highSchool
            let collStopW = d.coll == 0 || d.coll == "" ? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.rank)
            let draftStopW = d.draft == 0 || d.draft == "" ? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.draft_pk)
            let draftStopH = d.coll > 0 ? height * breakPoints.draft : height * breakPoints.college
            let rookieStopW = d.rookie == 0 || d.rookie == ""? stopSectionWidth / 2 : stopSectionWidth + scaleX(d.draft_pk)
            let rookieStopH = d.draft > 0 ? height * breakPoints.rookie : height * breakPoints.draft
            let successStopW = d.success == 0 || d.success == "" ? stopSectionWidth / 2 : stopSectionWidth + scaleXSuccess(d.success)
            let successStopH = d.draft > 0 ? height * breakPoints.success : height * breakPoints.draft
            const path = [
              // move over based on HS rank
              "M", [stopSectionWidth + scaleX(d.rank), 0],
              // move straight down to the top of the HS section
              "L", [hsStopW, height * breakPoints.highSchool],
              // move straight to the top of the college section
              "L", [collStopW, collStopH],
              // move straight to the top of the draft section
              "L", [draftStopW, draftStopH],
              // move straight to the rookie section
              "L", [rookieStopW, rookieStopH],
              // move to success section
              "L", [successStopW, successStopH]
            ]
            const joined = path.join(" ")
            return joined
          })

        console.log({sub})
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
