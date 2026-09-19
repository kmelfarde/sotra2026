import { getSupportSettings } from './storeSettings';

export interface WhatsAppSupportOptions {
  name?: string;
  orderId?: string;
  type?: string;
  details?: string;
  isArabic?: boolean;
  phone?: string;
}

export function buildWhatsAppSupportUrl(options: WhatsAppSupportOptions = {}): string {
  const {
    name = '',
    orderId = '',
    type = '',
    details = '',
    isArabic = true,
    phone
  } = options;

  const currentSupport = getSupportSettings();
  const rawPhone = phone || currentSupport.whatsappPhone || '201068989523';
  const cleanPhone = rawPhone.replace(/\D/g, '');

  let message = '';

  if (isArabic) {
    message = 'مرحباً، أود التواصل مع خدمة عملاء متجر سوترا (SOTRA).';
    if (type) {
      message += `\n- نوع الاستفسار: ${type}`;
    }
    if (name) {
      message += `\n- الاسم: ${name}`;
    }
    if (orderId) {
      message += `\n- رقم الطلب: #${orderId}`;
    }
    if (details) {
      message += `\n- التفاصيل: ${details}`;
    }
  } else {
    message = 'Hello, I would like to contact SOTRA customer support.';
    if (type) {
      message += `\n- Inquiry Type: ${type}`;
    }
    if (name) {
      message += `\n- Name: ${name}`;
    }
    if (orderId) {
      message += `\n- Order ID: #${orderId}`;
    }
    if (details) {
      message += `\n- Details: ${details}`;
    }
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
