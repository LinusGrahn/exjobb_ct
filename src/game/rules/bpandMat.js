

//this is a compositionProp for a chair (or a blueprint as it is the "correct" composition)
//bluePrint containes modH, modW AND ModD in modules in partsArray // not the same as l and b
let prodBluePrint = {
  name: "stol",
  type: "prodBP",
  parts: [
    {
      name: "Rygg",
      type: "modBP",
      modH: 50,
      modW: 45,
      modD: 10,
      parts: [
        {name: "material", partId:newId("part"), parts: {b:35, l:35}, type:"wood", index: 1,
          front: {shape:"rect", x: 40, y: 35, w: -35, h: -35, corners: 10},
          profile: {shape:"quad", x1: 35, y1: 35, x2: 40, y2: 0, x3: 45, y3: 0, x4: 40, y4: 35}
        
        },
        {name: "material", partId:newId("part"), parts: {b:5, l:35}, type:"wood",  index: 0,
          front: {shape:"rect", x: 25, y: 50, w: -5, h: -35, corners: 0},
          profile: {shape:"quad", x1: 37.5, y1: 50, x2: 42.5, y2: 15, x3: 45, y3: 15, x4: 40, y4: 50}
        }
      ],
      id: "mod_27836048255"
    },
    {
      name: "Sits", 
      type: "modBP",
      modH: 5,
      modW: 45,
      modD: 45,
      parts: [
        {name: "material", partId:newId("part"), parts: {b:45, l:45}, type:"wood", index: 0,
        front: {shape:"rect", x: 0, y: 0, w: 45, h: 5, corners: 0},
        profile: {shape:"rect", x: 0, y: 0, w: 45, h: 5, corners: 0}
        }
      ],
      id: "mod_2783783026"
    },
    {
      name: "Ben", 
      type: "modBP",
      modH: 50,
      modW: 45,
      modD: 45,
      parts: [
        //left front leg
        {name: "material", partId:newId("part"), parts: {b:10, l:50}, type:"wood", index: 1,
          front: {shape:"quad", x1: 5, y1: 0, x2: 0, y2: 50, x3: 5, y3: 50, x4: 10, y4: 0},
          profile: {shape:"quad", x1: 10, y1: 0, x2: 0, y2: 50, x3: 5, y3: 50, x4: 15, y4: 0}
        },
        //right front leg
        {name: "material", partId:newId("part"), parts: {b:10, l:50}, type:"wood", index: 1,
          front: {shape:"quad", x1: 35, y1: 0, x2: 40, y2: 50, x3: 45, y3: 50, x4: 40, y4: 0},
          profile: {shape:"quad", x1: 10, y1: 0, x2: 0, y2: 50, x3: 5, y3: 50, x4: 15, y4: 0}
        },
        //left Back leg
        {name: "material", partId:newId("part"), parts: {b:10, l:50}, type:"wood", index: 1,
          front: {shape:"quad", x1: 5, y1: 0, x2: 0, y2: 50, x3: 5, y3: 50, x4: 10, y4: 0},
          profile: {shape:"quad", x1: 35, y1: 0, x2: 40, y2: 50, x3: 45, y3: 50, x4: 40, y4: 0}
        },
        //right back leg
        {name: "material", partId:newId("part"), parts: {b:10, l:50}, type:"wood", index: 1,
          front: {shape:"quad", x1: 35, y1: 0, x2: 40, y2: 50, x3: 45, y3: 50, x4: 40, y4: 0},
          profile: {shape:"quad", x1: 35, y1: 0, x2: 40, y2: 50, x3: 45, y3: 50, x4: 40, y4: 0}
        }
      ],
      id: "mod_7827832783"
    }
  ],
  id:"bp_2896718356"
}


let startMat = [
  {name: "A", parts: {b:30, l:60}, id:"wood_2373821946", type:"wood"},
  {name: "B", parts: {b:60, l:50}, id:"wood_2914037864", type:"wood"},
  {name: "C", parts: {b:70, l:60}, id:"wood_8016393672", type:"wood"}
]

let modTest = {
  name: "Rygg",
  type: "modBP",
  modH: 50,
  modW: 45,
  modD: 10,
  parts: [
    {name: "material", partId:newId("part"), parts: {b:35, l:35}, type:"wood", index: 1,
      front: {shape:"rect", x: 40, y: 35, w: -35, h: -35, corners: 10},
      profile: {shape:"quad", x1: 35, y1: 35, x2: 40, y2: 0, x3: 45, y3: 0, x4: 40, y4: 35}
    
    },
    {name: "material", partId:newId("part"), parts: {b:5, l:35}, type:"wood",  index: 0,
      front: {shape:"rect", x: 25, y: 50, w: -5, h: -35, corners: 0},
      profile: {shape:"quad", x1: 37.5, y1: 50, x2: 42.5, y2: 15, x3: 45, y3: 15, x4: 40, y4: 50}
    }
  ],
  id: "mod_27836048255"
}









let MatDisplayshape = {
  x: -150,
  y: -90,
  w: 170
}


let testPos = ()=>{
  return {
    x: -250 + Math.round(Math.random()*500),
    y: -250 + Math.round(Math.random()*500)
  }
}