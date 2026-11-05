/**
 * MotoFix Pro - WhatsApp Integration Utility
 * Genera enlaces y mensajes dinámicos para notificar a clientes del taller vía WhatsApp.
 */

import { formatMoney } from './formatters';

/**
 * Normaliza y formatea el número de teléfono para WhatsApp.
 * Si tiene 10 dígitos (ej. celular Colombia 3001234567), antepone '57'.
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return '';
  // Quita espacios, guiones, paréntesis y signos +
  const clean = phone.toString().replace(/\D/g, '');
  if (!clean) return '';

  // Si tiene 10 dígitos y empieza por 3 (estándar móvil Colombia), anteponer 57
  if (clean.length === 10 && clean.startsWith('3')) {
    return `57${clean}`;
  }

  // Si tiene 7 u 8 dígitos (fijo local), anteponer indicativo por defecto si aplica
  if (clean.length <= 8) {
    return `57${clean}`;
  }

  return clean;
}

/**
 * Construye el mensaje según el estado actual de la orden de trabajo.
 */
export function buildWhatsAppMessage({ order, client, vehicle, settings }) {
  const shopName = settings?.name || 'MotoFix Pro';
  const clientName = client?.name || 'Estimado(a) Cliente';
  const plate = vehicle?.plate ? vehicle.plate.toUpperCase() : 'Tu motocicleta';
  const moto = vehicle?.brand ? `${vehicle.brand} ${vehicle.model || ''}`.trim() : '';
  const total = formatMoney(order?.totalAmount || 0, settings?.currency || '$');
  const orderNum = order?.orderNumber ? `#${order.orderNumber}` : '';

  switch (order?.status) {
    case 'lista':
      return (
        `🏍️ *¡Hola, ${clientName}!* 👋\n\n` +
        `Te saludamos de *${shopName}*. Te informamos con gusto que tu moto *${moto}* (Placa: *${plate}*) ya se encuentra *LISTA PARA ENTREGA* y con prueba de ruta satisfactoria ✅.\n\n` +
        `📋 *Orden:* ${orderNum}\n` +
        `💰 *Total a cancelar:* *${total}*\n\n` +
        `📍 Ya puedes pasar a recogerla en nuestras instalaciones. ¡Te esperamos!`
      );

    case 'reparacion':
      return (
        `🏍️ *¡Hola, ${clientName}!* 👋\n\n` +
        `Te escribimos de *${shopName}* para informarte que tu moto *${moto}* (Placa: *${plate}*) se encuentra actualmente *EN REPARACIÓN* 🔧 por parte de nuestro equipo técnico.\n\n` +
        `📋 *Orden:* ${orderNum}\n` +
        `💰 *Presupuesto estimado:* ${total}\n\n` +
        `Te notificaremos tan pronto esté completamente lista para entrega.`
      );

    case 'diagnostico':
      return (
        `🏍️ *¡Hola, ${clientName}!* 👋\n\n` +
        `Te informamos de *${shopName}* que tu moto *${moto}* (Placa: *${plate}*) se encuentra en proceso de *REVISIÓN Y DIAGNÓSTICO* 🔍.\n\n` +
        `📋 *Orden:* ${orderNum}\n\n` +
        `Estamos revisando el estado del vehículo para garantizarte el mejor servicio.`
      );

    case 'entregada':
      return (
        `🏍️ *¡Hola, ${clientName}!* 👋\n\n` +
        `Muchas gracias por confiar tu moto *${moto}* (Placa: *${plate}*) en *${shopName}* 🤝.\n\n` +
        `La Orden ${orderNum} ha sido finalizada y entregada con éxito. Esperamos que disfrutes de tu viaje. ¡Cualquier inquietud estamos a tu orden!`
      );

    case 'recibida':
    default:
      return (
        `🏍️ *¡Hola, ${clientName}!* 👋\n\n` +
        `Te confirmamos que tu motocicleta *${moto}* (Placa: *${plate}*) ha sido recibida en *${shopName}* bajo la Orden de Trabajo *${orderNum}* 📋.\n\n` +
        `Te mantendremos al tanto de cualquier novedad o avance. ¡Gracias por tu confianza!`
      );
  }
}

/**
 * Genera el enlace de WhatsApp listo para abrir y enviar.
 */
export function getWhatsAppOrderData({ order, client, vehicle, settings }) {
  const phone = formatWhatsAppPhone(client?.phone);
  const text = buildWhatsAppMessage({ order, client, vehicle, settings });
  const hasPhone = Boolean(phone);
  const url = hasPhone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
    : '';

  return { phone, text, hasPhone, url };
}

/**
 * Dispara la apertura directa de WhatsApp en una pestaña nueva.
 */
export function sendOrderWhatsApp({ order, client, vehicle, settings, onNoPhone }) {
  const { url, hasPhone } = getWhatsAppOrderData({ order, client, vehicle, settings });

  if (!hasPhone) {
    if (onNoPhone) onNoPhone();
    return false;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Genera y envía un mensaje persuasivo de invitación / recordatorio de mantenimiento
 * a un cliente registrado en el taller.
 */
export function sendMaintenanceInvitationWhatsApp({ client, vehicles = [], settings, onNoPhone }) {
  const phone = formatWhatsAppPhone(client?.phone);
  if (!phone) {
    if (onNoPhone) onNoPhone();
    return false;
  }

  const shopName = settings?.name || 'MotoFix Pro';
  const clientName = client?.name ? client.name.split(' ')[0] : 'amigo(a)';

  // Lista de motos del cliente
  const clientVehicles = (vehicles || []).filter((v) => v.clientId === client.id);
  const motosList = clientVehicles
    .map((v) => `${v.brand || ''} ${v.model || ''}${v.plate ? ` (${v.plate.toUpperCase()})` : ''}`.trim())
    .filter(Boolean)
    .join(', ');

  const motoMention = motosList ? `para tu moto *${motosList}*` : 'para tu motocicleta';

  const message =
    `🏍️ *¡Hola, ${clientName}!* 👋\n\n` +
    `Te saludamos de *${shopName}*. Esperamos que todo marche excelente en carretera.\n\n` +
    `Queremos recordarte que realizar un mantenimiento preventivo a tiempo ${motoMention} es clave para tu seguridad y el óptimo rendimiento de tu vehículo.\n\n` +
    `🛠️ *Servicios disponibles en nuestro taller:* \n` +
    `• Mantenimiento preventivo y correctivo\n` +
    `• Sincronización e inyección electrónica\n` +
    `• Frenos, suspensión y kit de arrastre\n` +
    `• Cambio de aceite y revisión general\n\n` +
    `📍 ¡Tráela a nuestras instalaciones y con gusto la dejamos al 100%! ¿En qué te podemos colaborar hoy? 🏍️💨`;

  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}


