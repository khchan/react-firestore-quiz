import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyC2_jm7KIEYWiFJNjPZmKmp-Us1WbClxuc",
    authDomain: "wedding-shoe.firebaseapp.com",
    databaseURL: "https://wedding-shoe.firebaseio.com",
    projectId: "wedding-shoe",
    storageBucket: "wedding-shoe.appspot.com",
    messagingSenderId: "222894053002",
    appId: "1:222894053002:web:4e2b14bbae82f817"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const storage = firebaseApp.storage();
const FieldValue = firebase.firestore.FieldValue;

export { db, storage, FieldValue };
