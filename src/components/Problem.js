import React, {useState}  from 'react';
import BaseComponent from './BaseComponent'
import QuestionElement from './QuestionElement'
import prob1 from '../images/test1_Bridges.png'
import prob2 from '../images/test2_SocialMedia.png'
// import rt from '../api/root'




const Problem = (props) => {

  let images = [prob1, prob2]
  let {title, text, imgNr, answers, id, cA} = {...props.problem}
  let {history, location,  nextPage, updateParticipant} = {...props}

  
  const [delayAnswer, setDelayAnswer] = useState(true)
  const [data, setData] = useState([])
  const [openNext, setOpenNext] = useState(false)
  
  // if(participant.currentPage!==location.pathname) {
  //   console.log("paths", participant.currentPage, location.pathname)
  //   // window.location = rt
  // }

  const updateAnsInPar = (ans)=> {
    if(!ans.ans) {
      // console.log("empty answer", ans)
      return
    }
    let d
    if(data.length) {
      if(data[0].ans === ans.ans) {
        // console.log("answer is the Same")
        return
      } else {
        // console.log("answer is changed", data[0].ans, "-->",ans.ans)
        d = [...data]
        d[0].ans = ans.ans
        d[0].answeredCorrect = ans.ans === cA
        d[0].changedAns = ans.changedAns
      }
    } else {
      let saveAns = {...ans}
      saveAns.testId = id
      saveAns.answeredCorrect = ans.ans === cA
      d = [...data]
      d.push(saveAns)
      // console.log(saveAns, ans.ans, "=?",cA )
      
      if(!openNext) {
        setOpenNext(true)
      }
      
    }

    setData(d)
    // console.log("update answers in db", d)
  }


  setTimeout(()=>{
    setDelayAnswer(false)
  }, 3000)

  let formContent = () => {
    let answered = data.find(el=>el.qId===id)
    let ansCnt = answered ? answered.changedAns : 0
    answered = answered ? answered.ans : null

    // console.log("data", data, answered)
    return (
      <div>
        <p>{text}</p>
        <div className="imgCont"><img src={images[imgNr]} alt=""></img></div>
        <QuestionElement {...props} answers={answers} delayAnswer={delayAnswer} qId={id} answered={answered} ansCnt={ansCnt} updateAnsInPar={updateAnsInPar.bind(this)}/>

      </div>
    )
  }

  let content = {
    title: title,
    content: formContent(),
    buttonValue: "Nästa",
    buttonEvent: () => {
      updateParticipant(location.pathname, data)
      history.push(nextPage(location.pathname))
    },

  }

  return (
    <div>
        <BaseComponent {...props} content={content} openNext={openNext}/>
    </div>
  )
}

export default Problem