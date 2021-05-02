'use strict'



const game = (p, gameType, assets) => {
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
    // console.log(gameType)
    let L = new Game(gameType, p, B, assets)
    
    //[happens in op tool object]
    opCut.pos = {x: -275, y: startY+300}
    opSort.pos = {x: 150, y: startY+300}
    opBuild.pos = {x: -50, y: startY+900}
    opMuda.pos = {x: 200, y:100}
    // new Sort(opSort, p, L, B) 
    // new Cut(opCut, p, L, B)
    new Build(opBuild, p, L, B) 
    
    // new Muda(opMuda, p, L, B) // placing a cut operation on board
    
    L.toolMenu = new ToolMenu(B.toolMenuPos, p, L, B)
    // L.toolMenu.setToolMenuPos("topLeft")

    // console.log(L.stateReps)
    // console.log(L.operations[0])


    //global variables for Dev and Debugging
    window.p = p
    window.B = B
    window.L = L
    window.removeDom = false
    window.zoom = false
    window.eTimer = null
    window.dev = false
    window.fc = 0
    window.disableEvent = false
    window.disableScroll = false
    window.target = null
    window.port = null



  
    p.noLoop()
  }
  
  p.draw = function() {
    
    p.clear()
    // console.log("challenge is -->", L.challenge)
    //createe background
    p.background(L.skin.pallet.c3)

    p.push()

    p.translate(B.x, B.y)
    p.scale(B.zF)
    B.drawGrid(L.skin.pallet.c2T)

    p.push()
    p.stroke(L.skin.pallet.c2T)
    p.strokeWeight(1)
    p.fill(L.skin.pallet.c3)

    p.rect(B.snapToGrid(-250), B.snapToGrid(startY-130), 800, 300, 15)

    
    p.fill(L.skin.pallet.c2)
    p.noStroke()
    p.textSize(L.skin.typography.hLrg)
    p.textFont(L.assets.fonts.headFont)
    p.text("Materialförådet", -230, startY-80)
    p.pop()

    //ddraw mech elements on canvas
    let mechArr = [...L.stateReps, ...L.operations].sort((a,b)=>a.shape.moving-b.shape.moving)
    mechArr.forEach(item=>{
      item.shape.display()
    })



    p.pop()
    
    
    //Toolbar and object unefected by orientation and zoom
    if(L.toolMenu.visible && !B.movingBoard ) {
      L.toolMenu.display()
    }
    
    //Dom elements
    if(!window.removeDom && !zoom) {
      
      // L.operations[0].shape.DOM_mechInterface.display()
    }
    
    //elemnts that will be shown with DOM objects
    if(L.matListOnCanvas.length) {
      L.matListOnCanvas.map(m=>m.display())
    }
    
    if(L.trashcan.active) {
      L.trashcan.display()
    }
    
    //safe for if loop doesn't stop
    if(window.fc>200 && !p.mouseIsPressed) {
      window.fc = 0
      p.noLoop()
    }
    window.fc++
  }
  

  



  //EventHandlers-----------------------------------------------------------------------------


  p.mousePressed = function(e) {
    if(window.disableEvent) {
      // console.log("event disabled")
      return
    }

    console.log(e.target)
    // console.log(e.x, e.y)
    // console.log(e.target)

    if(e.target.localName == "canvas" || e.target.className.includes("closeButton")) {
      if(L.domElems.length) {
        L.domElems.forEach(item=>item.removeElem())
      }

      window.dom = false
      window.removeDom = true
      // console.log("canvas")
    } else {
      // console.log("DOM element")
      // e.target.style.color = "red"
      // e.target.style.border = "1px solid green"

      //indicates a dom element is clicked
      window.dom = true

      return
    }

    // B.mouseValues(e)

    //start looping for the canvas to redraw.
    p.loop()

    //if toolbar have been clicked
    if(L.toolMenu.posInsideShape(p.mouseX, p.mouseY)) {
      console.log("toolbar clicked")
      L.toolMenu.targeted = true

      window.target = L.toolMenu.menuItems.find(item=>{
        return item.posInsideShape(p.mouseX, p.mouseY)
      })

      // console.log(window.target, p.mouseX, p.mouseY)
      if(window.target) {
        window.eTimer = setTimeout(()=>{
          window.target.moving = true
        }, 200)

      } else {
        window.target = null
      }


      L.toolMenu.posInsideProductionButtons(p.mouseX,p.mouseY)

      window.port = null
      return false
    }



    let mechArr = [...L.stateReps, ...L.operations]
    window.port = null
    
    //checks if a window.target or a port was hit
    window.target = mechArr.find(item=>{
      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      let check = item.shape.portList.find(port=>port.insidePort(x,y) && (port.type=="out" || (port.portName=="portIn" && !port.open) ) )
      if(check) {port = check}
      
      check = !check ? item.shape.posInsideShape(x,y, "shape") : check
      return check
    })

    // console.log("CLICKED", port, window.target)

    if(window.port) {
      console.log("port Clicked")
      if(window.port.type=="out" && window.port.open) {
        console.log("port created")
        window.port.createOpenConnection(null)
        console.log("connection created")
      } else {
        console.log("release connection")
      }
    } else if (window.target) {
      console.log(window.target.id, "clicked")
      //is it an op or a staterep?
      if(window.target.id.startsWith("op")) {

        //waits before dragging event is activated and if mouse is released before the eTimer is cleared
        window.eTimer = setTimeout(()=>{
          window.target.shape.moving = true
        }, 200)

      } 

    } else {
      B.movingBoard = true
      window.target = null
    }

  
    return false
  }
  p.touchStarted = p.mousePressed
 
  //eventlistener for release event.
  p.mouseReleased = function(e) {
    B.movingBoard = false 
    
    if(window.disableEvent) {
      console.log("event disabled")
      L.trashcan.active = false
      window.removeDom = true
      p.noLoop()
      window.target = null
      return false
    }
    if(window.dom) {
      //if a dom element have been clicked
      return
    } else {
      window.removeDom = true
    }

    if(L.toolMenu.targeted) {
      console.log("menu targeted")

      if(window.target) {
        console.log(window.target)
        if(window.target.moving) {
          window.target.dropped()
        } else {
          clearTimeout(eTimer)
          window.target.clicked()
        }

      }

      L.toolMenu.targeted = false
      p.noLoop()
      window.target = null
      return false
    }

    eTimer ? clearTimeout(eTimer) : {} 

    if(window.port) {
      //port is the starting object. 

      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      
      let endPort = L.ports.find(item=>item.legalConnection(x,y, window.port))
      // console.log(endPort)
      //if endPort is true the endport object have been passed there and connection is legal
      if(endPort) {
        let connected = window.port.connection.attachToPort(endPort)
        if(connected) {
          let check = L.connectMechs(window.port.mech, endPort.mech)
          if (!check) {
            console.log("did mechs failed to connect?", window.port.mech, endPort.mech)
            port.connection.detachPorts()
          } 
        } else {
          port.connection.killConnection()
        }
        
      } else if(!window.port.open && (window.port.portName == "portIn" || window.port.portName == "portOut") ){
        //if a closed OP_portIn or a closed SR_portOut is clicked)
        window.port.connection.detachPorts()
      } else if (window.port.open){
        //port is open and is being dragged
        window.port.connection.killConnection()

      }

      window.port = null
    } else if(window.target) {
      if(window.target.shape.moving) {
        let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
        if(L.trashcan.opOver && L.trashcan.active) {
          window.target.removeOperation()
          L.toolMenu.visible = true
        } else {
          window.target.shape.dropped(x,y)
        }
        L.trashcan.active = false
      } else {
        window.target.shape.clicked()
      }


      window.target = null
    }

    

    //collect data
    p.noLoop()

    
    //to avoid duplicattion of dom elements they need to be removed
    if(window.removeDom) {
      L.domElems.forEach(item=>{item.removeElem()})
      window.removeDom = false
    }

    return false
  }
  p.touchEnded = p.mouseReleased

  //event for drag 
  p.mouseDragged = function(e) {
    if(window.disableEvent) {
      console.log("event disabled")
      return
    }

    eTimer ? eTimer = null : {}
    
    if(window.dom) {
      //if a dom element have been clicked
      return
    } else {
      window.removeDom = true
    }

    if(L.toolMenu.targeted) {
      if(window.target.moving) {
        window.target = window.target.updatePos(p.mouseX, p.mouseY)
        // console.log(window.target)
      }
    }

    // console.log("x-move", e.movementX)
    // console.log("y-move",e.movementY)
  
    //if any operation is targeted
    // L.operations.find(item=>item.selected) ? L.operations.find(item=>item.selected).dragged() : {};
    let flagT = window.target ? window.target.shape.moving : false
    let flagP = window.port ? window.port.connection.openEnd : false

    if(flagT) {
      // console.log(window.target)
      L.trashcan.active = !window.target.opId.startsWith("opBuild") ? true : false
      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      window.target.shape.moved(x,y)
      window.port = null
      
      L.trashcan.inside(p.mouseX,p.mouseY)


    }

    if(flagP) {
      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      // console.log("dragging?")
      window.port.connection.draggingEnd(x,y)
      window.target = null
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
  p.touchMoved = p.mouseDragged


  p.mouseWheel = function(e){
    if(window.disableEvent || disableScroll) {
      return
    }
    zoom = true
    e.preventDefault()

  
    if(B.boardInsideCanvas().all) {
      B.zF = e.delta>0 ? B.zF*(1+B.zSpeend) : B.zF*(1-B.zSpeend)   //increments with 0.01
    } else if(e.delta>0){
      B.zF = B.zF*(1+B.zSpeend)
    }
  
    
    p.redraw()
    zoom = false
  }
  

  p.preload = function() {
    assets.loadedIcons = assets.iconList.map(item=>{
      return {
        name: item.name,
        icon: p.loadImage(item.path)
      }
    })
    let o = {}
    assets.fonts.forEach(f=>{
      o[f.name] = p.loadFont(f.path)
    })
    assets.fonts = o


  }


  //AuxFunctions-----------------------------------------------------------------------------
  
}


