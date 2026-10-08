// Firebase-konfiguration til den delte opgaveliste.
//
// Dette er IKKE en hemmelighed — Firebases web-API-nøgler er designet til at
// stå i klientkode (adgangen styres af Firestore-sikkerhedsreglerne, ikke af
// at hemmeligholde denne fil). Udfyld værdierne fra:
// Firebase-konsollen -> Projektindstillinger -> Dine apps -> Web-app -> SDK-opsætning.
window.FIREBASE_CONFIG = {
  apiKey: "UDFYLD-DIN-API-KEY",
  authDomain: "dit-projekt.firebaseapp.com",
  projectId: "dit-projekt",
  storageBucket: "dit-projekt.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx",
};

// Navnet på den Cloud Functions-region, du har deployet til (findes i
// Firebase-konsollen under Functions). "us-central1" er standard hvis du
// ikke selv har valgt en anden region ved deploy.
window.FIREBASE_FUNCTIONS_REGION = "us-central1";
