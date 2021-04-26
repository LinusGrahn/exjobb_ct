'use strict'

//Material_Classes------------------------------------------------------------
class Material {
  constructor({...o}, p5, L, B, ) {
    //Mand
    this.p = p5
    this.L = L
    this.B = B


    this.type = o.type
    this.name = o.name
    this.parts = o.parts
    
    this.clone = o.clone ? o.clone : false 

    this.id = o.id ? o.id : newId(this.type)
    this.uniqueKey = newId("mat")
    
    this.prevMat = o.prevMat ? o.prevMat : []
    this.nextMat = o.nextMat ? o.nextMat : []
    
    //lowest nr is first in stateRep.matList queue
    this.queue = this.prevMat.length + 1
    
    
    this.fromMechId = o.fromMechId ? o.fromMechId : "startMat"
    this.curMechId = o.curMechId ? o.curMechId : null
    this.sRqueue = o.sRqueue ? o.sRqueue : null
    //are these necesary?
    // this.prevOp = o.prevOp ? o.prevOp : null
    // this.nextOp = o.nextOp ? o.nextOp : null

    this.matDisplay = null //contains a matDisplay object
    this.displayFront = null //containt product from front
    this.displaySide = null // contain product from side

    // this.compositionProps = o.compositionProps
    // this.evalueate = null
    this.L.materials.push(this)
  }

}

//State representation class
//staterep contains a list materials and represents the state at that point of the flow.
//StateRep have 1 or 0 operations connected at each port
//stateRep is always created from a operation output and if list is empty is is still visible.
//stateRep have 2 input ports A and B that share the same functionality and one output port

//special case is staterep for StartMat where portInA is null

class StateRep {
  constructor({...o}, p5, L, B) {
    this.id = o.id ? o.id : newId("stateRep")
    this.new = o.id ? false : true
    this.p = p5
    this.L = L
    this.B = B
    this.matList = o.matList ? o.matList.map((item, i)=>{
      let newItem = {...item}
      newItem.curMechId = this.id
      newItem.sRqueue = i+1
      return new Material(newItem, this.p, this.L, this.B)
    }) : [] //list of materials contained in stateRep
    //#new Material
    this.portInA = o.portInA ? o.portInA : [] //operation that is spawns from // should only be one and can't be empty.
    this.portInB = o.portInB ? o.portInB : [] //inputs from other StateReps outputs. 
    this.portOut = o.portOut ? o.portOut : [] //outtput object op or stateRep // should only be one or empty array if no connection
  
    this.curSelfState = {...this}

    this.pos = o.shape ? {x: o.shape.x, y: o.shape.y } : o.pos
    // console.slog(o)

    this.passedMatList = []


    
    this.shape = o.shape ? o.shape : new StateRepShape(this.pos, this, this.p, this.L, this.B)
  }

  addMechToPort(mech, port) {
    eFlow("StateRep/addMechToPort")
    //mech is the mech to be connected to this and port is this port
    let res 
    if(port == "out") {
      //if mech is added to this out
      !this.portOut.length ? this.portOut.push(mech) : console.log("connection Error: port out is already connected to: " + this.portOut[0])
      res = this.portOut.length ? true : false
    } else { 

      //if mech is added to portInB
      this.portInB.push(mech)
      
      let mat = mech.matList.map(item=>{
        let newItem = {...item}
        newItem.clone = true;
        newItem.prevMat.push(item)
        newItem.fromMechId = mech.id
        newItem.curMechId = this.id
        newItem.queue = newItem.prevMat.length + 1
        return newItem
        //#new Material
      }) //Id from new remain

      
      mat.forEach(item=>{
        item.sRqueue=this.matList.length + 1
        this.matList.push(item)
        this.L.materials.push(item)

      })
      res = true
    }

    // console.log("portList-->", port, this.shape.portList)
    //if portInA.length = 1 --> is there any case exept starting case where portA isn't connected?
    // this.updateStateRepPorts()
    return res
  }

  updateStateRepPorts() {
    let res = {res: false, message: []}
    let newInA = false
    let matFromInA = []
    let allMatFromInB = []
    //checks if portInA is correct 
    //port InA is controlled from an OP or it is closed
    if(this.portInA.length != 1 && Array.isArray(this.portInA)) {
      res.message.push({m:this.id+" changes in port InA:", ch:`portInA on ${this.id} is empty. --> stateRep should then be removed, BUG-alert!`})
    } else if (this.curSelfState.portInA[0].id != this.portInA[0].id) {
      res.message.push({m:this.id+" changes in port InA:", ch:this.portInA[0]})
      newInA = true
    } else if (this.portInA != "closed") {
      //adds all mats that came from inA
      matFromInA = this.matList.filter(item=>item.fromMechId == this.portInA[0].id) 
      res.message.push({m:this.id+"--> mats from InA:", ch: matFromInA})
    } else {
      matFromInA = this.matList.filter(item=>item.fromMechId == "startMat") 
    }
    

    //check for changes in portInB and updates if necessary
    if (this.portInB.length) { 
      
      this.portInB.forEach(item=>{
        item.matList.forEach(mat=>{
          //adds all cur mats tha exist in statereps connected to input B
          
          allMatFromInB.push(mat)
        })
      })
      //newMatFromInB
      let newMatFromInB = allMatFromInB.filter(m=>!this.matList.find(mat=>mat.uniqueKey==m.uniqueKey))
      //newMatFromInB should now contain all new materials from inB
      //matFromInA Should now contain all materials from inA or startmat
      // console.log(newMatFromInB, matFromInA)

      let oldMat = []
      oldMat = this.matList.filter(mat=>!matFromInA.find(m=>m.uniqueKey==mat.uniqueKey))
      let oldMatToremove = oldMat.filter(mat=>!allMatFromInB.find(m=>m.uniqueKey==mat.uniqueKey))
      let oldMatToKeep = oldMat.filter(mat=>allMatFromInB.find(m=>m.uniqueKey==mat.uniqueKey))
 

      //need to remove old matToRemove?
      console.log("old mat to remove", oldMatToremove.length)

      //creates a clone of newMatFromInB
      newMatFromInB = newMatFromInB.map(item=>{
        //needs to be removed from matList
        let newItem = {...item}
        // console.log("new clone from:", item)

        newItem.clone = true
        newItem.prevMat.push(item)
        newItem.queue = newItem.prevMat.length + 1
        newItem.fromMechId = item.curMechId
        newItem.curMechId = this.id
        this.L.materials.push(newItem)
        return newItem
        //#new Material clone added to portInB of stateRep
      })

      if(newMatFromInB.length) {
        res.res = true
      }
      
      // console.log("newMat", newMatFromInB.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4)))
      // console.log("matfromA", matFromInA.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4)))
      // console.log("matTokeep",oldMatToKeep.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4)))
      // console.log("matToRemove",oldMatToremove.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4)))
      // console.log("this.matlist before", this.matList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4)))
      this.matList = [...newMatFromInB, ...matFromInA, ...oldMatToKeep].sort((a,b)=>a.queue-b.queue)
      this.matList.forEach((m, i)=>{m.sRqueue=i+1})
      // console.log("this.matlist after", this.matList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4)))

    } else {
      // console.log("portwinb is empty")

      if(this.portInB.length != this.curSelfState.portInB.length) {
        console.log("portInB has changed")
        // remove all old inB mats
        this.matList.forEach(item=>{
          this.L.materials.splice(this.L.materials.findIndex(m=>m.uniqueKey==item.uniqueKey))
        })

        matFromInA.forEach(item =>{
          // console.log("matFromA shouldn't be empty if op is connected", matFromInA)
          if(!this.L.materials.find(m=>m==item)) {
            this.L.materials.push(item)
          }
        })
      }

      this.matList = matFromInA
    }

    
    res.message.push({m:this.id+" changes in matList:", ch:{prev: this.curSelfState.matList, cur:this.matList}})



    //check for changes in portOut and triggers update for that obj
    if(this.portOut.length) {
      //SR have an mech in it's portOUt
      if(this.curSelfState.portOut[0].id != this.portOut[0].id) {
        // if port out have been changed or disconnected, it should have happened in an other mehod
        res.message.push({m:this.id+" changes in portOut:", ch:this.portOut[0] ? this.portOut[0] : "emptied"})
      } 

    } else {
      this.passedMatList = []
    }

    //return true if the arrays contain the same materials
    
    this.curSelfState = {...this}
    
    


    

    return res
  }

  disconnectPort(port, mech) {
    //if a mech is passed it is removed from the this[port]List
    //in case of port is inB and only a specifiic one needs to be removed
    let updOp = false

    if(!mech) {
      this[port] = []
    } else {
      // mech.matList.forEach(item=>{
      //   // this.matList.splice(this.matList.findIndex(m=>item.uniqueKey==m.uniqueKey), 1)
      // })
      this[port].splice(this[port].findIndex(item=>item.id==mech.id), 1)
      
      updOp = this.portOut.length ? (this.portOut[0].id.startsWith("op") ? true : false ) : false
    }
    
    if(updOp) {
      this.portOut[0].resetOperation()
    } else {
      this.updateStateRepPorts()
    }
    
    //remove Mat from matList if necesary.


  }

  removeStateRep() {
    eFlow("StateRep/removestateRep")

    console.log("remove: ", this.id)

    //remove connections from ports and opens them as well as disconnects mechs
    this.shape.portList.forEach(item=>{

      if(item.connection && !Array.isArray(item.connection)) {
        item.connection.detachPorts()
        this[item.portName] = []
      } else if (item.portName="portInB" && item.connection){
        item.connection.forEach(c=>c.detachPorts())
      } 
      
    })

    this.L.stateReps.splice(this.L.stateReps.findIndex(sr=>sr.id==this.id),1)

  }


}



//o is the material object and shape bject? coords from shape but props from mat

class MaterialDisplay {
  constructor({...size}, {...mat}, angle, p5, B, L) {
    this.p = p5
    this.B = B
    this.L = L
    //the angle of the picture "front" or "profile"
    this.angle = angle

    //Mat can be "wood", a modeule or a product and are drawn out of a blueprint 
    //composition takes in a blueprint or composititonProps as basis form drawing the material
    //"wood" is drawn in one way while modules are drawn in an other. Products are drawn from its modules
    this.composition = {...mat}

    this.x = size.x
    this.y = size.y
    this.w = size.w
    this.depth = this.L.unitSize
    this.padding = 4
    this.originalX = size.x
    
    //gridcells and prps
    //one cellsize is 5cm (defined in L.unitSize)
    let {rows, cols } = this.calcRowsNCols(this.angle)
    this.rows = rows
    this.cols = cols
    
    this.scale = this.rows%2 || this.cols%2 ? 1 : 2
    this.cellSize = this.w/this.cols
    this.h = this.cellSize*this.rows

    this.bdryX = this.h > this.w ? this.x - (this.h-this.w)/2 : this.x
    this.bdryW = this.h > this.w ? this.w + (this.h-this.w) : this.w

    this.bdryY = this.h > this.w ? this.y : this.y - (this.w-this.h)/2
    this.bdryH = this.h > this.w ? this.h : this.h - (this.w-this.h)

    this.style = this.L.skin.elem
    this.typo = {...this.L.skin.typography}


  }

  //creates the grid and defines the visible grid in different scales
  createBdryGrid() {
    let rows = this.rows / this.scale
    let cols = this.cols / this.scale
    let cellSize = this.cellSize * this.scale

    this.p.stroke(200,200,200)

    for (let i=0; i<=cols; i++) {
      let x = this.x + cellSize*i
      this.p.line(x,this.y, x, this.y +this.h)
      
    }

    for (let i=0; i<=rows; i++) {
      let y = this.y + cellSize*i
      this.p.line(this.x, y, this.x+this.w, y)
    }

  }

  // snap to grid material display
  snpMDG(v) {
    // console.log(v)
    // console.log(Math.round(v/this.cellSize/this.scale) * this.cellSize/this.scale)
    return Math.round(v/this.cellSize) * this.cellSize
  }

  calcRowsNCols(angle) {
    //get rows and cols from props of this.composition
    let rows 
    let cols
    let modules = []
    if(this.composition.type=="wood") {
      rows = this.gridmeassures(this.composition.parts.l) + this.padding * 2
      cols = this.gridmeassures(this.composition.parts.b) + this.padding * 2
      return {rows: rows, cols: cols}
    } else if (this.composition.type.startsWith("mod")){
      modules = [this.composition]
    } else {
      modules = this.composition.parts
    }
    //creates an Array with modules H, W, and D from blueprint
    modules = modules.map(item=>{
      let blueprint = this.L.moduleList.find(mod=>mod.name==item.name)
      return {h: blueprint.modH, w: blueprint.modW, d:blueprint.modD}
    })
    

    //colms 
    let widest = modules.sort((a, b)=>{return angle=="front" ? b.w-a.w : b.d-a.d})[0]
    widest = angle=="front" ? widest.w : widest.d
    cols = this.gridmeassures(widest)+ this.padding *2

    rows = this.gridmeassures(modules.map(item=>item.h).reduce((acc, cur)=>{
      return acc + cur
    })) + this.padding *2
    
    return {rows: rows, cols: cols}
  }

  gridmeassures(v) {
    return v/this.L.unitSize
  }

  unitToCell(v) {
    return v/this.L.unitSize*this.cellSize
  }

  drawWood() {
    let b = this.gridmeassures(this.composition.parts.b)
    let l = this.gridmeassures(this.composition.parts.l)
  
    // console.log(this.x + (this.cols - b)/this.scale*this.cellSize)
    // console.log(this.snpMDG(this.x + (this.cols - b)/this.scale*this.cellSize))
    let x1 = this.x + this.snpMDG((this.cols - b)/this.scale*this.cellSize)

    let y1 = this.y + this.snpMDG(((this.rows - l)/this.scale)*this.cellSize)
    let w = this.snpMDG(b*this.cellSize)
    let h = this.snpMDG(l*this.cellSize)

    this.p.push()
    this.p.fill(this.style.matFill)
    this.p.noStroke()
    this.p.rect(x1,y1,w,h)

    this.p.fill(this.typo.col)
    this.p.textSize(this.typo.textSize)
    this.p.text(this.L.setUnit("l", this.composition.parts.l), this.x+this.cellSize*(this.padding), this.y+this.cellSize*(this.padding-1))
    this.p.translate(x1-this.cellSize, y1+this.cellSize*8)
    this.p.rotate(-this.p.PI/2)
    this.p.text(this.L.setUnit("b", this.composition.parts.b), 0, 0)


    this.p.pop()

  }


  drawModule(mat, angle, transX, transY) {
    //check if its a bluprint
    if(mat.type.startsWith("modBP")) {
      //it's a bluePrint

      this.p.push()

      //translate to the boundry pos + padding
      this.p.translate(this.x + this.padding*this.cellSize + transX, this.y + this.padding*this.cellSize+transY)
      
      //runns through all materilas for a module and draws it. in order of its index.
      mat.parts.sort((a,b)=>a.index-b.index).forEach(item=>{
        let elm = {...item[angle]}

        this.p.fill("brown")

        if(elm.shape == "rect") {
          this.p[elm.shape](this.unitToCell(elm.x), this.unitToCell(elm.y), this.unitToCell(elm.w), this.unitToCell(elm.h), elm.corners)

        } else {
          this.p[elm.shape](this.unitToCell(elm.x1), this.unitToCell(elm.y1), this.unitToCell(elm.x2), this.unitToCell(elm.y2), this.unitToCell(elm.x3), this.unitToCell(elm.y3), this.unitToCell(elm.x4), this.unitToCell(elm.y4))

        }
        // item[angle]
        //what angle
        //create pElemnt

        //this.unitToCell

      })
      this.p.pop()

    } else {
      //parts need to be composed and judged
      let blueprint = this.L.moduleList.find(mod=>mod.name==mat.name)
      console.log(mat, blueprint)
    }

    




    // what angle are we drawing 

    // check pieces for matches

    //

    



  }

  updateBdry(x,y,w,h, textSize) {
    
    this.bdryX = x
    this.bdryY = y
    this.bdryW = w
    this.bdryH = h

    this.cellSize = this.cols > this.rows ? this.bdryW/this.cols : this.bdryH/this.rows
    
    this.w = this.cols > this.rows ? this.bdryW : this.cellSize*this.cols
    this.h = this.cols > this.rows ? this.cellSize*this.cols : this.bdryH



    this.x = this.h > this.w ? this.bdryX + (this.bdryW - this.w)/2 : this.bdryX
    
    this.y = this.h > this.w ? this.bdryY : this.bdryY + (this.bdryH - this.h)/2

   
    // this.typo.textSize = textSize

    
    //gridcells and prps
    //one cellsize is 5cm (defined in L.unitSize)

    // let {rows, cols } = this.calcRowsNCols(this.angle)
    // this.rows = rows
    // this.cols = cols
    
    // this.scale = this.rows%2 || this.cols%2 ? 1 : 2
    
  }

  display(size) {
    this.p.push()
    if(size) {
      console.log(size/this.bdryW, this.originalX, this.x, this.bdryX)
      this.p.scale(size/this.bdryW)
      let offset = this.bdryX-this.originalX
      if(offset) {
        this.x = this.x - offset
        this.bdryX = this.bdryX - offset
      }

    }

    //bdry
    this.p.noStroke()
    this.p.fill(this.style.secFill)


    this.p.rect(this.bdryX, this.bdryY, this.bdryW, this.bdryH)
    

    this.p.rect(this.x, this.y, this.w, this.h)

    this.createBdryGrid()

    if(this.composition.type == "wood") {
      this.drawWood()
    } else if(this.composition.type.startsWith("mod")){
      this.drawModule(this.composition, this.angle)
    } else {
      let incY = 0
      this.composition.parts.forEach(item=>{
        this.drawModule(item, this.angle, 0, incY)
        incY += this.unitToCell(item.modH)
      })
    }

    

    this.p.pop()


  }

}


class DisplayMatsOnCanvas {
  constructor({...pos},[...matList], p5, L, B) {
    this.p = p5
    this.L = L
    this.B = B
    
    this.matList = matList
    let {x,y} = pos 
    this.x = x
    this.y = y
    this.corners = 15

    //angle?

    console.log(this)

  }
  
  display() {
    console.log(this)
    this.p.push()

    this.p.fill(this.L.skin.pallet.c1)
    this.p.stroke(this.L.skin.pallet.c2)
    this.p.drawingContext.shadowOffsetX = 3;
    this.p.drawingContext.shadowOffsetY = 3;
    this.p.drawingContext.shadowBlur = 11;
    this.p.drawingContext.shadowColor = 'rgba(43, 42, 40, 0.6)';

    let a = this.p.rect(this.x, this.y, this.p.windowWidth-32, 400, this.corners)
    console.log(a)
    this.p.pop()
    
    this.p.push()
    this.p.translate(this.x+10, this.y+10)

    this.matList.forEach((mat, i)=>{
      console.log(mat)
      let angle = mat.id.startsWith("wood") ? "front" : "profile"
      let size = {
        xB: 0,
        yB: 0,
        wB: 120,
        x: 10,
        y: 10,
        w: 100
      }
      let md = new MaterialDisplay(size, mat, angle, this.p, this.B, this.L)
      console.log(md)      
      md.display(size.w)
      
      this.p.push()
      this.p.stroke(this.L.skin.pallet.c2)
      this.p.strokeWeight(2)
      this.p.noFill()
      this.p.rect(size.xB, size.yB, size.wB, size.wB, 10)
      this.p.fill(this.L.skin.pallet.c1)
      
      this.p.fill(this.L.skin.pallet.c2)
      this.p.stroke(this.L.skin.pallet.c3)
      this.p.strokeWeight(2)
      this.p.rect(size.xB+(size.wB-30), size.yB-5, 35, 35, 50)
      this.p.noStroke()
      this.p.textSize(this.L.skin.typography.textSize)
      this.p.textFont(this.L.assets.fonts.breadFont)
      this.p.fill(this.L.skin.pallet.c1)
      this.p.textAlign(this.p.CENTER, this.p.CENTER)
      this.p.text(i+1, size.xB+(size.wB-17), size.yB+9)
      
      this.p.pop()
      
      this.p.translate(135, 0)

    })




    this.p.pop()

    // this.p.redraw()
  }
  
}


class displayProductAndChallenge {
  constructor({...pos},challenge, product, p5, L, B) {
    this.p = p5
    this.L = L
    this.B = B
    
    this.matList = matList
    let {x,y} = pos 
    this.x = x
    this.y = y
    this.corners = 15

    //angle?

    console.log(this)

  }

  display() {
    // this.p.push()

    // this.p.fill(L.skin.typography.col2)
    // this.p.textSize(L.skin.typography.hSml)
    // this.p.textFont(L.assets.fonts.headFont)
    // this.p.text("Produkt &", 13, y+30)
    // this.p.text("utmaning", 13, y+53)
    
    // this.p.fill(L.skin.pallet.c1)
    // this.p.rect(7, y+70, this.w-14, this.w-14, 10)

    // this.p.pop()


    this.p.translate(this.x+10, this.y+10)




    this.p.push()
      this.p.stroke(this.L.skin.pallet.c2)
      this.p.strokeWeight(2)
      this.p.noFill()

      this.p.rect(size.xB, size.yB, size.wB, size.wB, 10)
      this.p.fill(this.L.skin.pallet.c1)
      
      this.p.fill(this.L.skin.pallet.c2)
      this.p.stroke(this.L.skin.pallet.c3)
      this.p.strokeWeight(2)

      this.p.rect(size.xB+(size.wB-30), size.yB-5, 35, 35, 50)

      this.p.noStroke()
      this.p.textSize(this.L.skin.typography.textSize)
      this.p.textFont(this.L.assets.fonts.breadFont)
      this.p.fill(this.L.skin.pallet.c1)
      this.p.textAlign(this.p.CENTER, this.p.CENTER)

      this.p.text(i+1, size.xB+(size.wB-17), size.yB+9)
      
      this.p.pop()
  }
}