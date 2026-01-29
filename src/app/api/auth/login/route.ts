/**
 * API Route для аутентификации админа
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminPassword } from '@/utils/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Получаем пароль из файла
    const adminPassword = getAdminPassword();

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      // Создаем простую сессию (в production лучше использовать JWT или cookies)
      const response = NextResponse.json({ success: true });
      
      // Устанавливаем cookie с токеном (простой вариант)
      const token = Buffer.from(`admin_${Date.now()}_${Math.random()}`).toString('base64');
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
