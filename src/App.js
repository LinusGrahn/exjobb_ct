import React, { Component } from 'react';
import Navbar from './components/Navbar';
import db from './api/firestoreAPI';
import Game from './components/Game';
import {tests, content} from './testContent/tests';
import Problem from './components/Problem';
import Questions from './components/Questions';
import Introduction from './components/Introduction';

import {BrowserRouter, Route, Switch} from 'react-router-dom';

//root component
class App extends Component {
  state = {
    gVar: null,
    participant: {},
    routeOrderArr: ["/", "/qB", "/pr1", "/q1", "/pr2", "/q2", "/pr3", "/q3", "/pr4", "/q4", "/i?", "/play_game", "/qG"]
  }

  componentDidMount() {
    //fetches the participant or creates a new one
    
    //checkdigitalFingreprint
    //exist-->
    
    // this.getParticipant()
    //redirect to current page
    
    //don't exist-->
    this.createParticipant()
    this.getAndUpdVariation()
  }

  getAndUpdVariation() {
    db.collection('gameVariation').get("flag").then((snapshot)=>{
      //gets an array of documents (participants) from the collection "participants"
      console.log("gV", snapshot.docs[0].data())
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
  getParticipant() {
    //if fingerprint exist get else create new 

    //fetch an existing participant
    db.collection('participants').get().then((snapshot)=>{
      //gets an array of documents (participants) from the collection "participants"
      console.log(snapshot.docs[0].data())
      let p = snapshot.docs[0].data()

      this.setState({
        participant: p
      })
    })
  }

  //create a new participant
  createParticipant() {
    
    let newPar = {
      currentPage: "/",
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
      par.answers = [...par.answers, ...[ansArr]]
    }

    par.currentPage = this.nextPage(page)

    // db.collection('participants').doc("flag").set({
    //   flag: updFlag
    // })

    console.log("toDB",par)
    // this.setState({
    //   participant: par
    // })
  }

  removeParticipant() {

  } 

  addParticipantToFinishedCollection() {

  }

  nextPage(curP) {
    curP = curP.match(/[i]\d/gm)? "/i?" : curP
    let list = this.state.routeOrderArr
    let curI = list.findIndex(p=>p===curP)
    let next = list[curI+1]
    if(next.includes("?")) {
      next = next.replace("?", this.state.gVar)
    } 
    console.log("curPageI and P is: ", curI, curP, "next path is:", next)

    if(curI===-1 || curI===list.length-1) {
      console.log("don't go to nextPage or cur is -1?", curI)
      return
    }

    return next
  }
  
  render() {
    console.log("par", this.state.participant)
    // console.log("I start from all", tests, content)
    return (
      <BrowserRouter>
          <div className="App">
            <Navbar />
              <Switch>
                <Route exact path="/" render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.intro.contentArr} /> )}/>

                <Route exact path="/pr1" render={(props) => (<Problem {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} problem={tests.test1.problem}/> )}/>
                <Route exact path="/pr2" render={(props) => (<Problem {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} problem={tests.test2.problem}/> )}/>
                <Route exact path="/pr3" render={(props) => (<Problem {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} problem={tests.test3.problem}/> )}/>
                <Route exact path="/pr4" render={(props) => (<Problem {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} problem={tests.test4.problem}/> )}/>
                
                <Route exact path="/q1" render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.test1.questionArr} tId={tests.test1.problem.id}/> )}/>
                <Route exact path="/q2" render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.test2.questionArr} tId={tests.test2.problem.id}/> )}/>
                <Route exact path="/q3" render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.test3.questionArr} tId={tests.test3.problem.id}/> )}/>
                <Route exact path="/q4" render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.test4.questionArr} tId={tests.test4.problem.id}/> )}/>
                <Route exact path="/qG" render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.testGame.questionArr} tId={tests.testGame.id}/> )}/>
                <Route exact path="/qB" render={(props) => (<Questions {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} questionArr={tests.testBasic.questionArr} tId={tests.testBasic.id}/> )}/>

                <Route exact path="/i1" render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.gameIntro1.contentArr}/> )}/>
                <Route exact path="/i2" render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.gameIntro2.contentArr}/> )}/>
                <Route exact path="/i3" render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.gameIntro3.contentArr}/> )}/>
                <Route exact path="/i4" render={(props) => (<Introduction {...props} updateParticipant={this.updateParticipant.bind(this)} nextPage={this.nextPage.bind(this)} participant={this.state.participant} contentArr={content.gameIntro4.contentArr}/> )}/>

                <Route exact path="/play_game" render={(props) => (<Game {...props} nextPage={this.nextPage.bind(this)} participant={this.state.participant}/> )} />

                {/* <Route exact path="/play_game" render={() => {window.location.href="http://localhost:8888/exjobb_ct/src/game/play_game.html"}} /> */}
                {/* <Route exact path="/q2" render={(props) => (<BaseComponent {...props} message={"avslutningsfrågor"} /> )} />
                <Route exact path="/end" render={(props) => (<BaseComponent {...props} message={"Slut på undersökning"} /> )} /> */}
                {/* <Route exact path="/plants" render={(props) => (<Plants {...props} plants={state.plantList} deletePlant={this.deletePlant}/>)} /> */}
                {/* <Route exact path="/">
                  <Plants plants={state.plants} />
                </Route> */}
             
            </Switch>
          </div>
  
      </BrowserRouter>
    );
  }


}

export default App;
