

//aux functions
const newId = (type) => {
  let types = ["ent", "op", "rel", "in", "out", "mat"]
  let int = Math.round(Math.random()*Math.pow(10,10))
  
  // save to list?

  if(types.includes(type)) {
    let id = `${type}_${int}`
    console.log(id)

    return id
  }
}



let scaleFactor = 1

let exOp = [
  {coord: {x:300, y:300} },
  {coord: {x:200, y:200} },
  {coord: {x:600, y:400} },
]


// operations are elemnts that alter or effect state
let operations = []
// relations are lines that connect operations and state
let relations = []
// materials are representations of state in the flow
let materials = [] 

function setup() {
  let canvas = createCanvas(windowWidth*.9, windowHeight*.9);
  canvas.parent("gameCanvas")
  draw()

  noLoop()

  exOp.forEach(item=>{
    operations.push(new Entity(item))
  })
  
}

function draw() {
  
  //createe background
  background(220)
  
  //zooms the canvas
  // translate(2*scaleFactor, 1*scaleFactor)
  scale(scaleFactor)
 

  
  //add an entity to the array
  //this will be done when a player puts it into the field
  // let line = new Line({coordStart:{x:600,y:50},coordEnd:{x:640, y: 90}})
  relations.forEach(item=>{
   item.display()
  })

  //rerenders canvas elements and puts the selected one last in the array
  operations.sort(item=>item.selected)
  operations.forEach(item=>{
    item.display()
  })

}


//--------------_EVENTS_-----------------------------//


//eventlistener for clickevent
function mousePressed(e) {
  console.log(e)
  console.log(mouseX,mouseY)
  loop()
 //----------eventlisteners 


  //call the events for enteties if it has been targeted
  operations.forEach(item=>{
    if(item.effectedByEvent()) {
      item.click()
    }

    if(item.outputTargeted() && item.relations.outputId==null) {

      //mouse x and y are just default values passed when created. the mouseEvent is controlled in Conection.display()
      let con = new Connection(item.outputCoord,{x:mouseX, y:mouseY}, item.id)
      relations.push(con)
    }

  })

  // redraw()
  return false
}

//eventlistener for release event.
function mouseReleased(e) {
  
  //checks if there's an unceonnected connection
  let unconnected = relations.find(item=>!item.connected)
  
  operations.forEach(item=>{
    if(item.selected){
      item.releaseClick()
      item.dropped()
    }

    if(item.inputTargeted() && unconnected != undefined) {
      relations[relations.findIndex(o=>o.id==unconnected.id)].connect(item.id)
      //clears unconnected variable for mouseRelease Scope.
      unconnected = undefined
      
    }

  })

  if(unconnected) {
    console.log("run?")
    relations.splice(relations.findIndex(o=>o.id==unconnected.id), 1)
  }

  

  noLoop()
  print("is looping:",isLooping())
  return false
}

//event for drag 
function mouseDragged(e) {
  operations.forEach(item=>{
    if(item.selected){
      item.dragged()
    }  
  })
  return false
}

function mouseWheel(e){
  // console.log(e.delta)
  console.log(e.deltaY)
  // console.log(e.deltaX)
  // loop()
  e.preventDefault()
  scaleFactor = e.delta>0 ? scaleFactor*1.008 : scaleFactor*0.992
  redraw()
  // resizeCanvas(windowWidth*e.deltaX, windowHeight*e.deltaY)
  // redraw()
}


//-----------------_Objects_--------------------------//




class Entity {
  constructor({coord}) {
    this.curCoord = {x:coord.x, y:coord.y}
    this.prevCoord = this.curCoord
    this.col = "yellow"
    this.selected = false
    this.id = newId("ent")
    this.size = 50;
    this.connectionSize = 10
    this.relations = {inputId: null, outputId: null}
  }

  getCurCoordinates() {
    // this.curCoord = {x:this.curCoord.x*scaleFactor, y:this.curCoord.y*scaleFactor}
    // this.size = this.size*scaleFactor

    this.inputCoord = {x: this.curCoord.x+(this.size/2), y: this.curCoord.y-(this.size/2)}
    this.outputCoord = {x: this.curCoord.x+(this.size/2), y: this.curCoord.y+this.size*1.5}
    this.center = {x: this.curCoord.x+this.size/2, y: this.curCoord.y-this.size/2}
    this.centerTop = {x: this.curCoord.x+this.size/2,  y: this.curCoord.y}
    this.centerBottom = {x: this.curCoord.x+this.size/2,  y: this.curCoord.y+this.size}


    // if(this.relations.inputId) {
    //   // only workls with one

    //   relations.find(item=>item.id==this.relations.inputId).coordEnd = this.inputCoord
    // }

    // if(this.relations.outputId) {
    //   // only workls with one

    //   relations.find(item=>item.id==this.relations.outputId).coordEnd = this.outputCoord
    // }


  }


  //checks if the object should be effected by the event
  effectedByEvent() {
    let calcPosX = (this.curCoord.x+this.size/2*scaleFactor)
    let calcPosY = (this.curCoord.y+this.size/2*scaleFactor)
    let calcMX = mouseX/scaleFactor
    let calcMY = mouseY/scaleFactor

    let d = dist(calcMX, calcMY, calcPosX,calcPosY)
    
    //behaves like the entity is a circle when size is radius
    return d<this.size/2/scaleFactor ? true : false

    //calc a rect
    // if(
    //   (mouseX > this.curCoord.x) && (mouseX < this.curCoord.x+this.size) && 
    //   (mouseY > this.curCoord.y) && (mouseY < this.curCoord.y+this.size)
    //   ) {
    //     return true
    // } else {
    //   return false
    // }


  }

  outputTargeted() {
    this.getCurCoordinates()
    let d = dist(mouseX, mouseY, this.outputCoord.x, this.outputCoord.y)

    return d<this.connectionSize ? true : false
  }

  inputTargeted() {
    this.getCurCoordinates()
    let d = dist(mouseX, mouseY, this.inputCoord.x, this.inputCoord.y)

    return d<this.connectionSize ? true : false
  }



  click() {
    this.col = "green"
    this.selected = operations.find(item=>item.selected) ? false : true
  }
  
  releaseClick() {
    this.col = "red"
    this.selected = false
  }

  dragged() {
    this.curCoord = {x:(mouseX - (this.size/2))/scaleFactor, y:(mouseY - (this.size/2))/scaleFactor}



  }

  dropped() {
    this.selected = false
    //if object is going to be connected to something then stay and connect
    //if object is newly created and not to be connected --> remove
    if(false) {
      this.curCoord = this.prevCoord
      //or delete
    }
  }

  display() {
    this.getCurCoordinates()
    

    fill(this.col)

    // ellipse(this.curX, this.curY, this.size, this.size);
    
    //only draws input and output when not selected
    if(!this.selected) {
      //input Line
      line(this.inputCoord.x, this.inputCoord.y, this.centerTop.x, this.centerTop.y)
      //input
      ellipse(this.inputCoord.x, this.inputCoord.y, this.connectionSize, this.connectionSize)
      //output Line
      line(this.outputCoord.x, this.outputCoord.y, this.centerBottom.x, this.centerBottom.y)
      //output
      ellipse(this.outputCoord.x, this.outputCoord.y, this.connectionSize, this.connectionSize)

    }

    //entity element
    rect(this.curCoord.x, this.curCoord.y, this.size, this.size, 5,5,5,5);
  }
}

class Connection {
  constructor(coordStart,coordEnd, inputId) {
    this.coordStart = coordStart
    this.coordEnd = coordEnd
    this.connected = false
    this.id = newId("rel")
    this.relations = {
      inputId: inputId,
      outputId: null
    }
  }

  connect(id) {
    // let d = dist(mouseX, mouseY, this.curCoord.x+25, this.curCoord.y+25)
    let startEnt = operations.find(item=>item.id==this.relations.inputId)
    let endEnt = operations.find(item=>item.id==id)
    
    startEnt.relations.outputId = this.id
    endEnt.relations.inputId = this.id

    this.relations.outputId = id

    endEnt.getCurCoordinates()

    this.coordEnd = {x:endEnt.inputCoord.x, y: endEnt.inputCoord.y}

    this.connected = true
  }


  display() {
    // stroke("black")

    if(!this.connected) {
      this.coordEnd = {x:mouseX, y:mouseY}
    }

    line(this.coordStart.x, this.coordStart.y, this.coordEnd.x, this.coordEnd.y)
  }
}
















class ObjEx {
  // constructor({coordStart,coordEnd, }) {
  //   this.coordStart = coordStart
  //   this.coordEnd = coordEnd
  // }


  //EVENTHANDLERS

  // display() {

  // }
}