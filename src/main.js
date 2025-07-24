import "./style.css"
import {SUDOKU_API} from "./config.js";

// HTML elements
const puzzleBoard = document.getElementById('puzzle')
const btnSolve = document.getElementById('btn-solve')
const btnNewGame = document.getElementById('start-game')
const solutionDisplay = document.getElementById('solution')
const difficultySelect = document.getElementById("difficulty");

// constants
const PUZZLE_FIELDS_COUNT = 81 // 9 x 9
const DEFAULT_DIFFICULTY = 'Hard';
let isGameStarted = false;
let isPuzzleSolved = false;
let submission;

const init = function () {
    btnSolve.hidden = true;
    solutionDisplay.hidden = true;
    submission = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
}
init();

const setGameMode = function () {
    if (!isGameStarted) {
        solutionDisplay.hidden = true;
        btnSolve.hidden = true;
    } else if (isGameStarted && isPuzzleSolved) {
        solutionDisplay.hidden = false;
        btnSolve.hidden = true;
    } else {
        btnSolve.hidden = false;
    }
}

for (let i = 0; i < PUZZLE_FIELDS_COUNT; i++) {
    const sudokuCell = document.createElement('input')
    sudokuCell.setAttribute('type', 'number')
    sudokuCell.setAttribute('min', 1)
    sudokuCell.setAttribute('max', 9)
    sudokuCell.classList.add('sudoku-cell')
    sudokuCell.setAttribute('id', `sudoku-cell cell_id-${i}`)
    if (
        !(Math.floor(i / 27) % 2 === 0 && (i % 9 < 3 || i % 9 > 5)) ||
        !(Math.floor(i / 27) % 2 === 1 && (i % 9 >= 3 && i % 9 <= 5))
    ) {
        puzzleBoard.appendChild(sudokuCell)
    }
}

const inputList = document.querySelectorAll('.sudoku-cell')

// Function to visually handle cells with value "0"
function updateInputStyles() {
    inputList.forEach(input => {
        const raw = input.value.trim();
        if (raw === "0" || raw === "") {
            input.classList.add("empty-cell");
            input.value = ""; // Clears displayed value
        } else {
            input.classList.remove("empty-cell");
            input.classList.remove("empty-cell");
            input.classList.add("gray-fields");
        }
    });
}

// Attach the input event to dynamically handle changes
inputList.forEach(input => {
    input.addEventListener('input', e => {
        updateInputStyles();
        input.classList.remove("flash");
        void input.offsetWidth; // Force reflow
        input.classList.add("flash");
        input.classList.add("gray-fields");
    });
});


const startNewGame = async function () {
    isGameStarted = true;
    setGameMode();
    const combination = await fetch(`${SUDOKU_API}/generate?difficulty=${difficultySelect.value}`)
    const data = await combination.json()
    if (data) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                inputList[i * 9 + j].value = data[i][j];
                inputList[i * 9 + j].disabled = inputList[i * 9 + j].value != 0;
                updateInputStyles();
            }
        }
    }
}

const joinValues = () => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            console.log(inputList[i * 9 + j].value)
            submission[i][j] = inputList[i * 9 + j].value !== 0 ? Number(inputList[i * 9 + j].value) : 0;
        }
    }
}

const setDifficulty = function (difficulty) {
    return difficulty;
}

const inputFillOut = (isSolvable, solution) => {
    if (isSolvable && solution) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                inputList[i * 9 + j].value = solution[i][j];
                inputList[i * 9 + j].disabled = true;
            }
        }
        solutionDisplay.innerHTML = 'This is a solution.'
    } else {
        solutionDisplay.innerHTML = 'This is not solvable.'
    }
}

const solve = async () => {
    joinValues()
    isGameStarted = false;
    isPuzzleSolved = true;
    setGameMode();
    const data = {data: submission}
    if (!data) return;
    console.log(data.data)

    await fetch('http://localhost:5154/api/sudoku/solved', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data.data)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Solution data: ", data)
            inputFillOut(data !== null, data)
        })
        .catch(error => console.error(`Error: ${error}`))
}

// Event Listeners
btnSolve.addEventListener('click', solve)
btnNewGame.addEventListener('click', startNewGame)
difficultySelect.addEventListener("change", (e) => setDifficulty(e.target.value))
