import loadData from './load-data'
import './pudding-chart/smallMult_template'

let data = []
let $sel = []
let nested = null

// selections
const $container = d3.select('.smallMultiples')
const $keyContainer = d3.select('.multKey')

function resize(){}

function addLevels(leaves, level){
  let total = 0

  let nbaLevels = ['bad', 'good', 'great']

  let map = leaves.map(d => {
    if (nbaLevels.includes(level)) {
      if (level === 'bad') {
        if (d.bad != "" || d.good != "" || d.great != "" || d.allstar != "") total += 1
      }
      else if (level === 'good') {
        if (d.good != "" || d.great != "" || d.allstar != "") total += 1
      } else if (level === 'great') {
        if (d.great != "" || d.allstar != "") total += 1
      }
    }
    else if (d[level] != "") total += 1
  })
  return total
}

function setupChart(){
  const filtered = data.filter(d => +d.smallMult === 1)
  nested = d3.nest()
    .key(d => d.college)
    .rollup(leaves => {
      return [{
        'level': 'highSchool',
        'count' : addLevels(leaves, 'highSchool'),
        'percent': addLevels(leaves, 'highSchool') / addLevels(leaves, 'highSchool')//d3.sum(leaves, e => e.highSchool)
      },{
        'level': 'college',
        'count': addLevels(leaves, 'coll'),
        'percent': addLevels(leaves, 'coll') / addLevels(leaves, 'highSchool')
      },{
        'level': 'draft',
        'count' : addLevels(leaves, 'draft'),
        'percent': addLevels(leaves, 'draft') / addLevels(leaves, 'highSchool')
      },{
        'level': 'rookie',
        'count' : addLevels(leaves, 'rookie'),
        'percent': addLevels(leaves, 'rookie') / addLevels(leaves, 'highSchool')
      },{
        'level': 'bad',
        'count' : addLevels(leaves, 'bad'),
        'percent': addLevels(leaves, 'bad' ) / addLevels(leaves, 'highSchool')
      },{
        'level': 'good',
        'count' : addLevels(leaves, 'good'),
        'percent': addLevels(leaves, 'good' ) / addLevels(leaves, 'highSchool')
      },{
        'level': 'great',
        'count' : addLevels(leaves, 'great'),
        'percent': addLevels(leaves, 'great') / addLevels(leaves, 'highSchool')
      },{
        'level': 'allstar',
        'count' : addLevels(leaves, 'allstar'),
        'percent': addLevels(leaves, 'allstar') / addLevels(leaves, 'highSchool')
      }]
    })
    .entries(filtered)
    .sort((a, b) => d3.descending(a.value[0].count, b.value[0].count))

  const charts = $container
    .selectAll('.multiple')
    .data(nested)
    .enter()
    .append('div')
    .attr('class', 'multiple')
    .smallMultiple()
}

function setupKey(){
  const keyData = nested[0].value

  const scaleX = d3.scaleLinear()
    .range([1, 130])
    .domain([0, 100])

  const meta = $keyContainer.append('div')
    .attr('class', 'meta')

  const chart = $keyContainer.append('div')
    .attr('class', 'barChart')

  const barGroup = chart.selectAll('.g-bar')
    .data(keyData)
    .enter()
    .append('div')
    .attr('class', d => `g-bar g-bar-${d.level}`)

  barGroup.append('div')
    .attr('class', 'bar')
    .style('width', d => `${Math.round(scaleX(d.percent * 100))}px`)
    .style('height', '10px')

  barGroup.append('p')
    .attr('class', 'bar-label')
    .text(d => {
      if(d.level === 'highSchool') return 'high school'
      else if (d.level === 'bad') return 'below average NBA career'
      else if (d.level === 'good') return 'mediocre NBA career'
      else if (d.level === 'great') return 'great NBA career'
      else if (d.level === 'allstar') return 'superstar NBA career'
      else if (d.level === 'draft') return `drafted`
      else if (d.level === 'rookie') return `< 2 years in NBA`
      else return d.level})


}

function init() {
	Promise.all([loadData()])
			.then((results) => {
				data = results[0]
        setupChart()
        setupKey()
			})
			.catch(err => console.log(err))
}

export default { init, resize };
