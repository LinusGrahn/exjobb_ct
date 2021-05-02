const chopStr = (str)=>{
  return str
  if(!str.match(/[[]/gm)) {
    return str
  }
  let cnt = str.match(/[[]/gm).length
  let arr = []
  let sI = 0
  
  for (let i=0; i<cnt*2+1; i++) {
    let s
    let en

    if(!i%2) {
      en = str.indexOf("[", sI)
      s = str.substr(sI ,en-sI)
      arr.push((<span key={Math.random()}>{s}</span>))
    } else {
      en = str.indexOf("]", sI)
      s = str.substr(sI+1, en-sI-1)
      arr.push((<span key={Math.random()} className="highLight">{s}</span>))
    }
    console.log(s)
    sI = en
  }
  console.log(arr)

  return (arr
  )
}


export {chopStr}