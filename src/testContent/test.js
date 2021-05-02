// const scale = 4

// const generalQuestions = {

// }

const test1 = {
  problem: { 
    title: "Sociala Medier",
    text: `På en sociala medieplattform kan du bara se bilder 
    som delas till personer du är vän med. Alla namn med en linje mellan sig är vänner. 
    Vem kan Lucia dela bilder med om hon inte vill att Jacob ska se dem?`,

    imgNr: '1', // path

    answers: [
      "Dana, Michael, Eve",
      "Michael, Eve, Jacob",
      "Michael, Peter, Monica",
      "Frågor till Sociala Media"
    ],

    correctAnswer: "Dana, Michael, Eve"
  },

  questionArr: [
    {
      id:"q_2839740131",
      question: "Problemets text höll sig på en låg detaljnivå. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig inte engagerad och jag blev inte motiverad att lösa problemet", alt: "HWLC"},
        {content: "Det gjorde mig engagerad, men jag blev inte motiverad att lösa problemet", alt: "HWSC"},
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "LWSC"},
        {content: "Det gjorde mig inte engagerad, men jag blev motiverad att lösa problemet", alt: "LWLC"}
      ],
      type: "multi"
    },
    {
      id:"q_2839740131",
      question: "På en skala 1-4 hur lätt var det att ta ut relevant information?",
      answers: [
        {content: "1", alt: "?????????HWLC"},
        {content: "2", alt: "?????????HWSC"},
        {content: "2", alt: "?????????LWSC"},
        {content: "2", alt: "?????????LWLC"}
      ],
      type: "scale"
    },
    {
      id:"q_2839740131",
      question: "På en skala 1-4 hur säker känner du dig på ditt svar är rätt?",
      answers: [
        {content: "1", alt: "?????????HWLC"},
        {content: "2", alt: "?????????HWSC"},
        {content: "2", alt: "?????????LWSC"},
        {content: "2", alt: "?????????LWLC"}
      ],
      type: "scale"
    }

  ],

  context: "low context",
  workload: "low workload"

}


// const ctProblem2 = {}

// const ctProblem3 = {}

// const ctProblem4 = {}


// const ctGameQuestions = {}




export default test1