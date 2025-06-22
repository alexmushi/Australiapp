import { loginUser, registerUser } from '../services/authService.js';

export function ping(req, res) {
  res.json({ message: 'pong' });
}

export async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    // remove password hash
    delete user.password_hash;
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const user = await loginUser(req.body);
    delete user.password_hash;
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}