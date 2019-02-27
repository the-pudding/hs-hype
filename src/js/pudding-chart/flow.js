/*
 USAGE (example: line chart)
 1. c+p this template to a new file (line.js)
 2. change puddingChartName to puddingChartLine
 3. in graphic file: import './pudding-chart/line'
 4a. const charts = d3.selectAll('.thing').data(data).puddingChartLine();
 4b. const chart = d3.select('.thing').datum(datum).puddingChartLine();
*/

import annotations from '../annotations';

d3.selection.prototype.createFlow = function init() {
	function createChart(el) {
		const $sel = d3.select(el);
		const { filter } = $sel.datum();
		const masterData = $sel.datum().filteredData;
		let data = masterData.map(d => ({
			...d,
			annotate: !!annotations.find(
				a => a.link === d.link && a.filter === filter
			)
		}));

		data.sort((a, b) => d3.ascending(a.annotate, b.annotate));

		let circleData = null;
		let elapsedTime = null;
		let timer = null;
		const DPR = window.devicePixelRatio
			? Math.min(window.devicePixelRatio, 2)
			: 1;

		// dimension stuff
		let width = 0;
		let height = 0;
		let rectHeight = 0;
		const radius = 3;
		const marginTop = 32;
		const marginBottom = 0;
		const marginLeft = 42;
		const marginRight = 24;
		const padding = 8;

		const topCount = masterData.filter(d => d.top === 1).length;
		const underCount = masterData.filter(d => d.top === 0).length;

		const breakPoints = {
			highSchool: 0 / 8,
			college: 1 / 8,
			draft: 2 / 8,
			rookie: 3 / 8,
			bad: 4 / 8,
			good: 5 / 8,
			great: 6 / 8,
			allstar: 7 / 8
		};
		const bpKeys = Object.keys(breakPoints);

		let stopSectionWidth = null;

		const annotationData = [
			{
				rank: 1,
				text: '#1'
			},
			{
				rank: 100,
				text: '#100'
			}
		];

		const annotationData10 = [
			{
				rank: 1,
				text: '#1'
			},
			{
				rank: 10,
				text: '#10'
			}
		];

		// scales
		const scaleX = d3.scaleLinear();
		const scaleXUnderdogs = d3.scaleLinear();

		// dom elements
		let $svg = null;
		let $canvas = null;
		let $context = null;
		let $labels = null;
		let $annotations = null;
		let rankAnn = null;
		let underdogAnn = null;
		let $bg = null;

		const delayScale = d3
			.scaleLinear()
			.domain([30, 2000])
			.range([3000, 15000]);

		const duration = 5000;

		let maxDelay = delayScale(data.length);

		const timeScale = d3
			.scaleLinear()
			.domain([0, duration])
			.range([0, 1])
			.clamp(true);

		// helper functions
		let topPass = null;
		let topPassMap = null;

		let underPass = null;
		let underPassMap = null;

		const percentSelectors = {
			college: {},
			draft: {},
			rookie: {},
			bad: {},
			good: {},
			great: {},
			allstar: {}
		};

		const countSelectors = {
			college: {},
			draft: {},
			rookie: {},
			bad: {},
			good: {},
			great: {},
			allstar: {}
		};

		function resetPercent() {
			d3.selectAll('.percentage').text(d => (d === 'highSchool' ? '' : '0%'));

			d3.selectAll('.count').text(d => {
				if (d === 'highSchool') return '';
				if (d === 'college') return '0 players';
				return '0';
			});

			topPass = bpKeys.map((d, i) => ({ level: d, passed: [] }));
			topPassMap = d3.map(topPass, d => d.level);

			underPass = bpKeys.map((d, i) => ({ level: d, passed: [] }));
			underPassMap = d3.map(underPass, d => d.level);
		}

		function updateAllPercent(d) {
			const top = d.top;
			if (
				(d.coll <= 2) &
				(d.y >= height * breakPoints.college + marginTop * DPR)
			)
				updatePercent(d, 'college', top);
			if ((d.draft <= 2) & (d.y >= height * breakPoints.draft))
				updatePercent(d, 'draft', top);
			if ((d.rookie <= 2) & (d.y >= height * breakPoints.rookie))
				updatePercent(d, 'rookie', top);
			if ((d.bad <= 2) & (d.y >= height * breakPoints.bad))
				updatePercent(d, 'bad', top);
			if ((d.good <= 2) & (d.y >= height * breakPoints.good))
				updatePercent(d, 'good', top);
			if ((d.great <= 2) & (d.y >= height * breakPoints.great))
				updatePercent(d, 'great', top);
			if ((d.allstar <= 2) & (d.y >= height * breakPoints.allstar))
				updatePercent(d, 'allstar', top);
		}

		function updatePercent(d, level, top) {
			if (level === 'college') d.coll = 3;
			else d[level] = 3;

			if (top === 1) {
				topPassMap.get(level).passed.push(1);
				const len = topPassMap.get(level).passed.length;
				const sel = percentSelectors[level].top;
				const per = Math.round((len / topCount) * 100, 0);
				const count = countSelectors[level].top;
				sel.text(per < 1 ? '<1 %' : `${per} %`);
				count.text(level === 'college' ? `${len} players` : `${len}`);
			}

			if (top === 0) {
				underPassMap.get(level).passed.push(1);
				const len = underPassMap.get(level).passed.length;
				const sel = percentSelectors[level].bottom;
				const per = Math.round((len / underCount) * 100, 0);
				sel.text(per < 1 ? '<1 %' : `${per} %`);
				const count = countSelectors[level].bottom;
				count.text(level === 'college' ? `${len} players` : `${len}`);
			}
		}

		function getDelay(d) {
			return Math.random() * delayScale(data.length);
		}

		function drawCircles(point) {
			$context.clearRect(
				0,
				0,
				width + marginLeft * DPR + marginRight * DPR,
				height + marginTop + marginBottom
			);
			circleData.forEach(d => {
				if (d.top === 0) {
					$context.fillStyle = 'rgba(83, 113, 171, 0.3)';
				} else {
					$context.fillStyle = 'rgba(244, 108, 35, 0.3)';
				}
				$context.beginPath();
				let xPos = null;
				if (d.top === 0) {
					xPos = scaleXUnderdogs(d.underRank);
				} else xPos = scaleX(d.rank);
				$context.moveTo(xPos, d.y);
				$context.arc(xPos, d.y, radius * DPR, 0, 2 * Math.PI);
				$context.fill();
				if (d.y === marginTop * DPR) {
					$context.fillStyle = 'rgba(149, 117, 81, 0)';
					$context.strokeStyle = 'rgba(149, 117, 81, 0)';
				} else if (d.y > 64 && d.y < d.maxY) {
					$context.fillStyle = 'rgba(149, 117, 81, 0.25)';
					$context.strokeStyle = 'rgba(149, 117, 81, 0.25)';
				} else if (d.y === d.maxY) {
					$context.fillStyle = 'rgba(149, 117, 81, 1)';
					$context.strokeStyle = 'rgba(149, 117, 81, 1)';
				}
				$context.font = `${14 * DPR}px "National 2 Narrow Web"`;
				$context.textBaseline = 'hanging';
				$context.textAlign = 'center';
				if (d.annotate) {
					$context.fillText(d.name, xPos, d.y + padding * DPR);
					$context.beginPath();
					$context.arc(xPos, d.y, (radius + 1) * DPR, 0, 2 * Math.PI);
					$context.stroke();
				}
			});
		}

		function setupCircleData() {
			circleData = data.map(d => ({ ...d }));
			circleData.forEach(d => {
				d.trans = { delay: getDelay(d) };
			});

			circleData.forEach(d => {
				// const yPos = height * breakPoints[d.highest] + marginTop
				d.y = height * breakPoints[d.highest] + marginTop * DPR;
				d.maxY = d.y;
				d.trans.duration = (d.maxY / height) * duration;
				d.trans.i = d3.interpolate(marginTop * DPR, d.y);

				if (d.trans.delay > maxDelay) {
					maxDelay = d.trans.delay;
				}
			});
		}

		function moveCircles(t) {
			elapsedTime = t;
			circleData.forEach(d => {
				const progress = Math.max(0, t - d.trans.delay);
				const delta = Math.min(1, progress / d.trans.duration);

				const time = d3.easeBounceOut(delta);
				d.y = d.trans.i(time);
				updateAllPercent(d);
			});
			drawCircles();
			if (t >= duration + maxDelay) {
				timer.stop();
			}
		}

		const Chart = {
			// called once at start
			init() {
				setupCircleData();

				$canvas = $sel.append('canvas').attr('class', 'pudding-chart-canvas');
				$context = $canvas.node().getContext('2d');

				$svg = $sel.append('svg').attr('class', 'pudding-chart');

				$bg = $svg.append('g').attr('class', 'g-bg');

				const $allLabels = $svg.append('g').attr('class', 'g-labels');

				$allLabels.attr('transform', `translate(0, ${marginTop})`);

				const $g = $svg.append('g');

				$annotations = $g.append('g').attr('class', 'g-annotations');

				const $allStops = $svg.append('g').attr('class', 'g-stops');

				$bg.append('rect').attr('class', 'bg-block');
				$bg.append('text').text('NBA career');

				$labels = $allLabels
					.selectAll('.g-label')
					.data(bpKeys)
					.enter()
					.append('g')
					.attr('class', d => `g-label g-label-${d}`);

				$labels
					.append('text')
					.attr('class', 'label')
					.text(d => {
						if (d === 'highSchool') return 'high school rank';
						if (d === 'bad') return 'below average';
						if (d === 'good') return 'mediocre';
						if (d === 'great') return 'great';
						if (d === 'allstar') return 'superstar';
						if (d === 'draft') return 'drafted';
						if (d === 'rookie') return '< 2 years in NBA';
						return d;
					})
					.attr('alignment-baseline', 'middle')
					.attr('text-anchor', 'middle');

				$labels
					.append('text')
					.attr('class', d => `percentage percentage__top percentage__top-${d}`)
					.text(d => (d === 'highSchool' ? '' : '0%'))
					.attr('alignment-baseline', 'middle')
					.attr('text-anchor', 'end');

				$labels
					.append('text')
					.attr('class', d => `count count__top count__top-${d}`)
					.text(d => {
						if (d === 'highSchool') return '';
						if (d === 'college') return '0 players';
						return '0';
					})
					.attr('alignment-baseline', 'middle')
					.attr('text-anchor', 'end');

				if (
					filter != 'ranked' &&
					filter != 'top10' &&
					filter != 'skipCollege'
				) {
					$labels
						.append('text')
						.attr(
							'class',
							d => `percentage percentage__underdog percentage__underdog-${d}`
						)
						.text(d => {
							if (d === 'highSchool') return '';
							if (d === 'college') return '0 players';
							return '0';
						})
						.attr('alignment-baseline', 'middle')
						.attr('text-anchor', 'start');

					$labels
						.append('text')
						.attr('class', d => `count count__underdog count__underdog-${d}`)
						.text(d => (d === 'highSchool' ? '' : '0'))
						.attr('alignment-baseline', 'middle')
						.attr('text-anchor', 'start');
				}

				percentSelectors.college.top = $svg.selectAll(
					'.percentage__top-college'
				);
				percentSelectors.college.bottom = $svg.selectAll(
					'.percentage__underdog-college'
				);
				percentSelectors.draft.top = $svg.selectAll('.percentage__top-draft');
				percentSelectors.draft.bottom = $svg.selectAll(
					'.percentage__underdog-draft'
				);
				percentSelectors.rookie.top = $svg.selectAll('.percentage__top-rookie');
				percentSelectors.rookie.bottom = $svg.selectAll(
					'.percentage__underdog-rookie'
				);
				percentSelectors.bad.top = $svg.selectAll('.percentage__top-bad');
				percentSelectors.bad.bottom = $svg.selectAll(
					'.percentage__underdog-bad'
				);
				percentSelectors.good.top = $svg.selectAll('.percentage__top-good');
				percentSelectors.good.bottom = $svg.selectAll(
					'.percentage__underdog-good'
				);
				percentSelectors.great.top = $svg.selectAll('.percentage__top-great');
				percentSelectors.great.bottom = $svg.selectAll(
					'.percentage__underdog-great'
				);
				percentSelectors.allstar.top = $svg.selectAll(
					'.percentage__top-allstar'
				);
				percentSelectors.allstar.bottom = $svg.selectAll(
					'.percentage__underdog-allstar'
				);

				countSelectors.college.top = $svg.selectAll('.count__top-college');
				countSelectors.college.bottom = $svg.selectAll(
					'.count__underdog-college'
				);
				countSelectors.draft.top = $svg.selectAll('.count__top-draft');
				countSelectors.draft.bottom = $svg.selectAll('.count__underdog-draft');
				countSelectors.rookie.top = $svg.selectAll('.count__top-rookie');
				countSelectors.rookie.bottom = $svg.selectAll(
					'.count__underdog-rookie'
				);
				countSelectors.bad.top = $svg.selectAll('.count__top-bad');
				countSelectors.bad.bottom = $svg.selectAll('.count__underdog-bad');
				countSelectors.good.top = $svg.selectAll('.count__top-good');
				countSelectors.good.bottom = $svg.selectAll('.count__underdog-good');
				countSelectors.great.top = $svg.selectAll('.count__top-great');
				countSelectors.great.bottom = $svg.selectAll('.count__underdog-great');
				countSelectors.allstar.top = $svg.selectAll('.count__top-allstar');
				countSelectors.allstar.bottom = $svg.selectAll(
					'.count__underdog-allstar'
				);

				$g.append('g').attr('class', 'g-vis');

				rankAnn = $annotations
					.selectAll('.annotations__rank')
					.data(filter === 'top10' ? annotationData10 : annotationData)
					.enter()
					.append('g')
					.attr('class', 'annotations__rank')
					.raise();

				// rankAnn.append('circle').attr('r', radius + 1);

				rankAnn
					.append('text')
					.text(d => d.text)
					.attr('alignment-baseline', 'baseline')
					.attr('text-anchor', 'middle');

				// rankAnn
				//   .append('line')
				//   .attr('x1', 0)
				//   .attr('x2', 0)

				if (
					filter != 'ranked' &&
					filter != 'top10' &&
					filter != 'skipCollege'
				) {
					underdogAnn = $annotations
						.append('g')
						.attr('class', 'annotations__underdog');

					underdogAnn
						.append('text')
						.text('not in Top 100')
						// .attr('alignment-baseline', 'hanging')
						.attr('text-anchor', 'middle');
					//
					// underdogAnn
					//   .append('line')
					//   .attr('y1', 0)
					//   .attr('y2', 0)
					//   .attr('x1', 0)
				}

				Chart.resize();
				// Chart.render();
			},
			// on resize, update new dimensions
			resize() {
				// defaults to grabbing dimensions from container element
				const normalWidth = $sel.node().offsetWidth; // - marginLeft - marginRight
				width = normalWidth * DPR;
				const normalHeight = $sel.node().offsetHeight; // - marginTop - marginBottom
				height = normalHeight * DPR;

				$svg.attr('width', width / DPR).attr('height', height / DPR);

				$canvas
					.attr('width', width)
					.attr('height', height)
					.style('width', `${width / DPR}px`)
					.style('height', `${height / DPR}px`);

				stopSectionWidth = width * 0.25;

				if (filter === 'ranked' || filter === 'skipCollege') {
					scaleX
						.range([marginLeft * DPR, width - marginRight * DPR])
						.domain([1, 100]);

					scaleXUnderdogs.range([0, 0]).domain([0, 0]);
				} else if (filter === 'top10') {
					scaleX
						.range([marginLeft * DPR, width - marginRight * DPR])
						.domain([1, 10]);

					scaleXUnderdogs.range([0, 0]).domain([0, 0]);
				} else {
					scaleX
						.range([
							marginLeft * DPR,
							width - stopSectionWidth - padding - marginRight * DPR
						])
						.domain([1, 100]);

					scaleXUnderdogs
						.range([width - stopSectionWidth, width - marginRight * DPR])
						.domain([0, 1]);
				}

				$bg
					.selectAll('.bg-block')
					.attr('width', (width + marginLeft + marginRight) / DPR)
					.attr('height', height / DPR - (height / DPR) * breakPoints.rookie)
					.attr('x', 0)
					.attr('y', (height / DPR) * breakPoints.bad)
					.lower()
					.attr('transform', `translate(${(marginLeft * DPR, 0)})`);

				$bg
					.selectAll('text')
					.attr(
						'transform',
						`translate(${marginLeft / 2}, ${((height / DPR) * 6) /
							8})rotate(-90)`
					)
					.attr('text-anchor', 'middle');

				rectHeight = height * 0.05;

				$labels.selectAll('.label').attr('transform', (d, i) => {
					let xPos = null;
					if (
						filter == 'ranked' ||
						filter == 'top10' ||
						filter == 'skipCollege'
					)
						xPos = width / 2 / DPR;
					else xPos = (width - stopSectionWidth) / 2 / DPR;

					return `translate(${xPos}, ${(height * breakPoints[d]) / DPR -
						rectHeight / 2 / DPR})`;
				});

				$labels.selectAll('.percentage__top').attr('transform', (d, i) => {
					let xPos = null;
					if (
						filter == 'ranked' ||
						filter == 'top10' ||
						filter == 'skipCollege'
					)
						xPos = width / DPR - marginRight;
					else xPos = (width - stopSectionWidth - padding) / DPR - marginRight;

					return `translate(${xPos}, ${(height / DPR) * breakPoints[d] -
						rectHeight / 2 / DPR})`;
				});

				$labels.selectAll('.count__top').attr('transform', (d, i) => {
					let xPos = null;
					if (
						filter == 'ranked' ||
						filter == 'top10' ||
						filter == 'skipCollege'
					)
						xPos = width / DPR - marginRight;
					else xPos = (width - stopSectionWidth - padding) / DPR - marginRight;

					return `translate(${xPos}, ${(height / DPR) * breakPoints[d] +
						rectHeight / 2 / DPR})`;
				});

				rankAnn.attr(
					'transform',
					d =>
						`translate(${scaleX(d.rank) / DPR}, ${marginTop +
							(height / DPR) * breakPoints.highSchool})`
				);

				// rankAnn.selectAll('line')
				//   .attr('y1', d => ((height * breakPoints.highSchool) - (rectHeight / 2) + (radius / 2)) / DPR)
				//   .attr('y2', d => -radius)

				rankAnn
					.selectAll('text')
					.attr('transform', `translate(0, ${-(rectHeight / 2 / DPR)})`);

				if (
					filter != 'ranked' &&
					filter != 'top10' &&
					filter != 'skipCollege'
				) {
					underdogAnn.attr(
						'transform',
						d =>
							`translate(0, ${marginTop +
								(height / DPR) * breakPoints.highSchool})`
					);

					underdogAnn
						.selectAll('text')
						.attr(
							'transform',
							d =>
								`translate(${scaleXUnderdogs(0.5) / DPR}, ${-(rectHeight / 2)})`
						);

					// underdogAnn.selectAll('line').attr('x2', stopSectionWidth - radius)

					$labels
						.selectAll('.percentage__underdog')
						.attr(
							'transform',
							(d, i) =>
								`translate(${(width - stopSectionWidth) / DPR}, ${(height *
									breakPoints[d]) /
									DPR -
									rectHeight / 2 / DPR})`
						);

					$labels
						.selectAll('.count__underdog')
						.attr(
							'transform',
							(d, i) =>
								`translate(${(width - stopSectionWidth) / DPR}, ${(height *
									breakPoints[d]) /
									DPR +
									rectHeight / 2 / DPR})`
						);
				}

				// setup data for canvas
				circleData.forEach(d => {
					// const yPos = height * breakPoints[d.highest] + marginTop
					d.y = height * breakPoints[d.highest] + marginTop * DPR;
					d.maxY = d.y;
					d.trans.duration = (d.maxY / height) * duration;
					d.trans.i = d3.interpolate(marginTop * DPR, d.y);

					if (d.trans.delay > maxDelay) {
						maxDelay = d.trans.delay;
					}
				});
				moveCircles(0);

				return Chart;
			},
			// update scales and render chart
			render() {
				if (timer) timer.stop();
				setupCircleData();
				resetPercent();
				timer = d3.timer(moveCircles);

				// timer.restart()

				return Chart;
			},
			pause() {
				if (timer) {
					timer.stop();
					moveCircles(duration + maxDelay);
				}
			},
			// get / set data
			data(val) {
				if (!arguments.length) return data;
				data = val;
				$sel.datum(data);
				// Chart.render();
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
