import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/database';

const router = express.Router();

// 1. مخططات التحقق (Validation Schemas)
const registerSchema = z.object({
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  name: z.string().min(2, { message: "الاسم قصير جداً" }),
});

const loginSchema = z.object({
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z.string().min(1, { message: "يرجى إدخال كلمة المرور" }),
});

// 2. تسجيل مستخدم جديد (Register)
router.post('/register', async (req, res) => {
  try {
    // التحقق من صحة المدخلات
    const { email, password, name } = registerSchema.parse(req.body);

    // التحقق من عدم تكرار البريد
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // الحفظ في قاعدة البيانات
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // إنشاء التوكين
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ success: true, data: { user, token } });

  } catch (error) {
    // معالجة أخطاء Zod بشكل منفصل لرسائل أوضح
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    console.error('Register Error:', error);
    res.status(500).json({ success: false, error: 'فشل إنشاء الحساب' });
  }
});

// 3. تسجيل الدخول (Login)
router.post('/login', async (req, res) => {
  try {
    // التحقق من المدخلات
    const { email, password } = loginSchema.parse(req.body);

    // البحث عن المستخدم
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    // رسالة خطأ عامة للأمان
    const invalidMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: invalidMsg });
    }

    const user = result.rows[0];

    // مطابقة كلمة المرور
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: invalidMsg });
    }

    // إنشاء التوكين
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      data: { 
        user: { id: user.id, email: user.email, name: user.name }, 
        token 
      } 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'فشل تسجيل الدخول' });
  }
});

export default router;
