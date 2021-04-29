
    //use local storage to check if new or saved game should load
    // let fipr = JSON.parse(document.getElementById("gameFrame").getAttribute("data-fipr"))
    // document.getElementById("gameFrame").removeAttribute("data-fipr")
    
    // console.log(window.getAttribute("data-fipr"))
    // window.addEventListener("meassage", (e)=>{
    //   console.log(e)
    // }, false)

    let G = new p5(async (p)=>{
      // let savedGame = CircularJSON.parse(localStorage.getItem("savedGame"))
      // let gameType = savedGame ? savedGame : newGame
      let gameType = newGame
        // console.log(JSON.parse(window.parent.localStorage.getItem("par")))
        // console.log(window.parent.par)
      

      let assets = {
        iconList: [
          {name: "sort", path: "./assets/icons/icon_Sort.png"},
          {name: "cut", path: "./assets/icons/icon_cut.png"},
          {name: "build", path: "./assets/icons/icon_joinProduct.png"},
          {name: "muda", path: "./assets/icons/icon_spill.png"},
          {name: "nodaler", path: "./assets/icons/icon_nodaler.png"},
          {name: "stateRep", path: "./assets/icons/icon_joinModule.png"},
          {name: "trash", path: "./assets/icons/icon_trash.png"},
          {name: "cross", path: "./assets/icons/icon_crossBeige.png"},
          {name: "check", path: "./assets/icons/icon_checkBeige.png"},
          // {name: "sort", path: "./assets/icons/icon_Sort.png"},
      
        ],
      
        loadedIcons: [],
        fonts: [
          {name: "breadFont", path: "./assets/fonts/Oswald/Oswald-VariableFont_wght.ttf"},
          {name: "headFont", path: "./assets/fonts/Dela_Gothic_One/DelaGothicOne-Regular.ttf"},
        ]
      }
  
      game(p, gameType, assets)

    })


  
// })





