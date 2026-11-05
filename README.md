# 🏍️ MotoFix Pro — Sistema Integral de Gestión para Talleres de Motocicletas

![React](https://img.shields.io/badge/React-19.2-blue?logo=react&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-v13-FFCA28?logo=firebase&style=flat-square)
![Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)

**MotoFix Pro** es una solución web profesional, moderna y de alto rendimiento diseñada específicamente para talleres mecánicos de motocicletas, centros de servicio técnico y almacenes de repuestos.

Construida con **React 19**, **Vite**, **Tailwind CSS v4** y sincronización reactiva en la nube mediante **Firebase Realtime Database & Authentication**, con persistencia local (_offline-first_). Presenta una interfaz oscura industrial con acentos neón ámbar (_Dark Industrial & Amber Neon_), optimizada tanto para computadores de escritorio como para tabletas y dispositivos móviles en el taller.

---

## ✨ Características y Módulos Principales

### 1. 📊 Dashboard General & Métricas en Vivo (`/dashboard`)

- **8 Tarjetas KPI en Tiempo Real**:
  - 🔧 **Órdenes Activas**: Cantidad actual de motocicletas en reparación o diagnóstico.
  - 💵 **Ingresos de Hoy**: Facturación generada en la fecha actual (órdenes cobradas + ventas directas).
  - 📅 **Ingresos de la Semana**: Recaudo acumulado en los últimos 7 días.
  - ⚠️ **Alertas de Stock**: Repuestos que se encuentran en o por debajo de su stock mínimo.
  - 📈 **Ingresos del Mes**: Facturación acumulada durante el mes calendario en curso.
  - 💰 **Facturación Total Histórica**: Total de ventas acumuladas registradas en el sistema.
  - 🛒 **Ventas Mostrador Hoy**: Ventas rápidas de repuestos directos realizadas en el día.
  - 🏆 **Mecánico Estrella**: Técnico con mayor volumen de órdenes y servicios asignados.
- **Gráfica Interactiva de Estados**: Visualización tipo dona (_Doughnut Chart_) con Chart.js para seguimiento visual de motos en recepción, diagnóstico, reparación y listas para entrega.
- **Feed de Actividad Reciente**: Registro de últimos movimientos y órdenes registradas en el taller.
- **Tabla Rápida de Órdenes & Monitor de Repuestos Críticos**.

---

### 2. 📈 Reportes & Estadísticas por Período (`/reports`) _(Nuevo)_

- **Filtros Temporales Inteligentes**:
  - Accesos rápidos de un clic: _Hoy_, _Ayer_, _Últimos 7 días_, _Últimos 30 días_, _Este mes_ y _Mes anterior_.
  - Rango de fechas personalizado (_Desde_ — _Hasta_).
- **8 KPIs Analíticos del Período**:
  - Ingresos Totales filtrados.
  - Facturación por Órdenes de Taller vs. Ventas Directas de Mostrador.
  - Desglose de ingresos por Mano de Obra y Repuestos.
  - Distribución por Métodos de Pago (Efectivo, Nequi / Transferencias, Tarjetas).
- **Rankings Top 5**:
  - 🥇 **Top Repuestos Más Vendidos**: Gráfico de barras porcentuales con unidades despachadas.
  - 🥇 **Top Servicios Más Solicitados**: Servicios técnicos con mayor demanda.
- **Exportación & Auditoría**:
  - 📥 **Exportar a Excel (CSV)**: Descarga directa del balance completo con fórmulas de subtotales compatibles con Microsoft Excel.
  - 🖨️ **Impresión / Exportar a PDF**: Generación de informe imprimible con diseño ejecutivo.
  - Auditoría detallada de órdenes y ventas del período con cliente, placa, ítems y recaudo.

---

### 3. 🔧 Gestión de Órdenes de Trabajo (`/orders`)

- **Notificaciones por WhatsApp al Cliente**:
  - 📲 **Botón de WhatsApp en Cada Orden**: Notifica con 1 clic al cliente sobre el estado de su vehículo sin necesidad de agregarlo a contactos.
  - 💬 **Mensajes Dinámicos e Inteligentes**:
    - **Lista para Entrega**: Avisa que la moto está lista, informa el total exacto a pagar e invita a recogerla.
    - **En Reparación / Diagnóstico**: Notifica el avance técnico y presupuesto estimado.
    - **Recepción**: Confirma el ingreso del vehículo y el número de orden de trabajo asignado.
  - Alerta interactiva al cambiar el estado a "Lista para Entrega" sugiriendo enviar el WhatsApp de inmediato.
- **Control de Flujo de Taller**:
  - Estados: `Recibida` ➔ `En Diagnóstico` ➔ `En Reparación` ➔ `Lista para Entrega` ➔ `Entregada`.
  - **Cambio de Estado Rápido**: Selector en línea directo en cada fila de la tabla sin necesidad de abrir modales.
  - Filtros por estado y buscador en tiempo real por número de orden, placa de la moto o nombre del cliente.
- **Recepción Completa de Vehículo (Modal Nueva Orden)**:
  - Registro de cliente (Cédula, Nombre, Teléfono) y vinculación de motocicleta (Placa, Marca, Modelo, Kilometraje, Nivel de Combustible).
  - **Checklist Físico de Recepción**: Inspección de casco, espejos, rayones, luces y nivel de aceite.
  - Asignación de mecánico responsable con acceso directo para crear técnicos al instante.
  - **Buscador Predictivo con Autocomplete**: Búsqueda instantánea de repuestos y servicios del inventario con visualización de precio, categoría y disponibilidad en stock (con alertas visuales en verde, amarillo y rojo).
  - Guardado atómico consistente (`saveFullOrder`) para garantizar integridad total de clientes, vehículos y órdenes en Firebase.

---

### 4. 💳 Punto de Venta & Cobro POS (`/pos`)

- **Módulo 1: Cobro de Órdenes de Trabajo**:
  - Selección de órdenes activas o listas para liquidación.
  - Desglose transparente de mano de obra y repuestos utilizados.
  - Múltiples medios de pago: Efectivo (con cálculo automático de cambio / devuelta), Transferencia (Nequi / Bancolombia) y Tarjeta de Crédito/Débito.
  - Descargo automático de repuestos del inventario al finalizar y cobrar la orden.
  - Generación e impresión de ticket térmico formateado para impresoras de 58mm y 80mm.
- **Módulo 2: Venta Directa de Mostrador**:
  - Carrito de compras rápido para clientes que solo adquieren repuestos o insumos.
  - Buscador predictivo de repuestos optimizado para catálogos masivos.
  - Control de existencias (bloqueo automático si el ítem no tiene stock disponible).
  - Emisión instantánea de comprobante de venta térmica.

---

### 5. 📦 Historial de Transacciones (`/history`)

- **Pestaña de Órdenes Entregadas & Cobradas**: Consulta histórica con detalle de cliente, placa, fecha, total, botón de contacto post-venta vía WhatsApp y reimpresión de comprobante.
- **Pestaña de Ventas Directas**: Registro de comprobantes de mostrador con opción de **Anulación de Venta** (reintegra automáticamente el stock de los repuestos y ajusta las finanzas del taller).

---

### 6. 👨‍🔧 Gestión de Personal Técnico (`/mechanics`)

- Registro de mecánicos con datos de contacto, especialidad técnica (Motor, Electricidad, Inyección Electrónica, Frenos, Suspensión, etc.) y estado activo/inactivo.
- Control de órdenes y servicios asignados a cada técnico.

---

### 7. 📦 Inventario & Tarifario de Servicios (`/inventory`)

- **Catálogo de Repuestos**: Código de referencia, descripción, categoría, cantidad en stock, umbral de stock mínimo de alerta, precio de costo y precio de venta al público.
- **Tarifario de Mano de Obra**: Catálogo estandarizado de servicios mecánicos y mano de obra con precios predefinidos.
- Búsqueda, ordenamiento y filtros por categoría o estado de inventario.

---

### 8. 🛵 Directorio de Clientes & Hojas de Vida (`/clients`)

- Base de datos unificada de propietarios con sus vehículos asociados.
- **Hoja de Vida por Placa**: Historial cronológico de todas las intervenciones, reparaciones, repuestos instalados y kilometrajes registrados de cada motocicleta que ha ingresado al taller.

---

### 9. ⚙️ Configuración, Respaldos & Exportaciones (`/settings`)

- Configuración de datos del negocio (Razón Social / Nombre del Taller, NIT / RUT, Teléfono, Dirección, Moneda y Mensaje de pie de ticket).
- **Centro de Exportación a Excel (CSV)**: Panel centralizado para descargar informes y bases de datos con codificación UTF-8 compatible con Microsoft Excel:
  - 📦 **Inventario de Repuestos**: Stock actual, mínimo, costo, venta y valoración de almacén.
  - 🛠️ **Tarifario de Servicios**: Mano de obra estándar y precios.
  - 🔧 **Todas las Órdenes de Trabajo**: Registro de órdenes activas y finalizadas con clientes, placas y presupuestos.
  - 🛒 **Ventas de Mostrador**: Historial de comprobantes de venta directa.
  - 👥 **Directorio de Clientes**: Base de datos de clientes, teléfonos, emails y motos vinculadas.
- **Copias de Seguridad (Backup & Restore)**:
  - Exportación completa de la base de datos a formato JSON.
  - Restauración e importación de copias de seguridad desde archivo JSON.
  - Opción de carga de datos demo para pruebas.

---

## 🛠️ Stack Tecnológico

| Capa                         | Tecnología                                 | Descripción                                                                                 |
| :--------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------ |
| **Frontend Core**            | React 19.2 + Vite 7.2                      | SPA modular de última generación con alto rendimiento y Fast Refresh.                       |
| **Estilos & UI**             | Tailwind CSS v4                            | Arquitectura de estilos con variables nativas, tema oscuro industrial y acentos neón ámbar. |
| **Enrutamiento**             | React Router DOM v7                        | Enrutador client-side protegido con layouts anidados.                                       |
| **Base de Datos**            | Firebase Realtime Database v13             | Sincronización en la nube bidireccional en tiempo real bajo la raíz `taller_data`.          |
| **Autenticación**            | Firebase Authentication v13                | Inicio de sesión seguro con control de sesión activo.                                       |
| **Persistencia**             | LocalStorage Fallback                      | Respaldo y disponibilidad sin conexión o ante cortes de red.                                |
| **Gráficos**                 | Chart.js                                   | Visualizaciones analíticas y estadísticas reactivas.                                        |
| **Iconografía & Tipografía** | FontAwesome 6 + Outfit / Plus Jakarta Sans | Iconos vectoriales e interfaz legible de alta fidelidad.                                    |

---

## 📂 Estructura del Proyecto

```text
src/
├── components/
│   ├── auth/            # Rutas protegidas y pantallas de autenticación
│   ├── clients/         # Módulo de clientes y modal de hoja de vida vehicular
│   ├── common/          # Componentes reutilizables (PlateBadge, StatusBadge, etc.)
│   ├── dashboard/       # Dashboard principal, KPI cards, gráficas y activity feed
│   ├── history/         # Historial de motos entregadas y ventas de mostrador
│   ├── inventory/       # Gestión de repuestos, stock y tarifario de servicios
│   ├── layout/          # Topbar interactivo, Sidebar responsive y contenedor principal
│   ├── mechanics/       # Gestión de mecánicos y personal técnico
│   ├── modals/          # Modal de nueva orden (con autocomplete) y detalle de orden
│   ├── pos/             # Punto de venta (cobro de órdenes y venta directa)
│   ├── print/           # Plantillas e impresión de tickets térmicos (58mm / 80mm)
│   ├── reports/         # Módulo de reportes, métricas y filtros por período
│   └── settings/        # Configuración del taller, copias de seguridad y backups
├── context/
│   ├── AuthContext.jsx  # Sesión de usuario con Firebase Auth
│   ├── DataContext.jsx  # Estado global, Firebase Realtime DB, saveFullOrder y métricas
│   ├── ModalContext.jsx # Controlador global de ventanas modales
│   └── ToastContext.jsx # Notificaciones toast flotantes
├── firebase/
│   └── config.js        # Inicialización de Firebase SDK
├── pages/
│   └── LoginPage.jsx    # Pantalla de acceso al sistema
├── utils/
│   └── formatters.js    # Utilidades de moneda, fechas y formateo
├── App.jsx              # Definición de rutas del sistema
└── main.jsx             # Punto de entrada de la aplicación
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos

- **Node.js** (v18.0 o superior recomendado)
- **npm** o **pnpm** / **yarn**

### Pasos

1. **Clonar o ingresar al directorio del proyecto**:

   ```bash
   cd "e:\Development\MotoFix System"
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:

   ```bash
   npm run dev
   ```

   Abre tu navegador en `http://localhost:5173`.

4. **Compilar para producción**:

   ```bash
   npm run build
   ```

   Genera la carpeta `dist/` optimizada para despliegue en cualquier hosting estático (Vercel, Netlify, Firebase Hosting, GitHub Pages).

5. **Previsualizar la compilación de producción**:
   ```bash
   npm run preview
   ```

---

## 🔒 Configuración de Firebase

La aplicación incluye la integración configurada en `src/firebase/config.js`:

- **Auth**: Registro e inicio de sesión seguro por correo y contraseña.
- **Realtime Database**: Sincronización en vivo reactiva en `taller_data`.
- **Modo Offline**: Si la conexión no responde o no hay sesión iniciada, el sistema utiliza el almacenamiento local de respaldo para que la operación del taller nunca se detenga.

---

## 📱 Experiencia Responsive

- **Diseño Mobile-First**: Cajón lateral (_Drawer_) deslizante con desenfoque de fondo y botón de acceso rápido para crear órdenes en pantalla táctil.
- **Topbar Unificado**: Títulos adaptativos, botón fijo `+ Nueva Orden` que nunca se rompe de línea y acceso rápido a perfil/cierre de sesión.
- **Tablas con Desplazamiento Horizontal Suave**: Visualización completa de columnas tanto en teléfonos como en monitores ultra-anchos.

---

## 📄 Licencia

Desarrollado para la gestión profesional de talleres mecánicos y distribución de repuestos de motocicletas. Todos los derechos reservados a la agencia de Desarrollo de Software ArkTech Labs.
