import React from 'react';
import '../css/anima.css';

const LoadingAnimation = (props) => {
  return (
    <div className="animaContainer">
      <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  )
}

export default LoadingAnimation;