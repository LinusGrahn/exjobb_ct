import React from 'react';
import '../game/stylesheet.css'


const Game = (props) => {
  let {participant} = props
  

  console.log(participant)
  
  
//  window.postMessage(JSON.stringify(participant), document.querySelector("#gameFrame").contentWindow)
  
 
  
  
  
  console.log(participant)
  // localStorage.setItem("par", JSON.stringify(participant))
  window.par = participant
  return (
    <div>
      {participant.fingerPrint ? 
        <iframe title="game" id="gameFrame" type="html" src="http://localhost:8888/exjobb_ct/src/game/play_game.html" width={window.innerWidth} height={window.innerHeight}></iframe>
      : <div>waiting for par</div>}
    </div>
  )

}

export default Game


