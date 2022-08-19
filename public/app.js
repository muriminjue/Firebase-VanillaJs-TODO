const loginBtn = document.getElementById("signIn");
const logoutBtn = document.getElementById("signOut");
const loadingSec = document.getElementById("loading");
const LoggedIn = document.getElementById("signedIn");
const LoggedOut = document.getElementById("signedOut");
const userDetails = document.getElementById("userDetails");
const newTaskForm = document.getElementById("newtask");
const newTaskName = document.getElementById("newtaskname");
const newTaskDate = document.getElementById("newtaskdate");
const itemList = document.getElementById("itemlist");

// settings
newTaskDate.min = new Date()
  .toISOString()
  .slice(0, new Date().toISOString().lastIndexOf(":"));
// newTaskDate.addEventListener("change", (e)=>{e.preventDefault(); newTaskDate.value=new Date(e.target.value).toISOString().split(".")[0]})

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();
const { serverTimestamp } = firebase.firestore.FieldValue;

let unsubscribe, todoRef;
/// Sign in event handlers

loginBtn.onclick = () => auth.signInWithPopup(provider);

logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in
    loadingSec.hidden = true
    LoggedIn.hidden = false;
    LoggedOut.hidden = true;
    userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3><h6>Wellcome to your to-do List</h6>`;
    todoRef = db.collection("todos");

    newTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
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
      .where("status", "==", "incomplete")
      .onSnapshot((querySnapshot) => {
        itemList.innerHTML = "";
        // Map results to an array of li elements
        const items = querySnapshot.docs.map((doc) => {
          let listItem = document.createElement("li"),
            listCheckBox = document.createElement("button"),
            listDelete = document.createElement("button"),
            listDiv = document.createElement("div");

          listDiv.style = "float: right";
          listCheckBox.onclick = () => {
            todoRef.doc(doc.id).update({
              status: "complete",
              endDate: serverTimestamp(),
            });
          };
          listCheckBox.innerHTML = `<i class="fas fa-check"style="color:green"></i>`;

          listDelete.innerHTML = `<i class="fas fa-trash" style="color:red"></i>`;
          listDelete.onclick = () => {
            todoRef.doc(doc.id).delete();
          };

          listItem.innerHTML = `${doc.data().name}`;

          listDiv.appendChild(listCheckBox);
          listDiv.appendChild(listDelete);
          listItem.appendChild(listDiv);
          itemList.appendChild(listItem);
        });
      });
  } else {
    // not signed in
    
    loadingSec.hidden = true
    LoggedIn.hidden = true;
    LoggedOut.hidden = false;
    userDetails.innerHTML = "";

    unsubscribe && unsubscribe();
  }
});
