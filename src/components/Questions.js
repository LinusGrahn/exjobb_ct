import React, {useState}  from 'react';
import BaseComponent from './BaseComponent'
import QuestionElement from './QuestionElement'
// import rt from '../api/root'



const Questions = (props) => {
  // let {title, bgImg, content, buttonEvent, buttonValue} = {...props}
  // let {plant, openDetail} = props 
  let {questionArr, nextPage, history, location, updateParticipant, tId, participant} = {...props}
  // console.log("propQuestions",props)

  const [openNext, setOpenNext] = useState(false)
  const [data, setData] = useState([])

  // if(participant.currentPage!==location.pathname) {
  //   window.location = rt
  // }


  if(tId==="t_game") {
    questionArr = questionArr.filter(q=>{
      return !q.id.startsWith("q1") || q.id.startsWith("q1_game_"+participant.gameVariation)
    })
  }


  const formContent = () => {
    return questionArr.map(q=>{
        let answered = data.find(el=>el.qId===q.id)
        let ansCnt = answered ? answered.changedAns : 0
        answered = answered ? answered.ans : null
      return (
        <div key={Math.random()}>
          <QuestionElement {...props} question={q.question} answers={q.answers} delayAnswer={false} type={q.type} qId={q.id} answered={answered} ansCnt={ansCnt} updateAnsInPar={updateAnsInPar.bind(this)}/>
        </div>
      )
    })


  }

  const updateAnsInPar = (ans)=> {
    if(!ans.ans) {
      // console.log("empty answer", ans)
      return
    }

    let d = [...data]
    let existingAns = d.find(el=>el.qId===ans.qId)
    // console.log("exist in questiondata?", d.find(el=>el.qId===ans.qId), d)
    
    
    if(existingAns) {
      if(existingAns.ans===ans) {
        // console.log("answer is the same")
        return
      }
      // console.log("answer is changed",existingAns.ans, "-->", ans.ans )
      existingAns.ans = ans.ans
      existingAns.changedAns = ans.changedAns
      setData(d)

    } else {
      // console.log("push new ans")
      let saveAns = {...ans}
      saveAns.testId = tId
  
      d.push(saveAns)
      setData(d)


      // console.log("update answers in db", d)
    }
  }

  const checkOpenNext = ()=>{
    let sub = questionArr.find(el=>el.type==="text") ? -1 : 0
    if(data.length === questionArr.length+sub && !openNext) {
      // console.log("activate next")
      setOpenNext(true)
    }
  }


  checkOpenNext()
  let content = {
    content: formContent(),
    buttonValue: "Nästa",
    buttonEvent: () => {
      updateParticipant(location.pathname, data)
      history.push(nextPage(location.pathname))
    },

  }



  return (
    <div>
        <BaseComponent {...props} content={content} openNext={openNext} />
    </div>
  )
}

export default Questions