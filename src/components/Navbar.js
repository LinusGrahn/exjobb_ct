import React from 'react';
import {NavLink} from 'react-router-dom';

//Link is used for react to intercept the server request for the <a> so the page doesn't need to reload as it would using <a href="/">
//in the dom Link is convertet to an a-tag
//NavLink allows the active link to add the class "active"

const Navbar = (props) => {


  return (
    <nav className="navbar">
    <p>Navbar finns under produktion och kommer sedan inte vara synlig för deltagarna.</p>
      <ul>
        <li className="navItem"><NavLink to="/">Introduktion</NavLink></li>
        <li className="navItem"><NavLink to="/bq">Grund-läggade frågor</NavLink></li>
        <li className="navItem"><NavLink to="/q1_int">test1 introduktion</NavLink></li>
        <li className="navItem"><NavLink to="/q1_tst">test1 problem</NavLink></li>
        <li className="navItem"><NavLink to="/q1_qtn">test1 frågor</NavLink></li>
        <li className="navItem"><NavLink to="/game_int">Introduktion till spel</NavLink></li>
        <li className="navItem"><NavLink to="/play_game">Spelet</NavLink></li>
        <li className="navItem"><NavLink to="/q2">avslutningsfrågor</NavLink></li>
        <li className="navItem"><NavLink to="/end">Avslutning och tack</NavLink></li>
      </ul>
    </nav>
  )
}

export default Navbar