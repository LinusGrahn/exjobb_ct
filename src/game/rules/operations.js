//cuts wood in two pieces action(side, meassure, objTobeCut)
const opCut = {
  details: {
    name: "kapa",
    icon: "cut",

    description: "text about this operation",
    parameterStatus: "Kapa MÅTTEN av SIDAN",

    shape: "OpShape",
    outLabels: ["A", "B"],
    inLabels: ["in"],

  },

  cost: 200,
  costPerRun: 20,

  portRules: {out: 2, in: 1},

  parameters: {side: null, meassure: null},

  action: (side, meassure, material)=>{
    // console.log("matCUt in", material)
    //values for side is "l" or "b"
    //values for meassure is "1/2, "1/3", int (cm)
    //value for material is an matObj.parts = {l:int , b:int}
    // console.log("cut executed", side, meassure, material)
    
    meassure = meassure=="1/2" ? material[side]/2 : meassure === "1/3" ? material[side]/3 : meassure 
    
   
    let a = {...material}
    let b = {...material}
    
    
    a[side] = meassure
    b[side] =  b[side] - meassure
    let rule = (a[side]>=1 && b[side]>=1) ? true : false

    // console.log("cut Out", a,b, rule)

    let res = rule ? {a: a, b: b} : "Failed"
    // console.log("cut outputted: ", res)

    return res
  }


}

//devides material based on the pased condition action(codition, objToBeSorted)
const opSort = {
  details: {
    name: "Sortera",
    icon: "sort",

    description: "text about Sort",
    parameterStatus: "är BITAR vars BREDD == 10",

    shape: "OpShape",
    outLabels: ["Ja", "Nej"],
    inLabels: ["in"],

  },
  
  
  
  portRules: {out: 2, in: 1},

  cost: 200,
  costPerRun: 20,

  parameters: {condProp: null, condOperatior: null, condValue: null },

  action: ({...o}, material) => {
    //material is always one matObj
    let props = ["l","b","type", "name", "queue"] //nr or a string (type is a string)
    let operators = ["==", ">", "<", "!="]
    let typeValues = ["wood", "product", "module"]
    let nameValues = ["rygg", "ben", "sits"]
    //nrValue two-digit nr 

    if(!props.find(item=>o.condProp==item) || !operators.find(item=>o.condOperatior==item) || ![...nameValues, ...typeValues].find(item=>o.condValue==item || Number.isInteger(+o.condValue)) ){
      console.log("parameter invalid from: -->", o)
      return "Failed"
    }

    //check that parameter is valid
    let res
    let prop = (o.condProp == "b" || o.condProp == "l") ? material.parts[o.condProp] : material[o.condProp]
    
    // console.log(o.condProp + ":" + prop, o.condOperatior, o.condValue)

    switch (o.condOperatior) {
      case "==":
        res = prop == o.condValue
        break;
    
      case ">":
        res = prop > o.condValue
        break;
      
      case "<":
        res = prop < o.condValue
        break;
    
      case "!=":
        res = prop != o.condValue
        break;

      default:
        console.log("faulty operator?")
        break;
    }

    // console.log("sort executed", o.condProp + ":" + prop, o.condOperatior, o.condValue, "mat: ", material)

    return res 
  } 
}


const Evaluate = {
  portRules: {out: 0, in: 1},

  cost: 0,
  costPerRun: 0,

  shape: null,
  style: null,

  parameters: {},

  action: () => {

  }
}