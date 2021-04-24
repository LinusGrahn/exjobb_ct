import firebase from 'firebase/app'
import 'firebase/firestore'


  // Your web app's Firebase configuration
  let firebaseConfig = {
    apiKey: "AIzaSyDdGj5wAxbwoNAfELBsu8tpy-ugCT9B2HQ",
    authDomain: "exjobbcct.firebaseapp.com",
    projectId: "exjobbcct",
    storageBucket: "exjobbcct.appspot.com",
    messagingSenderId: "670414171523",
    appId: "1:670414171523:web:4b6d7add037a47b4375ab6"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.firestore().settings({ timestampInSnapshots: true});
  const db = firebase.firestore()


  export default db