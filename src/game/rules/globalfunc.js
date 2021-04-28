
const newId = (type) => {
    let idTypes = [
      "op", "mat", "game", "mod", "prod", "wood", "stateRep", "part",
      "opCut", "opSort", "shape", "port", "connection", "DOMS", "opBuild", "opMuda"
      
    ]

    let int = Math.round(Math.random()*Math.pow(10,10))
    // console.log(this.idTypes)
    // save to list?

    if(idTypes.includes(type)) {
      let id = `${type}_${int}`
      // console.log(id)

      return id
    } else {
      console.log("wrong type of ID")
    }

  }