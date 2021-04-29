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

    this.matDisplay = null //contains a matDisplay object
    this.composition = {...o}

    // this.compositionProps = o.compositionProps
    // this.evalueate = null

    if(!o.type.startsWith("prod")) {
      this.L.materials.push(this)
    }
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
      // console.log("old mat to remove", oldMatToremove.length)

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
          removeFromArray(this.L.materials,this.L.materials.findIndex(m=>m.uniqueKey==item.uniqueKey))
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
      removeFromArray(this[port],this[port].findIndex(item=>item.id==mech.id))
      
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

    // console.log("remove: ", this.id)

    //remove connections from ports and opens them as well as disconnects mechs
    this.shape.portList.forEach(item=>{

      if(item.connection && !Array.isArray(item.connection)) {
        item.connection.detachPorts()
        this[item.portName] = []
      } else if (item.portName="portInB" && item.connection){
        item.connection.forEach(c=>c.detachPorts())
      } 
      
    })

    removeFromArray(this.L.stateReps,this.L.stateReps.findIndex(sr=>sr.id==this.id))

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
    this.calcGraphics() 
    

    this.style = this.L.skin.elem
    this.typo = {...this.L.skin.typography}


  }

  calcGraphics(o) {
    if(o) {
      let {x,y,w} = {...o}
      this.x = x
      this.y = y
      this.w = w
    }

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
  }

  //creates the grid and defines the visible grid in different scales
  createBdryGrid() {
    this.p.push()
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
    this.p.pop()
  }

  // snap to grid material display
  snpMDG(v) {
    // console.log(v)
    // console.log(Math.round(v/this.cellSize/this.scale) * this.cellSize/this.scale)
    return Math.round(v/this.cellSize) * this.cellSize
  }

  calcRowsNCols(angle) {
    // console.log(this, "wood or mod or prod")
    //get rows and cols from props of this.composition
    let rows 
    let cols
    let modules = []
    if(this.composition.type=="wood") {
      rows = this.gridmeassures(this.composition.parts.l) + this.padding * 2
      cols = this.gridmeassures(this.composition.parts.b) + this.padding * 2
      return {rows: rows, cols: cols}
    } else {
      modules = this.composition.parts
    }
    //creates an Array with modules H, W, and D from blueprint
    // console.log("moddules", this.composition)
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
      
      //runs through all materilas for a module and draws it. in order of its index.
      // console.log(mat.parts)
      mat.parts.sort((a,b)=>a.index-b.index).forEach(item=>{
        if(item.status=="missing") {
          return
        }
        let elm = {...item[angle]}


        
        this.p.fill(this.style.matFill)
        

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
      // console.log(mat, blueprint)
    }


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
      // console.log(size/this.bdryW, this.originalX, this.x, this.bdryX)
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
    
    // this.p.noFill()
    this.p.rect(this.x, this.y, this.w, this.h)

    // this.createBdryGrid()

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
  constructor({...pos},[...matList], action, p5, L, B) {
    this.p = p5
    this.L = L
    this.B = B
    this.action = action
    if(this.action=="stateRep") {
      this.matList = matList
    } else {
      this.challenge = matList[0]
      this.product = matList[1]
    }

    let {x,y} = pos 
    this.x = x
    this.y = y
    this.w = this.p.windowWidth-32
    this.h = this.p.windowHeight/2+50
    this.corners = 15
    this.corIcon = this.L.assets.loadedIcons.find(item=>item.name=="check").icon
    this.incorIcon = this.L.assets.loadedIcons.find(item=>item.name=="cross").icon

   


  }
  
  showStateRepMats() {
    
    this.p.push()
    this.p.translate(this.x+10,this.y+10)
    let cnt = -1
    let wE = this.matList.length < 16 ? 110 : this.matList.length > 30 ? 30 : 70
    let wB = this.matList.length < 16 ? 130 : this.matList.length > 30 ? 40 : 80 
    let inc = this.matList.length < 16 ? 145 : this.matList.length > 30 ? 50 : 85
    let cW = this.w-100
    let textSize = this.matList.length < 16 ? 16 : this.matList.length > 30 ? 11 : 13
    let rX = this.matList.length < 16 ? 30 : this.matList.length > 30 ? 5 : 15
    rX = wB-rX
    let tX = rX+textSize
    

    this.matList.forEach((mat, i, a)=>{
      let difX = cnt*inc
      let change = (cnt+1)*inc>cW
      cnt = change ? 0 : cnt+1
      
      if(change) {
        this.p.translate(-difX, inc)
      } else {
        this.p.translate(i? inc : 0, 0)
      }

      let angle = mat.id.startsWith("wood") ? "front" : "profile"
      let size = {
        xB: 0,
        yB: 0,
        x: 10,
        y: 10,
        w: wE,
        wB: wB
      }
      let md = new MaterialDisplay(size, mat, angle, this.p, this.B, this.L)
      md.display(wE)
      
      this.p.push()
      this.p.stroke(this.L.skin.pallet.c2)
      this.p.strokeWeight(2)
      this.p.noFill()
      
      this.p.rect(size.xB, size.yB, wB, wB, 10)
      
      this.p.fill(this.L.skin.pallet.c1)
      
      this.p.fill(this.L.skin.pallet.c2)
      this.p.stroke(this.L.skin.pallet.c3)
      this.p.strokeWeight(2)

      
      this.p.rect(rX, size.yB-5, textSize*2, textSize*2, 50)
      
      this.p.noStroke()
      this.p.textSize(textSize)
      this.p.textFont(this.L.assets.fonts.breadFont)
      this.p.fill(this.L.skin.pallet.c1)
      this.p.textAlign(this.p.CENTER, this.p.CENTER)
      this.p.text(i+1, tX, size.yB+9)
      
      this.p.pop()
      
      // console.log("no undefines", this.matList.length, cW, cnt, inc, change )
      

    })




    this.p.pop()
  }

  showProd() {
    // let propName = this.action=="build" ? "product" : "challenge"
    
    let propName = this.action
    this.p.push()
    this.p.translate(this.x+7, this.y+10)
    
    //Mat dispaly
    let size = {
      x: 0,
      y: 0,
      w: this.p.windowHeight/4-20
    }

    this[propName].front.calcGraphics(size)
    this[propName].front.display(size.w)

    size.y += size.w*1.8
    this[propName].profile.calcGraphics(size)
    this[propName].profile.display(size.w)

    //List of parts
    //get list of all modNames and mats
    //translate 00 to right side
    this.p.translate(size.w*1.4, 30)

    let partsList = []
    //add list to draw out
    this[propName].composition.parts.forEach(part=>{
      let aux = {type: "mod",  name:part.name, b: null, l:null }
      partsList.push(aux)
      part.parts.forEach(m=>{

        aux = {type: "wood",  name:null, b: m.parts.b, l: m.parts.l, status:m.status }
        //if statusProp exist? else null 
        partsList.push(aux)
      })
    })
    
    // console.log(partsList, "partsLst")
    //MAKE A RECT
    this.p.fill(this.L.skin.pallet.c2)
    this.p.textSize(L.skin.typography.textSize)
    this.p.noStroke()

    partsList.forEach((part, i)=>{
      console.log("part", part)
      this.p.push()
      let str = part.name
      let x = 0
      this.p.textFont(L.assets.fonts.headFont)

      if (part.type=="wood") {
        part.status=="missing" ? this.p.fill(this.L.skin.pallet.c2T) : {}
        str = `Material - Bredd: ${part.b} cm, Längd: ${part.l} cm`
        this.p.textFont(L.assets.fonts.breadFont)
        x = 15
      }
      
      this.p.text(str, x, 25*i)
      
      if(part.status=="correct") {
        this.p.image(this.corIcon, x+230, 25*i-15, 20, 20)
      } else if (part.status=="incorrect"){
        this.p.image(this.incorIcon, x+230, 25*i-15, 20, 20)
      }
      
      this.p.pop()
    })
    


    this.p.pop()
  }


  display() {
    this.p.push()

    this.p.fill(this.L.skin.pallet.c1)
    this.p.stroke(this.L.skin.pallet.c2)
    this.p.drawingContext.shadowOffsetX = 3;
    this.p.drawingContext.shadowOffsetY = 3;
    this.p.drawingContext.shadowBlur = 11;
    this.p.drawingContext.shadowColor = 'rgba(43, 42, 40, 0.6)';

    let a = this.p.rect(this.x, this.y, this.w, this.h, this.corners)

    this.p.pop()


    if(this.action=="stateRep") {
      this.showStateRepMats()
    } else {
      this.showProd()
    } 
    // this.p.redraw()
  }
  
}


class DisplayProductAndChallenge {
  constructor(challenge, product, parent, p5, L, B) {
    this.p = p5
    this.L = L
    this.B = B
    
    this.corners = 15
    this.parent = parent
    
    this.sml = {x: 10, y:400, w: 150, h: 200}
    this.lrg = {x: 10, y:10, w: 300, h: 400}
    this.size = "sml"  // coresponds with different sizes
    this.corIcon = this.L.assets.loadedIcons.find(item=>item.name=="check").icon
    this.incorIcon = this.L.assets.loadedIcons.find(item=>item.name=="cross").icon
    
    this.product = product ? product : [] //mat object like bluePrint
    this.challenge = challenge
    this.challenge.front = new MaterialDisplay(this[this.size], this.challenge, "front", this.p, this.B, this.L)
    this.challenge.profile = new MaterialDisplay(this[this.size], this.challenge, "profile", this.p, this.B, this.L)
    this.productmatDisplayUpd()

    // console.log("ch==ch?", this.challenge==this.L.challenge[0])
    // this.challenge = this.L.challenge[0]
    //angle?

    //{mat: "challenge"/"product", side: "front"/"profile"}
    this.showMat = {mat: "challenge", side: "profile"}


  }

  calcMDSize() {
    let {w} = this[this.size]
    let size = {x:0, y:0, w:w-10}
    return size
  }

  productmatDisplayUpd(trig) {
    //safe for recurcion
    trig = trig==true ? true : false

    if(!this.product.length) {
      // console.log("product is empty")
      if(!trig) {
        this.product = this.L.product
        this.productmatDisplayUpd(true)
      }
      return 
    } else {
      // console.log("product is somthing")
      this.product.front = new MaterialDisplay(this[this.size], this.product, "front", this.p, this.B, this.L)
      this.product.profile = new MaterialDisplay(this[this.size], this.product, "profile", this.p, this.B, this.L)
    }
  }

  updateAllmatDisplays() {
    this.challenge.front = new MaterialDisplay(this[this.size], this.challenge, "front", this.p, this.B, this.L)
    this.challenge.profile = new MaterialDisplay(this[this.size], this.challenge, "profile", this.p, this.B, this.L)
    this.productmatDisplayUpd()
  }

  display() {
    let {x,y,w,h} = this[this.size]
    // console.log(this[this.size])
    this.p.push() //first


    this.p.translate(x, y)

    this.p.push() //2
    this.p.stroke(this.L.skin.pallet.c2)
    this.p.fill(this.L.skin.pallet.c1)

    //container
    this.p.rect(0, 0, w, h, 10)

    //parameters for buttons
    let butW = w/2-10
    let butH = 30
    let xL = 5
    let xR = 5+butW+10
    let y2 = 5+butH+10

    let xLTxt = xL+butW/2
    let xRTxt = xR+butW/2
    let y1T = butH/2
    let y2T = y1T+butH+10
    
    let yMD = y2T+butH
    let yPD = yMD+150

    


    //product and challenge buttonContainter
    let list = [
      {type: "challenge", txt:"Ritning", x: xLTxt, y:y1T,bX: xL, bY: 5, bW: butW, bH: butH},
      {type: "product", txt:"Status", x: xRTxt, y:y1T, bX: xR, bY: 5, bW: butW, bH: butH},
      {type:"front", txt:"Front", x: xLTxt, y:y2T, bX: xL, bY: y2, bW: butW, bH: butH},
      {type:"profile", txt:"Profil", x: xRTxt, y:y2T, bX: xR, bY: y2, bW: butW, bH: butH}
    ]

    
    this.parent.productionButtonPos = list.map(item=>{
      let el = {
        type: item.type,
        x: item.bX+x,
        y: item.bY+y,
        w: item.bW,
        h: item.bH
      }

      return el
    })
    
    

    //product and challenge buttonText
    this.p.push() //3
    this.p.stroke(this.L.skin.pallet.c2)
    this.p.textSize(16)
    this.p.textFont(this.L.assets.fonts.breadFont)
    this.p.textAlign(this.p.CENTER, this.p.CENTER)
    
    list.forEach(item=>{
      let active = item.type==this.showMat.mat || item.type==this.showMat.side
      this.p.push()
      active ? this.p.fill(this.L.skin.pallet.c2T) : this.p.fill(this.L.skin.pallet.c1)
      this.p.rect(item.bX, item.bY, item.bW, item.bH, 10)
      
      active ? this.p.fill(this.L.skin.pallet.c2) : this.p.fill(this.L.skin.pallet.c2)
      this.p.noStroke()
      this.p.text(item.txt, item.x, item.y)
      this.p.pop()
    })

    this.p.pop() //3

    //next elem


    this.p.push() //4
    this.p.translate(0, yMD)
    let size = this.calcMDSize()
    //if product make sure it exist
    let md
    if(this.showMat.mat!="product") {
      md = this[this.showMat.mat][this.showMat.side]
      md.calcGraphics(size)
      md.display(size.w)
    } else if(this[this.showMat.mat][0]) {
      md = this[this.showMat.mat][0][this.showMat.side]
      // console.log(md, this.showMat)
      md.calcGraphics(size)
      md.display(size.w)
    } else {
      this.p.noStroke()
      this.p.fill(this.L.skin.pallet.c2)
      this.p.text(`Skicka in Material i Slå På-Maskinen
för att se hur den 
färdiga produkten 
kommer att se ut.`, 10, 20, w-30, w-10 )
    }
    this.p.pop() //4

    // Material partLIst --------------------------


    this.p.translate(0, yPD)

    let partsList = []
    let chair = this.showMat.mat!="product" ? this[this.showMat.mat] : this[this.showMat.mat][0]? this[this.showMat.mat][0] : null
    //add list to draw out that separates mod and mats
    if(!chair) {
      // this.p.fill(this.L.skin.pallet.c2)
      // this.p.textSize(12)
      // this.p.noStroke()
      // this.p.text("Lista av delar", xL, 0)
    } else {
      chair.composition.parts.forEach(part=>{
        let aux = {type: "mod",  name:part.name, b: null, l:null }
        partsList.push(aux)
        part.parts.forEach(m=>{
  
          aux = {type: "wood",  name:null, b: m.parts.b, l: m.parts.l, status:m.status }
          //if statusProp exist? else null 
          partsList.push(aux)
        })
      })
      
      
      this.p.fill(this.L.skin.pallet.c2)
      this.p.textSize(12)
      this.p.noStroke()
  
      partsList.forEach((part, i)=>{
        this.p.push() // 5
        let str = part.name
        let xL = 5
        this.p.textFont(L.assets.fonts.headFont)
  
        if (part.type=="wood") {
          part.status=="missing" ? this.p.fill(this.L.skin.pallet.c2T) : {}
          str = `M - B: ${part.b} cm, L: ${part.l} cm`
          this.p.textFont(L.assets.fonts.breadFont)
          xL = 15
        }
        
        this.p.text(str, xL, 15*i)
        
        if(part.status=="correct") {
          this.p.image(this.corIcon, xL+102, 15*i-8, 10, 10)
        } else if (part.status=="incorrect"){
          this.p.image(this.incorIcon, xL+102, 15*i-8, 10, 10)
        }
        
        this.p.pop() // 5
      })
      
    }
      




      
      this.p.pop() //2

      this.p.pop() //last
  }
}