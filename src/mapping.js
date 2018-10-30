//Here we get all the keys from the controller
var buttons = document.getElementsByClassName("button");

var oscillators = {
    
}

var setup = true;
var play = false;

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("mousedown", function() {
        if (setup) {
            oscillators["button" + i] = updateKey()
        }
    })
}



function updateKey() {
    
}



