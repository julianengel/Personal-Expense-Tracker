function submitData() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        	document.getElementById("input-text").value = ''
            const reply = document.getElementById("result-text");
            const response = JSON.parse(this.responseText)
            reply.innerHTML = response[0];
            console.log(response)
            switch (response[1]) {
                case "success":
                    // code block
                    reply.style.color = "green"

                    break;
                case "error":
                    // code block
                    reply.style.color = "red"

                    break;
                default:
                    reply.style.color = "black"
            }
            reply.style.visibility = "visible"
        }
    };
    const input = document.getElementById("input-text").value
    xhttp.open("POST", "submit", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("text=" + input);


}


// Get the input field
var input = document.getElementById("input-text");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {


    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("submit-button").click();
    }
});


function sendReturn(item) {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log("Successful")
        }
    };
    xhttp.open("POST", "returned", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("id=" + item);


}
