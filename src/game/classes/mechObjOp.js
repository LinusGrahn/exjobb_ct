

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

    this.action = o.action

    this.doneMatList = o.doneMatList ? o.doneMatList : []
    this.toDoMatList = o.toDoMatList ? o.toDoMatList : []

    
    this.parameters = o.parameters
    
    
    this.cost = o.cost
    this.costPerRun = o.costPerRun
    this.timesRun = 0

    this.pos = o.pos ? o.pos : {x: 0, y:0}
    
    
    this.shape = o.shape ? o.shape : new OpShape(this.pos, this, this.p, this.L, this.B)
    
    this.new ? this.closePortsOut() : {}
    this.new ? this.createPortOutStateReps() : {}
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
          y:this.shape.y + this.shape.bdryW
        }
      }
  
      let newStObj = new StateRep(stObj, this.p, this.L, this.B)
      this["portOut"+String.fromCharCode(65+i)] = newStObj
      this.L.stateReps.push(newStObj)
    }

    this.updatePorts()
  }

  updatePorts() {
    eFlow("Operations/update Ports (run from createPortOutStaeReps)")

    // console.log(this.shape.portList)
    this.shape.portList.forEach(item=>{
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
    if(!this.portIn) {
      this.portIn = stateRep
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

  disconnectPortIn() {
    eFlow("Operations/disconnectPortIn operations")
    this.portIn = null
    this.toDoMatList = []
    this.removeDoneMatFromPortOuts()

    //check staterep
    //remove Mat from port out state rep.
    //update
  }

  updateToDoList(matType) {
    eFlow("Operations/update toDo")

    // console.log("doneList", this.doneMatList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4) + "---clone: "+i.clone))
    // console.log("portInList", this.portIn.matList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4) + "---clone: "+i.clone))
    // console.log("toDoList - before", this.toDoMatList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4) + "---clone: "+i.clone))

    
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
    
    // console.log("toDoList - after", this.toDoMatList.map(i=>i.id.substr(-4) + "----uKey: "+ i.uniqueKey.substr(-4)+"---clone: "+i.clone))
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
}


class Cut extends Operations {
  constructor({...o}, p5, L, B) {
    super(o, p5, L, B)
    this.opId = o.opId ? o.opId : newId("opCut")

  }

  //used for most subClasses of Operations
  setParameters() {
    let {side, meassure} = this.parameters
    side = side ? side : "b"
    meassure = meassure ? meassure: 10

    this.parameters = {side: side, meassure: meassure}
  }

  //usd for all subclasses of oberations
  executeOp() {
    eFlow("CUT/executeOP cut")

    this.setParameters()
    let {side, meassure} = this.parameters
    
    let status
    // console.log("cut:", this.toDoMatLists)
    this.toDoMatList.forEach(item => {
      if(item.type != "wood") {
        console.log("cut only takes wood, " + item.type + " was ignored")
        return
      }
      if(this.portIn.passedMatList.find(m=>m.uniqueKey==item.uniqueKey)) {
        console.log("mat have been processed and was ignored", item)
        return
      }

      let output = this.action(side, +meassure, item.parts)
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

  }

  //used for most subClasses of Operations
  setParameters() {

    //player sets parameters

    this.parameters.condProp = "b"
    this.parameters.condOperatior = "<"
    this.parameters.condValue = "10"

  }

  //used for all subclasses of oberations
  executeOp()  {
    this.setParameters()
    let status
    
    this.toDoMatList.forEach(item=>{
      let res = this.action(this.parameters, item)

      if(this.portIn.passedMatList.find(m=>m.uniqueKey==item.uniqueKey)) {
        console.log("mat have been processed and was ignored", item)
        return
      }

      if(res!="Failed") {
        // if true add to portOutA eller add to portOutB

        //#new Material
        let newItem = {...item}
        newItem.clone = true
        newItem.prevMat.push(item)
        newItem.fromMechId = this.id
        let newMat = new Material(newItem, this.p, this.L, this.B)
        
        
        
        if(res) {
          newItem.curMechId = this.portOutA.id
          this.portOutA.matList.push(newMat)
        } else {
          newItem.curMechId = this.portOutB.id
          this.portOutB.matList.push(newMat)
        }
        //push mat into passetMatLIst in stateRep
        this.portIn.passedMatList.push(item)
        status = true
      } else {
        console.log("cant process: " + item)
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



//condition

//muda

//create Module

//create product

//evaluate