import express from 'express';
import { createPool, PoolConnection } from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

const pool = createPool({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'tictactoe_db',
  connectionLimit: 10
});

const SECRET_KEY = 'your_secret_key';

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const conn: PoolConnection = await pool.getConnection();
    await conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    conn.release();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
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
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});