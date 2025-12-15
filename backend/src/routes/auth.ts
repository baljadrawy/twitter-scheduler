import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  name: z.string().min(2, { message: "الاسم قصير جداً" }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({ success: true, data: { user, token } });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ success: false, error: 'فشل التسجيل' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    const invalidMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';

    if (result.rows.length === 0) return res.status(401).json({ success: false, error: invalidMsg });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) return res.status(401).json({ success: false, error: invalidMsg });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name }, token } });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'بيانات غير صالحة' });
    }
    res.status(500).json({ success: false, error: 'فشل تسجيل الدخول' });
  }
});

export default router;
