'use strict';

const textAreaEL = document.querySelector("#textarea-el")
const publishBtnEl = document.querySelector("#btn-el")

function test() {
   console.log("clicked")
}

publishBtnEl.addEventListener("click", function(){
    test()
    console.log(textAreaEL.value)
    clearInputField(textAreaEL)
})

function clearInputField(input) {
    input.value =""
}