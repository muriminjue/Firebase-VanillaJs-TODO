const loginBtn = document.getElementById("signIn");
const logoutBtn = document.getElementById("signOut");
const LoggedIn = document.getElementById("signedIn");
const LoggedOut = document.getElementById("signedOut");
const userDetails = document.getElementById("userDetails");
const newTaskForm = document.getElementById("newtask");
const newTaskName = document.getElementById("newtaskname");
const newTaskDate = document.getElementById("newtaskdate");
const itemList = document.getElementById("itemlist");

// settings
newTaskDate.min= new Date().toISOString().slice(0,new Date().toISOString().lastIndexOf(":"));
// newTaskDate.addEventListener("change", (e)=>{e.preventDefault(); newTaskDate.value=new Date(e.target.value).toISOString().split(".")[0]})

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

let unsubscribe, todoRef;
/// Sign in event handlers

loginBtn.onclick = () => auth.signInWithPopup(provider);

logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in
    LoggedIn.hidden = false;
    LoggedOut.hidden = true;
    userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3><h6>Wellcome to your to-do List</h6>`;
    todoRef = db.collection("todos");

    newTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const { serverTimestamp } = firebase.firestore.FieldValue;
      todoRef.add({
        uid: user.uid,
        name: newTaskName.value,
        dueDate: newTaskDate.value,
        status: "incomplete",
        createdAt: serverTimestamp(),
      });
    });

    unsubscribe = todoRef
      .where("uid", "==", user.uid)
      .onSnapshot((querySnapshot) => {
        // Map results to an array of li elements
        const items = querySnapshot.docs.map((doc) => {
          return `<li>${doc.data().name} </li>`;
        });
        itemList.innerHTML = items.join("");
      });
  } else {
    // not signed in
    LoggedIn.hidden = true;
    LoggedOut.hidden = false;
    userDetails.innerHTML = "";

    unsubscribe && unsubscribe();
  }
});
