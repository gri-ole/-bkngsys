/**
 * Футер админ-панели с информацией о версии
 */

'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function AdminFooter() {
  const { language } = useTranslation();
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.1.0';
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0];

  return (
    <footer className="admin-footer">
      <div className="admin-footer-content">
        <div className="admin-footer-left">
          <span className="admin-footer-app-name">www.colorlab.lv</span>
          <span className="admin-footer-divider">•</span>
          <span className="admin-footer-version">
            {language === 'ru' ? 'Версия' : 'Versija'} {version}
          </span>
        </div>
        <div className="admin-footer-right">
          <span className="admin-footer-build">
            {language === 'ru' ? 'Сборка' : 'Būvēts'}: {buildDate}
          </span>
        </div>
      </div>

      <style jsx>{`
        .admin-footer {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%);
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          padding: 16px 20px;
          margin-top: 60px;
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .admin-footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .admin-footer-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-footer-app-name {
          font-weight: 600;
          font-size: 14px;
          color: #d4af37;
          letter-spacing: 0.5px;
        }

        .admin-footer-divider {
          color: rgba(212, 175, 55, 0.4);
          font-weight: 300;
        }

        .admin-footer-version {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
          padding: 4px 10px;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .admin-footer-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-footer-build {
          font-size: 12px;
          color: #6b7280;
          font-weight: 400;
        }

        /* Mobile адаптация */
        @media (max-width: 768px) {
          .admin-footer {
            padding: 14px 16px;
            margin-top: 40px;
          }

          .admin-footer-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .admin-footer-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .admin-footer-app-name {
            font-size: 13px;
          }

          .admin-footer-version {
            font-size: 12px;
            padding: 3px 8px;
          }

          .admin-footer-build {
            font-size: 11px;
          }

          .admin-footer-divider {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .admin-footer {
            padding: 12px 12px;
          }

          .admin-footer-app-name {
            font-size: 12px;
          }

          .admin-footer-version {
            font-size: 11px;
          }
        }
      `}</style>
    </footer>
  );
}
