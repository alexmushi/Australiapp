export function ping(req, res) {
  res.json({ message: 'OK' });
}

import { createUser, verifyUser } from '../services/authService.js';

export async function register(req, res) {
  const { username, password, default_currency_code } = req.body;
  if (!username || !password || !default_currency_code) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const user = await createUser({ username, password, default_currency_code });
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const user = await verifyUser(username, password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
}
