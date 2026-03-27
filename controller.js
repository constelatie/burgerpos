const model = {
    menu: null,
    username: "",
    selectedBurger: "classic",
    stepindex: 0,
    steps: [
            {
                id: "bun",
                title: "Choose your bun",
                options: ["sesame", "whole wheat", "gluten free"],
                type: "multiple choice",
                feedback: "Great choice! The {{option}} bun is a delicious addition to your burger."
            },
            {
                id: "protein",
                title: "Choose your protein",
                options: ["beef", "chicken", "veggie"],
                type: "multiple choice",
                feedback: "Excellent! The {{option}} patty is a tasty choice for your burger."
            },
            {
                id: "toppings",
                title: "Choose your toppings",
                options: ["lettuce", "tomato", "onion", "pickles", "cheese"],
                type: "multiple choice",
                feedback: "Yum! Adding {{option}} will give your burger an extra burst of flavor."
            },
            {
                id: "sauces",
                title: "Choose your sauces",
                options: ["ketchup", "mustard", "mayo", "bbq sauce"],
                type: "text",
                feedback: {
                    condition: "amount > 4",
                    message: "Wow, that's too much! The {{option}} will overpower your meal. Consider using less for a more balanced flavor."
                }
            },
            {
                id: "extras",
                title: "Choose your extras",
                options: ["bacon", "double patty", "fried egg"],
                type: "multiple choice",
                feedback: "Delicious! Adding {{option}} will take your burger to the next level."
            },
            {
                id: "presentation",
                title: "Choose your presentation",
                imageOptions: [
                    { "url": "https://blog-content.omahasteaks.com/wp-content/uploads/2022/06/blogwp_classic-american-burger-scaled-1.jpg", "label": "Classic Presentation" },
                    { "url": "https://somuchfoodblog.com/classic-grilled-cheeseburgers/", "label": "Gourmet Presentation" },
                    { "url": "https://png.pngtree.com/thumb_back/fw800/background/20250712/pngtree-classic-beef-burger-with-fresh-lettuce-tomato-onion-and-sesame-seed-image_17580392.webp", "label": "50s Checkered Presentation" }
                ],
                type: "image-selection",
                feedback: "Great choice! Serving your burger {{option}} will make it look as good as it tastes."
            }
            

    ]
}

function render_view(view_id, data) {
    var source = document.querySelector("#"+view_id).innerHTML; 
    var template = Handlebars.compile(source); 
    var html = template(data); 
    document.querySelector("#view_widget").innerHTML = html; 
}

function startApp() {
    render_view("starttemplate", {});
    document.addEventListener("submit", function(e) {
        if(e.target.id === "name") {
            e.preventDefault();
            let customerName = document.getElementById("customername").value;
            model.username = customerName;
            render_view("menu", {customerName: model.username});
        }
        if(e.target.id === "stepform") {
            e.preventDefault();
            let step = model.steps[model.stepindex]
            let value = [];
            let inputs = document.querySelectorAll("input[name='option']:checked");
            inputs.forEach(element => {
                value.push(element.value);
            });
            model.stepIndex++;
            if(model.stepIndex < model.steps.length) {
            showStep();
            }
            else {
                render_view("summary", {username: model.username, selectedBurger: model.selectedBurger});
            }
            
        }
    });
}


function readytoOrder() {
    document.addEventListener("click", function(e) {
        if(e.target.id === "ready") {
            e.preventDefault();
            render_view("orderform", {});
            showStep();
    }
})
}

function showStep() {
            //model.stepindex++;
            let step = model.steps[model.stepindex];
            render_view("stepform", {title: step.title, options: step.options});
        }

    
function showConfirmation() {
    if(e.target.id === "confirm") {
        e.preventDefault();
        alert("Your order has been placed, " + model.username + "! Thank you for choosing Christiana's!");
    }
}
startApp();
readytoOrder();