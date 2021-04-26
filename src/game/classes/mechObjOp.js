

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

    
    this.parameters = o.parameters
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
      if(+outA!=-1) {
        this.portOutA.matList.splice(outA,1)
      } 
      
      let outB = this.portOutB.matList.findIndex(mat=>mat.id==item.id)
      if(+outB!=-1) {
        this.portOutB.matList.splice(outB,1)
      } 
      
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
      this.portIn.splice(this.portIn.findIndex(sr=>sr.id==stateRep.id), 1)
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
      item.connecion ? this.L.connections.splice(this.L.connections.findIndex(c=>c.id==item.connection), 1) : {}
      
      //remove connection from ports and detach ports.
      if(item.portName=="portIn" && item.connection) {
        console.log(item)
        item.connection.detachPorts()
      } else if(item.connection){
        console.log(item)
        item.connection.detachPorts()
      }

      
      
    })
    mechOuts.forEach(item=>item.removeStateRep())

    this.L.operations.splice(this.L.operations.findIndex(op=>op.id=this.id), 1)
    
    this.L.updateGameState()
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

    let side = this.parameters.side=="l" ? "längden" : "brädden"

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
        SRList.splice(SRList.findIndex(m=>m.uniqueKey==mat.uniqueKey), 1)
        // console.log("srlist after", SRList.length)

        this.L.materials.splice(this.L.materials.findIndex(m=>m.uniqueKey==mat.uniqueKey && m.clone==mat.clone),1)
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
    
      console.log(console.log(item))
      //removefrom SR
      let srId = this.L.materials.find(m=>m.uniqueKey==item.uniqueKey && m.fromMechId==this.id)
      let srMl = this.L.stateReps.find(mech=>mech.id==srId.curMechId).matList
      srMl.splice(srMl.findIndex(m=>m.uniqueKey==srId.uniqueKey), 1)


      //remove from MatList
      this.L.materials.splice(this.L.materials.findIndex(m=>m.uniqueKey==item.uniqueKey && m.fromMechId==this.id),1)

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

  }

  resetOperation() {

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

  executeOp() {
    // take in the materials 

    //get the bluePrint

    //find a way to check and match pieces and create modules of the mats

    //feed it into L.product
    //if L:product is null create new Material.product

    //add displayFront
    //add displeySide

    //display mat
    //if product.display is null create new.



    return { res: false, message: "no Build operation" }
  }

  updateOperationPorts() {
    this.updateToDoList()

    return { res: false, message: "no Build operation" }
  }

}

//muda

//create product