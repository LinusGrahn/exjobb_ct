
let testPos = {x:430, y:100}


function setup() {
  let canvas = createCanvas(windowWidth*.9, windowHeight*.9);
  canvas.parent("gameCanvas")


 window.zF = .8  // zoom factor
 window.zFLimit = {min: 0.2, max:2.5}
 window.zSpeend = .01
 window.entities
 window.board = {
   x: windowWidth/2, 
   y: windowHeight/2, 
   minX: -1600, 
   minY: -1600, 
   maxX: 1600,
   maxY: 1600
  } //board orientation
 window.movingBoard = false
 window.gridSize = 25



  draw()

  noLoop()
  
}

function draw() {
  
  //createe background
  background(220)
  
  

  push()
  //orients the board and zoom
  translate(board.x, board.y)
  scale(zF)
  
  drawGrid()

  entities = [new R(0,0,50),new R(90,60,50)]
  entities.map(item=>{item.display()})


  let b = new Connection(32,43,testPos.x,testPos.y)
  b.display()


  pop()


  //Toolbar and object unefected by orientation and zoom
  rect(30,30,100,100)

}


// Events ---------------------------------

function mousePressed(e) {
  // console.log(e)
  mouseValues()
  

  loop()
 //----------eventlisteners 

  if(entities[0].effectedByEvent()) {
    console.log("hit")
  } else {
    console.log("orientaion")
    movingBoard = true
  }


  return false
}

//eventlistener for release event.
function mouseReleased(e) {
  
  movingBoard = false 
  
  testPos = {
    x: (mouseX-board.x)/zF,
    y: (mouseY-board.y)/zF
  }

  noLoop()
  // print("is looping:",isLooping())
  return false
}

//event for drag 
function mouseDragged(e) {
  
  
  // console.log("x-move", e.movementX)
  // console.log("y-move",e.movementY)


  
  if(movingBoard) {
    let dir = {
      x: e.movementX < 0 ? "east" : "west",
      y: e.movementY < 0 ? "south" : "north"
    }

    if(boardInsideScreen()[dir.x]) {
      board.x += e.movementX
    }

    if(boardInsideScreen()[dir.y]) {
      board.y += e.movementY
    }

    //control min and max 
    //if window/2 <> then min/max don't change
  }

  // console.log("translated--> ", board.x, board.y)

  return false
}

function mouseWheel(e){
  // console.log(e.delta)
  // console.log("zF", zF)
  e.preventDefault()

  if(boardInsideScreen().all) {
    zF = e.delta>0 ? zF*(1+zSpeend) : zF*(1-zSpeend)  //increments with 0.01
  } else if(e.delta>0){
    zF = zF*1.01
  }

  redraw()

}



class R {
  constructor(x,y,size){
    this.x = snapToGrid(x)
    this.y = snapToGrid(y)
    this.size = size

  }

  effectedByEvent() {
    //calculates mouse and object center position according to scale
    let size = this.size*zF/2
    let pX = this.x * zF + size + board.x
    let pY = this.y * zF + size + board.y
    let mX = mouseX
    let mY = mouseY

    
    let d = dist(mX,mY,pX,pY)


    // console.log(d)
    // console.log(size)
    // console.log(pX,pY)
    // console.log(mX,mY)

    return d < size ? true : false
  }


  display() {
    rect(this.x, this.y, this.size, this.size)
  }
}




class Connection {
  constructor(x1,y1,x2,y2) {
    this.sX = snapToGrid(x1)
    this.sY = snapToGrid(y1)
    this.eX = snapToGrid(x2)
    this.eY = snapToGrid(y2)
    this.pathArr = []
  }

  
  calcPath() {
    // console.log("calcPath() run")
    let openSet = [{
      x:this.sX, 
      y:this.sY,
      g:0,
      h:dist(this.sX, this.sY, this.eX, this.eY),
      f: 0 + dist(this.sX, this.sY, this.eX, this.eY),
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
          {x:currentNode.x, y:currentNode.y-gridSize}, //north
          {x:currentNode.x+gridSize, y:currentNode.y},  //east
          {x:currentNode.x, y:currentNode.y+gridSize},  //south
          {x:currentNode.x-gridSize, y:currentNode.y}   //west
        ]

        neighbours = neighbours.filter((neighbour, index)=>{
          let pass = true
          // console.log(currentNode)
          if (!index && !currentNode.prev.length) {
            pass = false
          }

          //collission with entities
          //may cause bug
          entities.forEach(item=>{
            if(neighbour.x > item.x && neighbour.x < item.x+item.size && neighbour.y > item.y && neighbour.y < item.y+item.size) {
              pass = false
            }
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
          neighbour.g = dist(this.sX, this.sY, neighbour.x, neighbour.y) 
          neighbour.h = dist(neighbour.x, neighbour.y, this.eX, this.eY)
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

      if(debug > 400) {
        console.log("pathfinder passed 300 check for bug")
        openSet = []
      }
    }

    
    
    return nodes
  }

  display() {
    // console.log("goal is: ", this.eX, this.eY)


    stroke("red")
    strokeWeight(2)
    // line(this.startX, this.startY,this.endX,this.endY

    strokeJoin(ROUND)
    strokeCap(PROJECT)
    smooth()
    noFill()
    beginShape()
    this.pathArr = this.calcPath()
    this.pathArr.forEach((item,index)=>{
        vertex(item.x, item.y)
    })
    endShape()

    // console.log(this.pathArr[this.pathArr.length-1])


  }
}



//orientation functions


function drawGrid() {
  let colnr = (board.minX - board.maxX)*-1/gridSize
  let rownr = (board.minY - board.maxY)*-1/gridSize


  stroke(90,90,90)

  for(let i=0; i<=colnr; i++) {
    let x = board.minX + i*gridSize
    let y = board.minY + i*gridSize

    line(x, board.minY, x, board.maxY)
  }

  for(let i=0; i<=rownr; i++) {
    let x = board.minX + i*gridSize
    let y = board.minY + i*gridSize

    line(board.minX, y, board.maxX, y)
  }
}

function snapToGrid(v) {
  // {x,y} arguments
  // return {x: Math.round(x/gridSize) * gridSize, y: Math.round(y/gridSize) * gridSize}
  return Math.round(v/gridSize) * gridSize
}

function centerBoard() {
  board.x = windowWidth/2, 
  board.y = windowHeight/2
  zF = 1
  redraw()
}

function mouseValues() {
  console.log(board)
  console.log("mouse values on screen ", mouseX, mouseY)
  console.log("mouse values on board", (mouseX-board.x)/zF, (mouseY-board.y)/zF)
}

function screenToboardCoordCoverter(x,y) {
  return {x: (x-board.x)/zF, y: (y-board.y)/zF}
}

function boardToScreenCoordConverter(x,y) {
  return {x: x*zF+board.x, y: y*zF+board.y}
}

//returns if north,east,south and west is true
function boardInsideScreen() {
  let min = boardToScreenCoordConverter(board.minX,board.minY)
  let max = boardToScreenCoordConverter(board.maxX,board.maxY)
  
  // console.log(min, max)

  let r = {
    north: min.y < 0 ? true : false,
    east: max.x > width ? true : false,
    south: max.y > height ? true : false,
    west: min.x < 0 ? true : false 
  }
  r.all = (r.north && r.east && r.south && r.west) ? true : false

  return r
}