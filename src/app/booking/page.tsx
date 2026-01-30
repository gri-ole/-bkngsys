/**
 * Публичная страница для клиентов - форма записи
 */

'use client';

import { useState, useEffect } from 'react';
import BookingForm from '@/components/BookingForm';
import { useTranslation } from '@/hooks/useTranslation';
import { getWorkingHours, formatWorkingHours } from '@/utils/workingHours';
import { getContactInfo } from '@/utils/contactInfo';

// Функция проверки рабочего времени
function isWorkingTime(hours: any): boolean {
  if (!hours) return false;
  
  try {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // текущее время в минутах
    
    // Маппинг дней недели
    const dayMap: { [key: number]: string } = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    const dayKey = dayMap[currentDay];
    const daySchedule = hours[dayKey];
    
    if (!daySchedule || !daySchedule.enabled) {
      return false;
    }
    
    // Парсим время начала и конца
    const [startHour, startMin] = daySchedule.start.split(':').map(Number);
    const [endHour, endMin] = daySchedule.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  } catch (error) {
    console.error('Error checking working time:', error);
    return false;
  }
}

export default function BookingPage() {
  const { t, language } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [workingHours, setWorkingHours] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [contactInfo, setContactInfo] = useState({ address: '', phone: '', email: '', instagram: '', showInBooking: false });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadData = () => {
      try {
        const hours = getWorkingHours();
        setWorkingHours(formatWorkingHours(hours, language));
        
        // Проверяем, работаем ли мы сейчас
        const working = isWorkingTime(hours);
        setIsCurrentlyWorking(working);
        
        // Загружаем контактную информацию
        const contact = getContactInfo();
        setContactInfo(contact);
      } catch (error) {
        console.error('[BookingPage] Error loading data:', error);
      }
    };

    loadData();

    // Проверяем рабочее время каждую минуту
    const checkInterval = setInterval(() => {
      try {
        const hours = getWorkingHours();
        const working = isWorkingTime(hours);
        setIsCurrentlyWorking(working);
      } catch (error) {
        console.error('[BookingPage] Error checking working time:', error);
      }
    }, 60000); // Каждую минуту

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_working_hours') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language, isClient]);

  const handleSuccess = () => {
    setSubmitted(true);
    // Автоматически закрыть popup через 5 секунд
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  const closeSuccessPopup = () => {
    setSubmitted(false);
  };

  return (
    <div className="page-container">
      {/* Success Popup */}
      {submitted && (
        <div className="success-overlay" onClick={closeSuccessPopup}>
          <div className="success-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closeSuccessPopup}>×</button>
            <div className="success-animation">
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                  <div className="icon-circle"></div>
                  <div className="icon-fix"></div>
                </div>
              </div>
            </div>
            <h2 className="popup-title">{t('booking.success.title')}</h2>
            <p className="popup-message">{t('booking.success.message')}</p>
            <button className="btn btn-primary" onClick={closeSuccessPopup}>
              {language === 'ru' ? 'Закрыть' : 'Aizvērt'}
            </button>
          </div>
        </div>
      )}

      {/* Форма записи */}
      <section className="booking-section">
        <div className="container">
          <div className="booking-content">
            <h1 className="page-title">{t('booking.title')}</h1>

            {/* Форма */}
            <div className="form-card">
              <BookingForm onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </section>

      {/* Контакты - показываем только если включено в настройках и есть хотя бы один контакт */}
      {contactInfo.showInBooking && (contactInfo.address || contactInfo.phone || contactInfo.email || contactInfo.instagram) && (
        <section className="contacts-section">
          <div className="container">
            <h2 className="section-title">
              {language === 'ru' ? 'Контакты' : 'Kontakti'}
            </h2>
            
            <div className={contactInfo.address ? "contacts-grid" : "contacts-single"}>
              {/* Единый блок с контактами */}
              <div className="contacts-unified-box">
                <div className="contacts-box-content">
                  {contactInfo.address && (
                    <div className="contact-row">
                      <div className="contact-row-icon">📍</div>
                      <div className="contact-row-content">
                        <div className="contact-row-label">
                          {language === 'ru' ? 'Адрес' : 'Adrese'}
                        </div>
                        <div className="contact-row-value">
                          {contactInfo.address}
                        </div>
                      </div>
                    </div>
                  )}

                  {contactInfo.phone && (
                    <div className="contact-row">
                      <div className="contact-row-icon">📞</div>
                      <div className="contact-row-content">
                        <div className="contact-row-label">
                          {language === 'ru' ? 'Телефон' : 'Tālrunis'}
                        </div>
                        <div className="contact-row-value">
                          {!phoneRevealed ? (
                            <>
                              <span 
                                className="contact-row-link contact-blur"
                                onClick={() => setPhoneRevealed(true)}
                                style={{ cursor: 'pointer' }}
                              >
                                {contactInfo.phone}
                              </span>
                              <span className="reveal-hint-inline">
                                {language === 'ru' ? ' (нажмите)' : ' (klikšķis)'}
                              </span>
                            </>
                          ) : (
                            <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="contact-row-link">
                              {contactInfo.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {contactInfo.email && (
                    <div className="contact-row">
                      <div className="contact-row-icon">📧</div>
                      <div className="contact-row-content">
                        <div className="contact-row-label">Email</div>
                        <div className="contact-row-value">
                          {!emailRevealed ? (
                            <>
                              <span 
                                className="contact-row-link contact-blur"
                                onClick={() => setEmailRevealed(true)}
                                style={{ cursor: 'pointer' }}
                              >
                                {contactInfo.email}
                              </span>
                              <span className="reveal-hint-inline">
                                {language === 'ru' ? ' (нажмите)' : ' (klikšķis)'}
                              </span>
                            </>
                          ) : (
                            <a href={`mailto:${contactInfo.email}`} className="contact-row-link">
                              {contactInfo.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {contactInfo.instagram && (
                    <div className="contact-row">
                      <div className="contact-row-icon">📷</div>
                      <div className="contact-row-content">
                        <div className="contact-row-label">Instagram</div>
                        <div className="contact-row-value">
                          <a 
                            href={contactInfo.instagram.startsWith('http') ? contactInfo.instagram : `https://instagram.com/${contactInfo.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-row-link"
                          >
                            @{contactInfo.instagram.replace('@', '').replace(/https?:\/\/(www\.)?instagram\.com\//g, '')}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {workingHours && (
                    <div className="contact-row contact-row-last">
                      <div className="contact-row-icon">🕐</div>
                      <div className="contact-row-content">
                        <div className="contact-row-label">
                          {language === 'ru' ? 'Часы работы' : 'Darba laiks'}
                        </div>
                        <div className="contact-row-value">
                          <pre className="working-hours-compact">{workingHours}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Карта - показываем только если есть адрес */}
              {contactInfo.address && (
                <div className="map-container">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(contactInfo.address)}&zoom=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={language === 'ru' ? 'Карта расположения' : 'Atrašanās vietas karte'}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@300;400;700;900&display=swap');

        /* Премиальная палитра - мягкие цвета */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: #e8e8e8;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
        }

        .page-container {
          min-height: 100vh;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Секция с формой */
        .booking-section {
          padding: 80px 0;
          background: transparent;
        }

        .booking-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .page-title {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          font-size: 3.5rem;
          font-weight: 400;
          text-align: center;
          color: #f5f1e8;
          margin-bottom: 20px;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .title-underline {
          width: 100px;
          height: 4px;
          background: linear-gradient(90deg, #d4af37 0%, #c9915d 100%);
          margin: 0 auto 50px;
          box-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
        }

        /* Карточка часов работы */
        .working-hours-card {
          background: #ffffff;
          padding: 24px 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-left: 4px solid #4a4a4a;
        }

        .working-hours-text {
          font-family: 'Roboto', 'Courier New', monospace;
          font-size: 0.95rem;
          font-weight: 300;
          line-height: 1.8;
          color: #cbd5e1;
          margin: 0;
          white-space: pre-wrap;
        }

        /* Форма */
        .form-box {
          background: linear-gradient(135deg, rgba(45, 49, 66, 0.95) 0%, rgba(55, 65, 81, 0.95) 100%);
          padding: 40px;
          border-left: 4px solid #d4af37;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.1);
          backdrop-filter: blur(10px);
        }

        /* Success Popup */
        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
          padding: 20px;
        }

        .success-popup {
          background: linear-gradient(135deg, rgba(45, 49, 66, 0.98) 0%, rgba(55, 65, 81, 0.98) 100%);
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 16px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.2);
          position: relative;
          animation: slideUp 0.4s ease-out;
        }

        .popup-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 30px;
          color: #9ca3af;
          cursor: pointer;
          line-height: 1;
          padding: 5px 10px;
          transition: all 0.2s;
        }

        .popup-close:hover {
          color: #d4af37;
          transform: rotate(90deg);
        }

        .success-animation {
          margin-bottom: 30px;
        }

        .success-checkmark {
          width: 100px;
          height: 100px;
          margin: 0 auto;
          border-radius: 50%;
          display: block;
          stroke-width: 3;
          stroke: #d4af37;
          stroke-miterlimit: 10;
          box-shadow: inset 0 0 0 #d4af37;
          animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
          position: relative;
        }

        .success-checkmark .check-icon {
          width: 100px;
          height: 100px;
          position: relative;
          border-radius: 50%;
          box-sizing: content-box;
          border: 3px solid #d4af37;
        }

        .success-checkmark .icon-line {
          height: 3px;
          background-color: #d4af37;
          display: block;
          border-radius: 2px;
          position: absolute;
          z-index: 10;
        }

        .success-checkmark .icon-line.line-tip {
          top: 48px;
          left: 18px;
          width: 25px;
          transform: rotate(45deg);
          animation: icon-line-tip 0.75s;
        }

        .success-checkmark .icon-line.line-long {
          top: 43px;
          right: 10px;
          width: 47px;
          transform: rotate(-45deg);
          animation: icon-line-long 0.75s;
        }

        .success-checkmark .icon-circle {
          top: -3px;
          left: -3px;
          z-index: 10;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          position: absolute;
          box-sizing: content-box;
          border: 3px solid rgba(212, 175, 55, 0.3);
        }

        .success-checkmark .icon-fix {
          top: 10px;
          width: 7px;
          left: 30px;
          z-index: 1;
          height: 90px;
          position: absolute;
          transform: rotate(-45deg);
          background: linear-gradient(135deg, rgba(45, 49, 66, 0.98) 0%, rgba(55, 65, 81, 0.98) 100%);
        }

        .popup-title {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          font-size: 2rem;
          color: #f5f1e8;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .popup-message {
          font-size: 1rem;
          color: #cbd5e1;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes icon-line-tip {
          0% { width: 0; left: 1px; top: 19px; }
          54% { width: 0; left: 1px; top: 19px; }
          70% { width: 50px; left: -8px; top: 37px; }
          84% { width: 17px; left: 21px; top: 48px; }
          100% { width: 25px; left: 18px; top: 48px; }
        }

        @keyframes icon-line-long {
          0% { width: 0; right: 46px; top: 54px; }
          65% { width: 0; right: 46px; top: 54px; }
          84% { width: 55px; right: 0; top: 35px; }
          100% { width: 47px; right: 10px; top: 43px; }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0 0 0 50px rgba(212, 175, 55, 0.1);
          }
        }

        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }

        /* Кнопки */
        .btn-primary {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #d4af37 0%, #c9915d 100%);
          color: #1f2937;
          border: 2px solid transparent;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          border-radius: 4px;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .btn-primary:hover {
          background: transparent;
          color: #d4af37;
          border-color: #d4af37;
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
          transform: translateY(-2px);
        }

        /* Секция контактов */
        .contacts-section {
          padding: 80px 0 60px;
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(45, 49, 66, 0.8) 100%);
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          backdrop-filter: blur(10px);
        }

        .section-title {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          font-size: 3rem;
          font-weight: 400;
          text-align: center;
          margin-bottom: 20px;
          color: #f5f1e8;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .contacts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: start;
        }

        /* Контактная информация */
        .contacts-info {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .contact-item {
          display: flex;
          gap: 25px;
          align-items: flex-start;
          padding: 24px;
          background: rgba(212, 175, 55, 0.06);
          border-left: 3px solid rgba(212, 175, 55, 0.5);
          border-radius: 6px;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .contact-item:hover {
          background: rgba(212, 175, 55, 0.12);
          border-left-color: #d4af37;
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.15);
        }

        .contact-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #d4af37 0%, #c9915d 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(212, 175, 55, 0.3);
        }

        .contact-text h4 {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          font-size: 1.2rem;
          font-weight: 400;
          margin: 0 0 10px 0;
          color: #d4af37;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .contact-text p {
          margin: 0;
          font-size: 1.05rem;
          color: #cbd5e1;
          line-height: 1.8;
        }

        .contact-detail {
          font-size: 0.9rem !important;
          color: #94a3b8 !important;
          margin-top: 4px !important;
        }

        .contact-link {
          color: #e8e8e8;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .contact-link:hover {
          color: #d4af37;
          border-bottom-color: #d4af37;
        }

        /* Защита Email от ботов - заблюренные контакты */
        .contact-blur {
          filter: blur(5px);
          user-select: none;
          transition: all 0.3s ease;
          position: relative;
          display: inline-block;
        }

        .contact-blur:hover {
          filter: blur(3px);
          background: rgba(212, 175, 55, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .reveal-hint {
          font-size: 0.85rem;
          color: #94a3b8;
          font-style: italic;
          margin-left: 8px;
          opacity: 0.8;
        }

        /* Статус работы */
        .status-badge {
          font-family: 'Roboto', sans-serif;
          margin-left: 10px;
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 1px;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-block;
        }

        .status-open {
          color: #4ade80;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
        }

        .status-closed {
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        /* Анимация появления блока телефона */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .contact-item {
          animation: fadeIn 0.4s ease-out;
        }

        /* Карта */
        .map-container {
          height: 500px;
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.1);
        }

        /* Адаптивность */
        @media (max-width: 968px) {
          .contacts-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .map-container {
            height: 350px;
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2.5rem;
            letter-spacing: 2px;
          }

          .section-title {
            font-size: 2.2rem;
            letter-spacing: 2px;
          }

          .form-box {
            padding: 28px 20px;
          }

          .form-box .form-input,
          .form-box .form-select,
          .form-box .form-textarea {
            min-height: 48px;
            font-size: 16px;
            padding: 14px 16px;
          }

          .form-box button[type="submit"] {
            min-height: 52px;
            width: 100%;
            font-size: 17px;
          }

          .booking-section {
            padding: 50px 0;
          }

          .container {
            padding: 0 16px;
          }

          .success-box {
            padding: 40px 24px;
          }

          .contact-item {
            padding: 20px;
          }

          .booking-section {
            padding: 60px 0;
          }

          .contacts-section {
            padding: 60px 0 40px;
          }
          
          .contacts-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          
          .contacts-unified-box {
            padding: 24px;
          }
          
          .contact-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .contact-row-icon {
            width: 42px;
            height: 42px;
            min-width: 42px;
            font-size: 20px;
          }
        }
        
        /* Единый блок контактов */
        .contacts-single {
          max-width: 700px;
          margin: 40px auto 0;
        }
        
        .contacts-unified-box {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(45, 49, 66, 0.95) 100%);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .contacts-box-content {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        
        .contact-row {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          transition: all 0.3s ease;
        }
        
        .contact-row:first-child {
          padding-top: 0;
        }
        
        .contact-row-last {
          border-bottom: none;
          padding-bottom: 0;
        }
        
        .contact-row:hover {
          padding-left: 8px;
          border-bottom-color: rgba(212, 175, 55, 0.3);
        }
        
        .contact-row-last:hover {
          border-bottom-color: transparent;
        }
        
        .contact-row-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          background: linear-gradient(135deg, #d4af37 0%, #c9915d 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
        
        .contact-row-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        
        .contact-row-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #9ca3af;
        }
        
        .contact-row-value {
          font-size: 16px;
          font-weight: 500;
          color: #f5f1e8;
          line-height: 1.5;
          word-break: break-word;
        }
        
        .contact-row-link {
          color: #d4af37;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
          display: inline-block;
        }
        
        .contact-row-link:hover {
          color: #f5d76e;
          border-bottom-color: #d4af37;
        }
        
        .reveal-hint-inline {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
          margin-left: 6px;
        }
        
        .working-hours-compact {
          font-family: 'Roboto', 'Courier New', monospace;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.7;
          color: #cbd5e1;
          margin: 0;
          white-space: pre-wrap;
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.85rem;
            margin-bottom: 16px;
            letter-spacing: 1px;
          }

          .section-title {
            font-size: 1.6rem;
            margin-bottom: 20px;
          }

          .title-underline {
            width: 80px;
            height: 3px;
            margin-bottom: 32px;
          }

          .form-box {
            padding: 20px 16px;
            border-radius: 12px;
          }

          .form-box .form-input,
          .form-box .form-select,
          .form-box .form-textarea {
            min-height: 48px;
            font-size: 16px;
            padding: 14px 16px;
          }

          .form-box button[type="submit"] {
            min-height: 54px;
            width: 100%;
            font-size: 17px;
            padding: 16px;
          }

          .booking-section {
            padding: 36px 0;
          }

          .booking-content {
            padding: 0 4px;
          }

          .container {
            padding: 0 12px;
          }

          .success-icon {
            width: 80px;
            height: 80px;
            font-size: 48px;
          }

          .contact-icon {
            width: 45px;
            height: 45px;
            font-size: 20px;
          }

          .contacts-unified-box {
            padding: 20px;
            border-radius: 12px;
          }

          .contact-row {
            padding: 16px 0;
          }

          .contact-row-icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
            font-size: 18px;
            border-radius: 10px;
          }

          .contact-row-label {
            font-size: 10px;
          }

          .contact-row-value {
            font-size: 14px;
          }

          .working-hours-compact {
            font-size: 13px;
            line-height: 1.6;
          }

          .booking-section {
            padding: 40px 0;
          }

          .contacts-section {
            padding: 40px 0 30px;
          }

          .form-box, .success-box {
            padding: 25px 20px;
          }
        }
      `}</style>
    </div>
  );
}
