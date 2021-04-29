//OPERATIONS
  //content needed




//cuts wood in two pieces action(side, measure, objTobeCut)
const opCut = {
  details: {
    name: "kapa",
    icon: "cut",

    description: "Den här maskinen beskär virken. Den tar bara emot olika träbitar, inget annat! Du kan välja att beskära bitarna du skickar in längs längden eller längs bredden, samt bestämma mått. Måttet du väljer kommer att kapas på den sidan du valt. Det nya virket med det definierade måttet skickas ut vid A och resterande virke skickas ut vid B.",
    parameterStatus: "Kapa MÅTTEN av SIDAN",

    shape: "OpShape",
    outLabels: ["A", "B"],
    inLabels: ["in"],

  },

  cost: 200,
  costPerRun: 20,

  portRules: {out: 2, in: 1},

  parameters: {side: null, measure: null},

  action: (side, measure, material)=>{
    // console.log("matCUt in", material)
    //values for side is "l" or "b"
    //values for measure is "1/2, "1/3", int (cm)
    //value for material is an matObj.parts = {l:int , b:int}
    // console.log("cut executed", side, measure, material)
    // console.log(measure)

    measure = measure=="1/2" ? +material[side]/2 : measure == "1/3" ? +material[side]/3 : measure 
    
    // console.log(measure, material[side], material)
    // console.log(+material[side]/2, +material[side]/3, measure)
   
    if(measure<1 || measure > material[side]) {
      return "Failed"
    }

    let a = {...material}
    let b = {...material}
    
    a[side] = Math.ceil(measure)
    b[side] =  b[side] - Math.ceil(measure)
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

    description: "Den här maskinen analyserar virken efter mått längs längden eller bredden, samt när den virket skickas in i maskinen. Du kan välja att den ska kolla efter virken som är lika med ett visst mått, mindre än ett mått, större än ett mått eller inte lika med ett mått. Samma gäller köplats: lika med, mindre än, större än eller inte lika med en köplats. Om den upptäcker något som stämmer på vad den letar efter så skickas virket till A och om det inte stämmer in på vad maskinen letar efter så skickas det till B.",
    parameterStatus: "är BITAR vars BREDD == 10",

    shape: "OpShape",
    outLabels: ["Ja", "Nej"],
    inLabels: ["in"],

  },
  
  
  
  portRules: {out: 2, in: 1},

  cost: 200,
  costPerRun: 20,

  parameters: {condProp: null, condOperator: null, condValue: null },

  action: ({...o}, material) => {
    // console.log(material)
    //material is always one matObj
    let props = ["l","b","type", "name", "sRqueue"] //nr or a string (type is a string)
    let operators = ["==", ">", "<", "!="]
    let typeValues = ["wood", "product", "module"]
    let nameValues = ["rygg", "ben", "sits"]
    //nrValue two-digit nr 

    if(!props.find(item=>o.condProp==item) || !operators.find(item=>o.condOperator==item) || ![...nameValues, ...typeValues].find(item=>o.condValue==item || Number.isInteger(+o.condValue)) ){
      console.log("parameter invalid from: -->", o)
      return "Failed"
    }

    //check that parameter is valid
    let res
    let prop = (o.condProp == "b" || o.condProp == "l") ? material.parts[o.condProp] : material[o.condProp]
    
    // console.log(o.condProp + ":" + prop, o.condOperator, o.condValue)

    switch (o.condOperator) {
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

    // console.log("sort executed", o.condProp + ":" + prop, o.condOperator, o.condValue, "mat: ", material)

  
    return res 
  } 
}


const opBuild = {
  details: {
    name: "Slå ihop",
    icon: "build",

    description: "Den här kan vara den mest intelligenta maskinen jag har! Den tar alla dina tillklippta bitar och sätter samman dem till en stol. Den liksom vet hur allt ska gå ihopa. Efter den här maskinen är klar, så är det bara att leverera stolen till kunden, och njuta av ett bra jobb gjort!",

    parameterStatus: "är BITAR vars BREDD == 10",

    shape: "OpShape",
    outLabels: [],
    inLabels: ["in"],

  },

  build: true,
  portOutA: "closed",
  portOutB: "closed",

  portRules: {out: 0, in: 1},

  cost: 0,
  costPerRun: 0,

  shape: null,
  style: null,

  parameters: {},

  action: () => {
    return
  }
}

//spil DUMMY
const opMuda = {
details: {
    name: "Spill",
    icon: "muda",

    description: "Ibland händer det att man får över bitar som inte kan använda till något. Då kommer den här stationen väl till pass! Bara släng ner de bitarna du inte har användning för, så kan du få en liten slant för dem!",
    shape: "OpShape",
    outLabels: [],
    inLabels: ["in"],

  },

  portOutA: "closed",
  portOutB: "closed",

  portRules: {out: 0, in: 1},

  cost: 0,
  costPerRun: 0,

  shape: null,
  style: null,

  parameters: {},

  action: () => {
    return
  }



}






//STATEREP

const stateRepInfo = {
  details: {
    name: "Flödesstatus för material",
    icon: "stateRep",
    description: "Det här är en fantastisk mojäng! Den visar dig en avbild av alla material och produkter som har existerat och existerar på den här punkten. Du kan skicka in resultatet från flera maskiner här och kan sen leda alla de olika bitarna och produkterna till en maskin. Tänk på möjligheterna!",

  },



}

const materialDetail = {
  details: {
    name: "Material",

    description: "Det här är en fin bit trä jag har köpt från Jeanette nere på Wings byggvaruhus! Som du kan se så har träbiten en längd och en bredd, vilket är väldigt viktigt för mina maskiner. De behöver väldigt enkla kommandon och det är därför du heller inte kan rotera träbitarna i ledet.",

  },



}


const challengeInfo = {
    name: "Bygg en stol",

    description: `Nedan ser du en tydlig beskrivning av stolen vi ska skapa! Här finns en ritning, samt alla mått du behöver. 
    Det är bara att sätta igång och placera ut mina maskiner!
    Det är bara att trycka på frågetecknet så kan du se och måtten och ritningen igen`,

    iconPath: null,
    id: "opChallenge",
    opId: "opChallenge",


}

