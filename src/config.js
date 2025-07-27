
// Use environment variable or fallback to localhost for development
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5002'
    : 'https://sudoku-solver-api-production.up.railway.app'; // Your Deployment url. You'll get this from Railway

export const BASE_URL = API_URL;
export const SUDOKU_API = `${BASE_URL}/api/sudoku`;
