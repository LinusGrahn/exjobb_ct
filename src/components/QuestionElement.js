import React from 'react';
import { chopStr } from '../auxFunctions';


const QuestionElement = (props) => {
  let {question, answers, delayAnswer, qId, type, updateAnsInPar, answered, ansCnt} = {...props}

// console.log("question Content", question, answers)
type = !type ? "multi" : type
const dateStarted = Date()

const updParData = (ans)=> {
  console.log("updData", ans)
  let chAns = ansCnt
  if(answered!==ans && answered) {
    chAns++
  }
  let ansObj = {
    ans: ans, 
    qId: qId,
    timeStarted: dateStarted,
    timeAnswerd: Date(),
    changedAns: chAns
  }
  
  // console.log("save a/znswer in Question",ansObj)
  updateAnsInPar(ansObj)
}

const updParTxtAns = (ans) =>{
  console.log("updTxt", ans)

  let ansObj = {
    ans: ans ? ans : "", 
    qId: qId,
    timeStarted: dateStarted,
    timeAnswerd: Date(),
    changedAns: 0
  }

  updateAnsInPar(ansObj)

}


const multipleAnswerElemnts = ()=>{
  return answers.map(elm=>{
      let output = elm.content ? elm.content : elm

     return (
      <div className="multiAnsCont" key={Math.random()} onClick={()=>{updParData(output)}}> 
        <div className={answered===output ? "selectedQ bullet" : "bullet"}></div>
        <p>{output}</p>
      </div>
      )
  })
}

const scaleAnswerElements = ()=> {
  return answers.map(elm=>{
    return (<div className="scaleAnsCont" key={Math.random()} onClick={()=>{updParData(elm.content)}}> 
        <div className={answered===elm.content ? "selectedQ bullet" : "bullet"}></div>
        <p>{elm.content}</p>
      </div>
      )
  })
} 

const textAnswerElement = ()=> {
  //EVENT send data?
  return (<div>
    <textarea id="q_txt" name="textArea" 
    onFocus={()=>{updParData(document.getElementById("q_txt").value)}}
    onBlur={()=>{updParData(document.getElementById("q_txt").value)}}

    ></textarea>
  </div>)

}

let elements
if(type==="multi") {
  elements = multipleAnswerElemnts()
} else if(type==="scale") {
  elements = scaleAnswerElements()
} else {
  elements = textAnswerElement()
}


// console.log(elements)

  return (
    <div className={delayAnswer? "questionCont minH" : "questionCont"}>
       {question ? (<p>{chopStr(question)}</p>) : []}
       <div className={type==="scale"? "flex" : ""}>
        {delayAnswer? [] : elements}

       </div>
       
    </div>
  )
}

export default QuestionElement