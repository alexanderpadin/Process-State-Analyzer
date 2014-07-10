var id = 1;
var queue = []; //Process array
$("#pid").html(id);

var ready = [];
var blocked = [];
var ready_sup = [];
var blocked_sup = [];
var terminated = [];
var running = "";
var largest_state = 1;
var current_state_model;
var stoped = false;
var interval = 0;

button_enable(0, 0, 0, 0, 0, 1, 0);

function testing() {
    var ID = 1;
    for(var i = 0 ; i < 5 ; i++) {
         var proceso = new Process();
        proceso.id = ID;
        proceso.io = "false"
        proceso.instructions = 3;
        proceso.name = "testing";
        proceso.seconds = 3;
        queue.push(proceso);
        ID++;    
    }
    button_enable(1, 0, 0, 1, 0, 1, 1);
    updateQueue();
}

function addProcess() {
    $("#alertName").fadeOut();
    $("#alertInst").fadeOut();
    $("#alertIO").fadeOut();

    var proceso = new Process();
    proceso.id = id;
    proceso.io = document.getElementById("io").value;
    proceso.instructions = document.getElementById("instructions").value;
    proceso.name = document.getElementById("name").value;
    proceso.seconds = document.getElementById("seconds").value;

    if (proceso.name === "") {
        $("#alertName").fadeIn();
        return 0;
    } else if (proceso.instructions === "") {
        $("#alertInst").fadeIn();
        return 0;
    } else if (isNaN(proceso.instructions)) {
        $("#alertInst").fadeIn();
        return 0;
    } else if (proceso.io === "true" && isNaN(proceso.seconds)) {
        $("alertIO").fadeIn();
        return 0;
    } else {
        $("#alertName").fadeOut();
        $("#alertInst").fadeOut();
        $("#alertIO").fadeOut();
        proceso.instructions = parseInt(proceso.instructions);
        proceso.seconds = parseInt(proceso.seconds);
        queue.push(proceso);
        button_enable(1, 0, 0, 1, 0, 1, 1);
    }

    id++;
    $("#pid").html(id);
    document.getElementById("name").value = "";
    document.getElementById("io").value = "true";
    document.getElementById("instructions").value = "";
    document.getElementById("seconds").removeAttribute("disabled");

    updateQueue();
}

function starts(stat) {

    if(stoped === true) {
        chronoContinue();
        stoped = false;
        button_enable(0, 0, 0, 0, 1, 0, 0);
        return;
    }

    for (var i = 0; i < queue.length; i++) {
        var proceso = new Process();
        proceso.id = queue[i].id;
        proceso.io = queue[i].io;
        proceso.instructions = queue[i].instructions;
        proceso.name = queue[i].name;
        proceso.seconds = queue[i].seconds;
        ready.unshift(proceso);
    }

    updateReady();
    next();

    if (stat === "auto") {
        chronoStart();
        interval = setInterval(function() {
            next();
        }, 1000);
        button_enable(0, 0, 0, 0, 1, 0, 0);
    } else {
        button_enable(0, 1, 1, 0, 0, 0, 0)
    }
}

function stop_app() {
    stoped = true;
    chronoStop();
    button_enable(0, 0, 1, 1, 0, 0, 0);

}

function updateStateModel() {
    if(blocked_sup.length > 0 || ready_sup.length > 0) {
        largest_state = 7;
        if(current_state_model !== 7) {
            $("#process_model").fadeTo(300,0.30, function() {
                $("#process_model").attr("src","img/state_7.png");
            }).fadeTo(300,1);
            current_state_model = 7;
        }
    } else if(blocked.length > 0) {
        largest_state = (largest_state < 5) ? 5 : largest_state;
        if(current_state_model !== 5) {
            $("#process_model").fadeTo(300,0.30, function() {
                $("#process_model").attr("src","img/state_5.png");
            }).fadeTo(300,1);
            current_state_model = 5;
        }
    } else {
        if(current_state_model != 1) {
            $("#process_model").fadeTo(300,0.30, function() {
                $("#process_model").attr("src","img/state_1.png");
            }).fadeTo(300,1);
            current_state_model = 1;
        }
    }
 }


function next() {

    if(stoped === true) {
        return;
    }

    if(blocked_sup.length > 0) {
        for(var i = 0 ; i < blocked_sup.length ; i++) {
            blocked_sup[i].seconds--;
            if(blocked_sup[i].seconds === 0) {
                blocked_sup[i].io = "false";
                ready_sup.unshift(blocked_sup[i]);
                blocked_sup.splice(i, 1);
            } else {
                //do nothing.
            }
        }
    }

    if(blocked.length > 0) {
        for(var i = 0 ; i < blocked.length ; i++) {
            blocked[i].seconds--;
            blocked[i].timeBlocked++;
            if(blocked[i].seconds === 0) {
                blocked[i].io = "false";
                ready.unshift(blocked[i]);
                blocked.splice(i, 1);
            } else if(blocked[i].timeBlocked > 6) {
                blocked[i].timeBlocked = 0;
                blocked_sup.unshift(blocked[i]);
                blocked.splice(i, 1);
            } else {
                //do nothing.
            }
        }
    }

    if (running !== "") {
        running.instructions--;
        if (running.instructions === 0) {
            terminated.unshift(running);
            running = "";
        } else if (running.io === "true") {
            running.timeBlocked = 0;
            blocked.unshift(running);
            running = "";
        } else {
            ready.unshift(running);
            running = "";
        }
    }

    if (ready.length === 0) {
        running = "";
    } else {
        running = ready.pop();
    }

    while(ready.length > 5) {
        var proc = ready.shift();
        ready_sup.push(proc); 
    }  

    if(ready.length < 2) {
        while(ready.length < 5 && ready_sup.length > 0) {
            var proc = ready_sup.pop();
            ready.unshift(proc);
        }
    }

    while(blocked.length > 5) {
        var proc = blocked.shift();
        blocked_sup.push(proc); 
    }  

    if(blocked.length < 2) {
        while(blocked.length < 5 && blocked_sup.length > 0) {
            var proc = blocked_sup.pop();
            blocked.unshift(proc);
        }
    }

    if (ready.length === 0 && blocked.length === 0 && running === "") {
        if (interval !== 0) {
            clearInterval(interval);
            chronoStop();
            interval = "";
            button_enable(0, 0, 1, 0, 0, 0, 1);

            $("#process_model").fadeTo(300,0.30, function() {
                $("#process_model").attr("src","img/state_" + largest_state + ".png");
            }).fadeTo(300,1);

            $("#best").fadeIn();
            $("#chronotime").css('color', 'red');
        }
    }

    updateReady();
    updateBlocked();
    updateTerminated();
    updateRunning();
    updateReady_suspend();
    updateBlocked_suspend();
    updateStateModel();
}

function reset() {
    ready = [];
    blocked = [];
    terminated = [];
    ready_sup = [];
    blocked_sup = [];
    running = "";

    updateReady();
    updateBlocked();
    updateTerminated();
    updateRunning();
    updateReady_suspend();
    updateBlocked_suspend();

    chronoStop();
    chronoReset();

    clearInterval(interval);
            
    interval = "";


    $("#process_model").fadeTo(300,0.30, function() {
        $("#process_model").attr("src","img/state_0.png");
    }).fadeTo(300,1);
    current_state_model = 1;


    $("#best").fadeOut();
    $("#chronotime").css('color', 'black');

    stoped = false;

    button_enable(1, 0, 0, 1, 0, 1, 1);
}

function clear_process() {
    button_enable(0, 0, 0, 0, 0, 1, 0);
    queue = [];
    updateQueue();
    button_enable(0, 0, 0, 0, 0, 1, 0);
}

function button_enable(start, next, reset, auto, stop, process_btn, process_clear){
    var START = document.getElementById("start_btn");
    var NEXT = document.getElementById("next_btn");
    var RESET = document.getElementById("reset_btn");
    var AUTO = document.getElementById("auto_btn");
    var STOP = document.getElementById("stop_btn");
    var PROCESS_BTN = document.getElementById("process_add");
    var CLEAR_BTN = document.getElementById("process_clear");

    if(start == 0)
        START.disabled = true;
    else 
        START.disabled = false;

    if(next == 0)
        NEXT.disabled = true;
    else 
        NEXT.disabled = false;

    if(reset == 0)
        RESET.disabled = true;
    else
        RESET.disabled = false;

    if(auto == 0)
        AUTO.disabled = true;
    else
        AUTO.disabled = false;

    if(stop == 0)
        STOP.disabled = true;
    else 
        STOP.disabled = false;

    if(process_btn == 0)
        PROCESS_BTN.disabled = true;
    else 
        PROCESS_BTN.disabled = false;

    if(process_clear == 0) 
        CLEAR_BTN.disabled = true;
    else
        CLEAR_BTN.disabled = false;
}

function updateReady() {
    var response = "";
    response = '<ul class="button-group">';
    for (var index = 0; index < ready.length; index++) {
        response = response + '<li><a href="#" class="button" data-dropdown="drop' + ready[index].id + '">Process ' + ready[index].id + '</a>';
        response = response + '<div id="drop' + ready[index].id + '" data-dropdown-content class="f-dropdown content">';
        response = response + '<p>Name: ' + ready[index].name + '</p>';
        response = response + '<p>id: ' + ready[index].id + '</p>';
        response = response + '<p>ins: ' + ready[index].instructions + '</p>';
        response = response + '<p>I/O: ' + ready[index].io + '</p>';
        response = response + '<p>Request time: ' + ready[index].seconds + '</p>';
        response = response + '</div></li>';
    }

    response = response + '</ul>';
    $("#ready").html(response);
    $(document).foundation();
}

function updateBlocked() {
    var response = "";
    response = '<ul class="button-group">';
    for (var index = 0; index < blocked.length; index++) {
        response = response + '<li><a href="#" class="button alert" data-dropdown="drop' + blocked[index].id + '">Process ' + blocked[index].id + '</a>';
        response = response + '<div id="drop' + blocked[index].id + '" data-dropdown-content class="f-dropdown content">';
        response = response + '<p>Name: ' + blocked[index].name + '</p>';
        response = response + '<p>id: ' + blocked[index].id + '</p>';
        response = response + '<p>ins: ' + blocked[index].instructions + '</p>';
        response = response + '<p>I/O: ' + blocked[index].io + '</p>';
        response = response + '<p>Request Time: ' + blocked[index].seconds + '</p>';
        response = response + '</div></li>';
    }
    response = response + '</ul>';
    $("#blocked").html(response);
    $(document).foundation();
}

function updateBlocked_suspend() {
    
    var response = "";
    response = '<ul class="button-group">';
    for (var index = 0; index < blocked_sup.length; index++) {
        response = response + '<li><a href="#" class="button alert" data-dropdown="drop' + blocked_sup[index].id + '">Process ' + blocked_sup[index].id + '</a>';
        response = response + '<div id="drop' + blocked_sup[index].id + '" data-dropdown-content class="f-dropdown content">';
        response = response + '<p>Name: ' + blocked_sup[index].name + '</p>';
        response = response + '<p>id: ' + blocked_sup[index].id + '</p>';
        response = response + '<p>ins: ' + blocked_sup[index].instructions + '</p>';
        response = response + '<p>I/O: ' + blocked_sup[index].io + '</p>';
        response = response + '<p>Request Time: ' + blocked_sup[index].seconds + '</p>';
        response = response + '</div></li>';
    }

    response = response + '</ul>';
    $("#blocked_sup").html(response);
    $(document).foundation();
}

function updateReady_suspend() {
    var response = "";
    response = '<ul class="button-group">';
    for (var index = 0; index < ready_sup.length; index++) {
        response = response + '<li><a href="#" class="button" data-dropdown="drop' + ready_sup[index].id + '">Process ' + ready_sup[index].id + '</a>';
        response = response + '<div id="drop' + ready_sup[index].id + '" data-dropdown-content class="f-dropdown content">';
        response = response + '<p>Name: ' + ready_sup[index].name + '</p>';
        response = response + '<p>id: ' + ready_sup[index].id + '</p>';
        response = response + '<p>ins: ' + ready_sup[index].instructions + '</p>';
        response = response + '<p>I/O: ' + ready_sup[index].io + '</p>';
        response = response + '<p>Request Time: ' + ready_sup[index].seconds + '</p>';
        response = response + '</div></li>';
    }
    response = response + '</ul>';
    $("#ready_sup").html(response);
    $(document).foundation();
}

function updateTerminated() {
    var response = "";
    response = '<ul class="button-group">';
    for (var index = 0; index < terminated.length; index++) {
        response = response + '<li><a href="#" class="button secondary" data-dropdown="drop' + terminated[index].id + '">Process ' + terminated[index].id + '</a>';
        response = response + '<div id="drop' + terminated[index].id + '" data-dropdown-content class="f-dropdown content">';
        response = response + '<p>Name: ' + terminated[index].name + '</p>';
        response = response + '<p>id: ' + terminated[index].id + '</p>';
        response = response + '<p>ins: ' + terminated[index].instructions + '</p>';
        response = response + '<p>I/O: ' + terminated[index].io + '</p>';
        response = response + '<p>Request Time: ' + terminated[index].seconds + '</p>';
        response = response + '</div></li>';
    }

    response = response + '</ul>';
    $("#terminated").html(response);
    $(document).foundation();
}

function updateRunning() {
    var response = "";

    if (running !== "") {
        response = '<ul class="button-group">';
        response = response + '<li><a href="#" class="button success" data-dropdown="drop' + running.id + '">Process ' + running.id + '</a>';
        response = response + '<div id="drop' + running.id + '" data-dropdown-content class="f-dropdown content">';
        response = response + '<p>Name: ' + running.name + '</p>';
        response = response + '<p>id: ' + running.id + '</p>';
        response = response + '<p>ins: ' + running.instructions + '</p>';
        response = response + '<p>I/O: ' + running.io + '</p>';
        response = response + '<p>Request Time: ' + running.seconds + '</p>';
        response = response + '</div></li>';

        response = response + '</ul>';
    }

    $("#running").html(response);
    $(document).foundation();
}
function updateQueue() {
    var response = "";
    response = '<dl class="accordion" data-accordion>';
    for (var index = 0; index < queue.length; index++) {
        response = response + '<dd>';
        response = response + '<dd>';
        response = response + '<a href="#process' + queue[index].id + '">Process ' + queue[index].id + '</a>';
        response = response + '<div id="process' + queue[index].id + '" class="content">';
        response = response + '<p><strong>Name: </strong>' + queue[index].name + '</p>';
        response = response + '<p><strong>I/O: </strong>' + queue[index].io + '</p>';
        response = response + '<p><strong>Instructions: </strong>' + queue[index].instructions + '</p>';
        response = response + '<p><strong>Request Time: </strong>' + queue[index].seconds + '</p>';
        response = response + '</div>';
        response = response + '</dd>';
        response += '<hr>';
    }
    response = response + '</dl>';
    $("#queue").html(response);
    $(document).foundation();
}

function ioselect(stat) {
    if (stat === "false") {
        document.getElementById("seconds").setAttribute("disabled", "disabled");
    } else {
        document.getElementById("seconds").removeAttribute("disabled");
    }
}

