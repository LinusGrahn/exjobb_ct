import React from 'react';




const Test = (props) => {
  // let {plant, openDetail} = props 
  console.log(props)
  let {message} = props
  message = message ? message : "Introduktion till studie, GDPR och sånt"
  let test2 = "text och liste sp"
  let test3 = "vad kan man mer göra"

  // console.log(deletePlant, editPlant)
  // actions --> myplant or search result

  return (
    <div className="plantCard cont" >

        <div className="plantName">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        {message}
         </h2>

          <p>{test3}</p>
          <p><span>{test2}</span> - <span>{test3}</span>
          </p>
        </div>


        <div className="plantOption">
        </div>
      </div>
  )

}

export default Test