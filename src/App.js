import Navbar from './components/Navbar';
import Test from './components/Test';

import {BrowserRouter, Route, Switch} from 'react-router-dom';


//root component
function App() {
//   let state = {
//     plantList: [],
//     plants: []
//   }



  return (
    <BrowserRouter>
        <div className="App">
          <Navbar />
          <div>settings.</div>
            <Switch>
              <Route exact path="/" component={Test} />
              <Route exact path="/bq" render={(props) => (<Test {...props} message={"snabba generella frågor"} /> )} />
              <Route exact path="/q1_int" render={(props) => (<Test {...props} message={"test ett: introduktion"} /> )} />
              <Route exact path="/q1_tst" render={(props) => (<Test {...props} message={"test ett: problem"} /> )} />
              <Route exact path="/q1_qtn" render={(props) => (<Test {...props} message={"test ett: frågor kring problemet"} /> )} />
              <Route exact path="/game_int" render={(props) => (<Test {...props} message={"Introduktion av spel"} /> )} />
              <Route exact path="/play_game" render={() => {window.location.href="http://localhost:8888/exjobb_ct/src/game/play_game.html"}} />
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

export default App;
