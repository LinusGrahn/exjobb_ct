let pallet = {
  c1: "rgb(68,85,93)", //blue
  c2: "rgb(220,198,176)", //beige
  c3: "rgb(164,124,93)", // terracotta
  stroke: "black",
  c1T: "rgba(68,85,93,.3)", //blueTrans
  c2T: "rgba(220,198,176,.3)", //beigeTrans
  c3T: "rgba(16,124,93,.3)", // terracottaTrans
  mat: "rgb(145, 66, 48)"
}

const skin = {
  pallet: pallet,

  typography: {
    //textsizes
    textSize: 16,
    hSml: 22,


    col: pallet.c1,
    col2: pallet.c2
  },

  // typo: {
  //   headLrg: 40,
  //   headSml: 28,
  //   med: 18,
  //   sml: 16
  // },

  elem: {
    bdryFill: "rgba(67,85,94,.1)",
    elemFill: pallet.c1,
    ok_bdryFill: "rgba(0,180,10,0.10)",
    ok_elemFill: "rgba(0,180,10,0.80)",
    err_bdryFill: "rgba(180,0,0,0.10)",
    err_elemFill: "rgba(180,0,0,0.80)",

    stroke: pallet.stroke,

    secFill: pallet.c2,
    thirdFill: pallet.c3,

    matFill: pallet.mat
  },

  port: {
    closedCol: "rgb(204, 136, 69)",
    openCol: pallet.c2
  },

  connection: {
    col: "rgb(204, 136, 69)",
    err_col: "red",
    strokeWeigth: 4
  }

  
}
