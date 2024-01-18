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
        console.log(itemArr)
        // Create a separate copy of the item array since .reverse is destructive, as it changes the original arr
        //Reverse order of items in itemArr
        const reverseItemArr = itemArr.reverse()
        
        clearEndorsementListEl()
        // console.log(itemArr)
        for (let i = 0; i< reverseItemArr.length; i++) {
            let currentItem= reverseItemArr[i];
            
            let currentItemID = reverseItemArr[i][0];
            
            let dictToArr = Object.entries( reverseItemArr[i][1])
            console.log(dictToArr)
            let currentMessage = dictToArr[1][1];
            
            let fromUser = dictToArr[0][1];
            
            let toUser = dictToArr[2][1];

            let likeNum = dictToArr[3][1]
            addLikeCount(addLikeEl(), likeNum,currentItemID ) 
            
            appendItemToListEl(currentItemID, currentMessage, fromUser,toUser) 
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
function appendItemToListEl(currentID, message, from, to) {
    let itemID = currentID   
    let itemValue = message
    let userSendingEndorsement = from
    let userReceivingEndorsement = to
    

    const createLi = document.createElement("li")
    const createPSenderEl = document.createElement("p")
    createPSenderEl.classList="margin-btm"
    const createPReceiverEl = document.createElement("p")
    createPReceiverEl.classList="margin-top"

    createPSenderEl.textContent = `From ${userSendingEndorsement}`
    createPReceiverEl.textContent =`To ${userReceivingEndorsement}`

    const receiverSection = addDiv(createPReceiverEl, addLikeEl())    

    createLi.append(createPSenderEl, itemValue, receiverSection)

    createLi.addEventListener("dblclick", function(){
        let exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)
        remove(exactLocationOfItemInDB)
    })
    endorsementListEl.append(createLi)
}

// function that takes addlikeEl and createPReceiverEl and appends them to a div with a class on it
function addDiv(Receiver, likeCount) {
    const newDiv = document.createElement("div")
    newDiv.classList = "flex-style"
    newDiv.append(Receiver, likeCount)
    return newDiv
}


function addLikeEl() {
    const newPEl = document.createElement("p")
    newPEl.classList = "add-like-style"
    newPEl.textContent = `❤`;

    newPEl.addEventListener("click", function(){
        console.log("clicked")
        addLikeCount(newPEl)

    })
    return newPEl
}
// Adds like and store the amount of likes for that endorsement in the database ?
// Next task 16/1/2024 - storing likes for each endorsement in the db and display the current likes for each endorsement msg section
function addLikeCount(likeEl,likeCount, currentID) {
    let countfromDB = likeCount
    let itemID = currentID
    let counter = 0
    if (counter >= 1 ) {
        console.log(`Count added already - ${counter}`)

    } else {
        counter ++
        likeEl.textContent = `❤ ${counter}`
        console.log(`Counter ${counter}`)
        console.log(`count from db ${likeCount}`)
        console.log(`ID - ${currentID}`)

    }
    // console.log(`current count ${counter} count from db ${likeCount} current ID${currentID}`)
}
