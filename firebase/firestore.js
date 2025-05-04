// firebase/firestore.js
import app from './firebaseConfig.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const db = getFirestore(app);
const eventosRef = collection(db, "eventos");

export {
  db,
  eventosRef,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
};
