'use strict';
// Import to initialize app, get database, etc
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const textAreaEL = document.querySelector("#textarea-el")
const publishBtnEl = document.querySelector("#btn-el")
const endorsementListEl = document.querySelector("#endorsement-listing")

const appSettings = {
    databaseURL: "https://endorsement-app-78f29-default-rtdb.firebaseio.com/"
}
// Create dictionary to store database reference URL
// This is to connect our app to the database project 
const app = initializeApp(appSettings)

// Get the databse from the firebase project 
const database = getDatabase(app)

// Create reference, a location inside the database to store our data (endorsements)
const endorsementsinDB = ref(database, "endorsements")

publishBtnEl.addEventListener("click", function(){
    let inputValue = textAreaEL.value
    push(endorsementsinDB, inputValue)
    clearInputField(textAreaEL)
    appendItemToListEl(inputValue)
})

onValue(endorsementsinDB, function(snapshot) {
    let itemArr = Object.values(snapshot.val())
    console.log(itemArr)
})

function test() {
   console.log("clicked")
}

function clearInputField(inputEl) {
    inputEl.value =""
}

function appendItemToListEl(item) {
    const createLi = document.createElement("li")
    createLi.textContent= item
    endorsementListEl.append(createLi)
}

