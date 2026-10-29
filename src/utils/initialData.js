export const DEFAULT_SETTINGS = {
  name: 'MotoFix Pro - Taller & Repuestos',
  nit: '900.854.120-4',
  phone: '+57 300 456 7890',
  address: 'Av. Principal #45-12, Sector Taller',
  currency: '$',
  invoiceFooter: '¡Gracias por confiar en MotoFix Pro! Garantía de 30 días en mano de obra.'
};

export const DEFAULT_MECHANICS = [
  { id: 'm1', name: 'Carlos Mecánico', phone: '310 111 2233', specialty: 'Motor y Transmisión' },
  { id: 'm2', name: 'Andrés Técnico', phone: '315 444 5566', specialty: 'Electricidad e Inyección' },
  { id: 'm3', name: 'Taller General', phone: '-', specialty: 'Mantenimiento Básico' }
];

export const DEFAULT_INVENTORY = [
  { id: 'p1', code: 'ACE-4T-10W40', name: 'Aceite Semi-Sintético 4T 10W-40 (1L)', category: 'Lubricantes', stock: 18, minStock: 5, costPrice: 22000, sellPrice: 35000 },
  { id: 'p2', code: 'PAS-FRE-DEL', name: 'Pastillas de Freno Delanteras Sinterizadas', category: 'Frenos', stock: 8, minStock: 3, costPrice: 18000, sellPrice: 32000 },
  { id: 'p3', code: 'KIT-ARR-428', name: 'Kit de Arrastre Reforzado 428H', category: 'Transmisión', stock: 3, minStock: 4, costPrice: 65000, sellPrice: 98000 },
  { id: 'p4', code: 'BUJ-NGK-CPR8', name: 'Bujía NGK CPR8EA-9', category: 'Encendido', stock: 25, minStock: 6, costPrice: 9000, sellPrice: 16000 },
  { id: 'p5', code: 'FIL-AIR-NS200', name: 'Filtro de Aire Pulsar NS200', category: 'Filtros', stock: 2, minStock: 4, costPrice: 15000, sellPrice: 28000 },
  { id: 'p6', code: 'LLA-DEL-9090', name: 'Pneu / Llanta 90/90-17 Sellomatic', category: 'Llantas', stock: 4, minStock: 2, costPrice: 95000, sellPrice: 145000 },
  { id: 'p7', code: 'GUA-EMB-GEN', name: 'Guaya de Embrague Universal', category: 'Guayas', stock: 12, minStock: 5, costPrice: 6000, sellPrice: 14000 }
];

export const DEFAULT_SERVICES = [
  { id: 's1', name: 'Mantenimiento General Preventivo', description: 'Revisión de frenos, guayas, ajuste de cadena, limpieza de filtro y escaneo general', price: 65000 },
  { id: 's2', name: 'Cambio de Aceite y Filtro', description: 'Mano de obra para cambio de lubricante y filtro', price: 15000 },
  { id: 's3', name: 'Sincronización de Inyección/Carburación', description: 'Limpieza de cuerpo de aceleración / carburador y ajuste de ralentí', price: 50000 },
  { id: 's4', name: 'Cambio de Kit de Arrastre', description: 'Desmontaje y montaje de piñón, catalina y cadena nueva', price: 35000 },
  { id: 's5', name: 'Cambio de Pastillas / Bandas de Freno', description: 'Limpieza de mordaza y cambio de pastillas delanteras o traseras', price: 18000 },
  { id: 's6', name: 'Montaje y Balanceo de Llanta', description: 'Cambio de neumático / sello sellomatic', price: 20000 }
];

export const DEFAULT_CLIENTS = [
  { id: 'c1', name: 'Juan Carlos Pérez', phone: '310 987 6543', document: '1020456789', email: 'juan.perez@gmail.com' },
  { id: 'c2', name: 'María Fernanda Gómez', phone: '315 456 1234', document: '52890123', email: 'mafe.gomez@hotmail.com' },
  { id: 'c3', name: 'Roberto Silva', phone: '320 112 3344', document: '80123456', email: 'roberto.silva@yahoo.com' }
];

export const DEFAULT_VEHICLES = [
  { id: 'v1', clientId: 'c1', plate: 'XYZ-78E', brand: 'Yamaha', model: 'FZ 250', cylinder: '250 cc', year: '2022', color: 'Azul Mate', km: 18450, fuelLevel: '1/2' },
  { id: 'v2', clientId: 'c2', plate: 'ABC-12F', brand: 'Bajaj', model: 'Pulsar NS 200', cylinder: '200 cc', year: '2021', color: 'Negro Rojo', km: 24100, fuelLevel: '3/4' },
  { id: 'v3', clientId: 'c3', plate: 'MOT-99G', brand: 'Honda', model: 'XR 150L', cylinder: '150 cc', year: '2023', color: 'Blanco', km: 8900, fuelLevel: 'Reserva' }
];

export const DEFAULT_WORK_ORDERS = [
  {
    id: 'ot-1001',
    orderNumber: 1001,
    vehicleId: 'v1',
    clientId: 'c1',
    mechanicName: 'Carlos Mecánico',
    status: 'reparacion',
    entryDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    deliveryDate: new Date(Date.now() + 86400000).toISOString(),
    issueDescription: 'El cliente reporta ruido en el kit de arrastre y freno delantero chillando.',
    visualCheck: { casco: true, espejos: true, rayones: true, luces: true, aceiteOk: true },
    items: [
      { type: 'part', id: 'p3', name: 'Kit de Arrastre Reforzado 428H', qty: 1, price: 98000 },
      { type: 'part', id: 'p2', name: 'Pastillas de Freno Delanteras Sinterizadas', qty: 1, price: 32000 },
      { type: 'service', id: 's4', name: 'Cambio de Kit de Arrastre', qty: 1, price: 35000 }
    ],
    totalAmount: 165000,
    paymentMethod: 'Efectivo',
    isPaid: false
  },
  {
    id: 'ot-1002',
    orderNumber: 1002,
    vehicleId: 'v2',
    clientId: 'c2',
    mechanicName: 'Andrés Técnico',
    status: 'lista',
    entryDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    deliveryDate: new Date().toISOString(),
    issueDescription: 'Mantenimiento preventivo de los 24.000 km y cambio de aceite.',
    visualCheck: { casco: false, espejos: true, rayones: false, luces: true, aceiteOk: false },
    items: [
      { type: 'part', id: 'p1', name: 'Aceite Semi-Sintético 4T 10W-40 (1L)', qty: 2, price: 35000 },
      { type: 'service', id: 's1', name: 'Mantenimiento General Preventivo', qty: 1, price: 65000 }
    ],
    totalAmount: 135000,
    paymentMethod: 'Nequi / Transferencia',
    isPaid: false
  },
  {
    id: 'ot-1003',
    orderNumber: 1003,
    vehicleId: 'v3',
    clientId: 'c3',
    mechanicName: 'Carlos Mecánico',
    status: 'entregada',
    entryDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    deliveryDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    issueDescription: 'Sincronización de carburador y cambio de bujía.',
    visualCheck: { casco: true, espejos: true, rayones: false, luces: true, aceiteOk: true },
    items: [
      { type: 'part', id: 'p4', name: 'Bujía NGK CPR8EA-9', qty: 1, price: 16000 },
      { type: 'service', id: 's3', name: 'Sincronización de Inyección/Carburación', qty: 1, price: 50000 }
    ],
    totalAmount: 66000,
    paymentMethod: 'Efectivo',
    isPaid: true
  }
];

export const INITIAL_DATA = {
  settings: DEFAULT_SETTINGS,
  mechanics: DEFAULT_MECHANICS,
  inventory: DEFAULT_INVENTORY,
  services: DEFAULT_SERVICES,
  clients: DEFAULT_CLIENTS,
  vehicles: DEFAULT_VEHICLES,
  workOrders: DEFAULT_WORK_ORDERS,
  sales: []
};

