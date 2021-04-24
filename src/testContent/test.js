const scale = 4

const generalQuestions = {

}

const ctProblem1 = {
  head: "Sociala Medier",
  problemDescription: `På en sociala medieplattform kan du bara se bilder 
  som delas till personer du är vän med. Alla namn med en linje mellan sig är vänner. 
  Vem kan Lucia dela bilder med om hon inte vill att Jacob ska se dem?`,

  problemImg: null, // path

  answers: [
    "Dana, Michael, Eve",
    "Michael, Eve, Jacob",
    "Michael, Peter, Monica",
    "Frågor till Sociala Media"
  ],

  correctAnswer: "Dana, Michael, Eve", 

  ctTypeQst: "Problemets text höll sig på en låg detaljnivå. Hur upplevde du detta?", 
  ctTypeAns: [
    {ans: "Det gjorde mig inte engagerad och jag blev inte motiverad att lösa problemet", alt: "HWLC"},
    {ans: "Det gjorde mig engagerad, men jag blev inte motiverad att lösa problemet", alt: "HWSC"},
    {ans: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "LWSC"},
    {ans: "Det gjorde mig inte engagerad, men jag blev motiverad att lösa problemet", alt: "LWLC"}
  ],

  ctCapQst: "På en skala 1-4 hur lätt var det att ta ut relevant information?",
  ctCapAns: scale,

  ctConQst: "På en skala 1-4 hur säker känner du dig på ditt svar är rätt?",
  ctConAns: scale,

  context: "low context",
  workload: "low workload"


}


const ctProblem2 = {}

const ctProblem3 = {}

const ctProblem4 = {}


const ctGameQuestions = {}

