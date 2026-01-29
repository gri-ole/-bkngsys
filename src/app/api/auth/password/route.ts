/**
 * API Route для смены пароля
 * PUT - изменить пароль
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/utils/auth';
import { getAdminPassword, setAdminPassword } from '@/utils/password';

export async function PUT(request: NextRequest) {
  // Только для авторизованных пользователей
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Получаем текущий пароль из файла
    const adminPassword = getAdminPassword();

    if (!adminPassword || currentPassword !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid current password' },
        { status: 401 }
      );
    }

    // Сохраняем новый пароль в файл
    setAdminPassword(newPassword);
    
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error in PUT /api/auth/password:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
