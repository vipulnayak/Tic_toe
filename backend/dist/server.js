"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promise_1 = require("mysql2/promise");
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Database pool configuration
const pool = (0, promise_1.createPool)({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'vipulnayak',
    database: process.env.DB_NAME || 'tictactoe_db',
    connectionLimit: 10,
});
// Secret key for JWT
const SECRET_KEY = process.env.SECRET_KEY || 'defaultsecretkey';
// Default login credentials
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';
// Login route
app.post('/login', (req, // Type-safe request body
res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
    }
    try {
        // Check against default credentials
        if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
            const token = jsonwebtoken_1.default.sign({ userId: 'default_admin' }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token, message: 'Default admin login successful' });
            return;
        }
        // Check against database credentials
        const conn = yield pool.getConnection();
        const [rows] = yield conn.query('SELECT * FROM users WHERE username = ?', [username]);
        conn.release();
        if (rows.length > 0) {
            const match = yield bcrypt_1.default.compare(password, rows[0].password);
            if (match) {
                const token = jsonwebtoken_1.default.sign({ userId: rows[0].id }, SECRET_KEY, { expiresIn: '1h' });
                res.json({ token });
            }
            else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
}));
// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
