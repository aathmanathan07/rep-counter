// MockAPI free plan only has "id" and "name"
// so we save everything inside name like this:  Push-ups|3|10
// (exercise name | sets | reps)

const url = "https://6af9728f6d8b86fb22d6ff1c.mockapi.io/exercises";

let exercises = [];

document.querySelector("#loadDataBtn").addEventListener("click", getExercises);
document.querySelector("#addForm").addEventListener("submit", addExercise);


// ---------- GET all exercises ----------
function getExercises(){

   const xhr = new XMLHttpRequest();

   xhr.open("GET", url, true);

   xhr.onload = function(){

    if(this.status === 200){

        exercises = JSON.parse(this.responseText);

        // first time the api is empty, so add 3 exercises
        if(exercises.length === 0){
            createDefaults();
        }else{
            showExercises();
        }

    }else{
         document.querySelector("#status").innerHTML = `${this.status} ${this.statusText}`;
    }

   }

   xhr.send();

}


// ---------- show exercises on the page ----------
function showExercises(){

    let output = "";

    exercises.forEach(function(exercise){

        // split "Push-ups|3|10" into 3 parts
        const parts = exercise.name.split("|");
        const name = parts[0];
        const sets = parts[1] || 0;
        const reps = parts[2] || 0;

        output += `
            <div class="card shadow-sm mb-3">
                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">${name}</h5>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteExercise(${exercise.id})">Remove</button>
                    </div>

                    <div class="row text-center">

                        <div class="col-6">
                            <div class="text-muted">Sets</div>
                            <div class="fs-2 fw-bold">${sets}</div>
                            <button class="btn btn-sm btn-secondary" onclick="changeCount(${exercise.id}, 'sets', -1)">-</button>
                            <button class="btn btn-sm btn-primary" onclick="changeCount(${exercise.id}, 'sets', 1)">+</button>
                        </div>

                        <div class="col-6">
                            <div class="text-muted">Reps</div>
                            <div class="fs-2 fw-bold">${reps}</div>
                            <button class="btn btn-sm btn-secondary" onclick="changeCount(${exercise.id}, 'reps', -1)">-</button>
                            <button class="btn btn-sm btn-primary" onclick="changeCount(${exercise.id}, 'reps', 1)">+</button>
                        </div>

                    </div>

                    <div class="text-center mt-3">
                        <button class="btn btn-sm btn-outline-secondary" onclick="resetCount(${exercise.id})">Reset</button>
                    </div>

                </div>
            </div>
        `;

    });

    document.querySelector("#status").innerHTML = "";
    document.querySelector("#dataContainer").innerHTML = output;

}


// ---------- POST (add new exercise) ----------
function addExercise(e){

    e.preventDefault();

    const input = document.querySelector("#exerciseName");

    // remove | < > so it does not break the format
    const name = input.value.replace(/[|<>]/g, "").trim();

    if(name === ""){
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function(){

        if(this.status === 201 || this.status === 200){
            input.value = "";
            getExercises();
        }else{
            document.querySelector("#status").innerHTML = `${this.status} ${this.statusText}`;
        }

    }

    xhr.send(JSON.stringify({ name: name + "|0|0" }));

}


// ---------- POST 3 starter exercises ----------
function createDefaults(){

    const names = ["Push-ups", "Squats", "Pull-ups"];
    let done = 0;

    names.forEach(function(name){

        const xhr = new XMLHttpRequest();

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = function(){

            done++;

            // after all 3 are saved, load them again
            if(done === names.length){
                getExercises();
            }

        }

        xhr.send(JSON.stringify({ name: name + "|0|0" }));

    });

}


// ---------- PUT (change sets or reps) ----------
function changeCount(id, type, amount){

    const exercise = exercises.find(function(item){
        return item.id == id;
    });

    const parts = exercise.name.split("|");
    let sets = Number(parts[1]) || 0;
    let reps = Number(parts[2]) || 0;

    if(type === "sets"){
        sets = Math.max(0, sets + amount);
    }else{
        reps = Math.max(0, reps + amount);
    }

    saveExercise(id, parts[0], sets, reps);

}


function resetCount(id){

    const exercise = exercises.find(function(item){
        return item.id == id;
    });

    saveExercise(id, exercise.name.split("|")[0], 0, 0);

}


function saveExercise(id, name, sets, reps){

    const xhr = new XMLHttpRequest();

    xhr.open("PUT", url + "/" + id, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function(){

        if(this.status === 200){
            getExercises();
        }else{
            document.querySelector("#status").innerHTML = `${this.status} ${this.statusText}`;
        }

    }

    xhr.send(JSON.stringify({ name: name + "|" + sets + "|" + reps }));

}


// ---------- DELETE ----------
function deleteExercise(id){

    const xhr = new XMLHttpRequest();

    xhr.open("DELETE", url + "/" + id, true);

    xhr.onload = function(){

        if(this.status === 200){
            getExercises();
        }else{
            document.querySelector("#status").innerHTML = `${this.status} ${this.statusText}`;
        }

    }

    xhr.send();

}


// load when page opens
getExercises();