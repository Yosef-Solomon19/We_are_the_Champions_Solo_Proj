'use strict';
// Import to initialize app, get database, etc
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const textAreaEL = document.querySelector("#textarea-el")
const publishBtnEl = document.querySelector("#btn-el")
const endorsementListEl = document.querySelector("#endorsement-listing")
const endorsementSenderEl = document.querySelector("#endorsement-sender")
const endorsementReceiverEl = document.querySelector("#endorsement-receiver")

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
    let receiver = endorsementReceiverEl.value
    let sender = endorsementSenderEl.value
    console.log(endorsementDictionary(sender, receiver))

    push(endorsementsinDB, inputValue)
    clearInputField(textAreaEL)
    // appendItemToListEl(inputValue)
})

onValue(endorsementsinDB, function(snapshot) {
    if (snapshot.exists())
    {
        let itemArr = Object.entries(snapshot.val())
        // Reverse order of items in itemArr
        // itemArr.reverse()
        clearEndorsementListEl()
        // console.log(itemArr)
        for (let i = 0; i<itemArr.length; i++) {
            let currentItem = itemArr[i];
            let currentID = currentItem[0]
            let currentValue = currentItem[1]
            appendItemToListEl(currentItem)
        }

    } else {
        endorsementListEl.innerHTML = `<li>No endorsements yet...<li>`
    }
})
function clearEndorsementListEl() {
    endorsementListEl.innerHTML = ""
    endorsementSenderEl.innerHTML = ""
    endorsementReceiverEl.innerHTML = ""
}
function endorsementDictionary(from, to) {
    let endorsement = {}
    endorsement.sender = from
    endorsement.receiver = to
    return endorsement
}


function clearInputField(inputEl) {
    inputEl.value =""
}

function appendItemToListEl(item) {
    let itemID = item[0]
    
    let itemValue = item[1]
    const createLi = document.createElement("li")
    createLi.textContent= itemValue

    createLi.addEventListener("dblclick", function(){
        let exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)
        remove(exactLocationOfItemInDB)
    })
    endorsementListEl.append(createLi)
}

