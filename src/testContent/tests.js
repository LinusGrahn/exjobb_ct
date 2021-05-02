const test1 = {
  problem: {
    id: "p1_LWLC",
    title: "Sociala Medier",
    text: `På en sociala medieplattform kan du bara se bilder
    som delas till personer du är vän med. Alla namn med en linje mellan sig är vänner.
    Vem kan Lucia dela bilder med om hon inte vill att Jacob ska se dem?`,
    img: null, // path
    answers: [
      "Dana, Michael, Eve",
      "Michael, Eve, Jacob",
      "Michael, Peter, Monica",
      "Dana, Eve, Monica"
    ],
    cA: "Dana, Michael, Eve",
    imgNr: '1'
  },
  questionArr: [
    {
      id:"q1_LWLC",
      question: "Problemets text höll sig på en låg detaljnivå och du fick hjälp av en kompletterande bild. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig [inte] engagerad och jag blev [inte] motiverad att lösa problemet", alt: "HWHC"},
        {content: "Det gjorde mig engagerad, men jag blev [inte] motiverad att lösa problemet", alt: "HWLC"},
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "LWLC"},
        {content: "Det gjorde mig [inte] engagerad, men jag blev motiverad att lösa problemet", alt: "LWHC"}
      ],
      type: "multi"
    },
    {
      id:"q2_LWLC",
      question: "På en skala 1-4 hur lätt var det att ta ut relevant information?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
       {content: "4", alt: null}
      ],
      type: "scale"
    },
    {
      id:"q3_LWLC",
      question: "På en skala 1-4 hur säker känner du dig på ditt svar är rätt?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
        {content: "4", alt: null}
      ],
      type: "scale"
    }
  ],
  context: "LC",
  workload: "LW"
}
const test2 = {
  problem: {
    id: "p2_LWHC",
    title: "Köningsbergs Broar",
    text: `Nedan ser ni en karta över staden Königsberg, som visar floden som rinner genom staden, dess två öar och de sju broarna som knyter samman öarna och de två sidorna om floden. Turistdepartementet i staden har bestämt att de vill publicera en rutt som tar besökare till de olika delarna av staden (dvs de olika öarna och de två sidorna av floden) och som korsar varje bro endast en gång. Rutten bör starta och avslutas på samma plats. Du som nyanställd på turistdepartementet har fått i uppgift att rådge dem till hur rutten bör planeras.
    Var kan man börja (och avsluta) rutten för att uppnå en sådan rutt?`,
    img: null, // path
    answers: [
      "Norra delen",
      "Östra ön",
      "Det går inte att skapa en sådan rutt",
      "Södra delen"
    ],
    cA: "Det går inte att skapa en sådan rutt",
    imgNr: '0'
  },
  questionArr: [
    {
      id:"q1_LWHC",
      question: "Problemets text höll sig på en hög detaljnivå och du fick hjälp av en kompletterande bild. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig engagerad, men jag blev [inte] motiverad att lösa problemet", alt: "HWHC"},
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "LWHC"},
        {content: "Det gjorde mig [inte] engagerad och jag blev [inte] motiverad att lösa problemet", alt: "HWLC"},
        {content: "Det gjorde mig [inte] engagerad, men jag blev motiverad att lösa problemet", alt: "LWLC"}
      ],
      type: "multi"
    },
    {
      id:"q2_LWHC",
      question: "På en skala 1-4 hur lätt var det att ta ut relevant information?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
       {content: "4", alt: null}
      ],
      type: "scale"
    },
    {
      id:"q3_LWHC",
      question: "På en skala 1-4 hur säker känner du dig på ditt svar är rätt?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
        {content: "4", alt: null}
      ],
      type: "scale"
    }
  ],
  context: "HC",
  workload: "LW"
}
const test3 = {
  problem: {
    id:"p3_HWLC",
    title: "Syllogism",
    text: (<span>Nedan görs ett påstående. Bestäm vilket alternativ som du kan vara säker på är sant, snarare än vilka alternativ som kan vara sant, baserat på påståendet.
    <br></br><strong>Vissa skolor är gymnasium. Alla universitet är skolor</strong>.</span>),
    img: null, // path
    answers: [
      "Alla skolor är universitet",
      "Alla universitet är gymnasium",
      "Alla gymnasium är skolor",
      "Inget av de ovanstående"
    ],
    cA: "Inget av de ovanstående"
  },
  questionArr: [
    {
      id:"q1_HWLC",
      question: "Problemets text höll sig på en låg detaljnivå och du fick ingen hjälp av en kompletterande bild. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig [inte] engagerad, men jag blev motiverad att lösa problemet", alt: "HWHC"},
        {content: "Det gjorde mig [inte] engagerad och jag blev [inte] motiverad att lösa problemet", alt: "LWHC"},
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "HWLC"},
        {content: "Det gjorde mig engagerad, men jag blev [inte] motiverad att lösa problemet", alt: "LWLC"}
      ],
      type: "multi"
    },
    {
      id:"q2_HWLC",
      question: "På en skala 1-4 hur lätt var det att ta ut relevant information?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
       {content: "4", alt: null}
      ],
      type: "scale"
    },
    {
      id:"q3_HWLC",
      question: "På en skala 1-4 hur säker känner du dig på ditt svar är rätt?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
        {content: "4", alt: null}
      ],
      type: "scale"
    }
  ],
  context: "LC",
  workload: "HW"
}
const test4 = {
  problem: {
    id:"p4_HWHC",
    title: "Par sport",
    text: `En grupp vänner älskar att utöva sporter, men vill oftast inte göra det i ett större gäng. De vill istället testa sporter parvis och senare prata om deras upplevelse i efterhand. Gruppen består av två tjejer (konsulten Alice och läkaren Sara) och två killar (arkitekten Rolf och it-specialisten Ahmed).
    Alice och Rolf vill gärna inte umgås bara dem, och därför så finns det endast fyra olika kombinationer av sportpar i gänget. Två av gängmedlemmarna älskar badminton, men vill gärna testa nya sporter när de två parar ihop sig. Detta har resulterat i att bara ett av paren spelar badminton. När Rolf och Ahmed spelar något så spelar de badminton. 
    Vilket annat, om något, par spelar badminton?`,
    img: null, // path
    answers: [
      "Alice och Ahmed",
      "Inget annat par",
      "Ahmed och Sara",
      "Sara och Alice"
    ],
    cA: "Inget annat par"
  },
  questionArr: [
    {
      id:"q1_HWHC",
      question: "Problemets text höll sig på en hög detaljnivå och du fick ingen hjälp av en kompletterande bild. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "HWHC"},
        {content: "Det gjorde mig engagerad, men jag blev [inte] motiverad att lösa problemet", alt: "LWHC"},
        {content: "Det gjorde mig [inte] engagerad, men jag blev motiverad att lösa problemet", alt: "HWLC"},
        {content: "Det gjorde mig [inte] engagerad och jag blev [inte] motiverad att lösa problemet", alt: "LWLC"}
      ],
      type: "multi"
    },
    {
      id:"q2_HWHC",
      question: "På en skala 1-4 hur lätt var det att ta ut relevant information?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
       {content: "4", alt: null}
      ],
      type: "scale"
    },
    {
      id:"q3_HWHC",
      question: "På en skala 1-4 hur säker känner du dig på ditt svar är rätt?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
        {content: "4", alt: null}
      ],
      type: "scale"
    }
  ],
  context: "HC",
  workload: "HW"
}
const testBasic = {
  id: "t_basic",
  questionArr: [
    {
      id:"q1_basic",
      question: "Hur gammal är du?",
      answers: [
        {content: "Under 15", alt: null},
        {content: "15-20", alt: null},
        {content: "21+", alt: null}
      ],
      type: "multi"
    },
    {
      id:"q2_basic",
      question: "Vad är ditt juridiska kön?",
      answers: [
        {content: "Kvinna", alt: null},
        {content: "Man", alt: null}
      ],
      type: "multi"
    },
    {
      id:"q3_basic",
      question: "Är du för närvarande studerande på ett gymnasium i Sverige?",
      answers: [
        {content: "Ja", alt: null},
        {content: "Nej", alt: null}
      ],
      type: "multi"
    },
    {
      id:"q4_basic",
      question: "Vilken inriktning av nedanstående alternativ beskriver bäst din gymnasieutbildning?",
      answers: [
        {content: "Teknik", alt: null},
        {content: "Estet", alt: null},
        {content: "Tekniskt yrkesförberedande program", alt: null},
        {content: "Samhälle", alt: null},
        {content: "Handel & Service", alt: null},
        {content: "Vård & Omsårg", alt: null},
        {content: "Natur", alt: null}
      ],
      type: "multi"
    },
    {
      id:"q5_basic",
      question: "Kände du till begreppet Datalogiskt Tänkande innan inledandet av denna studien?",
      answers: [
        {content: "Ja", alt: null},
        {content: "Nej", alt: null}
      ],
      type: "multi"
    },
    {
      id:"q6_basic",
      question: "På en skala 1-4, hur ofta funderar du över hur du ska lösa ett problem innan du försöker lösa det?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
        {content: "4", alt: null}
      ],
      type: "scale"
    },
    {
      id:"q7_basic",
      question: "Under matematiklektioner, vad föredrar du:",
      answers: [
        {content: "Uppställda tal", alt: null},
        {content: "Lästal", alt: null}
      ],
      type: "multi"
    }
  ],
  context: null,
  workload: null
}
const testGame = {
  id: "t_game",
  questionArr: [
    {
      id:"q1_game_1_LWHC",
      testVariation: "1_LWHC",
      question: "Du fick en utförlig introduktion till spelet. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig engagerad, men jag blev INTE motiverad att lösa problemet", alt: "HWHC"},
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "LWHC"},
        {content: "Det gjorde mig INTE engagerad och jag blev INTE motiverad att lösa problemet", alt: "HWLC"},
        {content: "Det gjorde mig INTE engagerad, men jag blev motiverad att lösa problemet", alt: "LWLC"}
      ],
      type: "multi"
    },
    {
      id:"q1_game_2_HWHC",
      testVariation: "2_HWHC",
      question: "Du fick en beskrivande introduktion till hur spelet fungerar. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "HWHC"},
        {content: "Det gjorde mig engagerad, men jag blev [inte] motiverad att lösa problemet", alt: "LWHC"},
        {content: "Det gjorde mig [inte] engagerad, men jag blev motiverad att lösa problemet ", alt: "HWLC"},
        {content: "Det gjorde mig [inte] engagerad och jag blev [inte] motiverad att lösa problemet", alt: "LWLC"}
      ],
      type: "multi"
    },
    {
      id:"q1_game_3_LWLC",
      testVariation: "3_LWLC",
      question: "Du fick en högst visuell introduktion till hur spelet fungerar. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig [inte] engagerad och jag blev [inte] motiverad att lösa problemet", alt: "HWHC"},
        {content: "Det gjorde mig [inte] engagerad, men jag blev motiverad att lösa problemet", alt: "LWHC"},
        {content: "Det gjorde mig engagerad och jag blev [inte] motiverad att lösa problemet", alt: "HWLC"},
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "LWLC"}
      ],
      type: "multi"
    },
    {
      id:"q1_game_4_HWLC",
      testVariation: "4_HWLC",
      question: "Du fick en väldigt kort introduktion till hur spelet fungerar. Hur upplevde du detta?",
      answers: [
        {content: "Det gjorde mig [inte] engagerad, men jag blev motiverad att lösa problemet", alt: "HWHC"},
        {content: "Det gjorde mig [inte] engagerad och jag blev [inte] motiverad att lösa problemet", alt: "LWHC"},
        {content: "Det gjorde mig engagerad och jag blev motiverad att lösa problemet", alt: "HWLC"},
        {content: "Det gjorde mig engagerad, men jag blev [inte] motiverad att lösa problemet", alt: "LWLC"}
      ],
      type: "multi"
    },
    {
      id:"q2_game",
      question: "På en skala 1-4 hur lätt var det att komma fram till lösningar?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
       {content: "4", alt: null}
      ],
      type: "scale"
    },
    {
      id:"q3_game",
      question: "På en skala 1-4 hur effektiva var dina lösningar i spelet?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
        {content: "4", alt: null}
      ],
      type: "scale"
    },
    {
      id:"q4_game",
      question: "På en skala 1-4 hur ofta upplever du att du reviderade dina lösningar?",
      answers: [
        {content: "1", alt: null},
        {content: "2", alt: null},
        {content: "3", alt: null},
        {content: "4", alt: null}
      ],
      type: "scale"
    },
    {
      id:"q5_game",
      question: "Har du några tankar/kommentarer angående spelet",
      type: "text"
    }
  ],
}

const intro = {
  contentArr: [
    {
      text: (<div className="introTxt">Hej på dig och välkommen!<br></br>
Denna undersökning är en del av ett kandidatarbete i medieteknik på Malmö Universitet där vi undersöker <span className="hl" >Datalogiskt tänkande</span> och riktar sig till dig som går i gymnasiet. Alla uppgifter och data som vi samlar in är helt anonyma och kommer inte kunnas kopplas till dig som person eller individ. Däremot sparar ett så kallat digitalt fingeravtryck baserat på din browser för att säkerställa att inte testet görs flera gånger av samma person. Genom att delta så godkänner du att vi får använda den data som samlas in i samband med denna kandidatuppsats. Har du några funderingar eller frågor så går det bra att maila på kandidat.computationalthinking@gmail.com
Undersökningen kommer att bestå av fyra delar: <br></br>
<strong>
<ol>
<li>Du får svara på några generella frågor om dig och din gymnasieinriktning.</li>

<li>Därefter kommer du få försöka lösa fyra olika datalogiska problem där varje problem efterföljs av tre frågor. Gör så gott du kan! Att svara rätt är inte det viktiga i undersökningen. Svarsalternativen kommer först dyka upp efter tre sekunder.</li>
<li>Här kommer du få spela ett nyutvecklat spel (“Seymours Stolverkstad”), som är baserat på datalogiskt tänkande. Gör så gott du kan även här. Det finns en “jag-är-nöjd-knapp” som tar dig vidare till sista delen om du inte vill spela klart.</li>
<li>Sista delen består av ett par avslutande frågor kring spelet.</li>
</ol>
<br></br>
Stort tack på förhand för att du deltar och lycka till!</strong>
</div>),
      nextPage: "1",//path
    }
  ]
}
const gameIntro1_LWHC = { 
  contentArr: [
    {
    text: "Välkommen till Seymours Stolar! Mitt namn är Seymour och du har precis fått anställning för att programmera min Fantastiska Automatiserade Byggfabrik (F.A.B)!!",
    img: null,//path
    pageNumber: 1
  },
    {
    text: "Jag kommer få in virken som det är tänkt att jag ska skapa stolar av.Problemet är att jag inte längre är så bra på att planera och behöver någon som kan organisera min fabrik. Hur ska jag beskära virket t.ex?Det är här du kommer in!",
    img: true,//path
    pageNumber: 2
  },
    {
    text: "Det här är en beskärningsmaskin. Du drar en flödeslinje från en utåtriktad pil till denna maskinens inåtriktade maskin. Sen ställer du in om du vill beskära virket längs bredden eller längden, och sedan vid vilket mått. Då får du ju ut två ny brädor liksom.",
    img: true,//path
    pageNumber: 3
  },
    {
    text: "Den här sorteringsmaskinen tar emot olika bitar och sorterar dem efter antingen längd eller när de skickas in i sorteringsmaskinen!",
    img: true,//path
    pageNumber: 4
  },
    {
    text: "Sen kan man ju få maskinerna att interagera på olika sätt. Som att t.ex. beskära en och samma bit flera gånger och sen sortera ut den första biten.",
    img: true,//path
    pageNumber: 5
  },
    {
    text: "När du har gjort alla delarna för stolen, så skickar vi in dem i den här maskinen, sammanställaren, som sätter samman allt till en stol. Den är så smart att den vet exakt hur stolen ska bli.",
    img: true,//path
    pageNumber: 6
  },
    {
    text: "Och så här fint kan det bli till slut! Sätt igång! Gör mig stolt och tjäna lite pengar åt mig!",
    img: true,//path
    pageNumber: 7
  }
  ],
  testVariation: "1_LWHC"
}
const gameIntro2_HWHC = {
  contentArr: [
  {
    text: "Välkommen till Seymours Stolar! Mitt namn är Seymour och du har precis fått anställning för att programmera min Fantastiska Automatiserade Byggfabrik (F.A.B)!!",
    img: null,
    pageNumber: 1
  },
  {
    text: "Jag kommer få in virken som det är tänkt att jag ska skapa stolar av.Problemet är att jag inte längre är så bra på att planera och behöver någon som kan organisera min fabrik. Hur ska jag beskära virket t.ex?Det är här du kommer in!",
    img: null,
    pageNumber: 2
  },
  {
    text: "Du kommer b.l.a ha beskärningsmaskiner. Du drar en flödeslinje från en utåtriktad pil till denna maskinens inåtriktade maskin. Du ställer sedan in om du vill beskära virket längs bredden eller längden, och sedan vid vilket mått. Då får du ju ut två ny brädor liksom.",
    img: null,
    pageNumber: 3
  },
  {
    text: "Sen har vi sorteringsmaskinen som tar emot olika bitar och sorterar dem efter antingen längd eller när de skickas in i sorteringsmaskinen!",
    img: null,
    pageNumber: 4
  },
  {
    text: "Sen kan man ju få maskinerna att interagera på olika sätt. Som att t.ex. beskära en och samma bit flera gånger och sen sortera ut den första biten.",
    img: null,
    pageNumber: 5
  },
  {
    text: "När du har gjort alla delarna för stolen, så skickar vi in dem i den sista maskinen, sammanställaren, som sätter samman allt till en stol. Den är så smart att den vet exakt hur stolen ska bli.",
    img: null,
    pageNumber: 6
  },
  {
    text: "Sätt igång! Gör mig stolt!",
    img: null,
    pageNumber: 7
  }
  ],
  testVariation: "2_HWHC"
}
const gameIntro3_LWLC = {
  conntentArr: [
  {
    text: "Välkommen till Seymours Stolar!",
    img: null,//path
    pageNumber: 1
  },
  {
    text: "Du ska skapa stolar av träbitar!",
    img: true,//path
    pageNumber: 2
  },
  {
    text: "Beskärningsmaskiner beskär virken längs bredden eller längden, enligt definierat mått, och ger dig två nya brädbitar. De tar emot bitar från utåtriktade pilar via flödeslinjer som du fäster vid dess inåtriktade pil.",
    img: true,//path
    pageNumber: 3
  },
  {
    text: "Sorteringsmaskinen tar emot olika bitar och sorterar dem efter antingen längd eller när de skickas in i sorteringsmaskinen.",
    img: true,//path
    pageNumber: 4
  },
  {
    text: "Gör så att maskinerna interagerar på olika sätt. Som att t.ex. beskära en och samma bit flera gånger och sen sortera ut den första biten.",
    img: true,//path
    pageNumber: 5
  },
  {
    text: "När du har gjort alla delarna för stolen, så skickar vi in dem till sammanställaren.",
    img: true,//path
    pageNumber: 6
  },
  {
    text: "Lycka till.",
    img: true,//path
    pageNumber: 7
  }
],
  testVariation: "3_LWLC"
}
const gameIntro4_HWLC = {
  contentArr: [
  {
    text: "Återskapa den presenterade stolens olika delar med de mått som anges intill, av de virken som är högst upp på spelplan. Du hittar maskinerna för att åstadkomma detta under verktygsmenyn. Dra flödeslinjer mellan utåtriktade och inåtriktade pilar, och dra in alla färdiga delar till sammanställaren.",
    img: null,
    pageNumber: 1
  }
],
  testVariation:"4_HWLC"
}

const tests = {
  test1: test1,
  test2: test2,
  test3: test3,
  test4: test4,
  testBasic: testBasic,
  testGame: testGame
}
const content = {
  intro: intro,
  gameIntro1: gameIntro1_LWHC,
  gameIntro2: gameIntro2_HWHC,
  gameIntro3: gameIntro3_LWLC,
  gameIntro4: gameIntro4_HWLC
}

export  {tests, content}