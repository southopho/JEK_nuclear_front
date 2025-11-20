const MAX_RESERVOIR_CAPACITY = 100;
const MAX_POINTS = 20;

const drain_rate = 5;
const fill_rate = 5;

let energy = 100;
let pressure = 0;
let tmp = 0;
let reservoir_1_water_level = MAX_RESERVOIR_CAPACITY;
let reservoir_2_water_level = MAX_RESERVOIR_CAPACITY;

const inputs = {
    blue_button: -1,
    red_square_button: -1,
    resevoir_selector_1: -1,
    resevoir_selector_2: -1,
    big_red_button: -1,
    lever: 1,
    valve: 0,
    reactor_rod_1: -1,
    reactor_rod_2: -1,
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
    let drainage = inputs.valve * drain_rate;

    if (inputs.resevoir_selector_1 && reservoir_1_water_level > 0) {
        reservoir_1_water_level -= drainage;
    }
    if (inputs.resevoir_selector_2 && reservoir_2_water_level > 0) {
        reservoir_2_water_level -= drainage;
    }

    reservoir_1_water_level =
        reservoir_1_water_level < 0 ? 0 : reservoir_1_water_level;
    reservoir_2_water_level =
        reservoir_2_water_level < 0 ? 0 : reservoir_2_water_level;
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

const game_logic = () => {
    if (inputs.lever && energy > inputs.valve) {
        console.log(reservoir_1_water_level);
        console.log(reservoir_2_water_level);
        drain();
    }

    fill();
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
                    backgroundColor: "rgba(255, 200, 0, 0.2)", // optional fill
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
        drain();
        //game_logic();
        // if (data[0].pressed) {
        //   $("#pirmas").text("Pirmas rod pakeltas");
        // } else {
        //   $("#pirmas").text("Pirmas rod nuleistas");
        // }

        game_logic();
        updateHistoryAndCharts();
    });
}, 300);

$(document).ready(() => {
    $(initCharts);
});

let energy = 0;
let pressure = 0;
let tmp = 0;
let reservoir_1_water_level = 100000;
let reservoir_2_water_level = 100000;

const drain_rate = 5;

const inputs = {
    blue_button: -1,
    red_square_button: -1,
    resevoir_selector_1: -1,
    resevoir_selector_2: -1,
    big_red_button: -1,
    lever: -1,
    valve: -1,
};

// $.get("http://95.216.164.138:3001/posts/", function (data) {
//   console.log(data);
// });

const drain = () => {
    let drainage = inputs.valve * drain_rate;

    if (inputs.resevoir_selector_1) {
        reservoir_1_water_level -= valve * drain_rate;
    }
    if (inputs.resevoir_selector_2) {
        reservoir_2_water_level -= valve * drain_rate;
    }
};

const game_logic = () => {
    if (inputs.lever && energy > inputs.valve) {
    }
};

setInterval(function () {
    $.get("http://95.216.164.138:3001/posts/", function (data) {
        data.forEach((element) => {
            inputs[element.id] = element.pressed;
        });

        // if (data[0].pressed) {
        //   $("#pirmas").text("Pirmas rod pakeltas");
        // } else {
        //   $("#pirmas").text("Pirmas rod nuleistas");
        // }
    });
}, 300);
