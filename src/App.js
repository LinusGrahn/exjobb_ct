import React, { Component } from 'react';
import Navbar from './components/Navbar';
import Test from './components/Test';
import db from './api/firestoreAPI'
import Game from './components/Game'

import {BrowserRouter, Route, Switch} from 'react-router-dom';


//root component
class App extends Component {
  state = {
    testflag: 1,
    participant: {}
  }

  componentDidMount() {
    //fetches the participant or creates a new one
    this.getParticipant()
  }

  getParticipant() {
    //if fingerprint exist get else create new 

    //fetch an existing participant
    db.collection('participants').get().then((snapshot)=>{
      //gets an array of documents (participants) from the collection "participants"
      console.log(snapshot.docs[0].data())
      let p = snapshot.docs[0].data()
      // snapshot.docs.forEach(doc=>(
      //   console.log(doc.data())
      // ))
      //updates participant state
      this.setState({
        participant: p
      })

    })

    

  }
  
  render() {
    console.log(this.state.participant)
    return (
      <BrowserRouter>
          <div className="App">
            <Navbar />
            <div>Hehj</div>
              <Switch>
                <Route exact path="/" component={Test} />
                <Route exact path="/bq" render={(props) => (<Test {...props} message={"snabba generella frågor"} /> )} />
                <Route exact path="/q1_int" render={(props) => (<Test {...props} message={"test ett: introduktion"} /> )} />
                <Route exact path="/q1_tst" render={(props) => (<Test {...props} message={"test ett: problem"} /> )} />
                <Route exact path="/q1_qtn" render={(props) => (<Test {...props} message={"test ett: frågor kring problemet"} /> )} />
                <Route exact path="/game_int" render={(props) => (<Test {...props} message={"Introduktion av spel"} /> )} />
                {/* <Route exact path="/play_game" render={() => {window.location.href="http://localhost:8888/exjobb_ct/src/game/play_game.html"}} /> */}
                <Route exact path="/play_game" render={(props) => (<Game {...props} participant={this.state.participant}/> )} />
                <Route exact path="/q2" render={(props) => (<Test {...props} message={"avslutningsfrågor"} /> )} />
                <Route exact path="/end" render={(props) => (<Test {...props} message={"Slut på undersökning"} /> )} />
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
