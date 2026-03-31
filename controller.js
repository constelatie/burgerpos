//looked up documentation for this because i couldnt get handlebars to accept issuchandsuch, link here: https://handlebarsjs.com/guide/builtin-helpers.html

Handlebars.registerHelper('isdefined', function (value) {
  return value !== undefined;
});

// steps up the model ( static api ) for the html to pull from 
const model = {
    menu: null,
    username: "", //will hold customer name
    order: {}, //will hold the current order selections as key value pairs
    selectedBurger: "", //will hold the type of burger selected to determine which steps to show, either classic or cheeseburger
    stepIndex: 0,
    activeSteps: [] //based on the burger selected, shows necessary steps 
}
//render view function that takes in the id of the template and shows it
function render_view(view_id, data) {
    var source = document.querySelector("#"+view_id).innerHTML; 
    var template = Handlebars.compile(source); 
    var html = template(data); 
    document.querySelector("#view_widget").innerHTML = html; 
}

function checkOrder() {
    //basically go through every step to see if the user put in something
    return model.activeSteps.every(step => {
      const choice = model.order[step.key];
      //checks if the choice of is not null for multiple choice or undefined for checkbox
      return choice !== undefined && choice !== null;
    });
  }

//function to start the app 
function startApp() {
  //fetch json file for the info
    fetch("./burgers.json")
      //if there is a response, create the json
        .then((response) => response.json()) 
      //assign json data, then start
        .then((data) => {
            model.burgerChoices = data.burgerChoices;
            render_view("starttemplate", {}); 
        })
        .catch((err) => {
            console.error("Failed to load burger data:", err);
        });
}
    document.addEventListener("submit", function(e) {
        //when the customer inputs their name and hits the button, moves to the menu screen
        if(e.target.id === "name") {
            e.preventDefault();
            let customerName = document.getElementById("customername").value;
            model.username = customerName;
            render_view("menutemplate", {customerName: model.username});
        }
        //for every step of the customization process
        if(e.target.id === "stepform") {
            e.preventDefault();
            //step becomes the index of activesteps, and the json data that was fed into it based on the selected burger 
            let step = model.activeSteps[model.stepIndex];
            //value of selection blank to start
            let value = "";
            //since multiple choices can be made, it selects all checked options, then foreach input, it gets pushed to the selected array. .join(", ") concatenates the array into a string with commas and spaces in between for readability.
            if(step.type === "checkbox") {
                let selected = [];
                let inputs = document.querySelectorAll("input[name='option']:checked");
                inputs.forEach(function(input) {
                    selected.push(input.value);
                });
                value = selected.join(", ");
            }
            //only one answer can be selected, and that value gets pushed to the order object in the model with the key of the step, then moves to the next step
            //if nothing is selected and the user tries to move forward, an alert pops up asking them to select an option to proceed.
            else if(step.type === "multiple choice") {
                let inputs = document.querySelector("input[name='option']:checked");
                if(inputs.length === 0) {
                    alert("Please select an option to proceed.");
                    return;
                }
                value = inputs.value;
            }
            //takes whatever text is put in the text input and pushes that to the order object in the model with the key of the step, then moves to the next step
            else if(step.type === "text") {
                let textInput = document.getElementById("textInput").value;
                value = textInput;
            }
            //takes whatever image was picked and pushes that to the order object in the model with the key of the step, then moves to the next step
            else if(step.type === "image-selection") {
                let imageInput = document.querySelector("input[name='option']:checked").value;
                value = imageInput;
            }
            //index is incremented to move to the next step, and if there are no more steps, moves to the summary page with the order details
            model.order[step.key] = value; //changes the value of the step to whatever was picked, like changing "bun" from blank to "sesame"
            model.stepIndex++;
            if(model.stepIndex < model.activeSteps.length) {
            showStep();
            }
            else {
              //checks if all steps are completed, then shows the user if all done
                const done = checkOrder();
                render_view("summary", {username: model.username, order: model.order, allFilled: done});
            }
            
        }
    });
    document.addEventListener("click", function(e) {
        //when the ready button is clicked, the order form is shown
        if(e.target.id === "ready") {
            e.preventDefault();
            render_view("orderform", {customerName: model.username});
        }
      //happens at the end when the user confirms their order and the view resets to the start page
        if(e.target.id === "confirm") {
          e.preventDefault();
          alert("Your order has been placed, " + model.username + "! Thank you for choosing Christiana's!");
          render_view("starttemplate", {});
      }
      //if the user missed some steps and wants to go back, resets the step index and uses showstep() to go back to the start of the step view
      if(e.target.id === "go-back") {
        e.preventDefault();
        alert("You missed some steps, " + model.username + "! Let's go back and fix that.")
        model.stepIndex = 0;
        model.order = {};
        showStep();
      }
        //when the user picks their burger, activeSteps is assigned the json data for the steps of that burger, and the first step is shown
        if(e.target.id === "placeorder") {
            model.selectedBurger = document.getElementById("burger").value;
        if (model.selectedBurger === "classic") {
                model.activeSteps = model.burgerChoices.classic;
            } else {
                model.activeSteps = model.burgerChoices.cheeseburger;
            }
            //activesteps index set to the start, order is reset to blank if ordered before, and the first step is shown
            model.stepIndex = 0;
            model.order = {};
            e.preventDefault();
            showStep();
    }
    })
    //eventlistener put in specifically to check how many sauces are inputted
    document.addEventListener("input", function(e) {
        if (e.target.id === "textInput") {
            let step = model.activeSteps[model.stepIndex];
            //input is a string, so change it to an integer to compare it to the condition in the feedback
            if (step && step.id === "saucecount") {
                let amount = parseInt(e.target.value);
                //access the next button
                let nextButton = document.querySelector("#next");
                //if more than four sauces, disable the next button until less than four are put in
                if (amount > 4) {
                    nextButton.disabled = true;
                    let lowerAmountMsg = step.feedback.message.replace("{{option}}", e.target.value);
                    alert(lowerAmountMsg); 
                    //let the user proceed
                } else {
                    nextButton.disabled = false;
                }
            }
        }
    });



function showStep() {
    //step is set to whatever part of the json we're on
            let step = model.activeSteps[model.stepIndex];
            let previousStep = model.activeSteps[model.stepIndex - 1];
            let feedbackMessage = "";
  //if the feedback is just a string, just give the feedback. this is here to check for when we need to check if more than 4 sauces were inputted
            if (previousStep && typeof previousStep.feedback === "string") {
              let lastChoice = model.order[previousStep.key];
              feedbackMessage = previousStep.feedback.replace("{{option}}", lastChoice);
    }

        
//the order in which the customization steps are shown, and the data for those steps, is based on the json in the model, which is based on the burger selected
            render_view("steptemplate", {
            username: model.username,
            selectedBurger: model.selectedBurger,
            title: step.title,
            options: step.options,
            isText: step.type === "text",
            isCheckbox: step.type === "checkbox",
            isMultipleChoice: step.type === "multiple choice",
            isImageSelection: step.type === "image-selection",
            imageOptions: step.imageOptions,
            currentOrder: model.order,
            feedback: feedbackMessage
    })
}


    



    

startApp();


