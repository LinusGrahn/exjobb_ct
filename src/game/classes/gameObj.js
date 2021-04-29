class Board {
  constructor({...o}, p5) {
    this.p = p5
    this.zF = .48;  // zoom factor
    this.zFDef = this.zF
    this.zSpeend = .03; //speed of zooming
    this.x = this.p.windowWidth/2; // defines origin x
    this.y = 1050; // defines origin y
    // min/max values for the board boarders
    this.minX= o.w/2*-1;
    this.minY= o.h/2*-1; 
    this.maxX= o.w/2;
    this.maxY= o.h/2;
    this.movingBoard = false; // controles if drag event should move the board
    this.gridSize = o.gridSize; // size of each cell in the grid. board min, max diveded by gridSize should equal an intiger.
    this.toolMenuPos = o.toolMenuPos ? o.toolMenuPos : {x:10, y:10, h:680, w:150, posSetting: "topLeft" }

  }



  // methods
  // creates game grid
  drawGrid(col) {

    let colnr = (this.minX - this.maxX)*-1/this.gridSize
    let rownr = (this.minY - this.maxY)*-1/this.gridSize
  
    this.p.push()
    this.p.stroke(col)
  
    for(let i=0; i<=colnr; i++) {
      let x = this.minX + i*this.gridSize
      let y = this.minY + i*this.gridSize
  
      this.p.line(x, this.minY, x, this.maxY)
    }
  
    for(let i=0; i<=rownr; i++) {
      let x = this.minX + i*this.gridSize
      let y = this.minY + i*this.gridSize
  
      this.p.line(this.minX, y, this.maxX, y)
    }
    this.p.pop()
  }
  
  // orientation meethods
  startBoard() {
    this.x = this.p.windowWidth/2, 
    this.y = this.p.windowHeight*.65
    // this.zF = this.zFDef
    this.zF = .5
    this.p.redraw()
  }

  // calc methods
  snapToGrid(v) {
    return Math.round(v/this.gridSize) * this.gridSize
  }

  pointToPxl(v) {
    return v*this.zF
  }

  //converts the pos on canvas to board position
  canvasToboardCoordCoverter(x,y) {
    return {x: (x-this.x) / this.zF, y: (y-this.y) / this.zF}
  }
  
  //converts board position to canvas position
  boardToCanvasCoordConverter(x,y) {
    return {x: x * this.zF + this.x, y: y* this.zF + this.y}
  }

  // screenToBoardConverter(x,y) {
  //  se mouseVal()
  //   return {x: (x-this.x) / this.zF, y: (y-this.y) / this.zF}
  // }

  //converts board pos to screen pos
  boardToScreenCoordConverter(x,y) {
    return {
      x: x * this.zF + this.x + this.p.canvas.offsetLeft, 
      y: y* this.zF + this.y + this.p.canvas.offsetTop
    }
  }

  //converts 
  canvasToScreenCoordConverter(x, y ) {
    return {
      x: x + this.p.canvas.offsetLeft, 
      y: y + this.p.canvas.offsetTop
    }
  }

  //checks if the whole board is inside the canvas
  boardInsideCanvas() {
    let min = this.boardToCanvasCoordConverter(this.minX, this.minY)
    let max = this.boardToCanvasCoordConverter(this.maxX, this.maxY)
  
    let r = {
      north: min.y < 0 ? true : false,
      east: max.x > this.p.width ? true : false,
      south: max.y > this.p.height ? true : false,
      west: min.x < 0 ? true : false 
    }
    r.all = (r.north && r.east && r.south && r.west) ? true : false
  
    return r
  }

  mouseValues(e) {
    console.log(this)
    console.log("pos on canvas", this.p.mouseX, this.p.mouseY)
    console.log("pos on board", this.canvasToboardCoordCoverter(this.p.mouseX, this.p.mouseY))
    console.log("pos on sceen", e.x, e.y)
    console.log("screenPos on board", this.canvasToboardCoordCoverter(e.x-(e.x-this.p.mouseX), e.y-(e.y-this.p.mouseY)))
    console.log(this.p.canvas.offsetLeft, this.p.canvas.offsetTop)
  }


  //global styles
  typoStyle(style) {
    let styleParam = {
      alignH: this.p.CENTER,
      alignV: this.p.CENTER,
      size: this.typo.med,
      color: "white"
    }

   
    
    

    this.p.textAlign(styleParam.alignH, styleParam.alignV)
    this.p.textSize(styleParam.size)
    this.p.fill(styleParam.color)
  }
}


//collects all gamedata and score
//takes snapshots and send and receive data
//w
class Game {
  constructor({...o}, p5, B, assets) {
    //#dev
    // console.log(o)

    
    //Mandatory props
    this.p = p5
    this.B = B
    this.assets = assets
    this.skin = o.skin

    this.challenge = o.challenge.map(m=>new Material(m, this.p, this, this.B)) 
    this.cost = o.cost
    this.startMat = o.startMat
    this.retriggerUpdate = 0
    //mand?
    // this.entities = o.entities ? o.entities : [] //arrays storing all game entities (make into function)
    this.shapes = o.shapes ? o.shapes : []
    this.connections = o.connections ? o.connections : []
    this.ports = o.ports ? o.ports : []

    this.operations = o.operations ? o.operations : []
    
    this.materials = []
    this.materials = o.materials ? o.materials.map(item=>{new Material(item,this.p, this, this.B)}) : []
    //#new Material
    this.stateReps = o.stateReps ? o.stateReps.map(item=>new StateRep(item,this.p, this, this.B)) : []
    // this.states
    this.domElems = o.domElems ? o.domElems : []
    this.product = o.product ? o.product : []
    
    this.gameId = o.gameId ? o.gameId : newId("game")
    this.unitSize = 5

    this.matListOnCanvas = []
    this.productAndChallengeDisplay = null

    this.moduleList = this.getModuleList()

    this.trashcan = new Trashcan(this.p, this, this.B)


  }

  setUnit(side, v) {
    //this can re define meassurments units
    return `${side.toUpperCase()}: ${v}`
  }

  //compares two arrays return true if they match else false and with (ReturnList == true all diffrenses are returned)
  static compareArraysByProps(arr1, arr2, itemProp) {
    let filterArr = arr1.length > arr2.lengh ? [...arr1] : [...arr2]  
    let checkArr = arr1.length > arr2.lengh ? [...arr2] : [...arr1]
    
    filterArr = filterArr.map(item=>{
      if(checkArr.find(el=>el[itemProp]==item[itemProp])) {
        return "match"
      } else {
        return item
      }
    }).filter(item=>item!="match")

    console.log(filterArr)
    if(filterArr.length) {
      return false
    } else {
      return true
    }
  }

  updateGameState(trigger) {
    //update function in mech return {res: bool, message: array/ obj or string}
    //bool indicates success or error true/false

    eFlow("updateGameState")

    
    //how to stop cycle. or when to update (only update)
    let opUpdates = []
    let SRUpdates = []
    
    this.operations.forEach(item=> {
      //updates operation and adds changes to opUpdates
      opUpdates.push(item.updateOperationPorts())
    })
    //statereps are sorted after matList.length as a higher number are more likly to be effected of change
    
    this.stateReps.sort((a,b)=>a.matList.length-b.matList.length).forEach(item => {

      SRUpdates.push(item.updateStateRepPorts())
    });

    let trigUp = [...opUpdates, ...SRUpdates].find(item=>{
      // console.log(item)
      return item.res
    })
    // console.log("triggerUpdate?:", Boolean(trigUp), trigUp)

    if(+this.retriggerUpdate>100) {
      console.log("too many updates triggered")
      console.log("opUppdates", opUpdates)
      console.log("stateRepUpdates", SRUpdates)
      return
    } 

    if(trigUp) {
      this.retriggerUpdate++
      // console.log("update retriggered, cout is:", this.retriggerUpdate)
      this.updateGameState()
    } else {
      this.retriggerUpdate = 0
      console.log("everything is up to date")
    }


    

    this.p.redraw()
  }

  sortOperations() {
    this.operations = this.operations.sort((a,b)=>{return a.selected==b.selected ? 0 : !a.selected? -1 : 1})
    
    
  }

  getModuleList() {
    let modList = []

    this.challenge.forEach(item=>{
      modList = [...modList, ...item.parts]
    })  

    return modList
  }

  connectMechs(stateRepOut,mechIn) {
    //mechOut / stateRepOut is always a stateRep
    eFlow("Game/connectMechs")
    let res
    if(mechIn.id.startsWith("op")) {
      res = mechIn.connectStateRepToPortIn(stateRepOut)
    } else {
      res = mechIn.addMechToPort(stateRepOut, "inB")
    }

    res ? stateRepOut.addMechToPort(mechIn, "out") : console.log("couldn't connect")
    
    this.updateGameState()

    return res ? true : false
  }

  disconnectMechs(stateRepOut, mechIn) {
   eFlow("Game/disconnectMechs")
   console.log(stateRepOut, mechIn)

    stateRepOut.disconnectPort("portOut", false)
    
    if(mechIn.id.startsWith("op")) {
      mechIn.disconnectPortIn(stateRepOut)
    } else {
      console.log("SR inB remove")
      mechIn.disconnectPort("portInB", stateRepOut)
    }
    
  }


}