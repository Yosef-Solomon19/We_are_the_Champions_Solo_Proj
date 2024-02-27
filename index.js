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
        // addLikeCountAndUpdateToDB(this.id, counter, newPEl, currentID) 
        checkIfMessageIsLiked(counter, newPEl, currentID)
        // console.log(`this was clicked - ${this.id}`)   
        
    })
    // console.log(localStorage.getItem("isClicked"))
    // console.log(` - ${isClicked}`)
    // newPEl.textContent = `❤ ${counter}`
    // console.log(`Id count - ${idCounter}`)
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
    let exactLocationOfItemInDB = ref(database, `endorsements/${dbItemID}`)

    // //get item from localStorage 
    // let x = JSON.parse(localStorage.getItem("itms"))
    // // console.log(`Item-ID ${typeof(dbItemID)}`)
    // console.log(`Clicked - here's local storage ${x}`)
    // console.log(x.length)
    // console.log(dbItemID)
    // for (let i=0; i<x.length; i++) {
    //     console.log(`${x[i][0]}`)
    // }
    // // Get ID of the clicked message & compare it to the ID in the localStorage and retreive isliked value

    // console.log(x[0])

    // console.log(messageID)
    currentMessageLikeCount += 1 
    paraEl.textContent = `❤ ${ currentMessageLikeCount}`            
    update(exactLocationOfItemInDB, {likes: currentMessageLikeCount})
    console.log(`Adding ... ${currentMessageLikeCount}`)
    
    // if (!isClicked) {        
    //     // isClicked = true
    //     currentMessageLikeCount += 1 
    //     paraEl.textContent = `❤ ${ currentMessageLikeCount}`            
    //     update(exactLocationOfItemInDB, {likes: currentMessageLikeCount})
    //     console.log(`Adding ... ${currentMessageLikeCount}`)
    // } else {
    //     console.log(`Count added already - ${currentMessageLikeCount}`) 
    // }

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
    console.log(`Clicked - here's local storage ${currentLocalItems}`)
    // console.log(currentLocalItems.length)
    console.log(dbItemID)
    
    for (let i=0; i<currentLocalItems.length; i++) {
        const localItemID = currentLocalItems[i][0]
        const currentObject = currentLocalItems[i][1]
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
        }
    localStorage.setItem("itms", JSON.stringify(currentLocalItems))
    }
}

