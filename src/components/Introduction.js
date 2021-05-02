import React, {useState}  from 'react';
import BaseComponent from './BaseComponent'
import introImages from '../images/introImgs.js';




const Introduction = (props) => {
  // let {title, bgImg, content, buttonEvent, buttonValue} = {...props}
  // let {plant, openDetail} = props 
  let {contentArr, nextPage, history, location, updateParticipant} = {...props}
  // console.log("intro props", props)
  
  const [page, setPages] = useState(0)


  let formContent = () => {
    return contentArr.map(elm=>{
      return (
        <div key={Math.random()}>

          {elm.img? (<div className="introImg">
            <img alt="" src={introImages.find(el=>el["i"+elm.pageNumber])["i"+elm.pageNumber]}></img>
          </div>) : []}
          {typeof elm.text=="string" ? (<p>{elm.text}</p>) : elm.text}
        </div>
      )
    })


  }

  let introPages= formContent()

  let content = {
    content: introPages[page],
    buttonValue: "Nästa",
    bgImg: "seymourBG",
    buttonEvent: () => {
      // console.log(introPages)
      if(introPages.length-1 <= page) {
        updateParticipant(location.pathname)
        history.push(nextPage(location.pathname))
      } else {
        setPages(page+1)
      }
    },

  }

  return (
    <div>
        <BaseComponent {...props} content={content} openNext={true}/>
    </div>
  )
}

export default Introduction