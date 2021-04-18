'use strict'

let load = async (url)=>{
  let res = await fetch(url)
  .then(function(response) {
    return response;
  })
  return res
  
}


const game = (p, assets) => {
  //used to se the order of execution
  let eFlowArr = []
  const eFlow = (fName)=>{
    let order = !eFlowArr.length ? 1 : eFlowArr.sort((a,b)=>b.order-a.order)[0].order+1
    eFlowArr.push({func:fName, order:order})
    eFlowArr = eFlowArr.sort((a,b)=>a.order-b.order)
  }
  window.eFlowArr = eFlowArr
  window.eFlow = eFlow

  //Setup-----------------------------------------------------------------------------

  //creates the canvas and sets up the game
  p.setup = function() {
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent("gameCanvas")

    //1 create game and board
    //create board and game (using function parameters B, L etc. as functionScope variables insted of making them global)
    let B = new Board(gameBoard, p) 
    
    let L = new Game(newGame, p, B, assets)

    //2 add StartMaterial and display CHallenge
    //  (Show stateRep)
    // (show challenge)
    // place Evaluate
    // create tool menu
    
    

    //3 game started - 
    //placing a operattion on board (unconnected)
    //[happens in op tool object]
    opCut.pos = {x: -275, y: 0}
    opSort.pos = {x: 150, y: 0}
    L.operations.push(new Cut(opCut, p, L, B), new Sort(opSort, p, L, B)) // placing a cut operation on board




    // L.updateGameState()


    //should be a global update function 


    console.log(L.stateReps)
    console.log(L.operations[0])

    
    //---> check inputB of "stateA" - create a loop feedback!

    //---> create condition

    //--> module

    //--> product

    //--> (spill)

    //--> graphic representaton of material (drawing functioon)
    
    //check whole flow


    //apply shapes and interaction.







    //global variables for Dev and Debugging
    window.p = p
    window.B = B
    window.L = L


    
    // add materials
    // add State
    // add connections

  
    p.noLoop()
  }
  
  p.draw = function() {
    // console.log("challenge is -->", L.challenge)
    
    //createe background
    p.background(L.skin.pallet.c3)

    p.push()

    p.translate(B.x, B.y)
    p.scale(B.zF)
    B.drawGrid(L.skin.pallet.c2T)

   //draw entitis 
    // L.sortOperations()
    // L.operations.forEach((item, i)=>{
    //   // item.display()
    // })

    

    // let d = new MaterialDisplay(MatDisplayshape, prodBluePrint, "profile", p, B, L)
    // let d = new MaterialDisplay(MatDisplayshape, startMat[0], "front", p, B, L)
    // d.display()
    // window.d = d

    let mechArr = [...L.stateReps, ...L.operations].sort((a,b)=>a.shape.moving-b.shape.moving)
    
    mechArr.forEach(item=>{
      item.shape.display()
    })



    p.pop()
    

    //Toolbar and object unefected by orientation and zoom
    p.rect(30,30,100,100)
    

    // let pos = B.boardToScreenCoordConverter(0,0)
    let pos = B.canvasToScreenCoordConverter(30,30)
    //DOM elements need to be removed with each draw.
    let t = p.createP('this is some text inside inside a p-tag');
    t.style('font-size', '20px');
    t.style('border', '1px solid red');
    t.style('margin', '0');
    t.style('padding', '0');
    t.position(pos.x ,pos.y);

    

    console.log("Game started")
  }
  

  



  //EventHandlers-----------------------------------------------------------------------------


  p.mousePressed = function(e) {
    console.log(e.x, e.y)
    console.log(e.target)

    if(e.target.localName == "canvas") {
      console.log("canvas")
    } else {
      console.log("DOM element")
      e.target.style.color = "red"
      e.target.style.border = "1px solid green"


    }


    // B.mouseValues(e)

    //start looping for the canvas to redraw.
    p.loop()

    let mechArr = [...L.stateReps, ...L.operations]
    let port = null
    
    //checks if a target or a port was hit
    let target = mechArr.find(item=>{
      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      let check = item.shape.portList.find(port=>port.insidePort(x,y) && port.type=="out")
      if(check) {port = check}
      check = !check ? item.shape.posInsideShape(x,y, "shape") : check
      return check
    })

    if(port) {
      if(port.type=="out" && port.open) {
        console.log("port created")
        port.createOpenConnection(null)
        console.log("connection created")
      } else {
        console.log("release connection")
        port = null
      }
    } else if (target) {
      //is it an op or a staterep?
      console.log(target)
      if(target.id.startsWith("op")) {
        target.shape.moving = true

      } else {
        target.shape.clicked()
      }

    } else {
      B.movingBoard = true
      target = null
    }

    window.target = target
    window.port = port
    return false
  }
 
  //eventlistener for release event.
  p.mouseReleased = function(e) {
    B.movingBoard = false 

    if(target) {
      if(target.shape.moving) {
        let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
        target.shape.dropped(x,y)
      } else {
        target.shape.mechInfo()
      }


      window.target = null
    }

    if(port) {
      //port is the starting object. 
      console.log(port)

      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      
      let endPort = L.ports.find(item=>item.legalConnection(x,y, port))
      
      //if endPort is true the endport object have been passed there and connection is legal
      if(endPort) {
        port.connection.attachToPort(endPort)
        let check = L.connectMechs(port.mech, endPort.mech)
        !check ? console.log("did mechs failed to connect?", port.mech, endPort.mech) : {}
      } else {
        port.connection.killConnection()
      }

    }

    //collect data
    // L.updateGameState()
    p.noLoop()
    return false
  }

  //event for drag 
  p.mouseDragged = function(e) {
    // console.log("x-move", e.movementX)
    // console.log("y-move",e.movementY)
  
    //if any operation is targeted
    // L.operations.find(item=>item.selected) ? L.operations.find(item=>item.selected).dragged() : {};
    let flagT = target ? target.shape.moving : false
    let flagP = port ? port.connection.openEnd : false

    if(flagT) {
      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      target.shape.moved(x,y)
      port = null
    }

    if(flagP) {
      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      // console.log("dragging?")
      port.connection.draggingEnd(x,y)
      target = null
    }

    //if board is targeted.
    if(B.movingBoard) {
      let dir = {
        x: e.movementX < 0 ? "east" : "west",
        y: e.movementY < 0 ? "south" : "north"
      }
  
      if(B.boardInsideCanvas()[dir.x]) {
        B.x += e.movementX
      }
  
      if(B.boardInsideCanvas()[dir.y]) {
        B.y += e.movementY
      }
  
    }

    //if any open connections
    // L.connections.find(item=>!item.connected) ? L.connections.find(item=>!item.connected).draggingEnd() : {}
    
    return false
  }


  p.mouseWheel = function(e){
    e.preventDefault()
  
    if(B.boardInsideCanvas().all) {
      B.zF = e.delta>0 ? B.zF*(1+B.zSpeend) : B.zF*(1-B.zSpeend)   //increments with 0.01
    } else if(e.delta>0){
      B.zF = B.zF*(1+B.zSpeend)
    }
  
    p.redraw()
  
  }

  p.preload = function() {
    assets.loadedIcons = assets.iconList.map(item=>{
      return {
        name: item.name,
        icon: p.loadImage(item.path)
      }
    })


  }


  //AuxFunctions-----------------------------------------------------------------------------
  
}


