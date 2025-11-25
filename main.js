const MAX_RESERVOIR_CAPACITY = 200;
const MAX_POINTS = 20;
const VALVE_MAX = 4095
const MAX_ENERGY = 1000;

const drain_rate = 3;
const fill_rate = 5;
const cool_rate = 3;
const heat_rate = 0.2;
const energy_rate = 0.05;

const rod_1_change = 1;
const rod_2_change = -0.5;

let reaction_speed = 0;
let failed = false;
let score = 0;

let energy = MAX_ENERGY/2;
let pressure = 0;
let tmp = 0;
let reservoir_1_water_level = MAX_RESERVOIR_CAPACITY;
let reservoir_2_water_level = MAX_RESERVOIR_CAPACITY;

const inputs = {
    blue_button: 0,
    red_square_button: 0,
    resevoir_selector_1: 0,
    resevoir_selector_2: 0,
    big_red_button: 0,
    lever: 0,
    valve: 0,
    reactor_rod_1: 0,
    reactor_rod_2: 0,
    plug_1: 0,
    plug_2: 0,
    plug_3: 0,
    plug_4: 0,
    plug_5: 0,
    plug_6: 0,
    plug_7: 0,
    plug_8: 0,
    "corrector-1": 0,
};

// history arrays for energy vs time
let energyHistory = [];
let timeHistory = [];

// references to charts (will be created later)
let energyChart = null;
let statusChart = null;

// $.get("http://95.216.164.138:3001/posts/", function (data) {
//   console.log(data);
// });

const drain = () => {
    let drainage = inputs.valve/VALVE_MAX * drain_rate;
    let draining = false;

    if (inputs.resevoir_selector_1 && reservoir_1_water_level > 0) {
        reservoir_1_water_level -= drainage;
        draining = true;
    }
    if (inputs.resevoir_selector_2 && reservoir_2_water_level > 0) {
        reservoir_2_water_level -= drainage;
        draining = true;
    }

    reservoir_1_water_level =
        reservoir_1_water_level < 0 ? 0 : reservoir_1_water_level;
    reservoir_2_water_level =
        reservoir_2_water_level < 0 ? 0 : reservoir_2_water_level;
    return draining;
};

const fill = () => {
    let fillage = fill_rate;

    if (
        !inputs.resevoir_selector_1 &&
        reservoir_1_water_level < MAX_RESERVOIR_CAPACITY
    ) { 
        reservoir_1_water_level += fillage;
    }
    if (
        !inputs.resevoir_selector_2 &&
        reservoir_2_water_level < MAX_RESERVOIR_CAPACITY
    ) {
        reservoir_2_water_level += fillage;
    }
};

const cool = () => {
    tmp -= 5* (cool_rate * inputs.valve) / VALVE_MAX;
}

const update_pressure = () => {
    pressure = (100 * inputs.valve) / VALVE_MAX;
}

const cooler_consumption = () => {
    energy -= (cool_rate * 0.01);
}

const nuclear_core = () => {
    reaction_speed += rod_1_change * inputs.reactor_rod_1;
    reaction_speed += rod_2_change * inputs.reactor_rod_2;
}

const game_logic = () => {
    if (failed) {
        return;
    }

    if(energy < MAX_ENERGY){
        energy += reaction_speed * energy_rate;
    }
    tmp += reaction_speed * heat_rate;
    if(reaction_speed < 2 && tmp < 100){
        tmp += 2 * heat_rate;
    }

    if(inputs.big_red_button){
        energy -= 10;
        score += 10; 
    }

    nuclear_core();

    if(inputs["corrector-1"]){
        alert("Įvyko gedimas, sujunktie grandinę reaktoriaus kambaryje!")
        return;
    }

    if (inputs.lever && energy > 10) {
        console.log(reservoir_1_water_level);
        console.log(reservoir_2_water_level);
        if(drain()){
            update_pressure();
            cool();
            cooler_consumption();
        }else{
            pressure = 0;
        }
    }
    
    fill();

    if(tmp < 0){
        tmp = 0;
    }


    if(reaction_speed < 0){
        reaction_speed = 0;
    }

    if(tmp > 1000){
        failed = true;
        alert("JŪS PRALAIMĖJOTE! Reaktorius perkaisto! Balas: " + score);
    }   
};

//chart updating brain

function initCharts() {
    const energyCtx = document.getElementById("energy-chart").getContext("2d");
    const statusCtx = document.getElementById("status-chart").getContext("2d");

    // Line chart: energy vs time
    energyChart = new Chart(energyCtx, {
        type: "line",
        data: {
            labels: timeHistory,
            datasets: [
                {
                    label: "Energy",
                    data: energyHistory,
                    borderColor: "rgba(255, 200, 0, 1)", // bright amber line
                    backgroundColor: "rgba(255, 200, 0, 1)", // optional fill
                    borderWidth: 2,
                    tension: 0.2, // slight smoothing
                    fill: false,
                },
            ],
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 5,
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(255, 255, 255, 0.5)"
                    },
                },
            },
        },
    });

    // Bar chart: current values of pressure/tmp/reservoirs
    statusChart = new Chart(statusCtx, {
        type: "bar",
        data: {
            labels: ["Pressure", "Tmp", "Res 1", "Res 2"],
            datasets: [
                {
                    label: "Status",
                    data: [
                        pressure,
                        tmp,
                        reservoir_1_water_level,
                        reservoir_2_water_level,
                    ],
                    backgroundColor: [
                        "rgba(200, 50, 50, 0.8)", // Pressure = red
                        "rgba(50, 200, 50, 0.8)", // Tmp = green
                        "rgba(50, 150, 200, 0.8)", // Reservoir 1 = blue-ish
                        "rgba(200, 200, 50, 0.8)", // Reservoir 2 = yellow
                    ],
                    borderColor: [
                        "rgba(200, 50, 50, 1)",
                        "rgba(50, 200, 50, 1)",
                        "rgba(50, 150, 200, 1)",
                        "rgba(200, 200, 50, 1)",
                    ],
                    borderWidth: 2,
                },
            ],
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(255, 255, 255, 0.5)"
                    },
                },
            },
        },
    });
}

function updateHistoryAndCharts() {
    if (!energyChart || !statusChart) return; // charts not ready yet

    // --- 1) Energy vs time history (FIFO up to 20 points) ---
    const label = new Date().toLocaleTimeString(); // or a simple counter

    timeHistory.push(label);
    energyHistory.push(energy);

    if (timeHistory.length > MAX_POINTS) {
        timeHistory.shift();
        energyHistory.shift();
    }

    energyChart.data.labels = timeHistory;
    energyChart.data.datasets[0].data = energyHistory;
    energyChart.update("none"); // no animation for snappier update

    // --- 2) Bar chart: current values ---
    statusChart.data.datasets[0].data = [
        pressure,
        tmp,
        reservoir_1_water_level,
        reservoir_2_water_level,
    ];
    statusChart.update("none");
}

//
setInterval(function () {
    $.get("http://95.216.164.138:3001/posts/", function (data) {
        //console.log("Tick"); //debugging
        data.forEach((element) => {
            inputs[element.id] = element.pressed;
        });
        // drain();
        //game_logic();
        // if (data[0].pressed) {
        //   $("#pirmas").text("Pirmas rod pakeltas");
        // } else {
        //   $("#pirmas").text("Pirmas rod nuleistas");
        // }

        game_logic();
        updateHistoryAndCharts();
        $("#reaction_speed-value").text(reaction_speed.toFixed(2));
        $("#score").text(score);
        $("#valve").text(inputs.valve / VALVE_MAX);
    });
}, 300);

$(document).ready(() => {
    $(initCharts);});