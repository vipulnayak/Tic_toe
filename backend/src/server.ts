import express, { Request, Response } from 'express';
import { createPool, PoolConnection } from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());

// Database pool configuration
const pool = createPool({
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

// Type definitions for request bodies
interface LoginRequestBody {
  username: string;
  password: string;
}

// Login route
app.post(
  '/login',
  async (
    req: Request<{}, {}, LoginRequestBody>, // Type-safe request body
    res: Response
  ): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    try {
      // Check against default credentials
      if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        const token = jwt.sign({ userId: 'default_admin' }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, message: 'Default admin login successful' });
        return;
      }

      // Check against database credentials
      const conn: PoolConnection = await pool.getConnection();
      const [rows]: any = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
      conn.release();

      if (rows.length > 0) {
        const match = await bcrypt.compare(password, rows[0].password);
        if (match) {
          const token = jwt.sign({ userId: rows[0].id }, SECRET_KEY, { expiresIn: '1h' });
          res.json({ token });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  }
);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
