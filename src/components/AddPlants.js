import React, {Component} from 'react';
import convertTrefleToPlant from '../auxFunctions'
import getData from '../api/plantAPI'
import {storage} from '../api/firebaseAPI'

//Container components
class AddPlants extends Component {
  state = {
    plant: {
      myId: null,
      trefleId: null,
      common_name: "",
      scientific_name: "",
      family_common_name: "",
      family: "",
      image_url: "",
      images: [
        // {copyright:"",id: "",image_url: ""}
      ],
  
      growth: {},
      specifications: {}
    },
    unsavedItem: {},
    growthElem: [],
    specificationsElem: [],
    suggestionList: [],
    units: ["cm", "mm", "deg_c"],
    errMessage: {growth: "", specifications: ""},
    matchflag: true,
    sugDisplay: "elemName", //elemName
    imgSrc: null,
    imgFile: null
  }

  componentDidMount() {
    if(this.props.history.location.state) {
      this.importPlant(this.props.history.location.state)
    } else {
      let plant = this.state.plant
      plant.trefleId = "none_" + Math.random() * Math.pow(10,16)
    }

    
  }

  

  //updates state when inputing info
  handleChange = (e) => {
    let plant = this.state.plant
    let prName = e.target.name
    let change

    if(this.state.suggestionList.length<1 || e.target.name!==this.state.sugDisplay) {
      this.setState({
        sugDisplay: "elemName"
      })
    }

    
    if(e.target.className === "plantGen") {
      //must run with timer
      if(this.state.matchflag && e.target.value.replace(/\s/g, "")){
        this.setState({
          matchflag: false
        })

        setTimeout(()=>{
          this.setState({
            matchflag: true
          })
          this.searchForMatches(e.target.value, e.target.name)
        }, 200)
      } 

    }

    if(prName.startsWith("specifications") || prName.startsWith("growth")) {
      //change unsaved item 
      let newItem = this.state.unsavedItem

      if(Object.keys(newItem).length && prName.split("_")[0]===newItem.list) {
          newItem[prName.split("_")[1]] = e.target.value
      } else {
        newItem = {prop:"", val:"", list:prName.split("_")[0]}
        newItem[prName.split("_")[1]] = e.target.value
      }

      change = {
        unsavedItem: newItem 
      }
    } else {
      plant[prName] =  e.target.value
      change = {
        plant: plant
      }
    }
    
    change.errMessage = {growth: "", specifications: ""}
    this.setState(change)
  }

  handleSubmit = (e) =>{
    e.preventDefault()

    if(!this.state.plant.common_name) {
      let plant = this.state.plant
      plant.common_name = plant.scientific_name

      this.setState({
        plant: plant
      })
    }

    this.props.addPlant(this.state.plant)

    this.props.history.push('/plants')
  }


  searchForMatches = (str, type) => {

    if(str!==this.state.plant[type]) {
      str = this.state.plant[type]
    }
    if(!str) {
      return
    }

    str = str.endsWith(" ") ? str.slice(0,-1).toLowerCase() : str.toLowerCase()
    let arrStr = str.includes(" ") ? str.split(" ") : [str]

    let requestParam = {
      action: "search",
      snippet: str.toString().replace(/\s/g, "&q=")
    }


    getData(requestParam)
    .then(res => {

      let list = res.data.filter(item => {
        if(item[type]){
          let testArr = arrStr.map(str => item[type].toLowerCase().includes(str))
  
          if(!testArr.includes(false)) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      })

      let display = list.length ? type : "elemName"

      this.setState({
        sugDisplay: display,
        suggestionList: []
      })

      list = list.map(item=>{
        return(
          <div key={item.id} onClick={()=>{this.fetchPlantToImport(item)}} >{item[type]}</div>
        )
      })

      this.setState({
        suggestionList: list
      })
      
      //creATE OR OPEN LIST elem

      //if matches show as type them by puttiong in suggestions


      
    })




    //create window?
      //add item
      //remove item
      //what info?

    //request to DB
    //set timer and cancel request if necesery

    return 
  }

  addItemToList = (item, type) => {
    const convStr = (str) => {
      let convStr = str.replace(/^./,str[0].toUpperCase())
      convStr = convStr.replace(/[_]/g," ") + ":"
      return convStr
    }

    const meter = (int) => {
      //int is between 1-10
      let val = int/10*5
      let elems = []

      for (let i=0; i<5; i++) {
        let w = val>1 ? "100%" : (val*100) + "%"
        val = val>1 ? --val : 0 

        elems.push(<div key={"unit"+Math.random()}><div style={{width: w}}></div></div>)
      }
      
      return (
        <div className="meter">
          {elems}
        </div>
      )
    }
    let errM

    if((!item.prop || !item.val) && type==="new") {
      errM = this.state.errMessage
      errM[item.list] = "Both Property and value field must be filled."
      this.setState({
        errMessage: errM
      })
      return
    } else if (!item.val) {
      console.log("imported value was null!")
      return
    }
    
    let plant = this.state.plant
    let elemList = this.state[item.list.toLowerCase() + "Elem" ]
    
    
    if(plant[item.list][item.prop.replace(/\s/g,"_").toLowerCase()]) {
      errM = this.state.errMessage
      errM[item.list] = "property already exists"
      this.setState({
        errMessage: errM,
        unsavedItem: {}
      })
      return
    }
    
    let key = item.list + Math.random()
    let val = (parseInt(item.val) <= 10 && parseInt(item.val) >= 0 && !item.prop.includes("ph_m"))? meter(item.val): item.val

    elemList.push(
      <div key={key}>
        <div>{convStr(item.prop)} {val}</div>
        <input type="button" onClick={()=>{this.removeItemFromList(item.list, key, item.prop)}} value="X"></input>
        <input type="button" onClick={()=>{this.editItemFromList(item, key)}} value="Edit"></input>
      </div>
    )

    let change
    if(type==="new") {
      plant[item.list.toLowerCase()][item.prop.replace(/\s/g,"_").toLowerCase()] = item.val
      
      change = {
        plant: plant,
        [item.list.toLowerCase() + "Elem" ]: elemList,
        unsavedItem: {}
      }
    
      this.setState(change)
    }
  }

  removeItemFromList = (listName, key, prop) => {
    let elemList = this.state[listName.toLowerCase() + "Elem" ]
    let plant = this.state.plant
    
    elemList = elemList.filter(elem => elem.key !== key)
    delete plant[listName.toLowerCase()][prop.replace(/\s/g, "_")]

    this.setState({
      plant: plant,
      [listName.toLowerCase() + "Elem" ]: elemList,
    })
  }
  
  editItemFromList = (list, key) => {
    let change = {
      unsavedItem: list
    }

    this.removeItemFromList(list.list, key, list.prop)
    


    this.setState(change)
  }

  handleValData = (val) => {
    let nVal

    if (typeof(val)==="string" || typeof(val)==="number") {

      nVal = (!Number.isNaN(parseInt(val))) ? parseFloat(val)  : val

    } else if(Array.isArray(val)) {

      nVal = val.join(", ")


    } else if (val!==null) {

      let key = Object.keys(val).find(key=>this.state.units.includes(key))

      if (val[key] !== null)  {
        nVal = key.includes("deg_c") ? val[key] + " °C" : val[key] + " " + key
      } else { nVal = null }

    } else {
      nVal = null
    }
      
    return nVal
  }

  filterObject = (obj, list) => { 
    let nObj = obj
    let removeList
    
    if(!obj) {
      return {}
    }

    if(Object.entries(obj).length > 0) {
      removeList = Object.entries(obj).map(item => {
        if(item[1]!==null) {
          this.addItemToList({prop: item[0],val:this.handleValData(item[1]), list: list}, "imported")
        }
        return item
      }).filter(item=>{
        if(item[1]===null) {
          return true
        } else if(typeof(item[1])==="object" && Object.values(item[1]).includes(null)) {
          return true
        } else {
          return false
        }
        
      })


      removeList.forEach(item=>{
        
        delete nObj[item[0]]
      })

      return nObj
    } else {
      return {}
    }
  }

  importPlant = (o) => {
    // Updates state with imported plant
    //insures that id from trefle is kept when edited.
    let id 
    if(o.id) {
      id = o.id
    } else if(o.trefleId) {
      id = o.trefleId
    } else {
      id = "none_" + Math.random() * Math.pow(10,16)
    }

    //creates a new temp object of plant
    let nPlant = {
      myId: null,
      trefleId: id,
      common_name: o.common_name,
      scientific_name: o.scientific_name,
      family_common_name: o.family_common_name,
      family: o.family,
      image_url: o.image_url,
      images: [],
  
      growth: o.growth ? o.growth : {},
      specifications: o.specifications ? o.specifications : {}
    }

    //extracts images
    let list = [] 
    if(!Array.isArray(o.images) && o.images) {
      Object.entries(o.images).forEach(item => {
        item[1].forEach(img => {
          list.push(img)
        }) 
      })
    } else if(o.images){
      list = o.images
    } else {
      list = []
    }
    nPlant.images = list

    //extract specifications and growth if thay exist
    nPlant.specifications = this.filterObject(o.specifications, "specifications")
    nPlant.growth = this.filterObject(o.growth, "growth")

    this.setState({
      plant: nPlant,
      imgSrc: nPlant.image_url
    })
  }

  clearForm = () => {
    let newState = {
      plant: {
        myId: null,
        trefleId: null,
        common_name: "",
        scientific_name: "",
        family_common_name: "",
        family: "",
        image_url: "",
        images: [],
        growth: {},
        specifications: {}
      },
      unsavedItem: {},
      growthElem: [],
      specificationsElem: [],
      suggestionList: [
        // {obj from trefle }
      ],
      units: ["cm", "mm", "deg_c"],
      errMessage: {growth: "", specifications: ""}
    }

    this.setState(newState)
  }

  fetchPlantToImport = (plant) => {

    let requestParam = {
      action: "plantDetail",
      snippet: plant.links.self
    }

    this.setState({
      sugDisplay:"elemName"
    })

    getData(requestParam)
    .then(res => {
      this.clearForm()
      this.importPlant(convertTrefleToPlant(res.data))

    })
  } 

  cancel = () => {
    this.props.history.goBack()
  }

  prepareImg = e => {
    this.setState({
      imgFile: e.target.files[0]
    })

  }

  uploadImg = () => {
    let upload = storage.ref('images/'+this.state.imgFile.name).put(this.state.imgFile)
    upload.on(
      "state_changed", 
      snap=> {}, 
      err => {console.log(err)},
      ()=>{
        storage.ref('images/').child(this.state.imgFile.name).getDownloadURL()
        .then(res => {
          let plant = this.state.plant
          plant.image_url = res
          plant.imgFile = this.state.imgFile.name
          this.setState({
            plant: plant,
            imgSrc: res
          })
        })
      }
    )
  }

  render() {

    return(
      <div className="plantForm flexCenter">
        <form className="cont" onSubmit={this.handleSubmit} onFocus={(e)=>this.setState({sugDisplay: "elemName"})}  onKeyDown={(e)=>{if(e.keyCode === 13){e.preventDefault()}}}>
          <input type="button" onClick={this.clearForm} value="clear form"></input>
          
          <div className="plantNames">
            <label>Plant namn</label>
            <input type="text" className="plantGen" autoComplete="off" name="common_name" onChange={this.handleChange} value={this.state.plant.common_name ? this.state.plant.common_name : ""}></input>
            <div style={{display: (this.state.sugDisplay==="common_name") ? "block" : "none"}} className="common_name">
              {this.state.suggestionList}
            </div>

            <label>Scientific Name</label>
            <input type="text" className="plantGen" autoComplete="off" name="scientific_name" onChange={this.handleChange} value={this.state.plant.scientific_name ? this.state.plant.scientific_name : ""}></input>
            <div style={{display: (this.state.sugDisplay==="scientific_name") ? "block" : "none"}} className="scientific_name">
              {this.state.suggestionList}
            </div>

            <label>Scientific falmily name</label>
            <input type="text" className="plantGen" autoComplete="off" name="family" onChange={this.handleChange} value={this.state.plant.family ? this.state.plant.family : ""}></input>
            <div style={{display: (this.state.sugDisplay==="family") ? "block" : "none"}} className="family">
              {this.state.suggestionList}
            </div>
            
            <label>Common falmily name</label>
            <input type="text" className="plantGen" autoComplete="off" name="family_common_name" onChange={this.handleChange} value={this.state.plant.family_common_name ? this.state.plant.family_common_name : ""}></input>
            <div style={{display: (this.state.sugDisplay==="family_common_name") ? "block" : "none"}} className="family_common_name">
              {this.state.suggestionList}
            </div>
          </div>
          
        
          <div className="images">
            <img src={this.state.imgSrc} alt=""></img>
            <input type="file" onChange={this.prepareImg}></input>
            <input type="button" value="upload" onClick={this.uploadImg}></input>
          </div>

          <div className="specifications">
            <h4>Specifications</h4>
            <div className="list"> 
              {this.state.specificationsElem}
            </div>

            <div className="flexForm">
              <label>property: </label>
              <label>value</label>
            </div>

            <div className="flexForm max_w">
              <input type="text" name="specifications_prop" onChange={this.handleChange} value={(this.state.unsavedItem.list === "specifications") ? this.state.unsavedItem.prop : ""}></input>
              <input type="text" name="specifications_val" onChange={this.handleChange} value={(this.state.unsavedItem.list === "specifications") ? this.state.unsavedItem.val : ""}></input>
            </div>

            <input type="button" onClick={()=>{this.addItemToList(this.state.unsavedItem, "new")}} value="add"></input>
            <div style={{color: "var(--errorCol)"}}>{this.state.errMessage.specifications}</div>
          </div>


          <div className="growth">
            <h4>Growth</h4>
            <div className="list"> 
              {this.state.growthElem}
            </div>

            <div className="flexForm">
              <label>property: </label>
              <label>value</label>
            </div>

            <div className="flexForm max_w">
              <input type="text" name="growth_prop" onChange={this.handleChange} value={(this.state.unsavedItem.list === "growth") ? this.state.unsavedItem.prop : ""}></input>
              <input type="text" name="growth_val" onChange={this.handleChange} value={(this.state.unsavedItem.list === "growth") ? this.state.unsavedItem.val : ""}></input>
            </div>

            <input type="button" onClick={()=>{this.addItemToList(this.state.unsavedItem, "new")}} value="add"></input>
            <div style={{color: "var(--errorCol)"}}>{this.state.errMessage.growth}</div>
          </div>

          <input type="submit" value="save"></input>
          <input type="button" value="Cancel" onClick={this.cancel}></input>
        </form>
      </div>
    )
  }

}


export default AddPlants;
