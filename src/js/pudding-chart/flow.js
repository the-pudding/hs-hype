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
    let timer = null
		// dimension stuff
		let width = 0;
		let height = 0;
    let radius = 3
    let rectHeight = 0
		const marginTop = 32;
		const marginBottom = 32;
		const marginLeft = 32;
		const marginRight = 32;
    const padding = 8

    const topCount = data.filter(d => d.top === 1).length
    const underCount = data.filter(d => d.top === 0).length

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
    const bpKeys = Object.keys(breakPoints)

    let stopSectionWidth = null

    function bounce(h) {
      if (!arguments.length) h = 0.25;
      var b0 = 1 - h,
          b1 = b0 * (1 - b0) + b0,
          b2 = b0 * (1 - b1) + b1,
          x0 = 2 * Math.sqrt(h),
          x1 = x0 * Math.sqrt(h),
          x2 = x1 * Math.sqrt(h),
          t0 = 1 / (1 + x0 + x1 + x2),
          t1 = t0 + t0 * x0,
          t2 = t1 + t0 * x1,
          m0 = t0 + t0 * x0 / 2,
          m1 = t1 + t0 * x1 / 2,
          m2 = t2 + t0 * x2 / 2,
          a = 1 / (t0 * t0);
      return function(t) {
        return t >= 1 ? 1
            : t < t0 ? a * t * t
            : t < t1 ? a * (t -= m0) * t + b0
            : t < t2 ? a * (t -= m1) * t + b1
            : a * (t -= m2) * t + b2;
      };
    }

    const annotationData = [{
      rank: 1,
      text: '#1'
    }, {
      rank: 100,
      text: '#100'
    }]

		// scales
		const scaleX = d3.scaleLinear();
    const scaleXUnderdogs = d3.scaleLinear()
		const scaleY = null;

    const colorScale = d3.scaleSequential()
      .domain([100, 1])
      .interpolator(d3.interpolateCool)

		// dom elements
		let $svg = null;
    let $canvas = null
    let $context = null
		let $axis = null;
		let $vis = null;
    let $stops = null;
    let $labels = null
    let $annotations = null
    let rankAnn = null
    let underdogAnn = null

    // animation constants
    //let ease = d3.easeBounceOut()
    let duration = 5000
    let delay = function(d){
      return Math.random() * 25000
    }
    let maxDelay = 25000
    let timeScale = d3.scaleLinear()
      .domain([0, duration])
      .range([0, 1])
      .clamp(true)


		// helper functions

    let topPass = bpKeys.map((d, i) => {
      return {level: d, passed: []}
    })
    const topPassMap = d3.map(topPass, d => d.level)

    let underPass = bpKeys.map((d, i) => {
      return {level: d, passed: []}
    })
    const underPassMap = d3.map(underPass, d => d.level)
    //topPassMap.get('highSchool').passed.push("test")

    let collegePass = []
    let percentSelectors = {
      college: {},
      draft: {},
      rookie: {},
      bad: {},
      good: {},
      great: {},
      allstar: {}
    }
    // bpKeys.map(d => {
    //   return {[d]: []}
    // })

    function updateAllPercent(d){
      const top = d.top
      if (d.coll <= 2 & d.y >= height * breakPoints.college) updatePercent(d, 'college', top)
      if (d.draft <= 2 & d.y >= height * breakPoints.draft) updatePercent(d, 'draft', top)
      if (d.rookie <= 2 & d.y >= height * breakPoints.rookie) updatePercent(d, 'rookie', top)
      if (d.bad <= 2 & d.y >= height * breakPoints.bad) updatePercent(d, 'bad', top)
      if (d.good <= 2 & d.y >= height * breakPoints.good) updatePercent(d, 'good', top)
      if (d.great <= 2 & d.y >= height * breakPoints.great) updatePercent(d, 'great', top)
      if (d.allstar <= 2 & d.y >= height * breakPoints.allstar) updatePercent(d, 'allstar', top)
    }

    function updatePercent(d, level, top){
      if (level === 'college') d.coll = 3
      else d[level] = 3
        if (top === 1){
          topPassMap.get(level).passed.push(1)
          const len = topPassMap.get(level).passed.length
          const sel = percentSelectors[level].top
          sel.text(`${Math.round(len / topCount * 100, 0)} %`)
        }

        if (top === 0){
          underPassMap.get(level).passed.push(1)
          const len = underPassMap.get(level).passed.length
          const sel = percentSelectors[level].bottom
          sel.text(`${Math.round(len / underCount * 100, 0)} %`)
        }

        // if (top === 0){
        //   if (point.y >= height * breakPoints[level]) passedLevel = true
        //   if (lastPassed === false && passedLevel === true) {
        //     topPassMap.get(level).passed.push(1)
        //     const len = topPassMap.get(level).passed.length
        //     const sel = $svg.selectAll(`.percentage__underdog-${level}`)
        //     sel.text(`${Math.round(len / topCount * 100, 0)} %`)
        //   }
        // }
    }

    function drawCircles(point){
      $context.clearRect(0, 0, width + marginLeft + marginRight, height + marginTop + marginBottom)
      data.forEach(function(d){
          if (d.top === 0){
            $context.fillStyle = 'rgba(83, 113, 171, 0.3)'
          } else {
            $context.fillStyle = 'rgba(244, 108, 35, 0.3)'
          }
        $context.beginPath()
        let xPos = null
        if (d.top == 0){
          xPos = (width - stopSectionWidth) + scaleXUnderdogs(d.underRank)
        } else xPos = scaleX(d.rank)
        $context.moveTo(xPos, d.y)
        $context.arc(xPos, d.y, radius, 0, 2 * Math.PI)
        $context.fill()
      })
    }

    function moveCircles(t){
      data.forEach(d => {
        const del = d.trans.delay
        let time = d3.easeBounceOut(timeScale(t - d.trans.delay))
        d.y = d.trans.i(time)
        updateAllPercent(d)
        //updatePercent(d)
        const yPos = d.y
      })
      drawCircles()
      if(t >= duration + maxDelay) {
        timer.stop()
      }
    }


		const Chart = {
			// called once at start
			init() {
        $canvas = $sel.append('canvas').attr('class', 'pudding-chart-canvas')
        $context = $canvas.node().getContext('2d')


				$svg = $sel.append('svg').attr('class', 'pudding-chart');


        const $allLabels = $svg.append('g').attr('class', 'g-labels')

        $allLabels.attr('transform', `translate(0, ${marginTop})`)

				const $g = $svg.append('g');

        $annotations = $g.append('g').attr('class', 'g-annotations')

        const $allStops = $svg.append('g').attr('class', 'g-stops')


        $labels = $allLabels.selectAll('.g-label')
          .data(bpKeys)
          .enter()
          .append('g')
          .attr('class', d => `g-label g-label-${d}`)

        $labels
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

        $labels
          .append('text')
          .attr('class', d => `percentage percentage__top percentage__top-${d}`)
          .text(d => d === 'highSchool' ? '' : '0%')
          .attr('alignment-baseline', 'middle')
          .attr('text-anchor', 'end')

        $labels
          .append('text')
          .attr('class', d => `percentage percentage__underdog percentage__underdog-${d}`)
          .text(d => d === 'highSchool' ? '' : '0%')
          .attr('alignment-baseline', 'middle')
          .attr('text-anchor', 'start')

        percentSelectors.college.top = $svg.selectAll('.percentage__top-college')
        percentSelectors.college.bottom = $svg.selectAll('.percentage__underdog-college')
        percentSelectors.draft.top = $svg.selectAll('.percentage__top-draft')
        percentSelectors.draft.bottom = $svg.selectAll('.percentage__underdog-draft')
        percentSelectors.rookie.top = $svg.selectAll('.percentage__top-rookie')
        percentSelectors.rookie.bottom = $svg.selectAll('.percentage__underdog-rookie')
        percentSelectors.bad.top = $svg.selectAll('.percentage__top-bad')
        percentSelectors.bad.bottom = $svg.selectAll('.percentage__underdog-bad')
        percentSelectors.good.top = $svg.selectAll('.percentage__top-good')
        percentSelectors.good.bottom = $svg.selectAll('.percentage__underdog-good')
        percentSelectors.great.top = $svg.selectAll('.percentage__top-great')
        percentSelectors.great.bottom = $svg.selectAll('.percentage__underdog-great')
        percentSelectors.allstar.top = $svg.selectAll('.percentage__top-allstar')
        percentSelectors.allstar.bottom = $svg.selectAll('.percentage__underdog-allstar')

				$vis = $g.append('g').attr('class', 'g-vis');


        rankAnn = $annotations
          .selectAll('.annotations__rank')
          .data(annotationData)
          .enter()
          .append('g')
          .attr('class', 'annotations__rank')
          .raise()

        rankAnn
          .append('circle')
          .attr('r', radius + 1)

        rankAnn
          .append('text')
          .text(d => d.text)
          .attr('alignment-baseline', 'baseline')
          .attr('text-anchor', 'middle')

        rankAnn
          .append('line')
          .attr('x1', 0)
          .attr('x2', 0)

        underdogAnn = $annotations
          .append('g')
          .attr('class', 'annotations__underdog')


        underdogAnn
          .append('text')
          .text('not in Top 100')
          .attr('alignment-baseline', 'middle')
          .attr('text-anchor', 'middle')

        underdogAnn
          .append('line')
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('x1', 0)

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

        $canvas
          .attr('width', width + marginLeft + marginRight)
          .attr('height', height + marginTop + marginBottom);

        stopSectionWidth = width * 0.25

        scaleX
          .range([marginLeft, width - stopSectionWidth - padding])
          .domain([1, 100])

        scaleXUnderdogs
          .range([stopSectionWidth + marginLeft, 0])
          .domain([0, 1])

        rectHeight = height * 0.05

        $labels.selectAll('.label')
          .attr('transform', (d, i) => `translate(${(width - stopSectionWidth) / 2}, ${(height * breakPoints[d]) - (rectHeight / 2)})`)

        $labels.selectAll('.percentage__top')
          .attr('transform', (d, i) => `translate(${width - stopSectionWidth - padding}, ${(height * breakPoints[d]) - (rectHeight / 2)})`)

        $labels.selectAll('.percentage__underdog')
          .attr('transform', (d, i) => `translate(${width - stopSectionWidth}, ${(height * breakPoints[d]) - (rectHeight / 2)})`)

        rankAnn.attr('transform', d =>`translate(${scaleX(d.rank)}, ${marginTop + (height * breakPoints.highSchool)})`)

        rankAnn.selectAll('line')
          .attr('y1', d => breakPoints.highSchool - (rectHeight / 2) + (radius / 2))
          .attr('y2', d => -radius)

        rankAnn.selectAll('text').attr('transform', `translate(0, ${ - (rectHeight / 2)})`)

        underdogAnn.attr('transform', d =>`translate(${(width - stopSectionWidth)}, ${marginTop + (height * breakPoints.highSchool)})`)

        underdogAnn.selectAll('text').attr('transform', d =>`translate(${scaleXUnderdogs(0.5)}, ${ - (rectHeight / 2)})`)

        underdogAnn.selectAll('line').attr('x2', stopSectionWidth - radius)
          // setup data for canvas
          data.forEach(d => {
            //const yPos = height * breakPoints[d.highest] + marginTop
            d.y = height * breakPoints[d.highest] + marginTop,

            d.trans = {
              i: d3.interpolate(marginTop, d.y),
              delay: delay(d)
            }
            if (d.trans.delay > maxDelay) {
              maxDelay = d.trans.delay
            }

          })

				return Chart;
			},
			// update scales and render chart
			render() {

        timer = d3.timer(moveCircles)

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
