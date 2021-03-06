import firebase from "firebase/app";
import "firebase/database";

const config = {
    apiKey: "AIzaSyCY2RisfrQSJ_2spRpgmTQIVXCpHMKUBI8",
    authDomain: "roll-play-stage.firebaseapp.com",
    projectId: "roll-play-stage",
    storageBucket: "roll-play-stage.appspot.com",
    messagingSenderId: "1021674062807",
    appId: "1:1021674062807:web:11171850dd1eb9fff00192"
}

const db = firebase.initializeApp(config);
export default db;