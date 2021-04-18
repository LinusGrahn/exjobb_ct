'use strict'

let load = async (url)=>{
  let res = await fetch(url)
  .then(function(response) {
    return response;
  })
  return res
  
}




const game = (p, B, L) => {
  //-Game variables--------------------------------------------------------------


  


  //Classes------------------------------------------------------------------------- 
  //board object, works as a globalscope for the game
  class Board {
    constructor({...o}) {
      this.zF = .8;  // zoom factor
      this.zFDef = this.zF
      this.zSpeend = .01; //speed of zooming
      this.x = p.windowWidth/2; // defines origin x
      this.y= p.windowHeight/2; // defines origin y
      // min/max values for the board boarders
      this.minX= o.w/2*-1;
      this.minY= o.h/2*-1; 
      this.maxX= o.w/2;
      this.maxY= o.h/2;
      this.movingBoard = false; // controles if drag event should move the board
      this.gridSize = o.gridSize; // size of each cell in the grid. board min, max diveded by gridSize should equal an intiger.

      this.typo = o.typo
  
    }



    // methods
    // creates game grid
    drawGrid() {

      let colnr = (this.minX - this.maxX)*-1/this.gridSize
      let rownr = (this.minY - this.maxY)*-1/this.gridSize
    
    
      p.stroke(90,90,90)
    
      for(let i=0; i<=colnr; i++) {
        let x = this.minX + i*this.gridSize
        let y = this.minY + i*this.gridSize
    
        p.line(x, this.minY, x, this.maxY)
      }
    
      for(let i=0; i<=rownr; i++) {
        let x = this.minX + i*this.gridSize
        let y = this.minY + i*this.gridSize
    
        p.line(this.minX, y, this.maxX, y)
      }
    }
    
    // orientation meethods
    centerBoard() {
      this.x = p.windowWidth/2, 
      this.y = p.windowHeight/2
      // this.zF = this.zFDef
      this.zF = 2
      p.redraw()
    }

    // calc methods
    snapToGrid(v) {
      return Math.round(v/this.gridSize) * this.gridSize
    }

    canvasToboardCoordCoverter(x,y) {
      return {x: (x-this.x) / this.zF, y: (y-this.y) / this.zF}
    }
    
    boardToCanvasCoordConverter(x,y) {
      return {x: x * this.zF + this.x, y: y* this.zF + this.y}
    }

    //checks if the whole board is inside the canvas
    boardInsideCanvas() {
      let min = this.boardToCanvasCoordConverter(this.minX, this.minY)
      let max = this.boardToCanvasCoordConverter(this.maxX, this.maxY)
    
      let r = {
        north: min.y < 0 ? true : false,
        east: max.x > p.width ? true : false,
        south: max.y > p.height ? true : false,
        west: min.x < 0 ? true : false 
      }
      r.all = (r.north && r.east && r.south && r.west) ? true : false
    
      return r
    }

    mouseValues() {
      console.log(this)
      console.log("mouse values on screen ", p.mouseX, p.mouseY)
      console.log("mouse values on board", this.canvasToboardCoordCoverter(p.mouseX, p.mouseyY).x, this.canvasToboardCoordCoverter(p.mouseX, p.mouseY).y)
    }


    //global styles
    typoStyle(style) {
      let styleParam = {
        alignH: p.CENTER,
        alignV: p.CENTER,
        size: this.typo.med,
        color: "white"
      }

     
      
      

      p.textAlign(styleParam.alignH, styleParam.alignV)
      p.textSize(styleParam.size)
      p.fill(styleParam.color)
    }
  }


  //collects all gamedata and score
  //takes snapshots and send and receive data
  //w
  class Game {
    constructor({...o}) {
      this.entities = o.entities ? o.entities : [] //arrays storing all game entities (make into function)
      this.operations = o.operations ? o.operations : []
      this.connections = o.connections ? o.connections : []
      // this.states

      this.idTypes = o.idTypes
      this.gameId = o.gameId ? o.gameId : this.newId("game")
    }

    updateLists() {
      
    }

    updateEnteties() {
      this.entities = [...this.operations]
      
    }

    sortOperations() {
      this.operations = this.operations.sort((a,b)=>{return a.selected==b.selected ? 0 : !a.selected? -1 : 1})
      
      
    }

    newId(type) {
      let int = Math.round(Math.random()*Math.pow(10,10))
      // console.log(this.idTypes)
      // save to list?

      if(this.idTypes.includes(type)) {
        let id = `${type}_${int}`
        // console.log(id)

        return id
      } else {
        console.log("wrong tpye of ID")
      }

    }


  }

  //Entity class
  class Entity {
    constructor({...o}){
      this.entId = o.entId ? o.entId : L.newId("ent")
      this.board = o.board

      //defines position and size of entity
      this.x = B.snapToGrid(o.x)
      this.y = B.snapToGrid(o.y)
      this.w = B.snapToGrid(o.w)
      this.h = B.snapToGrid(o.h)
      //defines position and size of boundries (margin) of entity
      this.bdryX = this.x - B.gridSize
      this.bdryY = this.y - B.gridSize
      this.bdryW = this.w + B.gridSize * 2
      this.bdryH = this.h + B.gridSize * 2
      
      this.prevX = this.x
      this.prevY = this.y 
  
      this.selected = false
      this.moving = false //Boolean to determen if ent should be effected by drag event
      this.droppable = true
      
      this.style = o.style
    }
    
    //udates properties of class
    updatePos(x,y) {
      this.x = B.snapToGrid(x)
      this.y = B.snapToGrid(y)
      this.bdryX = this.x - B.gridSize
      this.bdryY = this.y - B.gridSize

    }

    //checks if a part (target) of the ent is effected by an event position (mouse Pos)
    //other targets can be added with the second argument, for usage with subclasses
    eventPosInside(target, addTargetsArr) {

      // this.updateProps()

      //acceptable target values - (Idealy these should match the idTypes)
      let targetValues = [
        {type: "ent", x: this.x, y: this.y, w: this.w, h: this.h},
        {type: "bdry", x: this.bdryX, y: this.bdryY, w: this.bdryW, h: this.bdryH}
      ]

      //if targets have to be added
      if(addTargetsArr) {
        targetValues = [...targetValues, ...addTargetsArr]
      }

      // filters all values and returns values that are relevant
      let arr = targetValues.filter(item=>{
        if(target!="all") {
          return item.type==target
        } else {
          return item.type!="bdry"
        }
      })

      //dubble check it a correct value
      if(!arr.length) {
        console.log("unaccepted target type")
        return {bool: false}
      }

      let {x: mX, y: mY} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)

      let hit = arr.find(item=>{
        let {x, y, w, h} = item
        return (mX > x && mX < x + w) && (mY > y && mY < y + h)
      })

      
      return hit!=undefined ? {bool: true, hit: hit.type} : {bool: false}
    }

    //checks if an area is inside bdrys
    areaInsideBdry(x1,y1,x2,y2) {
      let bx1 = this.bdryX
      let by1 = this.bdryY
      let bx2 = this.bdryX+this.bdryW
      let by2 = this.bdryY+this.bdryH

      // console.log("bool",
      //   (x1 >= bx1 && x1 < bx2),(x2 <= bx2 && x2 > bx1),
      //   (y1 >= by1 && y1 < by2),(y2 <= by2 && y2 > by1)
      // )

      let bool = ((x1 >= bx1 && x1 < bx2) || (x2 <= bx2 && x2 > bx1)) && ((y1 >= by1 && y1 < by2) || (y2 <= by2 && y2 > by1))

      return bool
    }


   
    //return center Pos of entity
    center() {
      return {x: this.x + this.w/2, y:this.y +this.h/2}
    }
  
  
    display() {
      p.push()

      //boundry rect
      p.fill(this.style.bdryFill)
      p.rect(this.bdryX, this.bdryY, this.bdryW, this.bdryH)

      //ent elem
      p.fill(this.style.entFill)
      p.rect(this.x, this.y, this.w, this.h)
      
      
      p.pop()

    }
  }


  //Operation class
  class Operation extends Entity {
    constructor({...o }){
      super(o)
      this.subId = o.subId ? o.subId : L.newId("op")
      this.newOp = o.subId ? false : true
      this.opType = o.opType

      this.connectionRules = o.connectionRules //defiens the nr of inputs and outputs and entity have - should be a const if possible

      //the information of the operations relaionship
      // this.inputs = this.checkRelationship("inputs", o.inputs)
      // this.outputs = this.checkRelationship("outputs", o.outputs)


      //the pos for the in- and output element - 
      this.inputs = this.getConnectionsObj("inputs", o.inputs)
      this.outputs = this.getConnectionsObj("outputs", o.outputs)

      //style?
      //mirror copy when placing?

      this.style = o.style




      this.operation = o.operation
      this.opDiscription = o.opDiscription,
      this.opName = o.opName





    }

    bug(){console.log(this)}

    updatePos(x,y) {
      let conArr = [...this.inputs, ...this.outputs]
      conArr.forEach(item=>{
        item.x = B.snapToGrid(x - this.w/2 + (item.x-this.x))
        item.y = B.snapToGrid(y - this.h/2 + (item.y-this.y))
      })
      super.updatePos(x-this.w/2, y-this.h/2)
      
    }

    updateConnectionPos() {
      let connections = [...this.inputs, ...this.outputs]
      connections.forEach(item=>{
        
        let c = L.connections.find(cct=>{return cct.id==item.cctId})


        item.connectAction=="in" && c ? c.updatePos(null,null, item.x, item.y) : c? c.updatePos(item.x, item.y, null, null) : {}
      })

      return connections.filter(cct=>cct.cctId)
    }

    //checks if in and outputs need to be created else return existing in/outs
    getConnectionsObj(dir, list) {
      //max nr of outputs is 2 and ins 1

      //controls that there is a connction rules
      if(this.connectionRules[dir]==undefined ) {
        this.connectionRules[dir]= 1
      }

      //controls if its an existing operation or if connectionsObj needs to be created.
      if (!this.newOp) {
        return list
      } 

      //object blueprint
      let cObj = {
        type: dir=="inputs" ? "in" : "out",
        w: B.gridSize, 
        h: B.gridSize, 
        y: B.snapToGrid(dir=="inputs" ? this.y-B.gridSize : this.y+this.h+B.gridSize),
        style: {},
        relationship: [],
        connectAction: dir=="inputs" ? "in" : "out",
        cctId: null

      }

      let nr = +this.connectionRules[dir]
      let pos = []
      let dist = 1

      for(let i=0; i<nr; i++){
        let cNew = {...cObj}

        if(+nr==1) {
          cNew.x = B.snapToGrid(this.x+this.w/2)
        } else if (!i%2) {
          cNew.x = B.snapToGrid(this.x+B.gridSize*dist)
          dist = dist*-1
        } else {
          cNew.x = B.snapToGrid((this.x+this.w)+B.gridSize*dist)
          dist = dist*-1+1
        }

        if(+nr>1){
          cNew.type += String.fromCharCode(65+i)
        }

        pos.push(cNew)
      }

      return pos

    }

    eventPosInside(target) {
      let addArr = [...this.outputs, ...this.inputs]

      //since x and y is in the center the coordinates need to be offset for the detection to work      
      addArr = addArr.map(item=>{
        let newItem = {...item}
        newItem.x -= item.w/2
        newItem.y -= item.h/2
        return newItem
      })


      return super.eventPosInside(target,addArr)
    }


    openConnection(target) {
      if(target.connectAction == "out") {
        let o = {
          x1: target.x,
          y1: target.y,
          x2: null,
          y2: null,
          input: {input: this, type: target.type}
        }
        L.connections.push(new Connection(o))

      }
    }


    clicked(type) {
      

      if(type=="ent") {
        console.log("show ent-info or prepare drag")
        L.operations.forEach(item=>item.selected = false)
        this.selected = true
        L.sortOperations()
      } else {
        let connectArr = [...this.outputs, ...this.inputs]

        let target = connectArr.find(item=>item.type==type)

        //change 316 for connectAction
        console.log("trigger " + target.connectAction + " connection for: " + target.type)

        if(target.connectAction == "out") {
          this.openConnection(target)
        }

        

      }


    }

    dragged() {
      this.moving = true
      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      this.updatePos(x,y)
      this.droppable = !Boolean(L.entities.find(item=>{
        let bool = item.areaInsideBdry(this.bdryX,this.bdryY, this.bdryX+this.bdryW,this.bdryY+this.bdryH)
        return bool && item.entId != this.entId
      }))

      //update connection positions
      this.updateConnectionPos()

      console.log("operation is being dragged")
    }

    dropped() {
      console.log("dropped")
      if(!this.droppable) {
        this.updatePos(this.prevX+ this.w/2 ,this.prevY + this.h/2)
      } else if (this.newOp) { 
        L.operations.splice(L.operations.findIndex(item=>item.subId==this.subId), 1)
        L.updateEnteties()
      } else {
        this.prevX = this.x + this.w/2
        this.prevY = this.y + this.h/2
        //checks for faulty connections
        let connections = this.updateConnectionPos()
        console.log(connections)
        if(connections.length) {
          connections.find(cct=>L.connections.find(c=>c.noGo && c.id==cct.cctId)) ? console.log("FAULTY CONNECTION") : {}
        }
      }

      this.selected = false
      this.moving = false

      
    }

    applyStyle(style) {
      //same structura as this.style
      let styleParam = {
        bdryFill: "rgba(100,100,100,0.11)",
        entFill: "blue",
        connectionFill: "orange"
      }

      switch (style) {
        case "notDroppable":
          styleParam.bdryfill = "rgba(255, 14, 0, 0.2)"
          styleParam.entFill = "rgba(255, 14, 0, 0.4)"
          styleParam.connectionFill = "rgba(255, 14, 0, 0.4)"
          break;

        case "droppable":
          styleParam.bdryfill = "rgba(44, 229, 0, 0.1)"
          styleParam.entFill = "rgba(44, 229, 0, 0.4)"
          styleParam.connectionFill = "rgba(44, 229, 0, 0.4))"
          break;
      }
      
      this.style = styleParam
    }
    
    display() {
      //draws the elents from parent entity class

      //apply style depending on ent state
      if(this.moving) {
        let style = this.droppable ? "droppable" : "notDroppable"
        this.applyStyle(style)
      } else {
        this.applyStyle()
      }

      super.display()

      p.push()
      
      B.typoStyle()
      p.text(this.opName, this.x, this.y, this.w, this.h);
      p.text(this.entId, this.x, this.y+30, this.w, this.h-30);

      p.pop()

      //operation info and argument and ICON


      p.push()
      //draw connections
      p.fill(this.style.connectionFill)

      this.inputs.forEach(item=>{
        p.line(item.x, item.y+B.gridSize, item.x, item.y)
        p.ellipse(item.x, item.y, item.w, item.h)
      })

      this.outputs.forEach(item=>{
        p.line(item.x, item.y-B.gridSize, item.x, item.y)
        p.ellipse(item.x, item.y, item.w, item.h)
      })

      p.pop()

      
    }
  }

  class Connection {
    constructor({...o}) {
      this.id = L.newId("cct")

      this.sX = B.snapToGrid(o.x1)
      this.sY = B.snapToGrid(o.y1)
      this.eX = o.x2 ? B.snapToGrid(o.x2) : null
      this.eY = o.y2 ? B.snapToGrid(o.y2) : null
      this.pathArr = []
      this.connected = this.x2 && this.y2 ? true : false
      this.relationship = {input: o.input, output: o.output}
      this.noGo = false
    }
  
    updatePos(x1,y1,x2,y2) {
      this.sX = x1 ? B.snapToGrid(x1) : this.sX
      this.sY = y1 ? B.snapToGrid(y1) : this.sY
      this.eX = x2 ? B.snapToGrid(x2) : this.eX
      this.eY = y2 ? B.snapToGrid(y2) : this.eY
    }

    draggingEnd() {
      let {x,y} = B.canvasToboardCoordCoverter(p.mouseX, p.mouseY)
      this.updatePos(this.sX,this.sY,x,y)
    }

    tryConnecting() {
      let hit = L.operations.find(item=>{
        return item.eventPosInside("in").bool
      })
      console.log("try connecting to -->", hit)

      if(hit) {
        this.connected = true
        this.noGo = false
        //adds the new output to connection object
        this.relationship.output = {output: hit, port: "in"}

        //adds the input obj to output object
        hit.inputs[0].relationship.push(this.relationship.input.input)
        hit.inputs[0].cctId = this.id
        
        //adds the output object to the input object
        let inObj = this.relationship.input.input.outputs.find(item=>item.type==this.relationship.input.type)
        inObj.relationship.push(hit)
        inObj.cctId = this.id

      } else {
        L.connections.splice(L.connections.findIndex(item=>item.id==this.id), 1)
      }
    }


    calcPath() {
      // console.log("calcPath() run")
      let openSet = [{
        x:this.sX, 
        y:this.sY,
        g:0,
        h: p.dist(this.sX, this.sY, this.eX, this.eY),
        f: 0 + p.dist(this.sX, this.sY, this.eX, this.eY),
        prev: []
      }]
  
      let nodes = []
      let closedSet = []
  
      //define searchplane
      // let colnr = (this.eX-this.sX) / gridSize
      // let rownr = (this.eY-this.sY) / gridSize
      // let cX = this.sX
      // let cY = this.sX
  
      let debug = 0
  
      while(openSet.length > 0) {
        debug++
  
        //findes the index with lowest f
  
        let lowInd = 0
        for(var i=0; i<openSet.length; i++) {
          if(openSet[i].f < openSet[lowInd].f) { lowInd = i; }
        }
  
        let currentNode = openSet[lowInd];
        // console.log("Is this the end?", currentNode)
        // console.log("current x:"+currentNode.x+" == this.end x: "+this.eX)
        // console.log("current y:"+currentNode.y+" == this.end y: "+this.eY)
  
        
  
        //remove from list and puts it n the closed list
        openSet.splice(lowInd, 1)
        closedSet.push(currentNode)
  
        //end case
        if(currentNode.x == this.eX && currentNode.y == this.eY) {
          // console.log(debug, "---------------------------->found goal, trace pathand return nodeList")
          //add last node if necesary and return
          nodes = currentNode.prev
          openSet = []
        } else {
          // console.log("still going")
          //find neighbours
          // always 3 neighbours
          //north - east - south - west
  
          let neighbours = [
            {x:currentNode.x, y:currentNode.y-B.gridSize}, //north
            {x:currentNode.x+B.gridSize, y:currentNode.y},  //east
            {x:currentNode.x, y:currentNode.y+B.gridSize},  //south
            {x:currentNode.x-B.gridSize, y:currentNode.y}   //west
          ]
  
          neighbours = neighbours.filter((neighbour, index)=>{
            let pass = true
            // console.log(currentNode)
            if (!index && !currentNode.prev.length) {
              pass = false
            }
  
            //collission with entities and connection positions
            L.entities.forEach(item=>{
              
              if(neighbour.x > item.bdryX && neighbour.x < item.bdryX+item.bdryW && neighbour.y > item.bdryY && neighbour.y < item.bdryY+item.bdryH) {
                pass = false
              }
              item.outputs.forEach(item2=>{
                if(neighbour.x == item2.x && neighbour.y==item2.y) {
                  pass = false
                }
              })
              
              
            })
  
            //exist in closedSet
            // console.log("open set-->",openSet)
            // console.log("closed set-->",closedSet)
            // console.log("in closed set?",closedSet.find(item=>item.x==neighbour.x && item.y==neighbour.y))
            // console.log("in open set?",openSet.find(item=>item.x==neighbour.x && item.y==neighbour.y))
  
            if(closedSet.find(item=>item.x==neighbour.x && item.y==neighbour.y) != undefined) {
              // console.log("YES - in CLOSED set")
              pass = false
            }
            //exist in openSet
            if(openSet.find(item=>item.x==neighbour.x && item.y==neighbour.y) != undefined) {
              // console.log("YES - in OPEN set")
              pass = false
            }
  
            //adding new data to neighbour
            neighbour.g = p.dist(this.sX, this.sY, neighbour.x, neighbour.y) 
            neighbour.h = p.dist(neighbour.x, neighbour.y, this.eX, this.eY)
            neighbour.f = neighbour.g+neighbour.h
            neighbour.prev = [...currentNode.prev, currentNode]
  
  
            return pass
          })
          openSet = openSet.concat(neighbours).sort((a,b)=>{a.f-b.f})
          
        }
        // console.log("end neighbours", neighbours)
          // console.log("end openSet", openSet.length)
          // console.log("end closedSet", closedSet)
          // console.log("end ", currentNode)
  
        if(debug > 500) {
          console.log("pathfinder passed 300 check for bug")
          openSet = []
        }
      }
  
      
      if(!nodes.length) {
        nodes.push({x: this.sX, y:this.sY })
        this.noGo = true
      } else {
        this.noGo = false
      }
      nodes.push({x: this.eX, y: this.eY})
      
      return nodes
    }
  
    display() {
      // console.log("goal is: ", this.eX, this.eY)
      let col
      if(this.noGo) {
        col = "red"
      } else {
        col = "blue"
      }
      p.stroke(col)
      p.strokeWeight(3)
      // line(this.startX, this.startY,this.endX,this.endY
  
      p.strokeJoin(p.ROUND)
      p.strokeCap(p.PROJECT)
      p.smooth()
      p.noFill()
      p.beginShape()
      this.pathArr = this.calcPath()
      this.pathArr.forEach((item,index)=>{
        p.vertex(item.x, item.y)
      })
      p.endShape()
  
      // console.log(this.pathArr[this.pathArr.length-1])
  
  
    }
  }


  //Setup-----------------------------------------------------------------------------

  //creates the canvas and sets up the game
  p.setup = function() {
    let canvas = p.createCanvas(p.windowWidth*.9, p.windowHeight*.9);
    canvas.parent("gameCanvas")


    //create board and game (using function parameters B, L etc. as functionScope variables insted of making them global)
    B = new Board(gameBoard) 
    L = new Game(gameA)

    console.log(L)
    load("board.js").then(res=>{console.log(res)})

    //global variables for Dev and Debugging
    window.p = p
    window.B = B
    window.L = L

    L.operations = L.operations.map(item => {
      let e = new Operation(item)
      e.board = B
      e.newOp = false                                 //TEST
      return e
    })

    L.updateEnteties()
    
    // add materials
    // add State
    // add connections

  
    p.noLoop()
  }
  
  p.draw = function() {

    
    //createe background
    p.background(220)

    p.push()

    p.translate(B.x, B.y)
    p.scale(B.zF)
    B.drawGrid()

   //draw entitis 
    // L.sortOperations()
    L.operations.forEach((item, i)=>{
      item.display()
    })

    L.connections.forEach(item=>{
      item.display()
    })

    p.pop()
    

    //Toolbar and object unefected by orientation and zoom
    p.rect(30,30,100,100)

  }
  

  



  //EventHandlers-----------------------------------------------------------------------------


  p.mousePressed = function(e) {
    // console.log(e)
    B.mouseValues()

    //start looping for the canvas to redraw.
    p.loop()

    let board = true

    L.updateEnteties()
    L.entities.forEach(item => {

      let inside = item.eventPosInside("all")

      if(inside.bool) {
        board = false
        

        

        //does item have input/output/ent or other

        if(item.eventPosInside(inside.hit).bool) {
          item.clicked(inside.hit)
        }


      } 
    })

    if(board) {
      B.movingBoard = true
    }

    return false
  }
  



  //eventlistener for release event.
  p.mouseReleased = function(e) {
    B.movingBoard = false 

    let selected = L.operations.find(item=>item.selected)
    selected ? selected.dropped() : {}
  
    let open = L.connections.find(item=>!item.connected) 
    console.log(open)

    open ? L.connections.find(item=>!item.connected).tryConnecting() : {}

    //collect what happened?
    p.noLoop()
    return false
  }
  





  //event for drag 
  p.mouseDragged = function(e) {
    // console.log("x-move", e.movementX)
    // console.log("y-move",e.movementY)
  
    //if any operation is targeted
    L.operations.find(item=>item.selected) ? L.operations.find(item=>item.selected).dragged() : {};

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
    L.connections.find(item=>!item.connected) ? L.connections.find(item=>!item.connected).draggingEnd() : {}
    
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


  //AuxFunctions-----------------------------------------------------------------------------
  
}


let G = new p5(game)