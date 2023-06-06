var liftsState = [];
var button = document.querySelector(".simulate");
var floorsInput = document.querySelector("#floors");
var liftsInput = document.querySelector("#lifts");

button.addEventListener("click", function showSimulation() {
    var floors = floorsInput.value;
    var lifts = liftsInput.value;
    if (!validatePositiveInteger(floors, lifts)) return;
    createState(lifts);
    createSimulation(floors, lifts);
});

function createState(lifts) {
    liftsState = [];
    for (let i = 0; i < lifts; i++) {
        liftsState.push({ idle: true, currentFloor: 0 });
    }
}

function moveLift(index, floor) {
    var lifts = document.querySelectorAll(".elevator");
    var currLift = lifts[index];
    var bottom = floor * 100;
    var currentBottom = parseValue(currLift.style.bottom);
    var diff = bottom - currentBottom;
    var time = diff ? Math.abs(diff) * 20 : 0;
    var direction = true; // true means up direction
    if (currentBottom == bottom) {
        // only open the doors here
        doorAnimation(index, currLift)
    } else if (currentBottom > bottom) {
        direction = false;
    }

    function move() {
        var elapsedTime = Date.now() - startTime;
        var newBottom = currentBottom + (diff / time) * elapsedTime;
        currLift.style.bottom = newBottom + "px";
        if (direction ? newBottom >= bottom : newBottom <= bottom) {
            currLift.style.bottom = bottom + "px";
            doorAnimation(index, currLift);
            return;
        }
        requestAnimationFrame(move);
    }

    var startTime = Date.now();
    requestAnimationFrame(move);
}

function doorAnimation(index, currLift) {
    var leftDoor = currLift.querySelector(".left");
    var rightDoor = currLift.querySelector(".right");

    openLift(leftDoor, rightDoor, index);
}

function closeLift(leftDoor, rightDoor, index) {
    const duration = 1000;
    const targetWidth = 50;
    const start = performance.now();

    function animateWidth(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const width = progress * targetWidth;

        leftDoor.style.width = `${width}px`;
        rightDoor.style.width = `${width}px`;

        if (progress < 1) {
            requestAnimationFrame(animateWidth);
        } else {
            liftsState[index].idle = true;
        }
    }
    requestAnimationFrame(animateWidth);
}

function openLift(leftDoor, rightDoor, index) {
    var startWidth = 50;
    var duration = 1000;
    var startTimestamp = null;

    function frame(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        var elapsed = timestamp - startTimestamp;
        var progress = Math.max(0, Math.min(elapsed / duration, 1));
        var width = startWidth * (1 - progress);

        leftDoor.style.width = width + "px";
        rightDoor.style.width = width + "px";

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            closeLift(leftDoor, rightDoor, index);
        }
    }
    requestAnimationFrame(frame);
}

function handleLiftBtnClick(index, up) {
    var y = getIdleLift(index);
    if (y == -1) {
        let intervalId = setInterval(function checkLiftAvailable() {
            var re = getIdleLift(index);
            if (re !== -1) {
                moveLift(re, index);
                clearInterval(intervalId);
            }
        });
    } else {
        moveLift(y, index);
    }
}

function getIdleLift(destination) {
    var minDis = Infinity;
    var res = -1;

    for (let i = 0; i < liftsState.length; i++) {
        if (liftsState[i].idle) {
            let currDiff = Math.abs(destination - liftsState[i].currentFloor);
            if (currDiff < minDis) {
                minDis = currDiff;
                res = i;
            }
        }
    }
    if (res !== -1) {
        liftsState[res].idle = false;
        liftsState[res].currentFloor = destination;
    }
    return res;
}

function parseValue(position) {
    if (position == "") return 0;
    return parseInt(position.substring(0, position.length - 2));
}

function createSimulation(f, l) {
    var fragment = document.createDocumentFragment();
    for (let i = 0; i < f; i++) {
        let fl = createFloor(f - i - 1);
        if (i == f - 1) {
            let lifts = createLift(l);
            fl.append(lifts);
        }
        fragment.append(fl);
    }

    var container = document.querySelector(".container");
    container.textContent = null;
    container.append(fragment);
}

function createFloor(index) {
    var fl = document.createElement("div");
    fl.classList.add("single-floor");

    var btnContainer = document.createElement("div");
    btnContainer.classList.add("box", "btn-box");
    var upBtn = createBtn("UP");
    var downBtn = createBtn("DOWN");
    upBtn.classList.add("btn", "lift-btn");
    upBtn.addEventListener("click", function () {
        handleLiftBtnClick(index, true);
    });
    downBtn.addEventListener("click", function () {
        handleLiftBtnClick(index, false);
    });
    downBtn.classList.add("btn", "lift-btn");

    btnContainer.append(upBtn, downBtn);
    fl.append(btnContainer);
    return fl;
}

function createBtn(text) {
    var btn = document.createElement("button");
    btn.textContent = text;
    return btn;
}

function createLift(n) {
    var fg = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
        fg.append(lift());
    }
    return fg;
}

function lift() {
    var liftContainer = document.createElement("div");
    var elevator = document.createElement("div");
    liftContainer.classList.add("box");
    elevator.classList.add("elevator");
    var leftDoor = document.createElement("div");
    var rightDoor = document.createElement("div");
    leftDoor.classList.add("door", "left");
    rightDoor.classList.add("door", "right");
    elevator.id = "elevator";
    elevator.append(leftDoor, rightDoor);
    liftContainer.append(elevator);
    return liftContainer;
}

function validatePositiveInteger(f, l) {
    var positiveIntegerRegex = /^[1-9]\d*$/;
    document.querySelector(".errorMsg").textContent = null
    console.log(parseInt(f))
    
    if (!positiveIntegerRegex.test(f) || !positiveIntegerRegex.test(l)) {
        document.querySelector(".errorMsg").textContent = "*Values must be positive integers";
        return false;
    } 

    var lifts = parseInt(l);
    var floors = parseInt(f);
    if(floors < 2) {
        document.querySelector(".errorMsg").textContent = "*Floors should be greater than 2";
        return false;
    }

    if(lifts >= floors) {
        document.querySelector(".errorMsg").textContent = "*Please keep the number of lifts less than number of floors";
        return false;
    }

    return true;
}
