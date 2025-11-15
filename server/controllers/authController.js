import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
    const{ username, email, password } = req.body;
    console.log(req.body);
    if(!username || !email || !password){
        return  res.status(400).json({ message: 'All fields are required' });
    }

    try{
        const[ existingUser ] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if(existingUser.length > 0){
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute('INSERT INTO users (username,email,password) VALUES (?,?,?)', [username, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Server Error during sign up' });
    }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getProfile = async (req, res) => {
    try{
        const[rows] = await pool.execute('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
        if(rows.length === 0){
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching profile' });
    }
};