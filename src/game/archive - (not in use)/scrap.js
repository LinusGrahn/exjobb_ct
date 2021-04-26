//v-1 DISFUNCTIONS
function calcPath() {
  console.log("---------------FUNCTION RUN: calcPath from ", this.id.substr(-4),"--------------------")
 
  //1 a temp x and y are created 
  let sX = this.sX
  let sY = this.sY + this.B.gridSize
  let eX = this.eX
  let eY = this.eY


  //2 an open set, the first positioin (defining the starting position)
  let openSet = [{
    x:sX, 
    y:sY,
    g:0,
    h: this.p.dist(sX, sY, eX, eY),
    f: 0 + this.p.dist(sX, sY, eX, eY),
    prev: []
  }]

  // console.log(openSet, sX, sY, eX, eY)
  // console.log(openSet[0])


  //3 nodes are the list that will be returned and later drawn in this.display()
  //closedSet are items that have been checked and added to the openset
  //debug count each whileloop run and stops on 300 to make sure that no endless loope will run
  let nodes = [{x: this.sX, y: this.sY}]
  let closedSet = []
  let debug = 0


  //all mechanis are put into an Array
  let mechArr = [...this.L.stateReps, ...this.L.operations]

  //defines that this connection is connectable from the beginning
  //meaning that a path will be returned
  //onPort contains a portObject if endPOs is over a port and false if not the case
  this.connectable = true 
  let onPort = false

  //4. Case 1: if endPos is on a port it is inside the bdry and the endPos is moved
  //a step out with an added step added in the end to make iit appeer that the path goes all the way to the port
  //if case 1 iis true this.connectable will be true and onPort will be the targeted port
  //else this.connectable is false and a "forbidden drop pos"

  // mechArr.forEach(item=>{
  //   //if inside bdry
  //   if(item.shape.posInsideShape(eX,eY,"bdry")) {
  //     let pin = item.shape.portList.filter(item=>item.type=="in").find(port=>port.insidePort(eX, eY))
  //     //if another in port but self is targeted
  //     if(pin && pin.mech.id != this.startPort.mech.id) {
  //         this.connectable = true
  //         let x = pin.portName == "portInB" ? pin.cX - this.B.gridSize : pin.cX
  //         let y = pin.portName == "portInB" ? pin.cY : pin.cY + this.B.gridSize
  //         eX = x
  //         eY = y
  //         onPort = pin
  //       } else {

  //       }

  //   }  
  // })

  //in case 1. this.connectable is false and and this connection is open a
  //straight (red) line is from start to end is drawn to illustrate it's forbidden
  
  if(!this.connectable && this.openEnd) {
    openSet = []
    return [
      {x: this.sX, y:this.sY },
      {x: eX, y:eY }
    ]
  }


  //5 loops starts and looks for neigbour positions and calculates path
  while(openSet.length > 0) {
    debug++

    // console.log("openSet loop start:",openSet)
    //5.1 - findes the index with lowest f meaniing it's the most optimal pos to keep looking throught

    let lowInd = 0
    for(var i=0; i<openSet.length; i++) {
      if(openSet[i].f < openSet[lowInd].f) { lowInd = i; }
    }

    //5.2 - defines the most optimal currentNode that will be evaluated
    let currentNode = openSet[lowInd];
    
    //5.3 remove currentNode from openlist and puts it n the closed list as it will be checked
    openSet.splice(lowInd, 1)
    closedSet.push(currentNode)
    
    // console.log("cur->",currentNode.x, currentNode.y, "end_>",eX, eY)

    //5.4 - end case - if current node is the same as the end the path is found and openList is emptied
    //and the loop stops. the history of all locations from this node that was stored in prev are added to nodeList and returned to be displayed
    if((currentNode.x == eX && currentNode.y == eY)) {
      console.log(debug, "---------------------------->found goal, trace path and return nodeList")
      //add last node if necesary and return
      nodes = [...nodes, ...currentNode.prev, currentNode]
      openSet = []
    } else {
      // console.log("still going")
      //find neighbours
      // always 3 neighbours
      //north - east - south - west

      //5.5 - if currentNOde isn't end a list off posible neighbours are created to be checked 
      //of and then added to the next iteration if they pass
      let neighbours = [
        {x: currentNode.x, y: currentNode.y-this.B.gridSize}, //north
        {x: currentNode.x+this.B.gridSize, y: currentNode.y},  //east
        {x: currentNode.x, y: currentNode.y+this.B.gridSize},  //south
        {x: currentNode.x-this.B.gridSize, y: currentNode.y}   //west
      ]
      
      // console.log("neigbours IN:",neighbours)

      //checks if its the first node and then 
      neighbours = neighbours.filter((neighbour, index)=>{
        let pass = true
        // console.log(currentNode)
        if (!index && !currentNode.prev.length) {
          // console.log("first node north removed -1")
          pass = false
        }

        //collission with entities and connection positions

        mechArr.forEach(item=>{
          // console.log("checking for collistion in", item.shape)
          if(item.shape.posInsideShape(neighbour.x,neighbour.y,"bdry")) {
            //-->neigbX and neigbY is inside bdry

            let pin = this.L.ports.filter(item=>item.type == "in")
            console.log(pin)
            pin = pin.find(item=>{
              return item.insidePort(neighbour.x, neighbour.y+this.B.gridSize) || item.insidePort(neighbour.x-this.B.gridSize, neighbour.y)
            })
            
            //if pin is true 
            console.log(index, neighbour, currentNode, pin)
            

            
            if(!pin) {
              // console.log("colission with shape! -1")
              pass = false 
            } else {
              neighbour.x = pin.cX
              neighbour.y = pin.cY
            }
   
          }
          
        })


 

        //exist in closedSet
        // console.log("open set-->",openSet)
        // console.log("closed set-->",closedSet)
        // console.log("in closed set?",closedSet.find(item=>item.x==neighbour.x && item.y==neighbour.y))
        // console.log("in open set?",openSet.find(item=>item.x==neighbour.x && item.y==neighbour.y))

        if(closedSet.find(item=>item.x==neighbour.x && item.y==neighbour.y) != undefined) {
          // console.log("YES - in CLOSED set -1")
          pass = false
        }
        //exist in openSet
        if(openSet.find(item=>item.x==neighbour.x && item.y==neighbour.y) != undefined) {
          // console.log("YES - in OPEN set -1")
          pass = false
        }

        //adding new data to neighbour
        neighbour.g = this.p.dist(sX, sY, neighbour.x, neighbour.y) 
        neighbour.h = this.p.dist(neighbour.x, neighbour.y, eX, eY)
        neighbour.f = neighbour.g+neighbour.h
        neighbour.prev = [...currentNode.prev, currentNode]

        // console.log("pass is", pass)
        return pass
      })
      // console.log("neighbours OUT", neighbours)
      openSet = openSet.concat(neighbours).sort((a,b)=>{a.f-b.f})
      
    }
    // console.log("end neighbours", neighbours)
      // console.log("end openSet", openSet.length)
      // console.log("end closedSet", closedSet)
      // console.log("end ", currentNode)

    if(debug > 50) {
      console.log("pathfinder passed 50 check for bug")
      openSet = []
    }
  }
  

  // nodes.push({x: eX, y: eY})
  // if(onPort) {
  //   nodes.push({x: onPort.cX, y: onPort.cY})
  // }
  
  console.log(nodes)
  return nodes
}

//v 2.0 - basic functions as it should
function calcPath() {
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
 
  while(openSet.length > 0) {
    //counts times loop iterates
    debug++

    // let lowInd = 0
    // for(var i=0; i<openSet.length; i++) {
    //   if(openSet[i].f < openSet[lowInd].f) { lowInd = i; }
    // } 


    // //5.2 - defines the most optimal currentNode that will be evaluated
    // let currentNode = openSet[lowInd];

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

      // console.log("current is ", currentNode, "north is", neighbours[0],
      // "east is", neighbours[1],"south is", neighbours[2],"west is", neighbours[3],
      // )

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
    if(debug > 300) {
      console.log("pathfinder passed", debug, "check for bug")
      openSet = []
    }
  
  }

  //return list of path pos
  // bug ? console.log(nodes) : {}
  return nodes
}

//v-2.5 - working as iit should
function calcPath() {
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

  //if true and no portIN is targeted no path is calculated
  if(inBdry && !pin) {
    this.connectable = false
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
    if(debug > 300) {
      console.log("pathfinder passed", debug, "check for bug")
      openSet = []
    }
  
  }

  //return list of path pos
  // bug ? console.log(nodes) : {}
  return nodes
}

//nice to fix that connections dosn't connect along shape-borders
//add diagonals and larer steps.



