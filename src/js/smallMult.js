import loadData from './load-data'
import './pudding-chart/smallMult_template'

let data = []
let $sel = []

// selections
const $container = d3.select('.smallMultiples')

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
  const nested = d3.nest()
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

  console.log({nested})

  const charts = $container
    .selectAll('.multiple')
    .data(nested)
    .enter()
    .append('div')
    .attr('class', 'multiple')
    .smallMultiple()
}

function init() {
	Promise.all([loadData()])
			.then((results) => {
				data = results[0]
        setupChart()
			})
			.catch(err => console.log(err))
}

export default { init, resize };
