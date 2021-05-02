import React, { Component } from 'react';
// import Navbar from './components/Navbar';
import db from './api/firestoreAPI';
import Game from './components/Game';
import {tests, content} from './testContent/tests';
import Problem from './components/Problem';
import Questions from './components/Questions';
import Introduction from './components/Introduction';
import ClientJS from 'clientjs'
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import rt from './api/root'

//root component
class App extends Component {
  
  state = {
    gVar: null,
    participant: {},
    routeOrderArr: [rt, rt+"qB", rt+"pr1", rt+"q1", rt+"pr2", rt+"q2", rt+"pr3", rt+"q3", rt+"pr4", rt+"q4", rt+"i?", rt+"play_game",rt+"qG", rt+"outro"],
  }


  componentDidMount() {
    const client = new window.ClientJS();
    const fp = client.getFingerprint()
    console.log("fp", fp)

    this.getParticipant(fp)
      
  }

  // directPar(curPath) {
  //   // console.log(window.location.pathname, curPath)
  //   if(curPath===undefined || curPath===null) {
  //     return
  //   }
  //   let redir
  //   console.log("path wind", window.location.pathname)
    

  //   if(!curPath) {
  //     redir =  <Redirect to={rt} />
  //     // window.location.pathname = rt
      
  //   } else if(curPath==="complete") {
  //     <Redirect to={rt+"outro"} />
  
  //     // window.location.pathname = rt+"outro"
  //   } else if(window.location.pathname !== curPath) {
  //     redir =  <Redirect to={curPath} />

  //     // window.location.pathname = curPath
  //   }

  //   this.setState({redir: redir})
  // }

  getAndUpdVariation() {
    db.collection('gameVariation').get("flag").then((snapshot)=>{
      //gets an array of documents (participants) from the collection "participants"
      // console.log("gV", snapshot.docs[0].data())
      let res = snapshot.docs[0].data()
      
      let updFlag = (res.flag >=4 || res.flag <1) ? 1 : res.flag+1
      db.collection('gameVariation').doc("flag").set({
        flag: updFlag
      })

      let par = {...this.state.participant}
      par.gameVariation = res.flag
      par.game.gameVariation = res.flag
      this.setState({
        gVar: res.flag,
        participant: par
      })

    })


  }

  //get an existing participant
  getParticipant(fp) {
    //if fingerprint exist get else create new 
    fp = "fp_"+fp
   
    //fetch an existing participant
    db.collection('participants').where('fingerPrint','==', fp).get().then((snapshot)=>{
      //gets an array of documents (participants) from the collection "participants"
      // console.log(snapshot.docs[0].data())
      
      let p = snapshot.docs[0].data()
      if(p.status) {
        if(window.location.pathname !== rt+"outro") {
          window.location = "https://en.wikipedia.org/wiki/Computational_thinking"

        }
        return
      } else {
        // this.directPar(p.currentPage)
        this.setState({
          participant: p
        })

      }

    }).catch(err=>{
      let e = err.toString()
      return true
      
    }).then(newP=>{

      console.log("new par", newP)

      if(newP){
        this.createParticipant(fp)
        this.getAndUpdVariation()
      }

    })

  }

  //create a new participant
  createParticipant(fp) {
    
    let newPar = {
      fingerPrint: fp,
      currentPage: rt,
      gameVariation: this.state.gVar,
      answers: [],
      enteredPage: Date(),
      game: {
        enteredIntro: null,
        enteredGame: null,
        finishedGame: null,
        gaveUp: null,
        gameVariation: this.state.gVar,
        solution: null, //snap of the last game when Deliver is clikced
        gameSnapSaves: [] 
      }
    }

    this.setState({
      participant: newPar
    })

  }

  //update participant
  updateParticipant(page, ansArr) {
    let par = {...this.state.participant}
    if(ansArr) {
      ansArr.forEach(ans => {
        let fI = par.answers.findIndex(el=>el.qId===ans.qId)
        if(fI!==-1){
          par.answers.splice(fI,1)
        }
      });
      par.answers = [...par.answers, ...ansArr]
    }

    par.currentPage = this.nextPage(page)
    console.log(par)
    db.collection('participants').where('fingerPrint', '==', par.fingerPrint).get().then(snapshot=>{
      let p = snapshot.docs[0].data()
      // console.log("update answerArr and page", p.answers, par.answers, p.currentPage, par.currentPage)

      if(p.currentPage === rt+"qG") {
        // console.log("Remove par from parlist and add to complete list")
        this.addParticipantToFinishedCollection(par)
      } else {

        db.collection('participants').doc(p.fingerPrint).set(par)
      }

      this.setState({
        participant: par
      })
      
      return false
    }).catch(err=>{
      let e = err.toString()
      console.log(e)
      
      return true
    }).then(newP=>{

      console.log("new par will be added if true", newP, par)

      if(newP){
        db.collection('participants').doc(par.fingerPrint).set(par)
        this.setState({
          participant: par
        })
      }

    })

    // console.log("toDB",par)
    this.setState({
      participant: par
    })
  }

  addParticipantToFinishedCollection(par) {
    db.collection('participants').doc(par.fingerPrint).set({fingerPrint: par.fingerPrint, status: "complete"})
    db.collection('completeParticipants').doc(par.fingerPrint).set(par)
  }

  nextPage(curP) {
    curP = curP.match(/[i]\d/gm)? rt+"i?" : curP
    curP = curP===rt.slice(0,-1) ? rt : curP
    let list = this.state.routeOrderArr
    let curI = list.findIndex(p=>p===curP)
    let next = list[curI+1]
    if(next.includes("?")) {
      next = next.replace("?", this.state.participant.gameVariation)
    } 
    console.log("curPageI and P is: ", curI, curP, "next path is:", next)

    if(curI===-1 || curI===list.length-1) {
      console.log("don't go to nextPage or cur is -1?", curI)
      return
    }

    return next
  }
  
  render() {
    // console.log("par", this.state.participant)
    // console.log("I start from all", tests, content)
    console.log(this.state)
    return (
      <BrowserRouter>
          <div className="App">
            {/* <Navbar /> */}
              <Switch>
                <Route exact path={rt} render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.intro.contentArr} /> )}/>
                <Route exact path={rt+"outro"} render={(props) => (<Introduction {...props} contentArr={content.outro.contentArr} /> )}/>

                <Route exact path={rt+"pr1"} render={(props) => (<Problem {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} problem={tests.test1.problem}/> )}/>
                <Route exact path={rt+"pr2"} render={(props) => (<Problem {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} problem={tests.test2.problem}/> )}/>
                <Route exact path={rt+"pr3"} render={(props) => (<Problem {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} problem={tests.test3.problem}/> )}/>
                <Route exact path={rt+"pr4"} render={(props) => (<Problem {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} problem={tests.test4.problem}/> )}/>
                
                <Route exact path={rt+"q1"} render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.test1.questionArr} tId={tests.test1.problem.id}/> )}/>
                <Route exact path={rt+"q2"} render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.test2.questionArr} tId={tests.test2.problem.id}/> )}/>
                <Route exact path={rt+"q3"} render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.test3.questionArr} tId={tests.test3.problem.id}/> )}/>
                <Route exact path={rt+"q4"} render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.test4.questionArr} tId={tests.test4.problem.id}/> )}/>
                <Route exact path={rt+"qG"} render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.testGame.questionArr} tId={tests.testGame.id}/> )}/>
                <Route exact path={rt+"qB"} render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.testBasic.questionArr} tId={tests.testBasic.id}/> )}/>

                <Route exact path={rt+"i1"} render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.gameIntro1.contentArr}/> )}/>
                <Route exact path={rt+"i2"} render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.gameIntro2.contentArr}/> )}/>
                <Route exact path={rt+"i3"} render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.gameIntro3.contentArr}/> )}/>
                <Route exact path={rt+"i4"} render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.gameIntro4.contentArr}/> )}/>

                <Route exact path={rt+"play_game"} render={(props) => (<Game {...props} nextPage={this.nextPage.bind(this)} participant={this.state.participant}/> )} />
             
            </Switch>
          </div>
  
      </BrowserRouter>
    );
  }


}

export default App;
