
class DOMShape {
  constructor({...pos}, shape, mech, p5, L, B) {
    this.p = p5,
    this.L = L
    this.B = B
    this.mech = mech
    this.shape = shape
    this.id = newId("DOMS")
    
  
    //default size and shape parameters
    this.w = this.p.windowWidth-20
    this.h = this.p.windowHeight/3
  
    let {x,y} = pos
    this.x = 0
    this.y = 0

    this.elem

    this.style = this.L.skin.elem
    this.typo = this.L.skin.typography
  
    // this.portList = []
  
    // this.L.shapes.push(this)
  }

  removeElem() {
    console.log("remove elems")
    this.removeDom = true
    this.shape.openDOM = false
    this.elem.remove()
    this.L.domElems.splice(this.L.domElems.find(item=>item.id==this.id), 1)
    this.L.matListOnCanvas = []
  }


  //retuen the element wrapping all the content elents inside
  createWrapper() {
    let wrapper = this.p.createDiv()
    wrapper.position(this.x, this.y)
    wrapper.elt.className = "wrapper"
    return wrapper
  }

  //creates and appends a container to the given parrent
  appendAndCreateContainer(type, parent) {
    // type == flex, flexCenter block or gallery / className
    let c = this.p.createDiv()
    c.elt.className = type
    // c.elt.onclick = () => {console.log("container clicked")}
    parent.elt.appendChild(c.elt)
    return c
  } 

  //creates a DOM headerlike element sml or large
  appendAndCreateHeader(content, type, parent) {
    // type== Sml/Lrg
    type = type ? type : "Sml"
    let h = this.p.createDiv(content)
    h.elt.className = "header"+type

    parent.elt.appendChild(h.elt)
    return h
  }

  //creatres a paragraph elem
  appendAndCreateP(content, parent) {
    let p = this.p.createP(content)
    p.elt.className = "gameP"

    parent.elt.appendChild(p.elt)
    return p
  }

  //creates a icon elem
  appendAndCreateIcon(src, parent) {
    let icon = this.p.createDiv() 
    icon.elt.className = "icon"
    icon.elt.style.backgroundImage = `url("${src}")`

    parent.elt.appendChild(icon.elt)
    return icon
  }


  //creates a button and a clickevent corresponding to propname and eventType (eType).
  appendAndCreateOpButton(label, value, parent, propName) {

    let button = this.p.createButton(label, value)
    button.elt.className = "button"

    button.elt.onclick = ()=>{
       //selects item
        //check if siblings are selected
      this.removeSelectedClass(parent)

      button.elt.classList.add("selected")

      this.mech.parameters[propName] = value
      //case for cut
      if(this.mech.parametersChanged()) {
        this.mech.resetOperation()
      } 
      //case for sort
      if(this.mech.parametersChanged() && propName=="condProp") {
        let vDiv = document.querySelector("#valueC").children[1].children[0]
        let vSlider = document.querySelector("#valueC").children[1].children[1]

        let max
        let inV = 1
        let str

        if (!this.mech.portIn) {
          max = 1
          str = "Inget inmatat material"
        } else if(value == "sRqueue") {
          max = this.mech.portIn.matList.length
          str = "Köplats "+inV
        } else {
          max = this.mech.portIn.matList.map(m=>m.parts[this.mech.parameters.condProp]).sort((a,b)=>b-a)[0]
          str = inV+" cm"
        }

        vSlider.max = max
        vSlider.value = inV
        vDiv.innerHTML = str
        this.mech.parameters.condValue = inV
      }
    }
    
    parent.elt.appendChild(button.elt)
    return button
  }
  
  //creates a slider and a clickevent corresponding to propname and eventType (eType).
  appendAndCreateOpSlider(min, max, initV, unit, parent, propName) {
    console.log(propName)
    let className = propName == "condValue" ? "block" : "flex"
    let sliderContainer = this.appendAndCreateContainer(className+" option", parent)
    let slider = this.p.createSlider(min, max, initV, 1)
    slider.elt.className = "slider"

    let valUnit = unit=="cm" ? `${slider.value()} cm` : `Köplats ${slider.value()}` 
    

    let value = this.p.createDiv(valUnit)
    value.elt.className = "sliderValue"

    slider.elt.oninput = ()=>{

      //case for cut
      if(this.mech.portIn && propName=="measure") {
        let side = document.querySelector("#sideC .selected").value
        slider.elt.max = this.mech.portIn.matList.map(m=>m.parts[side]).sort((a,b)=>b-a)[0] - 1
        value.elt.innerHTML = `${slider.value()} cm`
      } 

      //case for sort
      if(this.mech.portIn && propName=="condValue") {
        let prop = document.querySelector("#propC .selected").value
        if(prop=="sRqueue") {
          slider.elt.max = this.mech.portIn.matList.length  
          value.elt.innerHTML = `Köplats ${slider.value()}`
        } else {
          this.mech.portIn.matList.map(m=>m.parts[prop]).sort((a,b)=>b-a)[0]
          value.elt.innerHTML = `${slider.value()} cm`
        }


      }
    }

    slider.elt.onchange = ()=>{
      //selects item
      //check if siblings are selected
      this.removeSelectedClass(parent)
      value.elt.classList.add("selected")
      
      this.mech.parameters[propName] = slider.value()
      if(this.mech.parametersChanged()) {
        this.mech.resetOperation()
      } 
    }

    value.elt.onclick = ()=>{
      //selects item
      //check if siblings are selected
      this.removeSelectedClass(parent)
      value.elt.classList.add("selected")

      if(this.mech.parametersChanged()) {
        this.mech.resetOperation()
      } 
    }




    sliderContainer.elt.appendChild(value.elt)
    sliderContainer.elt.appendChild(slider.elt)
    return sliderContainer
  }

  closeDOMButton(parent) {
    let button = this.p.createDiv()
    button.elt.className = "closeButton"

    button.elt.onclick = () => {
      this.removeElem()
    }

    parent.elt.appendChild(button.elt)
  }

  appendAndCreateButtonNoEvent(label, value, parent) {
    let button = this.p.createButton(label, value)
    button.elt.className = "button"
    
    parent.elt.appendChild(button.elt)
    return button
    
  }


  removeSelectedClass(parent) {
    parent.elt.childNodes.forEach(item=>{
      if(item.className.includes("selected")) {
        item.classList.remove("selected")
      } else if(item.className.includes("option")) {
        item.children[0].className.includes("selected") ? item.children[0].classList.remove("selected") : {}
        
      }
      
      
    })
  }


  display() {
    this.elem = this.createWrapper()
    L.domElems.push(this)
  }

}


class MechDOMShape extends DOMShape {
  constructor(pos, shape, mech, p5, L, B) {
    super({...pos}, shape, mech, p5, L, B)

    this.name = shape.name
    this.description = shape.description
    this.iconPath = shape.iconPath
    this.headerSize = this.mech.id ? this.mech.id.startsWith("op") ? "Lrg" : "Sml" : "Sml"
    

  }


  //CUT
  createInterfaceCut() {

    let sideContent = [
      {name: "bredden", value: "b"},
      {name: "längden", value: "l"}
    ]

    let measureContent = [
      {name: "Hälften (1/2)", value: "1/2"},
      {name: "En tredjedel (1/3)", value: "1/3"},
      {name: "Välj Mått", value: "nr"}
    ]   

    let container = this.appendAndCreateContainer("flex", this.elem)

    this.closeDOMButton(container)

    //Measure 
    let measureC = this.appendAndCreateContainer("block", container)
    measureC.elt.style.width = "50%"
    this.appendAndCreateHeader("Mått", "Sml", measureC)
    measureContent = measureContent.map(item=>{
      let elm
      if(item.value!="nr") {
        elm = this.appendAndCreateOpButton(item.name, item.value, measureC, "measure")

      } else {
        let max
        let inV

        if(this.mech.portIn) {
          let side = this.mech.parameters.side
          max = this.mech.portIn.matList.map(m=>m.parts[side]).sort((a,b)=>b-a)[0]
          inV = +this.mech.parameters.measure ? +this.mech.parameters.measure : Math.round(max/3)

        } else {
          max = 100
          inV = 10
        }
        
        elm = this.appendAndCreateOpSlider(1, max-1, inV, "cm", measureC, "measure")
      }

      item.elm = elm
      return item
    })

    //Side
    let sideC = this.appendAndCreateContainer("block", container)
    sideC.elt.id = "sideC"
    this.appendAndCreateHeader("Sida", "Sml", sideC)
    sideContent = sideContent.map(item=>{
      let elm = this.appendAndCreateOpButton(item.name, item.value, sideC, "side")
      item.elm = elm
      return item
    })

    //check if parameter is set else 
    //set first inputs of each list as default
    this.mech.parameters.side ? sideContent.find(item=>item.value==this.mech.parameters.side).elm.elt.onclick() : sideContent[0].elm.elt.onclick()

    if(this.mech.parameters.measure) {
      let m = measureContent.find(item=>item.value==this.mech.parameters.measure || item.value=="nr")
      if(m.value != "nr") {
        m.elm.elt.onclick()
      } else { 
        m.elm.elt.children[0].innerHTML = this.mech.parameters.measure + " cm"
        m.elm.elt.children[1].value = this.mech.parameters.measure
        m.elm.elt.children[1].onchange() 
      }

    } else {
      measureContent[0].elm.elt.onclick()
    }

    //adjusts the max value of the slider
    
    
    //setButton

    if(!this.mech.portIn) {
      let lowerC = this.appendAndCreateContainer("flexCenter", this.elem)
      this.appendAndCreateP("Mata in material i masikinen för för att kapa det.", lowerC)
    }
    // let setButton = this.appendAndCreateButtonNoEvent("ok", "ok", setButtonC)
    // setButton.elt.onclick = () => {
    //   if(this.mech.parametersChanged()) {
    //     this.mech.resetOperation()
    //   }
    //   this.removeElem()
    // }
  
    
    return container
  }


  //SORT
  createInterfaceSort() {
    
    let propContent = [
      {name: "bredden", value: "b"},
      {name: "längden", value: "l"},
      {name: "köplats", value: "sRqueue"}
    ]

    let operatorContent = [
      {name: "Lika med [ = ]", value: "=="},
      {name: "Inte lika med [ ≠ ]", value: "!="},
      {name: "Större än [ > ]", value: ">"},
      {name: "Mindre än [ < ]", value: "<"}
    ]   

    let container = this.appendAndCreateContainer("flex", this.elem)

    this.closeDOMButton(container)

    //Prop
    let propC = this.appendAndCreateContainer("block", container)
    this.appendAndCreateHeader("Analysera", "Sml", propC)
    propC.elt.id = "propC"
    propContent = propContent.map(item=>{
      let elm = this.appendAndCreateOpButton(item.name, item.value, propC, "condProp")
      

      item.elm = elm
      return item
    })

    //Operator
    let operatorC = this.appendAndCreateContainer("block", container)
    operatorC.elt.id = "operatorC"
    this.appendAndCreateHeader("Operator", "Sml", operatorC)
    operatorContent = operatorContent.map(item=>{
      let elm = this.appendAndCreateOpButton(item.name, item.value, operatorC, "condOperator")
      item.elm = elm
      return item
    })

    //Value
    let valueC = this.appendAndCreateContainer("block", container)
    valueC.elt.id = "valueC"
    valueC.elt.style.width = "40%"
    this.appendAndCreateHeader("Värde", "Sml", valueC)
    let max 
    let inV 

    if(this.mech.portIn) {
      if(this.mech.parameters.condProp == "sRqueue") {
        max = this.mech.portIn.matList.length
        inV = this.mech.parameters.condValue ? this.mech.parameters.condValue : 1
      } else {
        max = this.mech.portIn.matList.map(m=>m.parts[this.mech.parameters.condProp]).sort((a,b)=>b-a)[0]
        inV = +this.mech.parameters.condValue ? +this.mech.parameters.condValue : 1
      }
    } else {
      max = 10
      inV = 1
    }
   
    let unit = this.mech.parameters.condProp == "sRqueue" ? "köplats" : "cm"
    this.appendAndCreateOpSlider(1, max, inV, unit, valueC, "condValue")


    //check if parameter is set else 
    //set first inputs of each list as default
    this.mech.parameters.side ? operatorContent.find(item=>item.value==this.mech.parameters.side).elm.elt.onclick() : operatorContent[0].elm.elt.onclick()

    if(this.mech.parameters.prop) {
      let m = propContent.find(item=>item.value==this.mech.parameters.measure || item.value=="nr")
      if(m.value != "nr") {
        m.elm.elt.onclick()
      } else { 
        m.elm.elt.children[0].innerHTML = this.mech.parameters.measure + " cm"
        m.elm.elt.children[1].value = this.mech.parameters.measure
        m.elm.elt.children[1].onchange() 
      }

    } else {
      propContent[0].elm.elt.onclick()
    }

    //adjusts the max value of the slider
    
    
    // //setButton

    // if(!this.mech.portIn) {
    //   let lowerC = this.appendAndCreateContainer("flexCenter", this.elem)
    //   this.appendAndCreateP("Mata in material i masikinen för för att kapa det.", lowerC)
    // }
  
    
    return container
  }


  //BUILD
  createInterfaceBuild() {
    
  }


  //MUDA / SPILL
  createInterfaceMuda() {
    
  }


  //STATEREP
  createInterfaceStateRep() {
    let container = this.appendAndCreateContainer("block", this.elem)

    this.closeDOMButton(container)

    this.L.matListOnCanvas.push(new DisplayMatsOnCanvas({x:16, y:300}, this.mech.matList, this.p, this.L, this.B))

    return container
  }




  //used to determen what interface to disply depeending oom what type of mech this belongs to
  getInterface() {
    if(this.mech.id.startsWith("op")) {
      let opNames = ["Cut", "Sort", "Muda", "Build", "Icon"]
      
      let endStr = opNames.find(item=>{
        return item.toLocaleLowerCase()==this.mech.opId.substr(2,item.length).toLocaleLowerCase()
      })

      return this["createInterface"+endStr]()
    } else if(this.mech.id.startsWith("stateRep")) {
      return this.createInterfaceStateRep()
    }


  }


  display() {
    //creates the upper container with title and info
    super.display()
    let upperCInfo = this.appendAndCreateContainer("block", this.elem)
    let upperTop = this.appendAndCreateContainer("flex", upperCInfo)

    this.appendAndCreateIcon(this.iconPath, upperTop)
    this.appendAndCreateHeader(this.name.toUpperCase(), this.headerSize, upperTop)
    this.appendAndCreateP(this.description, upperCInfo)

    //creates the container to set the parameters
    if(this.mech.id) {
      this.lowerCInterace = this.getInterface()
    } else {
      this.closeDOMButton(this.elem)
      this.appendAndCreateP("Dra in maskinen på planen för att använda den.", upperCInfo)
    }

    
  }

}




