
function cleanData(arr){
  return arr.map((d, i) => {
    return {
      ...d,
      rank: +d.rank,
      draft_year: +d.draft_year,
      draft_rd: +d.draft_rd,
      draft_pk: +d.draft_pk,
      recruit_year: +d.recruit_year,
      top: +d.top,
      highSchool: d.highSchool === "" ? "" : +d.highSchool,
      coll: d.coll === "" ? "" : +d.coll,
      draft: d.draft === "" ? "" : +d.draft,
      rookie: d.rookie === "" ? "" : +d.rookie,
      success: +d.success,
      underRank: +d.top === 0 ? Math.random() : ""
    }
  })
}


function loadShades(){
  const file = 'assets/data/shades.csv'

  return new Promise((resolve, reject) => {
    d3.loadData(file, (err, response) => {
      if(err) reject(err)
      shadeData = cleanData(response[0])
      resolve(shadeData)
    })
  })

}


function init(){
  return new Promise((resolve, reject) => {
    d3.csv('assets/data/playerPaths.csv')
      .then(response => {
          const data = cleanData(response)
          resolve(data)
        })
      .catch(error => console.log("error loading data"))
})



  // d3.csv('assets/data/playerPaths.csv')
  //   .then(function(response){
  //     const data = cleanData(response)
  //
  //     return data
  //   })
  //   .catch(error => console.log("error loading data"))
}

export default init
