/**
 * Компонент для управления контактной информацией
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { getContactInfo, saveContactInfo, ContactInfo } from '@/utils/contactInfo';

export default function ContactInfoSettings() {
  const { language } = useTranslation();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: '',
    phone: '',
    email: '',
    instagram: '',
    showInBooking: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loaded = getContactInfo();
    setContactInfo(loaded);
  }, []);

  const handleChange = (field: keyof ContactInfo, value: string | boolean) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      saveContactInfo(contactInfo);
      setSaveMessage({
        type: 'success',
        text: language === 'ru' ? 'Контактная информация сохранена' : 'Kontaktinformācija saglabāta',
      });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: language === 'ru' ? 'Ошибка сохранения' : 'Saglabāšanas kļūda',
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ 
        marginBottom: '24px', 
        fontSize: '20px', 
        fontWeight: '600',
        color: '#1f2937',
      }}>
        {language === 'ru' ? 'Контактная информация' : 'Kontaktinformācija'}
      </h2>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        maxWidth: '600px',
      }}>
        {/* Адрес */}
        <div className="form-group">
          <label htmlFor="address" className="form-label">
            📍 {language === 'ru' ? 'Адрес' : 'Adrese'}
          </label>
          <input
            type="text"
            id="address"
            className="form-input"
            value={contactInfo.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder={language === 'ru' ? 'Рига, ул. Бривибас 123' : 'Rīga, Brīvības iela 123'}
          />
        </div>

        {/* Телефон */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            📞 {language === 'ru' ? 'Телефон' : 'Tālrunis'}
          </label>
          <input
            type="tel"
            id="phone"
            className="form-input"
            value={contactInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+371 12345678"
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            📧 Email
          </label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={contactInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="info@colorlab.lv"
          />
        </div>

        {/* Instagram */}
        <div className="form-group">
          <label htmlFor="instagram" className="form-label">
            📷 Instagram
          </label>
          <input
            type="text"
            id="instagram"
            className="form-input"
            value={contactInfo.instagram}
            onChange={(e) => handleChange('instagram', e.target.value)}
            placeholder={language === 'ru' ? 'colorlab.lv или https://instagram.com/colorlab.lv' : 'colorlab.lv vai https://instagram.com/colorlab.lv'}
          />
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginTop: '6px',
            fontStyle: 'italic',
          }}>
            {language === 'ru' 
              ? 'Можно указать username или полную ссылку' 
              : 'Varat norādīt lietotājvārdu vai pilnu saiti'}
          </div>
        </div>

        {/* Показывать на странице бронирования */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={contactInfo.showInBooking}
              onChange={(e) => handleChange('showInBooking', e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
              }}
            />
            <div>
              <div style={{ 
                fontWeight: '600', 
                color: '#1e40af',
                fontSize: '15px',
                marginBottom: '4px',
              }}>
                {language === 'ru' ? 'Показывать на странице бронирования' : 'Rādīt rezervācijas lapā'}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#3b82f6',
              }}>
                {language === 'ru' 
                  ? 'Контактная информация будет отображаться внизу страницы для клиентов' 
                  : 'Kontaktinformācija tiks parādīta lapas apakšā klientiem'}
              </div>
            </div>
          </label>
        </div>

        {/* Кнопка сохранения */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
            }}
          >
            {isSaving 
              ? (language === 'ru' ? 'Сохранение...' : 'Saglabā...') 
              : (language === 'ru' ? '💾 Сохранить' : '💾 Saglabāt')}
          </button>

          {saveMessage && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: saveMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: saveMessage.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${saveMessage.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
            }}>
              {saveMessage.type === 'success' ? '✅' : '❌'} {saveMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* Превью */}
      {contactInfo.showInBooking && (contactInfo.address || contactInfo.phone || contactInfo.email || contactInfo.instagram) && (
        <div style={{ 
          marginTop: '40px',
          paddingTop: '32px',
          borderTop: '2px solid #e5e7eb',
        }}>
          <h3 style={{ 
            marginBottom: '16px', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#6b7280',
          }}>
            {language === 'ru' ? 'Превью на странице бронирования:' : 'Priekšskatījums rezervācijas lapā:'}
          </h3>
          
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {language === 'ru' ? 'Контакты' : 'Kontakti'}
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280',
            }}>
              {contactInfo.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📍</span>
                  <span>{contactInfo.address}</span>
                </div>
              )}
              {contactInfo.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📞</span>
                  <a href={`tel:${contactInfo.phone}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              {contactInfo.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📧</span>
                  <a href={`mailto:${contactInfo.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.instagram && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📷</span>
                  <a 
                    href={contactInfo.instagram.startsWith('http') ? contactInfo.instagram : `https://instagram.com/${contactInfo.instagram.replace('@', '')}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6', textDecoration: 'none' }}
                  >
                    @{contactInfo.instagram.replace('@', '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
