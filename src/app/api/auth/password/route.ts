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
    // В serverless окружении (Vercel) смена пароля через API не поддерживается
    // Пользователь должен обновить переменную окружения ADMIN_PASSWORD в Vercel Dashboard
    return NextResponse.json(
      { 
        error: 'Password change through API is not supported in production environment',
        message: 'To change password, update ADMIN_PASSWORD environment variable in Vercel Dashboard:\n' +
                '1. Go to Vercel Dashboard\n' +
                '2. Select your project\n' +
                '3. Settings → Environment Variables\n' +
                '4. Edit ADMIN_PASSWORD\n' +
                '5. Redeploy the project'
      },
      { status: 501 } // 501 Not Implemented
    );
  } catch (error) {
    console.error('Error in PUT /api/auth/password:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
