
//Class shape
class Shape {
  constructor({...pos}, mech, p5, L, B) {
    this.p = p5,
    this.L = L
    this.B = B
    this.mech = mech
    this.id = newId("shape")
    

    //default size and shape parameters
    this.w = 50
    this.h = 50
    this.shape = "rect"
    this.corners = 15

    let {x,y} = !pos.snap ? this.cPosToDPos(pos.x,pos.y) : pos
    this.x = x
    this.y = y

    this.drawBdry = true
    this.bdryX = this.x - this.B.gridSize
    this.bdryY = this.y - this.B.gridSize
    this.bdryW = this.w + this.B.gridSize * 2
    this.bdryH = this.h + this.B.gridSize * 2

    this.prevX = this.x + this.w/2
    this.prevY = this.y + this.h/2

    //from entity going to subClass?

    this.selected = false
    this.moving = false //Boolean to determen if ent should be effected by drag event
    this.droppable = true
    this.openDOM = false

    this.style = this.L.skin.elem
    this.typo = this.L.skin.typography

    this.bdryFill = this.style.bdryFill
    this.elemFill = this.style.elemFill
    this.elemStroke = false

    this.portList = []

    //set in subClass
    this.DOM_mechInterface = null

    this.L.shapes.push(this)
  }

  //updates shapes positon and prev position if true
  updatePos(nX,nY,updPrev) {
    let {x,y} = this.cPosToDPos(nX,nY)
    this.x = x
    this.y = y

    this.bdryX = this.x - this.B.gridSize
    this.bdryY = this.y - this.B.gridSize

    if(this.mech.id) {
      if(this.mech.id.startsWith("op")) {
        if(this.mech.portOutA != "closed") {
          let a = this.mech.portOutA.shape
          let b = this.mech.portOutB.shape
          let difAX = a.prevX-this.prevX
          let difAY = a.prevY-this.prevY
          let difBX = b.prevX-this.prevX
          let difBY = b.prevY-this.prevY
   
          a.updatePos(nX+difAX, nY+difAY, updPrev)
          b.updatePos(nX+difBX, nY+difBY, updPrev)
          
        }
      }

    }

    if(updPrev) {
      this.prevX = this.x + this.w/2
      this.prevY = this.y + this.h/2 
    }

    //if this is moving check for collision with other elements and set this.droppable
    if(this.moving) {
      let mechArr = [...this.L.stateReps, ...this.L.operations]
  
      //to account for ops with statereps
      let flag = this.mech.id.startsWith("op") && this.mech.portOutA!="closed"
      // console.log("flag", flag)
      let x1 = !flag ? this.bdryX : this.bdryX-this.B.gridSize*3
      let y1 = this.bdryY
      let x2 = !flag ? this.bdryX+this.bdryW : this.bdryX+this.bdryW+this.B.gridSize*3
      let y2 = !flag ? this.bdryY+this.bdryH : this.bdryY+this.bdryH+this.B.gridSize*8
      let stateRepIds = []

      if(flag) {
        stateRepIds = [this.mech.portOutA.id, this.mech.portOutB.id]
        // console.log(stateRepIds)
      }

      this.droppable = !Boolean(mechArr.find(item=>{
        let res
        let id = item.shape.mech.id 
        if(id != this.mech.id && !stateRepIds.find(el=>el==id)) {
          res = item.shape.areaInsideBdry(x1, y1, x2, y2)
          // let w = x2-x1
          // let h = y2-y1
          // res = !res ? item.shape.areaInsideBdry(x1+w/3, y1+h/3, x2-w/3, y2+h/3) : {}
        } else {
          res = false
        }
        // res ? console.log(item) : {}
       
        // console.log("is item droppable", res, item.id)
        return res
        
      }))
    }
    
    


    this.portList.forEach(item=>{
      item.updatePortPos()
    })

  }

  //position passed to shape are always thaugth to be the center pos
  //this method converts those positions to the corner for drawingPos
  cPosToDPos(x,y) {
    return {
      x: this.B.snapToGrid(x - this.w/2),
      y: this.B.snapToGrid(y - this.h/2)
    }
  }

  //loads img assets t
  loadImgPath(path) {
    return this.p.loadImage(path)
  }

  //checks if an area is inside bdrys
  areaInsideBdry(x1,y1,x2,y2) {
    
    let bx1 = this.bdryX
    let by1 = this.bdryY
    let bx2 = this.bdryX+this.bdryW+this.B.gridSize
    let by2 = this.bdryY+this.bdryH

    // console.log("bool",
    //   (x1 >= bx1 && x1 < bx2),(x2 <= bx2 && x2 > bx1),
    //   (y1 >= by1 && y1 < by2),(y2 <= by2 && y2 > by1)
    // )
    // console.log(
    //   y1, ">=", by1, "&&", y1, "<", by2, "||", y2, "<=", by2, "&&", y2, ">", by1,
    // )

    let bool = ((x1 >= bx1 && x1 < bx2) || (x2 <= bx2 && x2 > bx1)) && ((y1 >= by1 && y1 < by2) || (y2 <= by2 && y2 > by1))

    return bool
  }

  //checks if a pos is inside the shape or bdry
  posInsideShape(x,y, part) {
    let sX = part=="bdry" ? this.bdryX : this.x
    let sY = part=="bdry" ? this.bdryY : this.y
    let w = part=="bdry" ? this.bdryW : this.w
    let h = part=="bdry" ? this.bdryH : this.h
    
    let bool = (x > sX && x < sX + w) && (y > sY && y < sY + h)
    return bool
  }

  //creates ne portShape objects
  //corresponds to the shape subClass props
  //size defines size of the portShape
  //NOTE: if open is passed as false -> this means that the port is supposed to be connected
  //does not mean it is connected yet
  createPortShapes(size) {
    // console.log("-------------------- FUNCTION RUN: createPortShape -------------------")
    let portArr = Object.keys(this.mech).filter(item=>item.startsWith("portIn") || item.startsWith("portOut"))
    portArr = portArr.map(item=>{
      //only create ports that aren't "closed"
      if(this.mech[item] != "closed") {
        //if shape.mech is op, ports are objects, but arrays when stateReps
        // console.log("port:", item, "was created in", this.mech.id, "and port contains ", this.mech[item])
        let open
        if(this.mech.id.startsWith("op")) {
          open = this.mech[item] ? false : true
        } else if (!this.mech.build){
          open = !this.mech[item].length ? true : item == "portInB" ? true : false

        } 

        let portAttr = {
          open: open,
          type: item.toLowerCase().includes("in") ? "in" : "out",
          portName: item,
          size: size 
        }

        return new Port(this, portAttr, this.p, this.L, this.B)
      } else {
        return null
      }
    }).filter(item=>item)


    return portArr
  }

  // triggered if the shape is clicked
  clicked() {
    // console.log("sets the global removeDom to false")
    removeDom = false


    this.selected = true
    // this.selected = false
    // console.log("show me info about this shape, remain selected?")
    if(!this.openDOM) {
      this.DOM_mechInterface.display()
      this.openDOM = true
    }
  }

  // triggered if the shape is dragged
  moved(x,y) {
    this.selected = true
    this.L.toolMenu.visible = false
    //updates positon of this and checks if it is droppable
    this.updatePos(x,y,false)

  }

  // triggered if the shape is dropped
  dropped(x,y) {
    if(this.droppable) {
      this.updatePos(x,y,true)
      
    } else {
      this.updatePos(this.prevX,this.prevY,true)
      this.portList.forEach(item=>{item.display()})
    }

    this.moving = false
    this.selected = false
    this.L.toolMenu.visible = true
  }





  //displays/draws the shape on the canvas and apply style
  display() { 
    let bFill = this.bdryFill
    let sFill = this.elemFill
    
    if(this.moving && this.droppable) {
      bFill = this.style.ok_bdryFill
      sFill = this.style.ok_elemFill
    } else if(this.moving) {
      bFill = this.style.err_bdryFill
      sFill = this.style.err_elemFill
    } 
    
    
    this.p.push()

    //boundy
    // this.p.drawingContext.shadowOffsetX = 2;
    // this.p.drawingContext.shadowOffsetY = 2;
    // this.p.drawingContext.shadowBlur = 5;
    // this.p.drawingContext.shadowColor = 'black';
    if(this.drawBdry) {
      this.p.noStroke()
      this.p.fill(bFill)
      this.p.rect(this.bdryX, this.bdryY, this.bdryW, this.bdryH)
    }
    
    if(this.stroke) {
      this.p.stroke(this.stroke)
    } else {
      this.p.noStroke()

    }

    this.p.textSize(18)
    this.p.fill(this.typo.col2)
    if(this.mech.id && dev) {
      let id = this.mech.id
      id = id.substr(0, id.indexOf("_")+1) + id.substr(-4)
      this.p.text(id, this.bdryX, this.bdryY, this.bdryW, this.B.gridSize*2)
    }

    this.p.fill(sFill)
    this.p[this.shape](this.x, this.y, this.w, this.h, this.corners)



    this.p.pop()

  }
}

//subclass of shape for operations
class OpShape extends Shape {
  constructor({...pos},mech, p5, L, B) {
    super({...pos},mech, p5, L, B)
    let {...o} = this.mech.details

    this.icon = this.L.assets.loadedIcons.find(item=>item.name==o.icon).icon
    this.iconPath = this.L.assets.iconList.find(item=>item.name==o.icon).path
    this.name = o.name
    this.description = o.description 
    this.parameterStatus = o.parameterStatus
    this.inLabels = o.inLabels
    this.outLabels = o.outLabels
    this.w = this.B.gridSize*8
    this.h = this.B.gridSize*5
    this.bdryW = this.w + this.B.gridSize * 2
    this.bdryH = this.h + this.B.gridSize * 2

    // this.updatePos()
    this.portList = this.createPortShapes(this.B.gridSize)

    this.colors = this.L.skin.pallet


    //parameters for what opType
    // detail existing in this shapeObj
    let domPos = B.canvasToScreenCoordConverter(10,10)
    this.DOM_mechInterface = new MechDOMShape(domPos, this, this.mech, this.p, this.L, this.B)

  }


  display() {
    let s = this.B.gridSize/2 //spacing for elements inside
    super.display()
    
    this.p.push()
    this.p.noStroke()
    this.p.image(this.icon, this.x+s*.5, this.y+s*.5, s*7, s*7)

    

    this.p.textSize(this.L.skin.typography.textSize)
    this.p.textFont(this.L.assets.fonts.breadFont)

    this.p.fill(this.colors.c2)

    

    // if(!this.mech.opId.startsWith("opBuild")) {
    if(true) {
      this.p.push() 
      let text = this.mech.parameterDisplay().split(" ").map(item=>{
        if(item.startsWith("[")) {
          return {style: "marked", str: item.substr(1, item.length-2)}
        } else {
          return {style: "normal", str: item}
        }
      })

      let prevMarkedI = 0
      let lines = 1
      text.forEach((item, i, a)=>{
        let yt = this.y+(this.L.skin.typography.textSize+5)*(lines)+s*1
        //if next is marked concat all before last marked
        let flag = i!=a.length-1? a[i+1].style == "marked" : true
        if(item.style == "marked") {
          prevMarkedI = i
          
          this.p.fill(this.colors.c3)
          this.p.rect(this.x+s*8.8, yt-this.L.skin.typography.textSize-3, s*6, this.L.skin.typography.textSize+7)
          this.p.fill(this.colors.c2)
          this.p.textSize(this.L.skin.typography.textSize+4)
          this.p.text(item.str, this.x+s*9, yt)
          lines++


        } else if(flag){
          let length = i+1-prevMarkedI 
          let str = ""
          for(let j=prevMarkedI; j<length; j++) {
            str += a[prevMarkedI+j].str + " "
          }
          this.p.fill(this.colors.c2)
          this.p.textSize(this.L.skin.typography.textSize)
          this.p.text(str, this.x+s*9, yt)
          lines++
        }
        
      })
      // this.p.text(, this.x+s*8, this.y+s*2.5, s*6, s*4)
      this.p.pop()
    } else {
      console.log("display front")
      // this.L.product.displayFront.display()
    }
    // console.log(text)

  
    this.p.textSize(14)

    //creates output Labels
    this.outLabels.forEach((item, i, arr)=>{
      // let distX = this.w / (arr.length + 1)
      // let x = this.B.snapToGrid(this.x + distX * (i+1) ) - s*.3
      let x = !i ? this.B.snapToGrid(this.x + this.B.gridSize*2) : this.B.snapToGrid(this.x + this.w - this.B.gridSize*2) 
      this.p.text(item, x-s*.4, this.y+s*8.5, s*4, s*4)
    })

    this.portList.forEach(item=>{
      item.display()
    })

    this.p.pop()


  }



}

//subClass of shape for stateReps
class StateRepShape extends Shape {
  constructor({...pos},mech, p5, L, B) {
    super({...pos},mech, p5, L, B)
  
    this.w = this.B.gridSize*6
    this.h = this.B.gridSize*6
    this.bdryW = this.w + this.B.gridSize * 2
    this.bdryH = this.h + this.B.gridSize * 2
    this.name = stateRepInfo.details.name
    this.description = stateRepInfo.details.description 

    this.icon = this.L.assets.loadedIcons.find(item=>item.name==stateRepInfo.details.icon).icon
    this.iconPath = this.L.assets.iconList.find(item=>item.name==stateRepInfo.details.icon).path

    this.portList = this.createPortShapes(this.B.gridSize)
    
    let domPos = B.canvasToScreenCoordConverter(10,10)
    this.DOM_mechInterface = new MechDOMShape(domPos, this, this.mech, this.p, this.L, this.B)
  }
  
  
  display() {
    super.display()
    let s = this.B.gridSize/2
    
    this.p.push()
    
    this.p.textSize(this.typo.textSize)
    this.p.fill(this.typo.col2)

    // this.p.text("inA", this.x+this.w/2-s*.5, this.y+s, s*6, s*4)
    // this.p.text("inB", this.x+this.w-s*2, this.y+this.h/2-s*.5, s*6, s*4)
    // this.p.text("ut", this.x+this.w/2-s*.5, this.y+this.h-s, s*6, s*4)

    if(this.mech.matList.length) {
      //check tthat all matrial in stateRep have MatDisplay
      this.mech.matList.forEach(item=>{
        let size = {x: this.x+s, y: this.y+s, w: s*6}
        
        if(!item.matDisplay) {
          item.matDisplay = new MaterialDisplay(size,item,"front",this.p,this.B, this.L)
        }
      })

      this.mech.matList[0].matDisplay.updateBdry(this.x+s,this.y+s*2, s*8, s*8, s*.6)
      this.mech.matList[0].matDisplay.display()
  
    }

    this.portList.forEach(item=>{
      item.display()
    })

    //creates queue length
    let qX = this.x+this.w-s*3.5
    let qY = this.y-s*0.5
    let qS = s*4
    let qNr = this.mech.matList.length

    this.p.fill(this.style.secFill)
    this.p.stroke(this.L.skin.pallet.stroke)
    this.p.strokeWeight(3)
    this.p.rect(qX, qY, qS,qS, 50)
    
    this.p.noStroke()
    this.p.textSize(this.typo.hSml)
    this.p.fill(this.typo.col)
    this.p.textFont(this.L.assets.fonts.breadFont)
    this.p.textAlign(this.p.CENTER, this.p.CENTER)
    this.p.text(qNr, qX, qY-5, qS, qS)


    this.p.pop()
  }

}

//port object - represents in and out ports and are created within shape and added to shape.portList
class Port {
  constructor(shape, {...attr}, p5, L, B) {
    this.p = p5
    this.L = L
    this.B = B
    this.mech = shape.mech
    this.parentShape = shape
    this.id = newId("port")
    
    this.portName = attr.portName
    this.type = attr.type //in out
    
    this.open = attr.open // 
    //if portName in portInB this.connection is an Array 
    this.connection =  this.portName == "portInB" || this.mech.build ? [] : null
   
    let {cX,cY,rot} = this.getPos()

    this.cX = cX
    this.cY = cY
    this.rot = rot
    this.size = attr.size

    this.style = this.L.skin.port

    this.L.ports.push(this)

  }

  //gets the pos of the port depending on what type it is and what parent it has
  //coordinates are fetched from the parrentShape
  getPos() {
    let pos = {
      portIn: {cX: this.parentShape.x + this.parentShape.w/2, cY: this.parentShape.y, rot: this.p.PI},
      portInA: {cX: this.parentShape.x + this.parentShape.w/2, cY: this.parentShape.y, rot: this.p.PI},
      portInB: {cX: this.parentShape.x + this.parentShape.w, cY: this.parentShape.y+this.parentShape.h/2, rot: this.p.PI*-.5},
      portOut: {cX: this.parentShape.x + this.parentShape.w/2, cY: this.parentShape.y+this.parentShape.h, rot: this.p.PI},
      portOutA: {cX: this.B.snapToGrid(this.parentShape.x + this.B.gridSize*2), cY: this.parentShape.y+this.parentShape.h, rot: this.p.PI},
      portOutB: {cX: this.B.snapToGrid(this.parentShape.x + this.parentShape.w - this.B.gridSize*2), cY: this.parentShape.y+this.parentShape.h, rot: this.p.PI}
    }

    return pos[this.portName]
  }

  //updates pos by calling get pos
  updatePortPos() {
    let {cX,cY} = this.getPos()

    this.cX = cX
    this.cY = cY
  }

  //check if a pos is inside the port
  insidePort(x,y) {
    let cX = this.cX
    let cY = this.cY
    let v = 25
    let check = x>cX-v && x<cX+v && y>cY-v && y<cY+v

    // if(check) {console.log("event x, y --> ", x, y, "port x, y--> ", this.cX, this.cY)}
    return check ? true : false
  }

  legalConnection(x,y,port) {
    //port is starting port
    //this is endport
    
    if(this.insidePort(x,y)) {
      let legalC = [
        {outId: "stateRep", outP: "portOut", inId: "op", inP: "portIn"},
        {outId: "op", outP: "portOutA", inId: "stateRep", inP: "portInA"},
        {outId: "op", outP: "portOutB", inId: "stateRep", inP: "portInA"},
        {outId: "stateRep", outP: "portOut", inId: "stateRep", inP: "portInB"}
      ]

      let l = legalC.find(r=>{
        let ui = port.mech.id.startsWith(r.outId)
        let up = port.portName == r.outP
        let ii = this.mech.id.startsWith(r.inId)
        let ip = this.portName == r.inP
        // console.log(ui, up, ii, ip)
        return ui && up && ii && ip
      })

      // let open = (this.open && this.mech.id.startsWith("op")) 
      let open = this.open

      return l && open ? true : false
    } else {
      return false
    }
  }

  //create an OPEN connection object and adds it ti this.connection
  createOpenConnection(endPort) {
    // console.log(endPort)
    this.openConnection = true
    this.connection = new Connection(this, endPort, this.p, this.L, this.B)
    return this.connection
  }

  //runs when all ports are connected in all 3 cases: 
    //1. when portconnection is dragged and attached in canvas, connection.attach() runs thte method
    //2. after staeReps are created in op creation (runs from op.shape.portA nad B)
    //3. onLoad saved game - connections exist in objects
  //connects two ports. always triggeres from output ports so that this is the starting port
  //newConnection is a boolean that states if a new connection obj should be created or not
  connectTwoPorts(portIn, newConnection) {
    eFlow("Port/connectTwoPorts")

    // portOut = this
    this.open = false

    //if portinB - keep it open
    if(portIn.portName != "portInB" && !portIn.mech.build) {
      portIn.open = false
    }

    if(newConnection) {
      let con = new Connection(this, portIn, this.p, this.L, this.B)
      this.connection = con
      portIn.connection = con
      // console.log("new connection created and added to ports")
    }

  }

  //removes the connection on this port and opens it
  disconnectTwoPorts(portIn, connectionId) {
    eFlow("Port/discconectTwoPorts")
    // console.log("out stateReps_>", this.mech, "in mech_>", portIn.mech)
    if(!this.mech.id.startsWith("op")) {
      this.L.disconnectMechs(this.mech, portIn.mech)
    }
    
    this.open = true
    this.connection = null

    portIn.open = true
    if(portIn.portName == "portInB") {
      console.log(connectionId)
      removeFromArray(portIn.connection, portIn.connection.findIndex(item=>item.id==connectionId) )
    } else {
      portIn.connection = null
    }



  }

  display() {
    let s = this.size/2
    let fill = this.open ? this.style.openCol : this.style.closedCol

    if(this.connection) {
      // console.log("-------------------- FUNCTION RUN: port.disply - if port.connection == true-------------------")

      if(this.parentShape.moving) {
        if(Array.isArray(this.connection)) {
          this.connection.forEach(prt=>{prt.updatePos(this.type)})
        } else {
          this.connection.updatePos(this.type)
        }
      }
      
        let check = Array.isArray(this.connection) ? this.connection.length ? true : "empty" : false
        if(check && check!="empty") {
          // console.log("con is array")
          this.connection.forEach(con=>{con.updatePos(this.type); con.display()})
        } else if(this.connection && !check) {
          this.connection.updatePos(this.type)
          this.connection.display()
        }
      

    }

    this.p.push() 
    this.p.fill(fill)
    this.p.noStroke()

    this.p.translate(this.cX, this.cY)
    this.p.rotate(this.rot)
    this.p.triangle(-s, 0, 0, -s, s, 0)
    // this.p.triangle(this.cX-s, this.cY, this.cX, this.cY-s, this.cX+s, this.cY)

    
    this.p.pop()
    
    
  }
}


class Connection {
  constructor(startPort, endPort, p5, L, B) {
    this.p = p5
    this.L = L
    this.B = B
    this.id = newId("connection")

    this.startPort = startPort
    //if endPort is null no connection exist
    this.endPort = endPort ? endPort : null

    this.connectable = true
    this.openEnd = this.endPort ? false : true

    this.sX = this.startPort.cX
    this.sY = this.startPort.cY
    this.eX = this.endPort ? this.endPort.cX : this.sX
    this.eY = this.endPort ? this.endPort.cY : this.sY
    this.pathArr = []

    this.style = this.L.skin.connection

    
    !this.openEnd ? this.L.connections.push(this) : {}
  }

  //used when connecting mechanics
  updatePos(port) {
    if(port=="out") {
      this.sX = this.startPort.cX
      this.sY = this.startPort.cY
    } else if(port=="in"){
      this.eX = this.endPort.cX
      this.eY = this.endPort.cY
    }
  }

  //used when dragging
  draggingEnd(x,y) {
    this.eX = x
    this.eY = y
  }

  insideInPorts(x,y) {
    let pin = this.L.ports.filter(item=>item.type=="in" && item.id!=this.startPort.id).find(port=>port.insidePort(x, y))
    
    return pin ? pin : false 
  }

  //attaches a port to a port when dragged and dropped
  attachToPort(port) {
    console.log("port should not be undefined")
    if(!port) {
      return false
    }
    eFlow("Connection/attach port")

    //port is endPort and is set in this
    //connection end is closed and attached
    this.endPort = port

    this.openEnd = false
    this.connectable = true
    // console.log(this.endPort.connection)
    // console.log("BUild?", this.endPort)
    this.endPort.connection =  (this.endPort.portName=="portInB" || this.endPort.mech.build) ? [...this.endPort.connection, this] : this
    // console.log(this.endPort.connection)
    
    // console.log(this.endPort, port)

    //triggers port connection in startPort object and false for creating new connection since it exists as "this"
    this.startPort.connectTwoPorts(this.endPort, false) 

    this.L.connections.push(this)

    return true
  }

  //Tries connecting to a port
  killConnection() {
    console.log("can't connect, will delete")
    this.startPort.connection = null
    
  }

  detachPorts() {
    eFlow("Connection/detachPorts")
    this.startPort.disconnectTwoPorts(this.endPort, this.id)

    removeFromArray(this.L.connections, this.L.connections.findIndex(item=>item.id == this.id))
    
    //redraw ot update
    this.L.updateGameState()
  }

  calcPath() {
    let bug = this.startPort.open
    // bug ? console.log("---------------FUNCTION RUN: calcPath from ", this.id.substr(-4),"--------------------") : {}
   

    //1 a temp x and y are created 
    let sX = this.sX
    let sY = this.sY
    let eX = this.B.snapToGrid(this.eX)
    let eY = this.B.snapToGrid(this.eY)

    //2 an open set, the first positioin (defining the starting position)
    let openSet = [{
      x:sX, 
      y:sY,
      g:0,
      h: this.p.dist(sX, sY, eX, eY),
      f: 0 + this.p.dist(sX, sY, eX, eY),
      prev: []
    }]

     //3 nodes are the list that will be returned and later drawn in this.display()
    //closedSet are items that have been checked and added to the openset
    //debug count each whileloop run and stops on 300 to make sure that no endless loope will run
    let nodes = [
      // {x: this.sX, y: this.sY}
    ]
    let closedSet = []
    let debug = 0

    //all mechanis are put into an Array
    let mechArr = [...this.L.stateReps, ...this.L.operations]
    this.connectable = true
   
    //4 pin returns a port IN if one is targeted else it's false
    let pin = this.insideInPorts(eX,eY)

    // checks if eX, eY is inside any shape
    let inBdry = mechArr.find(item=>item.shape.posInsideShape(eX,eY,"bdry"))
    
    let portsMoving = this.endPort ? this.startPort.parentShape.moving || this.endPort.parentShape.moving : this.startPort.parentShape.moving 
    //if true and no portIN is targeted no path is calculated
    if(inBdry && !pin || portsMoving) {
        this.connectable = portsMoving ? true : false
      
      return [
        {x: this.sX, y:this.sY },
        {x: eX, y:eY }
      ]
    }

    
    while(openSet.length > 0) {
      //counts times loop iterates
      debug++

      // //5.2 - defines the most optimal currentNode that will be evaluated
      openSet = openSet.sort((a,b)=>{return a.f-b.f})
      let currentNode = openSet[0];
      
      //5.3 remove currentNode from openlist and puts it n the closed list as it will be checked
      openSet.splice(0, 1)
      closedSet.push(currentNode)
      // console.log(currentNode, openSet)

      // bug ? console.log("cur->", currentNode.x, currentNode.y, "end_>", eX, eY)
      // :{}

      if((currentNode.x == eX && currentNode.y == eY)) {
        // bug ? console.log(debug, "---------------------------->found goal, trace path and return nodeList") : {}
        //add last node if necesary and return
        nodes = [...nodes, ...currentNode.prev, currentNode]
        openSet = []
      } else {
        //create neigbour that need to be checked
        let neighbours = [
          {x: currentNode.x, y: currentNode.y-this.B.gridSize}, //north
          {x: currentNode.x+this.B.gridSize, y: currentNode.y},  //east
          {x: currentNode.x, y: currentNode.y+this.B.gridSize},  //south
          {x: currentNode.x-this.B.gridSize, y: currentNode.y}   //west
        ]

        // bug ? console.log("current is ", currentNode, "north is", neighbours[0],
        // "east is", neighbours[1],"south is", neighbours[2],"west is", neighbours[3],
        // ) : {}

        //filters out neighbours that already exist or don't pass the test
        neighbours = neighbours.filter((neighbour, index)=>{
          //by default all neigbors pass
          let pass = true

          //removes if neigbour exist in closed set
          if(closedSet.find(item=>item.x==neighbour.x && item.y==neighbour.y) != undefined) {
            // console.log("YES - in CLOSED set -1")
            pass = false
          }

          //removes if neighbour exist in openSet
          if(openSet.find(item=>item.x==neighbour.x && item.y==neighbour.y) != undefined) {
            // console.log("YES - in OPEN set -1")
            pass = false
          }

          if (!index && !currentNode.prev.length) {
            // console.log("first node north removed -1")
            pass = false
          }
  
          mechArr.forEach(item=>{
            // console.log("checking for collistion in", item.shape)
            if(item.shape.posInsideShape(neighbour.x,neighbour.y,"bdry")) {
              //-->neigbX and neigbY is inside bdry

              //if eX and eY is inside a port then it's another case otherwise pos is forbidden and passed as false
              let check = pin ? !pin.insidePort(neighbour.x, neighbour.y) : !pin
              if(check) {
                pass = false 
              }

            }
            
          })



          //adds props to heighbours that arn't in open or closed set
          neighbour.g = this.p.dist(sX, sY, neighbour.x, neighbour.y) 
          neighbour.h = this.p.dist(neighbour.x, neighbour.y, eX, eY)
          neighbour.f = neighbour.g+neighbour.h
          neighbour.prev = [...currentNode.prev, currentNode]

        //return true if pass else false and is filtered out
        return pass
        })

        // adds neigburs to open set
        // openSet = openSet.concat(neighbours).sort((a,b)=>{a.f-b.f})
        openSet = openSet.concat(neighbours)

      }

      //stops loop if it bugs
      if(debug > 700) {
        console.log("pathfinder passed", debug, "check for bug")
        openSet = []
      }
    
    }

    //return list of path pos
    // bug ? console.log(nodes) : {}
    return nodes
  }



  display() {
    // console.log("-------------------FUNCTION RUN: connection.disply -----------------------")
    let col = this.style.col

    if(!this.connectable && this.openEnd) {
      col = this.style.err_col
    } 

    // console.log("connection:", this)

    this.p.push() 

    this.p.strokeJoin(this.p.ROUND)
    this.p.strokeCap(this.p.PROJECT)
    this.p.stroke(col)
    this.p.strokeWeight(this.style.strokeWeigth)
    this.p.smooth()
    this.p.noFill()

    // this.p.line(this.sX, this.sY, this.eX, this.eY)

    this.p.drawingContext.shadowOffsetX = 5;
    this.p.drawingContext.shadowOffsetY = 5;
    this.p.drawingContext.shadowBlur = 9;
    this.p.drawingContext.shadowColor = 'rgb(115, 70, 26)';
    // this.p.blendMode(this.p.LIGHTEST)

    this.p.beginShape()
    this.pathArr = this.calcPath()
    this.pathArr.forEach(item=>{
      
      this.p.vertex(item.x, item.y)
    })
    this.p.endShape()

    this.p.pop()
  }
}

class IconShape extends Shape { 
  constructor({...pos}, mech, toolMenu, p5, L, B) {
    super({...pos},mech, p5, L, B)
    let {...o} = this.mech.details

    this.icon = this.L.assets.loadedIcons.find(item=>item.name==o.icon).icon
    this.iconPath = this.L.assets.iconList.find(item=>item.name==o.icon).path
    this.name = o.name
    this.description = o.description
    this.op = o.icon
    this.w = 120
    this.h = 60

    this.prevX = this.x
    this.prevY = this.y
    
    this.drawBdry = false

    this.stroke = this.L.skin.pallet.c2

    this.toolMenu = toolMenu

    this.opParameter = mech

    this.DOM_mechInterface = new MechDOMShape({x: 0, y: 0}, this, this.opParameter, this.p, this.L, this.B) 

  }

  posInsideShape(x, y) {
    return super.posInsideShape(x-this.toolMenu.x, y-this.toolMenu.y)
  }

  updatePos(nX, nY) {
    let offSetX = nX-this.w/2 - this.toolMenu.x
    let offSetY = nY-this.h/2 - this.toolMenu.y
    let newOp
    if(!this.toolMenu.posInsideShape(nX,nY)) {
      // console.log("Create Operation.")
      
      this.toolMenu.targeted = false
      this.toolMenu.visible = false
      this.moving = false
      this.x = this.prevX 
      this.y = this.prevY

      this.opParameter.pos = {
        x: nX,
        y: nY
      }

      if(this.op == "cut") {
        newOp = new Cut(this.opParameter, this.p, this.L, this.B )
      } else if (this.op == "sort") {
        newOp = new Sort(this.opParameter, this.p, this.L, this.B )
      } else if (this.op == "muda") {
        newOp = new Muda(this.opParameter, this.p, this.L, this.B )
      }

      newOp.shape.selected = true
      newOp.shape.moving = true
      return newOp

    } else {
      this.x = offSetX
      this.y = offSetY
      return this
    }
  }

  dropped() {
    this.droppable = true
    this.moving = false
    this.selected = true
    this.x = this.prevX
    this.y = this.prevY
  }

  display() {
    super.display()

    this.p.image(this.icon, this.x+5, this.y+10, 40, 40)

    this.p.textSize(this.L.skin.typography.textSize)
    this.p.textFont(this.L.assets.fonts.breadFont)
    this.p.fill(this.L.skin.pallet.c2)

    this.p.text(this.name, this.x+55, this.y+35)

  }

}

class ToolMenu {
  constructor({...pos}, p5, L, B) {
    this.p = p5
    this.L = L
    this.B = B

    let {x,y,w,h, posSetting} = pos
    this.x = x
    this.y = y
    this.h = h
    this.w = w
    this.corner = 15
    this.yAfterOps = 0
    this.posSetting = posSetting

    this.visible = true
    this.targeted = false

    this.productionButtonPos = []
    this.productAndChallengeDisplay = new DisplayProductAndChallenge(L.challenge[0], L.product[0], this, this.p, this.L, this.B)



    this.menuItems = this.getmenuItems()
  }

  getSettingsItems() {
    let settingItems = [
      {
        type: "label",
        label: "?",
        trigFunc: ()=>{
          console.log("setting clicked")
          let domPos = B.canvasToScreenCoordConverter(10,10)
          let shape = new MechDOMShape(domPos, challengeInfo, this.L.challenge[0], this.p, this.L, this.B)
          console.log(shape)
          shape.display()
          this.p.redraw()

          // this.openDOM = true
        }
      },

    ]

    this.p.push()

    let c = this.p.createDiv()
    c.elt.className = "settingsBar"

    settingItems.forEach((item, i)=>{

      if(item.type=="label") {
        let p = this.p.createDiv(item[item.type])
        p.elt.className = "settingsLabel"
        p.elt.onclick = ()=>{item.trigFunc()}

        c.elt.appendChild(p.elt)
        
      }
  
  
    })
    
    this.p.pop()
  }

  getmenuItems() {
    // let list = [opCut, opSort, opMuda]
    let list = [opCut, opSort]

    list = list.map((item, i)=>{
      let pos = {
        x: 15,
        y: 125 + 70*i,
        snap: true
      }
      this.yAfterOps = i==list.length-1 ? pos.y+70 : 0
      return new IconShape(pos, item, this, this.p, this.L, this.B)
    })
    


    

    return list
  }

  setToolMenuPos(pos) {
    // let posList = ["topLeft", "topRight", "bottomLeft", "bottomRight"]
    let margin = {x:10, y:10}
    
    this.B.toolMenuPos.posSetting = pos

    switch (pos) {
      case "topRight":
        this.B.toolMenuPos.x = this.p.windowWidth - this.B.toolMenuPos.w - margin.x
        this.B.toolMenuPos.y = margin.y
        this.x = margin.x
        break;
  
      case "bottomLeft":
        this.B.toolMenuPos.x = margin.x
        this.B.toolMenuPos.y = this.p.windowHeight - this.B.toolMenuPos.h - margin.y
        break;
  
      case "bottomRight":
        this.B.toolMenuPos.x = this.p.windowWidth - this.B.toolMenuPos.w - margin.x
        this.B.toolMenuPos.y = this.p.windowHeight - this.B.toolMenuPos.h - margin.y
        break;
  
      default:
        this.B.toolMenuPos.posSetting = "topLeft"
        this.B.toolMenuPos.x = margin.x
        this.B.toolMenuPos.y = margin.y
        break;
      }

      this.x = this.B.toolMenuPos.x
      this.y = this.B.toolMenuPos.y
      this.posSetting = this.B.toolMenuPos.posSetting
    
  }

  //checks if a pos is inside the shape or bdry
  posInsideShape(x,y) {
    let sX = this.x
    let sY = this.y
    let w = this.w
    let h = this.h
    
    let bool = (x > sX && x < sX + w) && (y > sY && y < sY + h)
    return bool
  }

  posInsideProductionButtons(x,y) {
    if(!this.productionButtonPos.length) {
      console.log("no buttons set")
      return false
    }

    let list = this.productionButtonPos.map(el=>{
      let bool = (x > el.x && x < el.x + el.w) && (y > el.y && y < el.y + el.h)
      let prop = el.type=="front" || el.type=="profile" ? "side" : "mat"
      
      return {bool:bool, prop: prop, type: el.type}
    })
    let pressed = list.find(el=>el.bool)
    if(pressed) {
      this.productAndChallengeDisplay.showMat[pressed.prop] = pressed.type
    }


    // console.log(pressed, this.productAndChallengeDisplay.showMat)

    return Boolean(pressed)
  }

  display() {
    this.p.push()

    this.p.translate(this.x, this.y)
    this.p.fill(this.L.skin.pallet.c1)
    this.p.stroke(this.L.skin.pallet.c2)
    
    //container for menu----------------------------------------------
    this.p.push()
    this.p.drawingContext.shadowOffsetX = 3;
    this.p.drawingContext.shadowOffsetY = 3;
    this.p.drawingContext.shadowBlur = 11;
    this.p.drawingContext.shadowColor = 'rgba(43, 42, 40, 0.6)';

    this.p.fill(L.skin.pallet.c1)
    this.p.noStroke()
    this.p.rect(0, 0, this.w, this.h, this.corner)
    this.p.pop()

    //Settings----(DOMELEMENTs)------------------------------------------s
    this.getSettingsItems()


    //Points----------------------------------------------
    // this.p.push()
    // this.p.noStroke()
    // this.p.rect(7, 45, this.w-14, 30, 10)

    // this.p.fill(this.L.skin.pallet.c2)
    // this.p.textSize(this.L.skin.typography.textSize)
    // this.p.textFont(this.L.assets.fonts.breadFont)
    // let icon = this.L.assets.loadedIcons.find(item=>item.name=="nodaler").icon
    // this.p.image(icon, 4, 50, 35, 35)
    // // this.p.text("Budget", 15, 71)
    // this.p.text("6000", 35, 75)
    // this.p.pop()

    //Titel----------------------------------------------
    this.p.push()
    this.p.fill(L.skin.typography.col2)
    this.p.textSize(L.skin.typography.hSml)
    this.p.textFont(L.assets.fonts.headFont)
    this.p.text("Maskiner", 13, 115)
    this.p.pop()

    //Maskiner/OperationIcons----------------------------------------------
    this.p.push()
    this.menuItems.forEach(item=>{
      item.display()
    })

    this.p.pop()

    
    
    //Product representation----------------------------------------------
    let y = this.yAfterOps
    let pos = {x: 7, y:y+30, w: this.w-14, h: (this.w-14)*2.78}  
    //staterept
    this.p.push()
    this.p.fill(L.skin.typography.col2)
    this.p.textSize(18)
    this.p.textFont(L.assets.fonts.headFont)
    this.p.text("Produktion", 13, y+17)
    this.p.pop()
    
    //product&challenges
    this.productAndChallengeDisplay.sml = pos
    this.productAndChallengeDisplay.display()





    this.p.pop()
  }
}

class Trashcan {
  constructor(p5, L, B) {
    this.p = p5
    this.L = L
    this.B = B
    this.active = false
    this.opOver = false

    this.pos = {
      x: this.p.width-170,
      y: 15,
      w: 150,
      icon: this.L.assets.loadedIcons.find(item=>item.name=="trash").icon,
      iconPath: this.L.assets.iconList.find(item=>item.name=="trash").path
    }
  }

  inside(mX,mY) {
    let {x,y,w} = this.pos

    let bool = (mX > x && mX < x + w) && (mY > y && mY < y + w)
    this.opOver = bool ? true : false

    return bool 
  }

  display() {
    let {x,y,w, icon} = this.pos
    let fill = this.L.skin.elem.err_elemFill
    
    if(this.opOver) {
      w = w*1.5
      x = x-85
      y = y
      fill = this.L.skin.elem.err_bdryFill
    }
    this.p.translate(x,y)
    this.p.push()

    this.p.stroke(this.L.skin.pallet.c2)
    this.p.strokeWeight(2)
    this.p.fill(fill)
    // this.p.noFill()
    this.p.rect(0,0, w, w, 15)
    this.p.image(icon, 0, 0, w, w)


    this.p.pop()


  }
}