import React from 'react';
import rt from '../api/root'




const BaseComponent = (props) => {
  let {content, buttonEvent, buttonValue, bgImg, title} = {...props.content}
  let openNext = props.openNext
  let {location} = {...props}


  let className = ()=>{
    return bgImg? "baseComponent "+ bgImg : "baseComponent"
  }

  return (
    <div className={className()}>
        <div className="headCont">
          <h2>{title? title : ""}</h2>
        </div>  

        <div className="contentCont">
          {content}
        </div>

        <div className="buttonCont">
          {openNext && location.pathname!==rt+"outro" ? <input type="button" className="pageButton" value={buttonValue} onClick={buttonEvent} ></input> : []}
        </div>

    </div>
  )
}

export default BaseComponent