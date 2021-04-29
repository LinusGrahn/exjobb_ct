

//operations Classes


class Operations {
  constructor({...o}, p5, L, B) {
    this.B = B
    this.L = L //level object of the game
    this.p = p5 //P5 instance
    this.id = o.id ? o.id : newId("op")
    this.new = o.id ? false : true

    //ports contain a StateRepObj
    this.portIn = o.portIn ? o.portIn : null //contains a stateRep or null if unconnected, "closed" in not in use
    this.portOutA = o.portOutA ? o.portOutA : null
    this.portOutB = o.portOutB ? o.portOutB : null
    this.portRules = o.portRules
    this.details = o.details

    this.build = o.build ? o.build : false
    this.action = o.action

    this.doneMatList = o.doneMatList ? o.doneMatList : []
    this.toDoMatList = o.toDoMatList ? o.toDoMatList : []
    this.outputtedMatList = o.outputtedMatList ? o.outputtedMatList : []

    
    this.parameters = {...o.parameters}
    this.prevParameters = {...this.parameters}
    
    
    this.cost = o.cost
    this.costPerRun = o.costPerRun
    this.timesRun = 0

    this.pos = o.pos ? o.pos : {x: 0, y:0}
    
    
    this.shape = o.shape ? o.shape : new OpShape(this.pos, this, this.p, this.L, this.B)
    
    
    this.new ? this.closePortsOut() : {}
    this.new ? this.createPortOutStateReps() : {}
    this.L.operations.push(this)
    
  }

  //shold run directly
  //to be done id it's a new operation
  createPortOutStateReps() {
    for(let i=0; i<this.portRules.out; i++) {
      let stObj = {
        matList: [],
        portInA: [this],
        pos: {
          x:this.shape.x + (this.shape.w)*i - this.B.gridSize*2,
          y:this.shape.y + this.B.gridSize*9
        }
      }
  
      let newStObj = new StateRep(stObj, this.p, this.L, this.B)
      this["portOut"+String.fromCharCode(65+i)] = newStObj
      this.L.stateReps.push(newStObj)
    }
    // console.log(this)
    this.updatePorts()
  }

  updatePorts() {
    eFlow("Operations/update Ports (run from createPortOutStateReps)")

    // console.log(this.shape.portList)
    this.shape.portList.forEach(item=>{
      // console.log(item.portName)
      if(item.portName!="portIn") {
        item.connectTwoPorts(this[item.portName].shape.portList.find(p=>p.portName=="portInA"), true)
      }
    })

  }

  //to be used with some operations
  closePortsOut() {
    if(!this.portRules.out) {
      this.portOutA = "closed"
      this.portOutB = "closed"
    } else if(this.portRules.out == 1) {
      this.portOutB = "closed"
    }
  }

  connectStateRepToPortIn(stateRep) {
    eFlow("Operations/connectStateRepToPortIn")
    let res
    if(Array.isArray(this.portIn)) {
      this.portIn.push(stateRep)
      res = true
    } else if(!this.portIn) {
      this.portIn = stateRep
      this.shape.clicked()
      res = true
    } else {
      console.log("port is occupied")
      res = false
    }
    return res
    // console.log("portList (check in)->", this.shape.portList)
  }

  removeDoneMatFromPortOuts() {
    eFlow("Operations/removeDoneMatFromPortOuts")
    // console.log("doneList", this.doneMatList)
    // console.log("A", this.portOutA.matList)
    // console.log("B", this.portOutB.matList)

    this.doneMatList.forEach(item=>{
      let outA = this.portOutA.matList.findIndex(mat=>mat.id==item.id)
      let outB = this.portOutB.matList.findIndex(mat=>mat.id==item.id)
      removeFromArray(this.portOutA.matList,outA)
      removeFromArray(this.portOutB.matList,outB)
      
      // console.log(outA)
      // console.log(outB)
    })

    
    this.doneMatList = []
  }

  disconnectPortIn(stateRep) {
    eFlow("Operations/disconnectPortIn operations")
    if(!this.build) {
      this.portIn = null
      this.toDoMatList = []
      this.removeDoneMatFromPortOuts()
    } else {
      removeFromArray(this.portIn ,this.portIn.findIndex(sr=>sr.id==stateRep.id))

      this.updateToDoList()
    }

    //check staterep
    //remove Mat from port out state rep.
    //update
  }

  updateToDoList(matType) {
    eFlow("Operations/update toDo")

    // console.log("doneList", this.doneMatList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4) + "---clone: "+i.clone))
    // console.log("portInList", this.portIn.matList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4) + "---clone: "+i.clone))
    // console.log("toDoList - before", this.toDoMatList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4) + "---clone: "+i.clone))

    if(!this.build) {
      //if port in isn't empty mats that don't exist in doneMatList are added
      this.toDoMatList = !this.portIn ? [] : this.portIn.matList.filter(item=>{
        let rule = matType ? matType == item.type : true
        let match = this.doneMatList.find(mat=>{
          let unique = mat.uniqueKey==item.uniqueKey
          let clone = !item.clone
       
          return unique && clone      
        })
  
        // !match ? console.log("doesn't exist, go to toDo?", item) : {}
  
        // console.log(this.doneMatList.map(i=>i.id))
        return !match && rule
      })
    } else {
        this.toDoMatList = []
        if(this.portIn.length) {
          this.portIn.forEach(sr=>{
            sr.matList.forEach(m=>{
              this.toDoMatList.push(m)
            })
          }) 
        }
        // console.log("build to do", this.toDoMatList)
        return true

    }
    
  }

  updateDoneList() {

    this.doneMatList = [...this.doneMatList, ...this.toDoMatList]
    this.toDoMatList = []
  }
  
  removeOperation() {
    eFlow("removeOperations")
    //remove all connections
    let mechOuts = [this.portOutA, this.portOutB]

    this.shape.portList.forEach(item=>{
      //remove Connection from connectionsList
      if(item.connecion) {
        removeFromArray(this.L.connections,this.L.connections.findIndex(c=>c.id==item.connection))
      }
      
      //remove connection from ports and detach ports.
      if(item.portName=="portIn" && item.connection) {
        console.log(item)
        item.connection.detachPorts()
      } else if(item.connection){
        // console.log(item)
        item.connection.detachPorts()
      }

      
    })

    removeFromArray(this.L.shapes,this.L.shapes.findIndex(s=>s.id==this.shape.id))

    mechOuts.forEach(item=>item.removeStateRep())
    removeFromArray(this.L.operations,this.L.operations.findIndex(op=>op.id==this.id))

    // this.L.updateGameState()
  }

  //returns true if parameters changed
  parametersChanged() {
    let arr = Object.entries(this.parameters)
    let res = arr.map(item=>{
      return this.prevParameters[item[0]] == item[1]
    }).find(item=>!item)

    this.prevParameters = {...this.parameters}
    return !res
  }

  

}


class Cut extends Operations {
  constructor({...o}, p5, L, B) {
    super(o, p5, L, B)
    this.opId = o.opId ? o.opId : newId("opCut")

  }

  //used for most subClasses of Operations
  setParameters() {
    //if parameters have changed the donelist should change
    


    let {side, measure} = this.parameters
    side = side ? side : "b"
    measure = measure ? measure: "1/3"

    this.parameters = {side: side, measure: measure}
  }

  parameterDisplay() {
    if(!this.parameters.side) {
      return "Välj vilkor"
    }

    let side = this.parameters.side=="l" ? "längden" : "bredden"

    let string = `Kapa [${this.parameters.measure}] av [${side}]`
    
    return string
  }

  //usd for all subclasses of oberations
  executeOp() {
    eFlow("CUT/executeOP cut")
    let status

    // this.setParameters()
    let {side, measure} = this.parameters
    //controls that parameters are set
    if(!side, !measure) {
      status = false
      return status
    }
    
    // console.log("cut:", this.toDoMatLists)
    this.toDoMatList.forEach(item => {
      // console.log(item, measure, side)
      if(item.type != "wood") {
        console.log("cut only takes wood, " + item.type + " was ignored")
        return
      }
      if(this.portIn.passedMatList.find(m=>m.uniqueKey==item.uniqueKey)) {
        // console.log("mat have been processed and was ignored", item)
        return
      }

      let output = this.action(side, measure, item.parts)
      // console.log("outPut cut", output)
      if(output!="Failed") {
        Object.entries(output).forEach(outI=>{
          let newPre = [...item.prevMat]
          newPre.push(item)
    
          let newMat = {
            type: item.type,
            name: item.name,
            parts: outI[1],
            sRqueue: this["portOut" + outI[0].toUpperCase()].matList.length+1,
            prevMat: newPre,
            fromMechId: this.id,
            curMechId: this["portOut" + outI[0].toUpperCase()].id
          }

          
          //push new material to matlist of staterep in port a/b
          let n = new Material(newMat, this.p, this.L, this.B)
          //#new Material from cutOperation
          this["portOut" + outI[0].toUpperCase()].matList.push(n)
          this.doneMatList.push(n)
          this.outputtedMatList.push(n)
          // this["portOut" + outI[0].toUpperCase()].updateStateRepPorts()

          // console.log("cut to "+outI[0]+" Succeded from", item.id.substr(-4) + "----uKey: "+ item.uniqueKey.substr(-4) + "---clone: "+item.clone+ " B-->"+item.parts.b)
          // console.log("prevMat include", item.prevMat.map(item=>item.id.substr(-4) + "----uKey: "+ item.uniqueKey.substr(-4) + "---clone: "+item.clone+ " B-->"+item.parts.b))
          // console.log("new mat from cut is: ", n.id.substr(-4) + "----uKey: "+ n.uniqueKey.substr(-4) + "---clone: "+n.clone+ " B-->"+n.parts.b)
        })
        this.timesRun++
        // operation suceeded it updates stateReps list
        this.portIn.passedMatList.push(item)
        status = true
      } else {
        console.log("operation failed")
        status = false
      }

    });

    
      
    return status
  }

  resetOperation(upd) {
    //if argument is undefined it should be true
    upd = upd==undefined ? true : upd
    //remove all elemnts from outputs
    //each element that exist in port ut is removed from portOutMec and from material list
    this.outputtedMatList.forEach(item=> {
      // console.log("L.matlength before",L.materials.length)

      //get the materials to remove both clone and original
      let mats = this.L.materials.filter(m=>m.uniqueKey==item.uniqueKey)
      //if mat is undefined the loop is never executed
      mats.forEach(mat=> {
        let SRList = L.stateReps.find(m=>m.id == mat.curMechId).matList
        // console.log("srlist before", SRList.length)

        removeFromArray(SRList,SRList.findIndex(m=>m.uniqueKey==mat.uniqueKey))
        
        removeFromArray(this.L.materials,this.L.materials.findIndex(m=>m.uniqueKey==mat.uniqueKey && m.clone==mat.clone))

      })

      // console.log(L.mat length after",L.materials.length)
     

    })
    
    this.toDoMatList = []
    this.doneMatList = []
    this.portIn? this.portIn.passedMatList = [] : {}
    
    if(upd) {
      this.L.updateGameState()
    }

  }

  updateOperationPorts() {
    eFlow("Cut/updateOperationPorts")
    
    

    if(this.portIn) {
      this.updateToDoList("wood")
    }

    let status = this.executeOp()

    let res
    if(status) {
      res = {res: true, message:["new mats thats been cut (mod or prod shouldn't be in this array) in: "+this.id ,[...this.toDoMatList]]}
      this.updateDoneList()
    } else {
      res = {res: false, message: "didn't cut toDoList"}
    }
    return res
  }
  
}


class Sort extends Operations {
  constructor({...o}, p5, L, B) {
    super(o, p5, L, B)
    this.opId = o.opId ? o.opId : newId("opSort")

  }

  resetOperation(upd) {
    //if argument is undefined it should be true
    upd = upd==undefined ? true : upd

    //remove all elemnts from outputs
    //each element that exist in port ut is removed from portOutMec and from material list
    this.doneMatList.forEach(item=> {
    
      //removefrom SR
      let srId = this.L.materials.find(m=>m.uniqueKey==item.uniqueKey && m.fromMechId==this.id)
      let srMl = this.L.stateReps.find(mech=>mech.id==srId.curMechId).matList
      removeFromArray(srMl,srMl.findIndex(m=>m.uniqueKey==srId.uniqueKey))


      //remove from MatList
      removeFromArray(this.L.materials,this.L.materials.findIndex(m=>m.uniqueKey==item.uniqueKey && m.fromMechId==this.id))

    })
    
    this.toDoMatList = []
    this.doneMatList = []
    this.portIn? this.portIn.passedMatList = [] : {}
    
    if(upd) {
      this.L.updateGameState()
    }

  }

  //used for most subClasses of Operations
  setParameters() {

    //player sets parameters
    console.log("sort parameters", this.parameters)
    let {prop, operator, value} = this.parameters

    this.parameters.condProp = "b"
    this.parameters.condOperator = "!="
    this.parameters.condValue = "10"

  }

  parameterDisplay() {
    if(Object.values(this.parameters).some(item=>item==null || item==undefined)) {
      return "Välj vilkor"
    }

    let type
    if(this.parameters.condProp=="b") {
      type="bredden"
    } else if(this.parameters.condProp=="l") {
      type="längden"
    } else if(this.parameters.condProp=="sRqueue") {
      type="köplats"
    }

    let operator = this.parameters.condOperator=="!="? ["≠"] : this.parameters.condOperator

    let string = `Är [${type}] [${operator}] [${this.parameters.condValue}]`
    
    return string
  }

  //used for all subclasses of oberations
  executeOp()  {
    // this.setParameters()
    let status

    //controls that parameters are set
    let {condProp, condOperator, condValue} = this.parameters
    if(!condProp, !condOperator, (!condValue && condValue!=0)) {
      status = false
      return status
    }
    console.log("sort run")
    
    this.toDoMatList.forEach(item=>{
      let res = this.action(this.parameters, item)
      console.log("res:",  res,"from sor op of par & mat:",this.parameters, item)

      if(this.portIn.passedMatList.find(m=>m.uniqueKey==item.uniqueKey)) {
        // console.log("mat have been processed and was ignored", item)
        return
      }

      if(res!="Failed") {
        // if true add to portOutA eller add to portOutB

        //#new Material

        let newItem = {...item}
        newItem.clone = true
        newItem.prevMat.push(item)
        newItem.queue = item.prevMat.length + 1
        newItem.fromMechId = this.id
        this.L.materials.push(newItem)    
        
        console.log(newItem, res)
        if(res) {
          newItem.curMechId = this.portOutA.id
          newItem.sRqueue = this.portOutA.matList.length+1
          this.portOutA.matList.push(newItem)
        } else {
          newItem.curMechId = this.portOutB.id
          newItem.sRqueue = this.portOutB.matList.length+1
          this.portOutB.matList.push(newItem)
        }
        //push mat into passetMatLIst in stateRep
        this.portIn.passedMatList.push(item)
        status = true
      } else {
        // console.log("cant process: " + item)
        status =  false
      }

    })


    // console.log("Sort portOutA after-->",this.portOutA.matList)
    // console.log("Sort portOutB after-->",this.portOutB.matList)
    return status
  }
    
  updateOperationPorts() {
    eFlow("Sort/updateOperationPorts")
    
    if(this.portIn) {
     this.updateToDoList()   
    }

    let status = this.executeOp()

    let res 
    if(status) {
      res = {res: true, message:["new mats thats been sorted in "+this ,[...this.toDoMatList]]}
      this.updateDoneList()
    } else {
      res = {res: false, message: "didn't sort toDoList"}

    }

    return res
  }

  
}

class Muda extends Operations {
  constructor({...o}, p5, L, B) {
    super(o, p5, L, B)
    this.opId = o.opId ? o.opId : newId("opMuda")
  }

  executeOp() {
    console.log("spill executed")
  }

  parameterDisplay() {
    return "Spill operation"
  }

  updateOperationPorts() {
    return { res: false, message: "no Spill Operation" }
  }
}


class Build extends Operations {
  constructor({...o}, p5, L, B) {
    super(o, p5, L, B)
    this.opId = o.opId ? o.opId : newId("opBuild")

    this.portIn = []
    this.prevToDoList = []

  }

  resetOperation() {
    return 
  }

  toDoListChanged(){
    if ((this.toDoMatList.length==0 || this.prevToDoList.length==0) && (this.toDoMatList.length==this.prevToDoList.length)){
      return false
    }
    return Game.compareArraysByProps(this.toDoMatList, this.prevToDoList, "uniqueKey")
  }

  parameterDisplay() {
    return "Slå ihop [stol]"
  }

  calcMatchValue(incL, corL, incB, corB) {
    let vList = [incL/corL, incB/corB]
    // console.log("values:", vList)

    // let v = vList.reduce((acc, cur)=>{
    //   console.log(cur)
    //   let nCur
    //   if(cur<1 && cur) {
    //     console.log("keep same v")
    //     nCur = cur
    //   } else if (cur>1 && cur<2) {
    //     console.log("remove from 2")
    //     nCur = 2-cur
    //   } else {
    //     console.log("floor it")
    //     nCur = 0.01
    //   }
    //   console.log(acc, nCur)
    //   return acc + nCur
    // }) 

    let nCur = 0
    vList.forEach(cur=>{
          if(cur<=1 && cur) {
            console.log("keep same v")
            nCur += cur
          } else if (cur>1 && cur<2) {
            console.log("remove from 2")
            nCur += 2-cur
          } else {
            console.log("floor it")
            nCur += 0.01
          }
    })

    // console.log("value:", nCur, "from", incL ,"/", corL, incB ,"/", corB)
    return nCur
  }

  executeOp() {
    console.log(this.toDoMatList)

    // let prodParts = [...this.L.challenge[0].parts]
    
    // creates a copy of the blueprint to compare with
    
    let bpParts = this.L.challenge[0].parts
    let toDoList = [...this.toDoMatList]
    //list of all correct mats
    let bpMats = []

    //creates the array for the product with mods with parts empty too be filled with "correct/ncorrect and missing mats/wood"

    bpParts = bpParts.map(mod=>{

      //adds correct mats to bpMats and ads status prop to tell where they belong iin which module
      mod.parts.forEach(mat=>{
        let nm = {...mat}
        nm.belongsToMod = mod.name 
        bpMats.push(nm)
      })
      return {...mod}
    })
    
    //if there's more todo mats then needed the array is plane cut down to the right amount
    let lengthDif = toDoList.length - bpMats.length
    console.log("todo length", toDoList.length, lengthDif, )
    if(lengthDif>0) {
      toDoList = toDoList.filter((m, i)=>i<7)
    }


    console.log("todo length after, should be 7", toDoList.length)

    //used to remove mats that get ocupied
    let bpMatsLeft = [...bpMats]
    // console.log("1-->corrects mats", bpMats)

    //finds pieces that are correct and 
    let correctMats = toDoList.map((mat, i)=>{
      mat.removeMat = false
      let cM = bpMatsLeft.find(m=>mat.parts.l==m.parts.l && mat.parts.b==m.parts.b )
      if(cM) {
        cM.status = "correct"
        cM.nodalFactor = 2
        removeFromArray(bpMatsLeft,bpMatsLeft.findIndex(m=>m.partId==cM.partId))
        mat.removeMat = true
        return cM
      } else {
        return false
      }
    }).filter(m=>m)

    toDoList = toDoList.filter(m=>!m.removeMat)
    //remove matching elememnts from toDo

    // console.log("2-->correctMats", correctMats)
    // console.log("toDos left", toDoList)
    // console.log("corrects mats left", bpMatsLeft)

    //incorreect mats match bpMats ---------------------------
    //every mat in toDoList goes through the bpMatsleft to see which mat it matches best with by
    //dividing its side with the bpMat side (with som added rules). resulting in a value .01-1
    
    let incorrectMats = toDoList.map(mat=>{
      // console.log("bpLeft",bpMatsLeft.length)

      let matchList = bpMatsLeft.map(m=>{
        return {bpMat: m, match: this.calcMatchValue(mat.parts.l, m.parts.l, mat.parts.b, m.parts.b) }
      }).sort((a,b)=>b.match-a.match)

      // console.log("matchList", matchList)
      let iM = matchList[0].bpMat
      
      //add that to prodParts
      iM.status = "incorrect"
      //adding the "wrong" dimeentions
      iM.parts = mat.parts
      iM.nodalFactor = matchList[0].match
      removeFromArray(bpMatsLeft,bpMatsLeft.findIndex(m=>m.partId==iM.partId))
      mat.removeMat = true

      //recalculate shapeddimentions
      let sides = ["front", "profile"]
      // console.log("incorrect mat", iM)
      sides.forEach(side=>{
        let dir = iM.belongsToMod=="Ben" ? 1 : -1
        iM[side] = {...iM[side]}
        if(iM[side].shape=="rect") {
          if(iM.belongsToMod!="Sits") {
            iM[side].h = iM[side].h < 0 ? iM.parts.l * -1 : iM.parts.l
          }

          if(iM.belongsToMod=="Sits" && side=="profile") {
            iM[side].w = iM[side].w < 0 ? iM.parts.l * -1 : iM.parts.l
          } else {
            iM[side].w = iM[side].w < 0 ? iM.parts.b * -1 : iM.parts.b
          }
          
        } else {
          iM[side].y2 = iM[side].y1+(iM.parts.l * dir)
          iM[side].y3 = iM[side].y4+(iM.parts.l * dir)
          if(side=="front") {
            iM[side].x2 = iM[side].x2+iM.parts.l
            iM[side].x1 = iM[side].x1+iM.parts.l
          }
        }
      })



      return iM
    })

    toDoList = toDoList.filter(m=>!m.removeMats)
    
    // console.log("3-->incorrectMats", incorrectMats)
    // console.log("toDos left", toDoList)
    // console.log("corrects mats left", bpMatsLeft)
    

    //missing mats
    let missingMats = bpMatsLeft.map(mat=>{
      let m = mat
      m.status = "missing"
      m.partId = mat.partId
      m.nodalFactor = 0
      // consoles.log(m)
      return m
    })

    // console.log(correctMats, incorrectMats, missingMats)
    let prodMats = correctMats.concat(incorrectMats, missingMats)
    // console.log(prodMats)


    let prodParts = bpParts.map(mod=>{
      let nMod = mod
      // console.log(nMod.parts)
      nMod.parts = nMod.parts.map(mat=>{
        let nMat = prodMats.find(m=>{
          return m.partId==mat.partId
        })
        // console.log(nMat)
        return nMat
      })
      return nMod
    })

    // console.log(prodParts)
    //add prop to each piece status = {status: "cor"/"incor"/"missing", corPart: {wood}, tempId: #}
    //--> join cor and incor arrays

    //--> add missing pieces

  
    let newProduct = {...this.L.challenge[0]}
    newProduct.curMechId = "prod"
    newProduct.fromMechId = "prod"
    newProduct.parts = prodParts
    newProduct.id = newId("prod")
    newProduct.type = "prod"

    let size = this.L.toolMenu.productAndChallengeDisplay.lrg

    this.L.product = []
    this.L.product.push(new Material(newProduct, this.p, this, this.B))
    // console.log("outputted product", this.L.product)
    this.L.product[0].front = new MaterialDisplay(size, L.product[0], "front", this.p, this.B, this.L)
    this.L.product[0].profile = new MaterialDisplay(size, L.product[0], "profile", this.p, this.B, this.L)
    this.L.toolMenu.productAndChallengeDisplay.product = this.L.product

    // console.log("p==p -> true?", this.L.product==this.L.toolMenu.productAndChallengeDisplay.product)
    // make sure the this.L.product and this.L.toolMenu.productAndChallengeDisplay.product


    //display mat
    return { res: false, message: "execute run succesfully" }
  }

  updateOperationPorts() {
    let m
    this.updateToDoList()
    if(this.toDoListChanged()) {
      // console.log("list is different, change product",this.toDoMatList, this.prevToDoList)
        this.executeOp()
        m = "changes in Build have been made, executee run"
    } else {
      // console.log("list is the same", this.toDoMatList, this.prevToDoList)
      m = "no changes made in Build"
    }


    //response to global function
    return { res: false, message: m }
  }

}

//muda

//create product