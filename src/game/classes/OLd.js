//Entity class
class Entity {
  constructor({...o}, p5){
    this.p = p5
    this.entId = o.entId ? o.entId : newId("ent")
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

    this.L = o.L
    this.B = o.B
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

    let {x: mX, y: mY} = B.canvasToboardCoordCoverter(this.p.mouseX, this.p.mouseY)

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
    this.p.push()

    //boundry rect
    this.p.fill(this.style.bdryFill)
    this.p.rect(this.bdryX, this.bdryY, this.bdryW, this.bdryH)

    //ent elem
    this.p.fill(this.style.entFill)
    this.p.rect(this.x, this.y, this.w, this.h)
    
    
    this.p.pop()

  }
}

//OperationShape class
class OperationShape extends Entity {
  constructor({...o}, p){
    super(o,p)
    this.subId = o.subId ? o.subId : newId("op")
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


    this.L = o.L
    this.B = o.B


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
      L.sortOperationShapes()
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
    let {x,y} = B.canvasToboardCoordCoverter(this.p.mouseX, this.p.mouseY)
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

    this.p.push()
    
    B.typoStyle()
    this.p.text(this.opName, this.x, this.y, this.w, this.h);
    this.p.text(this.entId, this.x, this.y+30, this.w, this.h-30);

    this.p.pop()

    //operation info and argument and ICON


    this.p.push()
    //draw connections
    this.p.fill(this.style.connectionFill)

    this.inputs.forEach(item=>{
      this.p.line(item.x, item.y+B.gridSize, item.x, item.y)
      this.p.ellipse(item.x, item.y, item.w, item.h)
    })

    this.outputs.forEach(item=>{
      this.p.line(item.x, item.y-B.gridSize, item.x, item.y)
      this.p.ellipse(item.x, item.y, item.w, item.h)
    })

    this.p.pop()

    
  }
}

class Connection {
  constructor({...o}, p5) {
    this.p = p5
    this.id = newId("cct")

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
    let {x,y} = B.canvasToboardCoordCoverter(this.p.mouseX, this.p.mouseY)
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
      this.relationshithis.p.output = {output: hit, port: "in"}

      //adds the input obj to output object
      hit.inputs[0].relationshithis.p.push(this.relationshithis.p.input.input)
      hit.inputs[0].cctId = this.id
      
      //adds the output object to the input object
      let inObj = this.relationshithis.p.input.input.outputs.find(item=>item.type==this.relationshithis.p.input.type)
      inObj.relationshithis.p.push(hit)
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
      h: this.p.dist(this.sX, this.sY, this.eX, this.eY),
      f: 0 + this.p.dist(this.sX, this.sY, this.eX, this.eY),
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
          {x:currentNode.x, y:currentNode.y-this.B.gridSize}, //north
          {x:currentNode.x+this.B.gridSize, y:currentNode.y},  //east
          {x:currentNode.x, y:currentNode.y+this.B.gridSize},  //south
          {x:currentNode.x-this.B.gridSize, y:currentNode.y}   //west
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
          neighbour.g = this.p.dist(this.sX, this.sY, neighbour.x, neighbour.y) 
          neighbour.h = this.p.dist(neighbour.x, neighbour.y, this.eX, this.eY)
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

    
    // if(!nodes.length) {
    //   nodes.push({x: this.sX, y:this.sY })
    //   this.noGo = true
    // } else {
    //   this.noGo = false
    // }
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
    this.p.stroke(col)
    this.p.strokeWeight(3)
    // line(this.startX, this.startY,this.endX,this.endY

    this.p.strokeJoin(this.p.ROUND)
    this.p.strokeCap(this.p.PROJECT)
    this.p.smooth()
    this.p.noFill()
    this.p.beginShape()
    this.pathArr = this.calcPath()
    this.pathArr.forEach((item,index)=>{
      this.p.vertex(item.x, item.y)
    })
    this.p.endShape()

    // console.log(this.pathArr[this.pathArr.length-1])


  }
}