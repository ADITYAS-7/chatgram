import "./App.css";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore"; // Import getFirestore

import { serverTimestamp, addDoc } from "firebase/firestore";
import { useRef, useState } from "react";

// ...

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDfO8-4NjPQhDZPJFqxAs1PD0I1X6d6rMk",
  authDomain: "chatgram-4253c.firebaseapp.com",
  projectId: "chatgram-4253c",
  storageBucket: "chatgram-4253c.appspot.com",
  messagingSenderId: "315054059643",
  appId: "1:315054059643:web:1e565649b1e8ddac3872de",
  measurementId: "G-X4BHR67JL9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get auth instance from the initialized app
const firestore = getFirestore(app); // Get Firestore instance from the initialized app

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>
        <SignOut /> {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  // Sign in function using google auth provider popup
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider); // Use signInWithPopup from auth instance
  };

  return (
    <>
      <h1 class="appName">Welcome to ChAtGrAm!</h1>
      <br />
      <button class="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

function SignOut() {
  // To signout checking if there is a current user and simply using the signout function
  return (
    auth.currentUser && (
      <>
        <button class="signOut" onClick={() => auth.signOut()}>
          Sign Out
        </button>
      </>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messageRef = collection(firestore, "messages");

  const messageQuery = query(messageRef, orderBy("createdAt"), limit(25)); // fetch by timestamp only 25 messages

  const [messages] = useCollectionData(messageQuery, { idField: "id" });

  const [formValue, setFormValue] = useState(""); //using this state to get the value from the textbox

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    try {
      await addDoc(messageRef, {
        //Adding the document to the firestore
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
      });
      setFormValue("");

      dummy.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  return (
    <>
      <div>
        {messages &&
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
            /> /* Mapping through the messages using their id */
          ))}{" "}
      </div>

      <div ref={dummy}></div>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)} //setting the value used in Chatroom() function to add the message to the document using the state
        />
        <button type="submit">
          {" "}
          <span class="glyphicon glyphicon-send" aria-hidden="true"></span>
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  // How the chat message will look
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "recieved"; // to distinguish b/w the messages sent and recieved by matching the current user id to the uid of the message creator

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default App;
