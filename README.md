# MotoFix Pro - Sistema de Gestión para Taller de Motocicletas (React.js)

Sistema integral de gestión para talleres de motocicletas y venta de repuestos, migrado y desarrollado en **React.js + Vite** con sincronización en tiempo real vía **Firebase (Authentication & Realtime Database)** y persistencia offline con LocalStorage.

---

## 🚀 Características Principales

### 1. 📊 Dashboard del Taller
- **Métricas KPI en tiempo real**: Órdenes Activas, Listas para Entrega, Ingresos Totales, y Alertas de Bajo Stock.
- **Gráfica de Órdenes por Estado**: Visualización dinámica de motocicletas en recepción, diagnóstico, reparación, listas y entregadas con Chart.js.
- **Alertas de Repuestos**: Monitoreo automático de piezas que han alcanzado o bajado de su stock mínimo.
- **Motocicletas en Taller**: Listado rápido de motos activas con acceso directo a ver detalle y cambiar estado.

### 2. 🔧 Órdenes Activas de Trabajo
- Filtro por estado (`Recibida`, `En Diagnóstico`, `En Reparación`, `Lista para Entrega`).
- Búsqueda en tiempo real por placa, cliente o número de orden.
- **Recepción completa de vehículo**:
  - Datos de cliente (Cédula, Nombre, Teléfono).
  - Datos de motocicleta (Placa, Marca/Modelo, Kilometraje, Nivel de Gasolina).
  - Asignación de mecánico con botón rápido para agregar nuevos técnicos.
  - Checklist visual de recepción (Casco, Espejos, Rayones/Golpes, Luces, Nivel de Aceite).
  - Asignación dinámica de repuestos y servicios de mano de obra con cálculo instantáneo de presupuesto.

### 3. 💳 Punto de Venta & Cobro (POS)
- **Modo 1: Cobrar Orden de Taller**:
  - Selección de órdenes listas para entrega.
  - Resumen detallado de ítems y presupuesto.
  - Métodos de pago: Efectivo, Nequi / Transferencia Bancaria, Tarjeta Débito / Crédito.
  - Cálculo automático de cambio / devuelta en efectivo.
  - Descuento automático de inventario al entregar y cobrar.
  - Generación e impresión de ticket/factura térmica.
- **Modo 2: Venta Directa de Mostrador**:
  - Carrito de venta rápida de repuestos para clientes de mostrador.
  - Control de stock disponible.
  - Impresión de ticket de venta directa.

### 4. 📦 Historial de Transacciones
- Pestaña de **Motos Entregadas & Cobradas** con reimpresión de comprobante.
- Pestaña de **Ventas Directas de Mostrador** con reimpresión y opción de **Anulación de Venta** (reintegra automáticamente los repuestos al inventario y ajusta las finanzas).

### 5. 👨‍🔧 Gestión de Mecánicos
- Registro, edición y eliminación de personal técnico y especialistas (Motor, Electricidad, Inyección, etc.).

### 6. 📦 Inventario & Tarifario de Servicios
- **Repuestos & Insumos**: Código de referencia, nombre, categoría, stock actual, stock mínimo para alertas, precio costo y precio venta.
- **Mano de Obra / Servicios**: Tarifario estándar de mano de obra con descripción y precio.

### 7. 🛵 Clientes & Hojas de Vida de Motos
- Base de datos de clientes con sus vehículos vinculados.
- **Hoja de Vida por Placa**: Historial completo y cronológico de todos los servicios y reparaciones realizadas a la motocicleta.

### 8. ⚙️ Configuración & Copias de Seguridad
- Personalización de datos del taller (Nombre, NIT, Teléfono, Moneda, Dirección, Mensaje de pie de ticket).
- **Exportación de Backup en JSON**.
- **Importación y restauración de Backup en JSON**.
- Botón de restablecimiento de datos demo iniciales.

---

## 🔒 Firebase y Conexión
La aplicación viene preconfigurada con las credenciales de Firebase en `src/firebase/config.js`:
- **Firebase Auth**: Registro e inicio de sesión de usuarios por email/contraseña.
- **Firebase Realtime Database**: Sincronización bidireccional y reactiva en tiempo real bajo la ruta `taller_data`.
- **LocalStorage Fallback**: Si la conexión no está disponible o mientras se inicia sesión, los datos se conservan localmente.

---

## 🛠️ Tecnologías Utilizadas
- **React 19**
- **Vite**
- **Firebase SDK v13 (Modular)**
- **Chart.js**
- **FontAwesome 6**
- **Google Fonts (Outfit & Plus Jakarta Sans)**

---

## 💻 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación
npm run preview
```

