import React from 'react';
import BaseComponent from './BaseComponent'
// import introImages from '../images/introImgs.js';




const Outro = (props) => {
  let {contentArr, history, location} = {...props}

  let content = {
    content: contentArr[0],
    bgImg: "seymourBG noButton",
  }

  return (
    <div>
        <BaseComponent {...props} content={content} openNext={false} />
    </div>
  )
}

export default Outro