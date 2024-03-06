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
    const inputValue = textAreaEL.value
    const receiver = endorsementReceiverEl.value
    const sender = endorsementSenderEl.value
    const userNamesWithMessage = endorsementDictionary(sender, receiver, inputValue)
    // console.log(userNameWithMessage)
    // console.log(endorsementDictionary(sender, receiver))

    push(endorsementsinDB, userNamesWithMessage)
    clearInputField(textAreaEL)
    addNewEndorsementToLocalStorage(endorsementsinDB)
    // appendItemToListEl(inputValue)
})

onValue(endorsementsinDB, function(snapshot) {
    if (snapshot.exists())
    {
        const itemArr = Object.entries(snapshot.val())
        // Create a separate copy of the item array since .reverse is destructive, as it changes the original arr
        //Reverse order of items in itemArr
        const reverseItemArr = itemArr.reverse()
        // check if local storage exists 
        if(localStorage.hasOwnProperty("itms")) { // find alternative to .hasOwnPropery to check if local storage exists w/ itms as key
            // alert("Said storage exists")
            console.log(`localstorage exists`)
        } else {
            alert("Said storage doesn't exist creating one...")
            storeItemsInLocal(reverseItemArr)
        }
        
        clearEndorsementListEl()
       // console.log(itemArr)
        for (let i = 0; i< reverseItemArr.length; i++) {
            let currentItem= reverseItemArr[i];
            // console.log(currentItem[1])
            
            let currentItemID = reverseItemArr[i][0];
            
            // Extract from dictionary instead of converting them to array. 
            let currentObjectItems = reverseItemArr[i][1]
            
            let currentMessage = currentObjectItems.Message
            
            let fromUser = currentObjectItems.From
            
            let toUser = currentObjectItems.To

            let likeCountNum = currentObjectItems.likes
            
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
    const itemID = currentID   
    const itemValue = message
    const userSendingEndorsement = from
    const userReceivingEndorsement = to
    const messageLikeCount = likeCount
    

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
        const exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)
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
    // console.log(`Current count - ${likeCount}`)
    const counter = likeCount; 
    const newPEl = document.createElement("p")
    newPEl.classList = "add-like-style"
    // idCounter = idCounter + 1 
    // newPEl.setAttribute("id", "likeCounter-" + idCounter) // Add increment count here seems to have brought an unexpected result. 
    newPEl.textContent = `❤ ${likeCount}`  
       

    newPEl.addEventListener("click", function(){
        console.log(`${currentID}`)
        
        // addLikeCountAndUpdateToDB(this.id, counter, newPEl, currentID) 
        checkIfMessageIsLiked(counter, newPEl, currentID)
        // console.log(`this was clicked - ${this.id}`)   
        
    })
    return newPEl
}

// localstorage function 
function storeItemsInLocal(reverseItemArr){
    // loop through the array of item
    for (let i = 0; i < reverseItemArr.length; i++) {
        //    add a flag on each item to remember that it got liked or not by this user
        reverseItemArr[i][1].isLiked = false
    }
    // store it in local storage
    localStorage.setItem('itms', JSON.stringify(reverseItemArr))
}

// let isClicked = false
// function that adds the like count and updates it to the DB
function addLikeCountAndUpdateToDB (currentMessageLikeCount, paraEl, dbItemID) {
    // Stores the item(s) associated with the ID in the DB
    const exactLocationOfItemInDB = ref(database, `endorsements/${dbItemID}`)

    // console.log(messageID)
    currentMessageLikeCount += 1 
    paraEl.textContent = `❤ ${ currentMessageLikeCount}`            
    update(exactLocationOfItemInDB, {likes: currentMessageLikeCount})
    console.log(`Adding ... ${currentMessageLikeCount}`)

}
// Gets the item from local storage, compares IDs b/w local storage and DB
// for loop through the ids in local storage
//  if id in local storage and dbID match
//      check isLiked, if true 
//             don't call call addLikeCountAndUpdateToD
//      else 
//          call addLikeCountAndUpdateToD, set .isLiked to true, to prevent user for liking again 
//  else do nothing 
function checkIfMessageIsLiked (currentMsgLikeCount, pEl, dbItemID) {
    console.log("Clicked")
    //get item from localStorage 
    const currentLocalItems = JSON.parse(localStorage.getItem("itms"))
    // console.log(`Item-ID ${typeof(dbItemID)}`)
    console.log(`Clicked - here's local storage ${JSON.stringify(currentLocalItems)}`)
    // console.log(currentLocalItems.length)
    console.log(dbItemID)
    
    for (let i=0; i<currentLocalItems.length; i++) {
        const localItemID = currentLocalItems[i][0]
        console.log(localItemID)
        const currentObject = currentLocalItems[i][1]
        console.log(localItemID)
        if(localItemID === dbItemID) {
            console.log(`${localItemID} --- ${dbItemID}`)
            
            if(currentObject.isLiked) {
                console.log(`TRUE - ${(currentObject.isLiked)}`)
                console.log("You've already liked the message") // Change it to alert ?
            } else {
                console.log(`FALSE - ${(currentObject.isLiked)}`)
                addLikeCountAndUpdateToDB(currentMsgLikeCount, pEl, dbItemID) 
                currentObject["isLiked"] = true
            }
        } else {
            console.log("nope")
            console.log(`${localItemID} --- ${dbItemID}`)
        }
    localStorage.setItem("itms", JSON.stringify(currentLocalItems))
    }
}

// create function 
// When a new endorsement is made:
// Get the ID and Object from the DB for the newly generated endorsement 
// Get and parse the values stored in local storage 
// add the new ID and object to the parsed values
// set it back to local storage 
// Create a function that adds newly published endorsement meesage to local storage 
function addNewEndorsementToLocalStorage(endorsementsinDB) {
    // Get and parse the values stored in local storage 
    const currentLocalItems = JSON.parse(localStorage.getItem("itms"))

    // Get the ID and Object from the DB for the newly generated endorsement 
    onValue(endorsementsinDB, function(snapshot) {
        const objectItems = snapshot.val()
        const objectEntries = Object.entries(objectItems)
        const itemKeys = Object.keys(objectItems)
        const latestEndorsement = itemKeys[itemKeys.length - 1 ]
        objectItems[latestEndorsement].isLiked = false


        console.log(objectEntries[objectEntries.length - 1])
        const lastestItmArr = objectEntries[objectEntries.length - 1]

        // add the new ID and object to the parsed values
        currentLocalItems.push(lastestItmArr)
        console.log(`second local check ${JSON.stringify(currentLocalItems)}`)
        // // set it back to local storage
        localStorage.setItem("itms", JSON.stringify(currentLocalItems))

    })
}



// New issue - 
// When a new message is made, get the data from the DB and add it to the current local storage? 
