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

    // animation constants
    //let ease = d3.easeBounceOut()
    let duration = 5000
    let delay = function(d){
      return Math.random() * 25000
    }
    let maxDelay = 0
    let timeScale = d3.scaleLinear()
      .domain([0, duration])
      .range([0, 1])


		// helper functions

    let topPass = bpKeys.map((d, i) => {
      const selTop = `$${d}PerTop`
      const selUnder = `$${d}PerUnder`
      return {level: d, passed: []}
    })
    const topPassMap = d3.map(topPass, d => d.level)

    //topPassMap.get('highSchool').passed.push("test")

    let collegePass = []
    // bpKeys.map(d => {
    //   return {[d]: []}
    // })

    function updatePercent(point, level, top, passedLevel){
      console.log("updating percent")
        let lastPassed = passedLevel
        passedLevel = false
        if (top === 1){
          if (point.y >= height * breakPoints[level]) passedLevel = true
          if (lastPassed === false && passedLevel === true) {
            topPassMap.get(level).passed.push(1)
            const len = topPassMap.get(level).passed.length
            const string = `$${level}PerTop`
            const sel = $svg.selectAll(`.percentage__top-${level}`)
            sel.text(`${Math.round(len / topCount * 100, 0)} %`)
          }
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
      $context.clearRect(0, 0, width, height)
      data.forEach(function(d){
          if (d.top === 0){
            $context.fillStyle = '#5371AB'
          } else {
            $context.fillStyle = '#F46C23'
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
        let time = d3.easeCubic(timeScale(t - d.trans.delay))
        //console.log({time})
        // to fix: why is y still undefined?
        d.y = d.trans.i(time)
      })
      drawCircles()
      if(t >= duration + maxDelay) {
        return true
      }
    }


    function translateAlong(path, top){
      let passedLevel = false
			let length = path.getTotalLength(); // Get the length of the path
			let r = d3.interpolate(0, length); //Set up interpolation from 0 to the path length
			return function(t){
				let point = path.getPointAtLength(r(t));
        //let lastPassed = passedCollege
        //passedCollege = false

        updatePercent(point, 'college', top, passedLevel)
        //updatePercent(point, 'draft', top)
        // console.log({topPass})
        //console.log({lastPassed, passedCollege})
        // if (top === 1){
        //   if (point.y >= height * breakPoints.college) passedCollege = true
        //   if (lastPassed === false && passedCollege === true) {
        //     collegePass.push(t)
        //     const numCol = collegePass.length
        //     $collegePerTop.text(`${Math.round(numCol/topCount * 100, 0)}%`)
        //   }
        // }

        // //const test = $labels.selectAll('.g-label-college').select('.percentage__top')
        // console.log({test})
          //.text(`${collegePass.length}`)

        // Get the next point along the path
        return `translate(${point.x}, ${point.y})`
			}
    }


		const Chart = {
			// called once at start
			init() {
        $canvas = $sel.append('canvas').attr('class', 'pudding-chart-canvas')
        $context = $canvas.node().getContext('2d')


				$svg = $sel.append('svg').attr('class', 'pudding-chart');


        const $allLabels = $svg.append('g').attr('class', 'g-labels')

        $allLabels.attr('transform', `translate(${marginLeft}, ${marginTop})`)

				const $g = $svg.append('g');

        $annotations = $g.append('g').attr('class', 'g-annotations')

				// offset chart for margins
				$g.attr('transform', `translate(${marginLeft}, ${marginTop})`);

				// create axis
				$axis = $svg.append('g').attr('class', 'g-axis');

        const $allStops = $svg.append('g').attr('class', 'g-stops')


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
          .text(d => d === 'highSchool' ? '' : 'x%')
          .attr('alignment-baseline', 'middle')
          .attr('text-anchor', 'end')

        $labels
          .append('text')
          .attr('class', d => `percentage percentage__underdog percentage__underdog-${d}`)
          .text(d => d === 'highSchool' ? '' : 'x%')
          .attr('alignment-baseline', 'middle')
          .attr('text-anchor', 'start')


        // const $collegePerTop = $svg.select('.percentage__top-college')
        // const $collegePerUnder = $labels.select('.percentage__underdog-college').node()
        // console.log({$collegePerTop})

        //$collegePerTop = $collegeLab.select('.percentage__top')
        //console.log({$collegeLab})
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

        $canvas
          .attr('width', width + marginLeft + marginRight)
          .attr('height', height + marginTop + marginBottom);

        stopSectionWidth = width * 0.25

        scaleX
          .range([0, width - stopSectionWidth - padding])
          .domain([1, 100])

        scaleXUnderdogs
          .range([stopSectionWidth, 0])
          .domain([0, 1])

        rectHeight = height * 0.05

        // scale up the stop boxes
        // $stops.selectAll('rect')
        //   .attr('width', stopSectionWidth)
        //   .attr('height', rectHeight)
        //   .attr('transform', (d, i) => `translate(0, ${(height * breakPoints[d]) - (rectHeight / 2)})`)
        $labels.selectAll('.label')
          .attr('transform', (d, i) => `translate(${width / 2}, ${(height * breakPoints[d]) - (rectHeight / 2)})`)

        $labels.selectAll('.percentage__top')
          .attr('transform', (d, i) => `translate(${width - stopSectionWidth - padding}, ${(height * breakPoints[d]) - (rectHeight / 2)})`)

        $labels.selectAll('.percentage__underdog')
          .attr('transform', (d, i) => `translate(${width - stopSectionWidth}, ${(height * breakPoints[d]) - (rectHeight / 2)})`)

          // setup data for canvas
          data.forEach(d => {
            const yPos = height * breakPoints[d.highest]
            d.y = height * breakPoints[d.highest],

            d.trans = {
              i: d3.interpolate(0, d.y),
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

        d3.timer(moveCircles)

        let sub = data.slice(0, 3)
        //let sub = data.filter(d => d.recruit_year >= 2005)
        // console.log({data, sub})

        const groups = $vis.selectAll('.player')
          .data(sub)
          .enter()
          .append('g')
          .attr('class', 'player')

        const dots = groups
          .append('circle')
          .attr('r', radius)
          .style('fill', d => d.top == 0 ? '#5371AB' : '#F46C23')//d => colorScale(d.rank))
          .attr('opacity', 0.3)
          .attr('transform', d => {
            let xPos = null
            if (d.top == 0){
              xPos = (width - stopSectionWidth) + scaleXUnderdogs(d.underRank)
            } else xPos = scaleX(d.rank)

            return `translate(${xPos}, ${breakPoints.highSchool})`})
          .transition()
          .duration(5000)
          .delay((d, i) => Math.random() * 25000)
          .ease(bounce(0.1))
          .attr('transform', d => {
            let xPos = null
            if (d.top == 0){
              xPos = (width - stopSectionWidth) + scaleXUnderdogs(d.underRank)
            } else xPos = scaleX(d.rank)

            return `translate(${xPos}, ${height * breakPoints[d.highest]})`})


          const annotationData = [{
            rank: 1,
            text: '#1'
          }, {
            rank: 100,
            text: '#100'
          }]

          const rankAnn = $annotations
            .selectAll('.annotations__rank')
            .data(annotationData)
            .enter()
            .append('g')
            .attr('class', 'annotations__rank')
            .attr('transform', d =>`translate(${scaleX(d.rank)}, ${breakPoints.highSchool})`)
            .raise()

          rankAnn
            .append('circle')
            .attr('r', radius + 1)

          rankAnn
            .append('text')
            .text(d => d.text)
            .attr('alignment-baseline', 'baseline')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(0, ${ - (rectHeight / 2)})`)

          rankAnn
            .append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', d => breakPoints.highSchool - (rectHeight / 2) + (radius / 2))
            .attr('y2', d => -radius)

          const underdogAnn = $annotations
            .append('g')
            .attr('class', 'annotations__underdog')
            .attr('transform', d =>`translate(${(width - stopSectionWidth)}, ${breakPoints.highSchool})`)

          underdogAnn
            .append('text')
            .text('not in Top 100')
            .attr('transform', d =>`translate(${scaleXUnderdogs(0.5)}, ${ - (rectHeight / 2)})`)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')

          underdogAnn
            .append('line')
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('x1', 0)
            .attr('x2', stopSectionWidth - radius)
            //.attr('transform', d => `translate(0, ${- (rectHeight / 4)})`)



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
