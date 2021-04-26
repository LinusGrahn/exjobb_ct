
//operations------------------------------------------------------

let cut = {
  x:0, 
  y:0, 
  w:150, 
  h:55, 
  entId: null, 
  subId: null,
  opType: "cut",

  connectionRules: {inputs: 1, outputs: 2},
  inputs: [], 
  outputs: [], 


  //functional protperties
  operation: (s)=>{}, //defined elseware - 
  opDiscription: "Kapar en inkommande bräda efter de mått som anges i regeln och skickar ut de två kapade delarna i varsin utgång.",
  opName: "Beskär",
  operationParameters: "regler, bredd eller längd? på mitten, en tredjedel eller efter mått.", //object?

  style: {
    bdryFill: "rgba(100,100,100,0.11)",
    entFill: "blue",
    connectionFill: "orange"
  }

}


//test operations
let testOp = ()=>{
  let a = []
  for (let i = -2; i<3; i++) {
    let c = {...cut}; 
    c.x =  200*i
    c.y = 150*i
    // c.entId = i<1 ? "ent_239401231" + (4+i) : null
    // c.subId = i<1 ? "op_132333242" + (6+i) : null
    a.push(c)
  }
  return a
}

let gameBoard = {
  w: 2400,
  h: 2400,
  gridSize: 25,
}

const startY = (gameBoard.w/2 -100) * -1

//used to load a game or creat a new game.
let gameA = {
  operations: testOp(),



  connections: null,

  
  // entities: [
  //   {x:220, y:312, w: 55, h:55, entId: "ent_3528524373"},
  //   {x:11, y:267, w: 112, h:66}
  // ],
  gameId: null
}


let newGame = {
  //M=Mandatory for any game

  //the challenge the game poses- it's the blueprint of the product(s) 
  challenge: [prodBluePrint], //array of objects       M

  //currency and costs
  //cost ,                     M
  
  startMat: startMat, //array of meterial objects that the player may use   M


  //inital material statereps. stateReps.length == startMat.length
  stateReps: [
    {id: newId("stateRep"),
      matList: [startMat[0]],
      portInA: "closed",
      portInB: [],
      portOut: [],
      pos: {x: -150, y: startY}
    },
    {id: newId("stateRep"),
      matList: [startMat[1]],
      portInA: "closed",
      portInB: [],
      portOut: [],
      pos: {x: 100, y: startY}
    },
    {id: newId("stateRep"),
      matList: [startMat[2]],
      portInA: "closed",
      portInB: [],
      portOut: [],
      pos: {x: 350, y: startY}
    },
  ],

  skin: skin



}






