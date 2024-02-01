'use strict';
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
        // console.log(itemArr)
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
            // addLikeCount(addLikeEl(), likeNum,currentItemID ) 
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
// Create a global boolean variable 
// Set boolean value in local storage 


// function setBoolean () {
//     let getBooleanValFromLocal = JSON.parse(localStorage.getItem("isClicked"))
//     return getBooleanValFromLocal
// }

// isClicked = setBoolean()

// localStorage.setItem("isClicked", "false")
// Create a global boolean variable with the value from local storage 
// let isClicked = JSON.parse(localStorage.getItem("isClicked"))
// console.log(isClicked)
// Storing boolean value in local storage

// localStorage.setItem("isClicked", isClicked)
// let x = localStorage.getItem("isClicked")
// console.log(typeof(JSON.parse(x)))
// console.log(JSON.stringify)

// localStorage.setItem("isClicked", isClicked)
let convertToBoolean = localStorage.getItem("isClicked")

// Increment ID number for every new element that's made 
let idCounter = 0
function addLikeElAndUpdateCount(likeCount, currentID) {
    console.log(`Current count - ${likeCount}`)
    const newPEl = document.createElement("p")
    newPEl.classList = "add-like-style"
    newPEl.setAttribute("id", "likeCounter-" + idCounter++) // Add increment count here seems to have brought an unexpected result. 
    newPEl.textContent = `❤ ${ likeCount}`
    // console.log(`Like count - ${likeCount}`)

    // Generate local storage for endorsement message
    localStorage.setItem(newPEl.id, false)

    
    

    // Stores the item(s) associated with the ID in the DB
    let exactLocationOfItemInDB = ref(database, `endorsements/${currentID}`)

    // Storing number of likes from the Id in the DB
    let counter = likeCount;

    newPEl.addEventListener("click", function(){
        let isMessageClicked = JSON.parse(localStorage.getItem(this.id))
        // console.log(`isMessageClicked ${typeof(isMessageClicked)}`)
        // let isClicked = false
        console.log(currentID)
        let currentElementID = this.id
        console.log(currentElementID)
        // localStorage.setItem(currentElementID, isClicked)
        // addLikeCount(newPEl) 
        if (document.getElementById(currentElementID) && isMessageClicked === false) {
            console.log(`Hey ${currentElementID}`)
            // isClicked = true
            // console.log("Already clicked")
            // isClicked = true
            // New Task 29/1/2024 - In the if statement check if key of the local storage item is true or 'clicked'
            localStorage.setItem(currentElementID, true)
            counter += 1 
            newPEl.textContent = `❤ ${ counter}`            
            update(exactLocationOfItemInDB, {likes: counter})
            console.log(`Adding ... ${counter}`)
                       
    
        } else {
            console.log(`Count added already - ${counter}`) 
        }
        
    })
    // console.log(localStorage.getItem("isClicked"))
    // console.log(` - ${isClicked}`)
    // newPEl.textContent = `❤ ${counter}`
    console.log(`Id count - ${idCounter}`)
    return newPEl
    
}
// localStorage.setItem("check", false)
// console.log(localStorage.getItem("check"))
// console.log(`Id count pt 2 - ${idCount}`)

// function addLikeEl() {
//     const newPEl = document.createElement("p")
//     newPEl.classList = "add-like-style"
//     newPEl.textContent = `❤`;

//     newPEl.addEventListener("click", function(){
//         console.log("clicked")
//     })
//     return newPEl
// }
// Adds like and store the amount of likes for that endorsement in the database ?
// Next task 16/1/2024 - storing likes for each endorsement in the db and display the current likes for each endorsement msg section
// function addLikeCount(likeEl,likeCount, currentID) {
//     let countfromDB = likeCount
//     let itemID = currentID
//     let counter = 0
//     if (counter >= 1 ) {
//         console.log(`Count added already - ${counter}`)

//     } else {
//         counter ++
//         likeEl.textContent = `❤ ${counter}`
//         console.log(`Counter ${counter}`)
//         console.log(`count from db ${countfromDB}`)
//         console.log(`ID - ${itemID}`)
//         let exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)
//         console.log(exactLocationOfItemInDB)

//     }
//     // console.log(`current count ${counter} count from db ${likeCount} current ID${currentID}`)
    
// }

// Current problem I'm facing 
// Incrementing ID by 1 for each element created 
// Issue - the id number does not stay consistent, refreshing the page causing the number to increase still 
// Currently all of the new generated element have the same ID
// Current thoughts on how to solve it - A) Rest idCounter to 0 
//                                       B) Use A with an if statement to check if a new endorsement is made 
// 