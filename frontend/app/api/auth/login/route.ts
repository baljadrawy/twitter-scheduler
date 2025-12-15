import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'البريد وكلمة المرور مطلوبة' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return NextResponse.json({ success: false, error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'فشل تسجيل الدخول' }, { status: 500 });
  }
}
