import "./style.css"
import {SUDOKU_API} from "./config.js";

// HTML elements
const puzzleBoard = document.getElementById('puzzle')
const btnSolve = document.getElementById('btn-solve')
const btnNewGame = document.getElementById('start-game')
const btnRestart = document.getElementById('restart-game')
const solutionDisplay = document.getElementById('solution')
const difficultySelect = document.getElementById("difficulty");

// constants
const PUZZLE_FIELDS_COUNT = 81 // 9 x 9
let submission;
let currentPuzzle;
let isValid = true;
const GAME_MODES = {
    NEW: "NEW",
    START: 'START',
    SOLVE: 'SOLVE',
    RESTART: 'RESTART'
};

const GAME_DIFFICULTIES = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
    EXTREME: "EXTREME"
};

const init = function () {
    setGameMode(GAME_MODES.NEW);
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
    currentPuzzle = [...submission];
}

const setGameMode = function (option) {
    switch (option) {
        case GAME_MODES.NEW:
            btnSolve.hidden = true;
            btnRestart.disabled = true;
            solutionDisplay.innerHTML = '';
            break;
        case GAME_MODES.START:
            btnSolve.hidden = false;
            btnRestart.disabled = true;
            solutionDisplay.innerHTML = '';
            break;
        case GAME_MODES.SOLVE:
            btnSolve.hidden = true;
            btnRestart.disabled = true;
            break;
        case GAME_MODES.RESTART:
            btnSolve.hidden = false;
            btnRestart.disabled = false;
            solutionDisplay.innerHTML = '';
            break;
        default:
            break;
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

const inputList = Array.from(document.querySelectorAll('.sudoku-cell'));

// Attach the input event to dynamically handle changes
inputList.forEach(input => {
    input.addEventListener('input', e => {
        input.classList.remove("flash");
        void input.offsetWidth; // Force reflow
        input.classList.add("flash");
    });
});

// Get value at given row and column from inputList
const getValue = (row, col) => {
    return inputList[row * 9 + col].value;
};

const checkPuzzle = (e) => {
    const input = e.target;
    const index = inputList.indexOf(input);
    const value = input.value.trim();

    if (value === "") {
        isValid = true;
        input.classList.remove("input-error");
        input.classList.add("sudoku-cell");
        btnSolve.disabled = false;
        return;
    }

    // Early return if empty or not a number 1–9
    // if (!/^[1-9]$/.test(value)) {
    //     input.classList.add("input-error");
    //     return;
    // }

    // Compute row and col
    const row = Math.floor(index / 9);
    const col = index % 9;

    // Check Row
    for (let c = 0; c < 9; c++) {
        if (c !== col && getValue(row, c) === value) {
            isValid = false;
            break;
        }
    }

    // Check Column
    if (isValid) {
        for (let r = 0; r < 9; r++) {
            if (r !== row && getValue(r, col) === value) {
                isValid = false;
                break;
            }
        }
    }

    // Check 3x3 Subgrid
    if (isValid) {
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if ((r !== row || c !== col) && getValue(r, c) === value) {
                    isValid = false;
                    break;
                }
            }
        }
    }

    // Update styling
    if (!isValid) {
        input.classList.remove("sudoku-cell");
        input.classList.add("input-error");
        btnSolve.disabled = true;
    } else {
        input.classList.remove("input-error");
        input.classList.add("sudoku-cell");
        btnSolve.disabled = false;
        solutionDisplay.innerHTML = '';
    }
    isValid = true;
};

const startNewGame = async function () {
    setGameMode(GAME_MODES.START);

    const sudokuCombination = await fetch(`${SUDOKU_API}/generate?difficulty=${difficultySelect.value}`)
    const data = await sudokuCombination.json()
    const {data: puzzle} = data;
    if (data) {
        currentPuzzle = [...puzzle];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                inputList[i * 9 + j].value = puzzle[i][j] !== 0 ? puzzle[i][j] : "";
                inputList[i * 9 + j].classList.remove("input-error");
                inputList[i * 9 + j].classList.remove("gray-fields");
                inputList[i * 9 + j].classList.add("sudoku-cell");
                inputList[i * 9 + j].disabled = inputList[i * 9 + j].value != 0;
                if (inputList[i * 9 + j].value != 0) {
                    inputList[i * 9 + j].classList.add("gray-fields")
                }
            }
        }
    }
}

const restartGame = function () {
    setGameMode(GAME_MODES.RESTART);

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            inputList[i * 9 + j].value = currentPuzzle[i][j] !== 0 ? currentPuzzle[i][j] : "";
            inputList[i * 9 + j].classList.remove("input-error");
            inputList[i * 9 + j].classList.remove("gray-fields");
            inputList[i * 9 + j].classList.add("sudoku-cell");
            inputList[i * 9 + j].disabled = inputList[i * 9 + j].value != 0;
            if (inputList[i * 9 + j].value != 0) {
                inputList[i * 9 + j].classList.add("gray-fields")
            }
        }
    }
}

const joinValues = () => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            submission[i][j] = inputList[i * 9 + j].value !== 0 ? Number(inputList[i * 9 + j].value) : 0;
        }
    }
}

const setDifficulty = function (difficulty) {
    switch (difficulty) {
        case GAME_DIFFICULTIES.EASY:
            return GAME_DIFFICULTIES.EASY;
        case GAME_DIFFICULTIES.MEDIUM:
            return GAME_DIFFICULTIES.MEDIUM;
        case GAME_DIFFICULTIES.HARD:
            return GAME_DIFFICULTIES.HARD;
        case GAME_DIFFICULTIES.EXTREME:
            return GAME_DIFFICULTIES.EXTREME;
        default:
            return GAME_DIFFICULTIES.EASY;
    }
}

const inputFillOut = (isSolvable, solution) => {
    if (isSolvable && solution) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                inputList[i * 9 + j].value = solution[i][j];
                inputList[i * 9 + j].disabled = true;
                inputList[i * 9 + j].classList.add("sudoku-cell");
                inputList[i * 9 + j].classList.remove("gray-fields");
            }
        }
    }
}

const solve = async () => {
    joinValues();
    const bodyRequest = {sudokuCombination: submission}
    if (!isValid || !bodyRequest) return;

    await fetch(`${SUDOKU_API}/solve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({puzzleGrid: bodyRequest.sudokuCombination})
    })
        .then(response => response.json())
        .then(data => {
            const {success: solvable, data: solution, message} = data;
            inputFillOut(solvable, solution);
            if (solvable) {
                setGameMode(GAME_MODES.SOLVE);
            } else {
                setGameMode(GAME_MODES.RESTART);
            }
            solutionDisplay.innerHTML = message;
        })
        .catch(error => {
            console.error(`Error: ${error}`)
        })
}

init();

// Event Listeners
btnSolve.addEventListener('click', solve)
btnNewGame.addEventListener('click', startNewGame)
btnRestart.addEventListener('click', restartGame)
difficultySelect.addEventListener("change", (e) => setDifficulty(e.target.value))
inputList.forEach(input => input.addEventListener("input", (e) => checkPuzzle(e)));
