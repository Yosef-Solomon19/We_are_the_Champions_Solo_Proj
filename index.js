"use strict";
// Import to initialize app, get database, etc
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

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
    let userNamesWithMessage = endorsementDictionary(sender, receiver, inputValue)
    // console.log(userNameWithMessage)
    // console.log(endorsementDictionary(sender, receiver))

    push(endorsementsinDB, userNamesWithMessage)
    clearInputField(textAreaEL)
    // appendItemToListEl(inputValue)
})

onValue(endorsementsinDB, function(snapshot) {
    if (snapshot.exists())
    {
        const itemArr = Object.entries(snapshot.val())
        // Create a separate copy of the item array since .reverse is destructive, as it changes the original arr
        //Reverse order of items in itemArr
        const reverseItemArr = itemArr.reverse()
        
        clearEndorsementListEl()
        // console.log(itemArr)
        for (let i = 0; i< reverseItemArr.length; i++) {
            let currentItem= reverseItemArr[i];
            
            let currentItemID = reverseItemArr[i][0];
            
            let dictToArr = Object.entries( reverseItemArr[i][1])
            // console.log(dictToArr)
            let currentMessage = dictToArr[1][1];
            
            let fromUser = dictToArr[0][1];
            
            let toUser = dictToArr[2][1];

            let likeCountNum = dictToArr[3][1]
            
            appendItemToListEl(currentItemID, currentMessage, fromUser,toUser, likeCountNum) 
        }

    } else {
        endorsementListEl.innerHTML = `<li>No endorsements yet...<li>`
    }
})
function clearEndorsementListEl() {
    endorsementListEl.innerHTML = ""
}
function endorsementDictionary(from, to, message) {
    let endorsement = {}
    endorsement.Message = message
    endorsement.To = to
    endorsement.From = from 
    endorsement.likes = 0   
    return endorsement
}


function clearInputField(inputEl) {
    inputEl.value =""
    endorsementSenderEl.value= ""
    endorsementReceiverEl.value = ""
}
// appendItemToListEl(currentItemID, currentMessage, fromUser,toUser) 
function appendItemToListEl(currentID, message, from, to, likeCount) {
    let itemID = currentID   
    let itemValue = message
    let userSendingEndorsement = from
    let userReceivingEndorsement = to
    let messageLikeCount = likeCount
    

    const createLi = document.createElement("li")
    const createPSenderEl = document.createElement("p")
    createPSenderEl.classList="margin-btm"
    const createPReceiverEl = document.createElement("p")
    createPReceiverEl.classList="margin-top"

    createPSenderEl.textContent = `From ${userSendingEndorsement}`
    createPReceiverEl.textContent =`To ${userReceivingEndorsement}`

    const receiverSection = addDiv(createPReceiverEl, addLikeElAndUpdateCount(messageLikeCount, currentID))    

    createLi.append(createPSenderEl, itemValue, receiverSection)

    createLi.addEventListener("dblclick", function(){
        let exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)
        remove(exactLocationOfItemInDB)
    })
    endorsementListEl.append(createLi)
}

// function that takes addlikeEl and createPReceiverEl and appends them to a div with a class on it
function addDiv(Receiver, likeEl) {
    const newDiv = document.createElement("div")
    newDiv.classList = "flex-style"
    newDiv.append(Receiver, likeEl)
    return newDiv
}



// Task 18/1/ - 19/1/2024 Combine addLikeEl with addLike Count, add single like count per user, Update new like count per message liked 
//                        Add number of likes when clicked - done 
//                        Add only one like count per user - involves storing isClicked variable in localStorage - in progress
//                        Update the number of likes to Firebase - done 
// reference - https://stackoverflow.com/questions/40589397/firebase-db-how-to-update-particular-value-of-child-in-firebase-database
//           - https://stackoverflow.com/questions/2788191/how-to-check-whether-a-button-is-clicked-by-using-javascript
//           - https://stackoverflow.com/questions/14107817/using-javascript-to-dynamically-create-dom-elements-with-incrementing-ids



// Increment ID number for every new element that's made 
// let idCounter = 0
function addLikeElAndUpdateCount(likeCount, currentID) {
    console.log(`Current count - ${likeCount}`)
    const newPEl = document.createElement("p")
    newPEl.classList = "add-like-style"
    // idCounter = idCounter + 1 
    // newPEl.setAttribute("id", "likeCounter-" + idCounter) // Add increment count here seems to have brought an unexpected result. 
    newPEl.textContent = `❤ ${ likeCount}`  
    
    let counter = likeCount;    

    newPEl.addEventListener("click", function(){
        checkIfLikeIsClicked(this.id, counter, newPEl, currentID) 
        console.log(`this was clicked - ${this.id}`)   
        
    })
    // console.log(localStorage.getItem("isClicked"))
    console.log(` - ${isClicked}`)
    // newPEl.textContent = `❤ ${counter}`
    // console.log(`Id count - ${idCounter}`)
    return newPEl
}

let isClicked = false
function checkIfLikeIsClicked (messageID, currentMessageLikeCount, paraEl, dbItemID) {
    // Stores the item(s) associated with the ID in the DB
    let exactLocationOfItemInDB = ref(database, `endorsements/${dbItemID}`)

    console.log(messageID)
    
    if (!isClicked) {        
        isClicked = true
        currentMessageLikeCount += 1 
        paraEl.textContent = `❤ ${ currentMessageLikeCount}`            
        update(exactLocationOfItemInDB, {likes: currentMessageLikeCount})
        console.log(`Adding ... ${currentMessageLikeCount}`)
    } else {
        console.log(`Count added already - ${currentMessageLikeCount}`) 
    }

}

// Current problem I'm facing 
// Incrementing ID by 1 for each element created 
// Issue - A) How to allow only one click for each message on display ? 
//         B) When generating an ID for the like icon p element for each message, refreshing the page causes the id number to double, why?
//         C) 
// What works so far: 
//          A) User can like and cannot like the same message, but it causes other messages to not be liked as well. Even if 
//              user hasn't liked them before. 
//          Should I try storing boolean values for each message in local storage? 