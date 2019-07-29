//written by daniel reynolds github:d4wgo
var canvas = document.getElementById("playCanvas");
var ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerHeight * 1.333333;
var scale = canvas.height / 300;
var colorSwitcher = -1;
var colors = ["green", "blue", "red", "yellow", "white", "grey", "magenta", "purple", "cyan", "orange"];

function getNewColor() {
    colorSwitcher++;
    if (colorSwitcher >= colors.length) {
        colorSwitcher = 0;
    }
    return colors[colorSwitcher];
}

class Vector2 {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
    }
}

class Rect {
    constructor(pos, vel, size) {
        this.position = pos;
        this.velocity = vel;
        this.size = size;
    }
}

class Node {
    constructor() {
        this.value = 0;
    }
    addToValue(additive) {
        this.value += additive;
    }
    get calculatedValue() {
        return Math.tanh(this.value);
    }
}
var displayAll = true;
var changeyness = 0.5; //how likely a child network is to mutate
class Network {
    constructor(middleDepth, parentNetwork) { //its only 1 hidden layer so middle is how many middle is
        this.depth = middleDepth;
        this.weights = [];
        this.nodes = [];
        this.nodes.push(new Node());
        this.weights.push(-1.000010101); //index cant be 0 so i pushed a float in
        for (var i = 0; i < this.depth; i++) {
            this.nodes.push(new Node());
        }
        if (parentNetwork == null) {
            for (var i = 0; i < (this.depth * 5) + this.depth; i++) {
                this.weights.push((Math.random() * 2) - 1);
            }
        }
        else {
            for (var i = 0; i < (this.depth * 5) + this.depth; i++) {
                var rnd = Math.random();
                if (rnd < 0.9) {
                    this.weights.push(parentNetwork[0].network.weights[i + 1]);
                }
                else {
                    this.weights.push(parentNetwork[Math.floor(Math.random() * parentNetwork.length)].network.weights[i + 1]);
                }
                if (rnd < 0.02) {
                    console.log("mutate");
                    if (Math.random < 0.5) {
                        this.weights[i + 1] *= (Math.random() * 4) - 1;
                    }
                    else {
                        this.weights[i + 1] *= (Math.random() * 2);
                    }
                }
            }
        }
    }
    runThrough(startValues) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].value = 0;
        }
        for (var i = 1; i <= startValues.length; i++) {
            for (var j = 1; j <= this.depth; j++) {
                this.nodes[j].addToValue(this.weights[i * j] * startValues[i - 1]);
            }
        }
        var output = new Node();
        for (var i = 1; i < this.nodes.length; i++) {
            output.addToValue(this.nodes[i].calculatedValue * this.weights[(startValues.length * this.depth) + i]);
        }
        return output.calculatedValue;
    }
}

var accelSpeed = 0.05;
class GameInstance {
    constructor(network) {
        this.reset();
        this.network = network;
    }

    logic() {
        if (this.ball.position.y < (this.autoPaddle.position.y - (this.autoPaddle.size.y * 0.33))) {
            this.autoPaddle.position.y -= 2.5;
        }
        else if (this.ball.position.y > (this.autoPaddle.position.y + (this.autoPaddle.size.y * 0.33))) {
            this.autoPaddle.position.y += 2.5;
        }
        var dec = neuralDir(this.ball.position, this.ball.velocity, this.aiPaddle.position.y, this.network);
        if (Math.abs(dec) > 0) {
            if (dec < 0) {
                this.aiPaddle.position.y -= 2;
            }
            else {
                this.aiPaddle.position.y += 2;
            }
        }
        /*
        if(this.aiPaddle.position.y > 300 + (this.aiPaddle.size.y / 2)){
            this.aiPaddle.position.y = 1;
        }
        else if(this.aiPaddle.position.y < 0 - (this.aiPaddle.size.y / 2)){ //dont let ai go past bounds
            this.aiPaddle.position.y = 299;
        }*/
    }

    checkBounce() {
        if (this.ball.position.y > 295) { //bottom
            this.ball.position.y = 294;
            this.ball.velocity.y *= -1;
        }
        else if (this.ball.position.y < 5) { //top
            this.ball.position.y = 6;
            this.ball.velocity.y *= -1;
        }
        if ((this.ball.position.x - (this.ball.size.x / 2)) < (this.autoPaddle.position.x + (this.autoPaddle.size.x / 2))) { //auto paddle
            this.ball.velocity.x *= 1 + 0.01 + Math.random() * accelSpeed;
            this.ball.velocity.y *= 1 + 0.01 + Math.random() * accelSpeed;
            this.ball.velocity.x *= -1;
            this.ball.position.x += 1;
        }
        if ((this.ball.position.x + (this.ball.size.x / 2)) > (this.aiPaddle.position.x - (this.aiPaddle.size.x / 2))) {
            if ((this.ball.position.y - (this.ball.size.y / 2)) < (this.aiPaddle.position.y + (this.aiPaddle.size.y / 2)) && (this.ball.position.y + (this.ball.size.y / 2)) > (this.aiPaddle.position.y - (this.aiPaddle.size.y / 2))) {
                this.ball.velocity.x *= 1 + 0.01 + Math.random() * accelSpeed;
                this.ball.velocity.y *= 1 + 0.01 + Math.random() * accelSpeed;
                this.ball.velocity.x *= -1;
                this.ball.position.x = this.aiPaddle.position.x - (this.ball.size.x / 2) - 10;
                this.score++;
            }
        }
        if (this.ball.position.x > 380) {
            this.going = false;
            this.clear();
        }
    }

    draw() {
        drawIt(this.ball, this.color);
        drawIt(this.autoPaddle, "white");
        drawIt(this.aiPaddle, this.color);
    }

    clear() {
        drawIt(this.ball, "rgba(255, 255, 255, 0)");
        drawIt(this.autoPaddle, "rgba(255, 255, 255, 0)");
        drawIt(this.aiPaddle, "rgba(255, 255, 255, 0)");
    }

    continue() {
        if (this.going) {
            this.logic();
            this.checkBounce();
            this.ball.position.x += this.ball.velocity.x;
            this.ball.position.y += this.ball.velocity.y;
            if (displayAll) {
                this.draw();
            }
            else {
                if (this.isTop) {
                    this.draw();
                }
            }
        }
    }

    reset() {
        this.autoPaddle = new Rect(new Vector2(25, 150), new Vector2(0, 0), new Vector2(10, 50));
        this.aiPaddle = new Rect(new Vector2(375, 150), new Vector2(0, 0), new Vector2(10, 50));
        this.isTop = false;
        this.ball = new Rect(new Vector2(200, 150), new Vector2(1, Math.random() + 0.25), new Vector2(10, 10));
        if (Math.random() < 0.5) {
            this.ball.velocity.y *= -1;
        }
        this.ball.velocity.x *= 1 + Math.random() * accelSpeed;
        this.ball.velocity.y *= 1 + Math.random() * accelSpeed;
        this.color = getNewColor();
        this.score = 0;
        this.going = true;
    }
}

function drawIt(rect, color) {
    ctx.fillStyle = color;
    ctx.fillRect((rect.position.x - (rect.size.x / 2)) * scale, (rect.position.y - (rect.size.y / 2)) * scale, rect.size.x * scale, rect.size.y * scale);
}


var games = [];
for (var i = 0; i < 1000; i++) {
    games.push(new GameInstance(new Network(7, null)));
}

function neuralDir(bpos, bvel, mpos, network) {
    var values = [];
    values.push(bpos.x / 400);
    //values.push((bpos.y - 150) / 150);
    values.push(0);
    values.push(bvel.x);
    values.push(bvel.y);
    values.push((mpos - 150) / 150);
    return network.runThrough(values);
}
var currentTop;
var generation = 1;
var run = setInterval(function () {
    ctx.clearRect(0, 0, canvas.height * 2, canvas.width * 2);
    ctx.font = '20px Arial';
    var doneWithGeneration = true;
    var temporaryGen = [];
    var remaining = 0;
    for (var i = 0; i < games.length; i++) {
        games[i].continue();
        if (games[i].going) {
            remaining++;
            doneWithGeneration = false;
        }
    }


    temporaryGen.push(games[0]);
    for (var i = 1; i < games.length; i++) {
        var inned = false;
        for (var j = 0; j < temporaryGen.length; j++) {
            if (games[i].score > temporaryGen[j].score) {
                temporaryGen.splice(j, 0, games[i]); //simple way of putting shit in order
                inned = true;
                break;
            }
        }
        if (!inned) {
            temporaryGen.push(games[i]);
        }
    }
    if (currentTop == null) {
        currentTop = temporaryGen[0];
    }
    temporaryGen[0].isTop = true;
    for (var i = 1; i < temporaryGen.length; i++) {
        temporaryGen[i].isTop = false;
    }
    if (temporaryGen[0].score <= currentTop.score) {
        temporaryGen[0].isTop = false;
        currentTop.isTop = true;
    }
    else {
        currentTop = temporaryGen[0];
    }
    ctx.fillStyle = "white";
    ctx.fillText("Generation " + generation.toString() + ", " + remaining + " pongers remain. Best score is " + currentTop.score, 20, 42);
    if (doneWithGeneration) {
        generation++;
        var temporaryNetworks = [];
        temporaryNetworks.push(games[0]); //puts first
        var total = games[0].score;
        for (var i = 1; i < games.length; i++) {
            total += games[i].score;
            var inned = false;
            for (var j = 0; j < temporaryNetworks.length; j++) {
                if (games[i].score > temporaryNetworks[j].score) {
                    temporaryNetworks.splice(j, 0, games[i]); //simple way of putting shit in order
                    inned = true;
                    break;
                }
            }
            if (!inned) {
                temporaryNetworks.push(games[i]);
            }
        }
        console.log("Avg score: " + (total / games.length));
        for (var i = 0; i < games.length; i++) {
            games[i].network = new Network(7, temporaryNetworks.slice(0, Math.floor(temporaryNetworks.length / 2)));
            //console.log("Mating " + temporaryNetworks[0].color + " and " + temporaryNetworks[1].color);
            games[i].reset();
        }
    }
}, 1);

window.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 37: // Left
            displayAll = !displayAll;
            this.console.log(displayAll);
            break;
    }
}, false);


