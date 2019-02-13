import loadData from './load-data'

let data = []

function resize() {}

function init() {
	Promise.all([loadData()])
			.then((results) => {
				data = results[0]
				console.log({data, results})
				//$h2h.each(setupH2H)
			})
			.catch(err => console.log(err))
}

export default { init, resize };
