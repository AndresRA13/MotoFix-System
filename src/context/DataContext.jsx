import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { INITIAL_DATA, DEFAULT_SETTINGS, DEFAULT_MECHANICS } from '../utils/initialData';

const STORAGE_KEY = 'motofix_pro_db_v1';
const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleanArray = (arr) => (Array.isArray(arr) ? arr.filter(Boolean) : []);
        if (!parsed.mechanics || parsed.mechanics.length === 0) parsed.mechanics = DEFAULT_MECHANICS;
        if (!parsed.sales) parsed.sales = [];
        parsed.workOrders = cleanArray(parsed.workOrders);
        parsed.inventory = cleanArray(parsed.inventory);
        parsed.services = cleanArray(parsed.services);
        parsed.clients = cleanArray(parsed.clients);
        parsed.vehicles = cleanArray(parsed.vehicles);
        parsed.sales = cleanArray(parsed.sales);
        return parsed;
      }
    } catch (e) {
      console.error('Error reading localStorage initial data:', e);
    }
    return INITIAL_DATA;
  });

  const isSyncingFromRemoteRef = useRef(false);

  // Sync to localStorage and Firebase Realtime Database
  const commitStore = useCallback(
    (nextData) => {
      setData(nextData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }

      if (db && user && !isSyncingFromRemoteRef.current) {
        try {
          set(ref(db, 'taller_data'), nextData).catch((err) => {
            console.warn('Error saving to Firebase Realtime Database:', err);
          });
        } catch (err) {
          console.warn('Firebase set error:', err);
        }
      }
    },
    [user]
  );

  // Firebase Realtime DB subscription when user is authenticated
  useEffect(() => {
    if (!db || !user) return;

    const dataRef = ref(db, 'taller_data');
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          isSyncingFromRemoteRef.current = true;
          setData((prev) => {
            const cleanArray = (arr) => (Array.isArray(arr) ? arr.filter(Boolean) : []);
            const merged = {
              settings: val.settings || prev.settings || DEFAULT_SETTINGS,
              mechanics: cleanArray(val.mechanics).length > 0 ? cleanArray(val.mechanics) : (prev.mechanics || DEFAULT_MECHANICS),
              inventory: cleanArray(val.inventory || prev.inventory),
              services: cleanArray(val.services || prev.services),
              clients: cleanArray(val.clients || prev.clients),
              vehicles: cleanArray(val.vehicles || prev.vehicles),
              workOrders: cleanArray(val.workOrders || prev.workOrders),
              sales: cleanArray(val.sales || prev.sales)
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
          isSyncingFromRemoteRef.current = false;
        } else {
          // If remote is empty, initialize it with current data
          set(dataRef, data).catch(() => {});
        }
      },
      (error) => {
        console.warn('Firebase RTDB listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Helpers & Actions
  const getSettings = useCallback(() => data.settings || DEFAULT_SETTINGS, [data.settings]);

  const saveSettings = useCallback(
    (newSettings) => {
      const updated = {
        ...data,
        settings: { ...getSettings(), ...newSettings }
      };
      commitStore(updated);
    },
    [data, getSettings, commitStore]
  );

  const getMechanics = useCallback(() => data.mechanics || DEFAULT_MECHANICS, [data.mechanics]);

  const saveMechanic = useCallback(
    (mechanic) => {
      const mechanics = [...(data.mechanics || DEFAULT_MECHANICS)];
      let savedMechanic = { ...mechanic };
      if (!savedMechanic.id) {
        savedMechanic.id = 'm_' + Date.now();
        mechanics.push(savedMechanic);
      } else {
        const idx = mechanics.findIndex((m) => m.id === savedMechanic.id);
        if (idx !== -1) mechanics[idx] = savedMechanic;
        else mechanics.push(savedMechanic);
      }
      commitStore({ ...data, mechanics });
      return savedMechanic;
    },
    [data, commitStore]
  );

  const deleteMechanic = useCallback(
    (id) => {
      const mechanics = (data.mechanics || []).filter((m) => m.id !== id);
      commitStore({ ...data, mechanics });
    },
    [data, commitStore]
  );

  const getInventory = useCallback(() => data.inventory || [], [data.inventory]);

  const savePart = useCallback(
    (part) => {
      const inventory = [...(data.inventory || [])];
      let savedPart = { ...part };
      if (!savedPart.id) {
        savedPart.id = 'p_' + Date.now();
        inventory.unshift(savedPart);
      } else {
        const idx = inventory.findIndex((p) => p.id === savedPart.id);
        if (idx !== -1) inventory[idx] = savedPart;
        else inventory.unshift(savedPart);
      }
      commitStore({ ...data, inventory });
      return savedPart;
    },
    [data, commitStore]
  );

  const deletePart = useCallback(
    (id) => {
      const inventory = (data.inventory || []).filter((p) => p.id !== id);
      commitStore({ ...data, inventory });
    },
    [data, commitStore]
  );

  const getServices = useCallback(() => data.services || [], [data.services]);

  const saveService = useCallback(
    (service) => {
      const services = [...(data.services || [])];
      let savedService = { ...service };
      if (!savedService.id) {
        savedService.id = 's_' + Date.now();
        services.unshift(savedService);
      } else {
        const idx = services.findIndex((s) => s.id === savedService.id);
        if (idx !== -1) services[idx] = savedService;
        else services.unshift(savedService);
      }
      commitStore({ ...data, services });
      return savedService;
    },
    [data, commitStore]
  );

  const deleteService = useCallback(
    (id) => {
      const services = (data.services || []).filter((s) => s.id !== id);
      commitStore({ ...data, services });
    },
    [data, commitStore]
  );

  const getClients = useCallback(() => data.clients || [], [data.clients]);
  const getVehicles = useCallback(() => data.vehicles || [], [data.vehicles]);

  const getClientById = useCallback(
    (id) => (data.clients || []).find((c) => c.id === id),
    [data.clients]
  );

  const getVehicleById = useCallback(
    (id) => (data.vehicles || []).find((v) => v.id === id),
    [data.vehicles]
  );

  const saveClientAndVehicle = useCallback(
    (clientData, vehicleData) => {
      const clients = [...(data.clients || [])];
      const vehicles = [...(data.vehicles || [])];

      let client = clients.find(
        (c) => (clientData.document && c.document === clientData.document) || (clientData.id && c.id === clientData.id)
      );

      if (!client) {
        client = { id: 'c_' + Date.now(), ...clientData };
        clients.push(client);
      } else {
        Object.assign(client, clientData);
      }

      let vehicle = vehicles.find(
        (v) => vehicleData.plate && v.plate.toUpperCase() === vehicleData.plate.toUpperCase()
      );

      if (!vehicle) {
        vehicle = {
          id: 'v_' + Date.now(),
          clientId: client.id,
          ...vehicleData,
          plate: vehicleData.plate.toUpperCase()
        };
        vehicles.push(vehicle);
      } else {
        Object.assign(vehicle, vehicleData);
        vehicle.plate = vehicleData.plate.toUpperCase();
        vehicle.clientId = client.id;
      }

      // NOTE: Does NOT call commitStore — returns updated arrays for atomic saves
      return { client, vehicle, clients, vehicles };
    },
    [data]
  );

  /**
   * Saves client + vehicle + work order in ONE atomic commitStore call,
   * preventing the stale-closure bug where saveWorkOrder would overwrite
   * the clients/vehicles written by saveClientAndVehicle.
   */
  const saveFullOrder = useCallback(
    (clientData, vehicleData, orderData) => {
      // --- Resolve client ---
      const clients = [...(data.clients || [])];
      let client = clients.find(
        (c) =>
          (clientData.document && c.document === clientData.document) ||
          (clientData.id && c.id === clientData.id)
      );
      if (!client) {
        client = { id: 'c_' + Date.now(), ...clientData };
        clients.push(client);
      } else {
        Object.assign(client, clientData);
      }

      // --- Resolve vehicle ---
      const vehicles = [...(data.vehicles || [])];
      let vehicle = vehicles.find(
        (v) => vehicleData.plate && v.plate.toUpperCase() === vehicleData.plate.toUpperCase()
      );
      if (!vehicle) {
        vehicle = {
          id: 'v_' + (Date.now() + 1),
          clientId: client.id,
          ...vehicleData,
          plate: vehicleData.plate.toUpperCase()
        };
        vehicles.push(vehicle);
      } else {
        Object.assign(vehicle, vehicleData);
        vehicle.plate = vehicleData.plate.toUpperCase();
        vehicle.clientId = client.id;
      }

      // --- Resolve work order ---
      const workOrders = [...(data.workOrders || [])];
      let saved = { ...orderData, clientId: client.id, vehicleId: vehicle.id };

      if (!saved.id) {
        const orders = data.workOrders || [];
        const maxNum = orders.length === 0 ? 1000 : Math.max(...orders.map((o) => o.orderNumber || 1000));
        saved.id = 'ot-' + Date.now();
        saved.orderNumber = maxNum + 1;
        saved.entryDate = saved.entryDate || new Date().toISOString();
        saved.status = saved.status || 'recibida';
        saved.isPaid = false;
        workOrders.unshift(saved);
      } else {
        const idx = workOrders.findIndex((o) => o.id === saved.id);
        if (idx !== -1) {
          workOrders[idx] = { ...workOrders[idx], ...saved };
          saved = workOrders[idx];
        } else {
          workOrders.unshift(saved);
        }
      }

      // ONE atomic commit — all collections saved together
      commitStore({ ...data, clients, vehicles, workOrders });
      return saved;
    },
    [data, commitStore]
  );

  const getWorkOrders = useCallback(
    () => (data.workOrders || []).filter(Boolean),
    [data.workOrders]
  );

  const getNextOrderNumber = useCallback(() => {
    const orders = data.workOrders || [];
    if (orders.length === 0) return 1001;
    const maxNum = Math.max(...orders.map((o) => o.orderNumber || 1000));
    return maxNum + 1;
  }, [data.workOrders]);

  const saveWorkOrder = useCallback(
    (orderData) => {
      const workOrders = [...(data.workOrders || [])];
      let saved = { ...orderData };

      if (!saved.id) {
        saved.id = 'ot-' + Date.now();
        saved.orderNumber = getNextOrderNumber();
        saved.entryDate = saved.entryDate || new Date().toISOString();
        saved.status = saved.status || 'recibida';
        saved.isPaid = false;
        workOrders.unshift(saved);
      } else {
        const idx = workOrders.findIndex((o) => o.id === saved.id);
        if (idx !== -1) {
          workOrders[idx] = { ...workOrders[idx], ...saved };
          saved = workOrders[idx];
        } else {
          workOrders.unshift(saved);
        }
      }

      commitStore({ ...data, workOrders });
      return saved;
    },
    [data, getNextOrderNumber, commitStore]
  );

  const updateOrderStatus = useCallback(
    (orderId, newStatus, additionalData = {}) => {
      let updatedOrder = null;
      setData((prevData) => {
        const workOrders = [...(prevData.workOrders || [])];
        const inventory = [...(prevData.inventory || [])];
        const idx = workOrders.findIndex((o) => o.id === orderId);

        if (idx !== -1) {
          const currentOrder = workOrders[idx];
          const isTransitioningToEntregada = newStatus === 'entregada' && currentOrder.status !== 'entregada' && !currentOrder.isPaid;

          const order = { ...currentOrder, status: newStatus };
          if (newStatus === 'entregada') {
            order.isPaid = true;
            order.deliveryDate = additionalData.deliveryDate || order.deliveryDate || new Date().toISOString();
            if (additionalData.paymentMethod) {
              order.paymentMethod = additionalData.paymentMethod;
            }

            // Deduct parts stock ONLY ONCE during transition to entregada
            if (isTransitioningToEntregada && order.items) {
              order.items.forEach((item) => {
                if (item.type === 'part') {
                  const partIdx = inventory.findIndex((p) => p.id === item.id);
                  if (partIdx !== -1) {
                    const deductQty = Number(item.qty) || 1;
                    inventory[partIdx] = {
                      ...inventory[partIdx],
                      stock: Math.max(0, (Number(inventory[partIdx].stock) || 0) - deductQty)
                    };
                  }
                }
              });
            }
          }
          workOrders[idx] = order;
          updatedOrder = order;

          const nextData = { ...prevData, workOrders, inventory };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }

          if (db && user && !isSyncingFromRemoteRef.current) {
            try {
              set(ref(db, 'taller_data'), nextData).catch((err) => {
                console.warn('Firebase error on updateOrderStatus:', err);
              });
            } catch (err) {}
          }

          return nextData;
        }
        return prevData;
      });
      return updatedOrder;
    },
    [user]
  );

  const cancelWorkOrder = useCallback(
    (orderId) => {
      let cancelledOrder = null;
      setData((prevData) => {
        const workOrders = [...(prevData.workOrders || [])];
        const inventory = [...(prevData.inventory || [])];
        const idx = workOrders.findIndex((o) => o.id === orderId);

        if (idx !== -1 && workOrders[idx].status !== 'cancelada') {
          const currentOrder = workOrders[idx];
          const wasDeliveredOrPaid = currentOrder.status === 'entregada' || currentOrder.isPaid;
          const order = { ...currentOrder, status: 'cancelada', isPaid: false };

          // If it was delivered/paid, return parts back to inventory exactly once
          if (wasDeliveredOrPaid && order.items) {
            order.items.forEach((item) => {
              if (item.type === 'part') {
                const partIdx = inventory.findIndex((p) => p.id === item.id);
                if (partIdx !== -1) {
                  const restoreQty = Number(item.qty) || 1;
                  inventory[partIdx] = {
                    ...inventory[partIdx],
                    stock: (Number(inventory[partIdx].stock) || 0) + restoreQty
                  };
                }
              }
            });
          }

          workOrders[idx] = order;
          cancelledOrder = order;

          const nextData = { ...prevData, workOrders, inventory };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }

          if (db && user && !isSyncingFromRemoteRef.current) {
            try {
              set(ref(db, 'taller_data'), nextData).catch((err) => {
                console.warn('Firebase error on cancelWorkOrder:', err);
              });
            } catch (err) {}
          }

          return nextData;
        }
        return prevData;
      });
      return cancelledOrder;
    },
    [user]
  );

  const deleteWorkOrder = useCallback(
    (orderId) => {
      let deleted = false;
      setData((prevData) => {
        const workOrders = (prevData.workOrders || []).filter((o) => {
          if (o && o.id === orderId) {
            deleted = true;
            return false;
          }
          return Boolean(o);
        });

        if (!deleted) return prevData;

        const nextData = { ...prevData, workOrders };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
        } catch (e) {
          console.error('Error saving to localStorage on deleteWorkOrder:', e);
        }

        if (db && user && !isSyncingFromRemoteRef.current) {
          try {
            set(ref(db, 'taller_data'), nextData).catch((err) => {
              console.warn('Firebase error on deleteWorkOrder:', err);
            });
          } catch (err) {}
        }

        return nextData;
      });
      return deleted;
    },
    [user]
  );

  const getDirectSales = useCallback(
    () => (data.sales || []).filter(Boolean),
    [data.sales]
  );

  const saveDirectSale = useCallback(
    (saleData) => {
      const sales = [...(data.sales || [])];
      const inventory = [...(data.inventory || [])];

      const saleId = 'sale-' + Date.now();
      const saleNum = (sales.length || 0) + 5001;

      const newSale = {
        id: saleId,
        saleNumber: saleNum,
        date: new Date().toISOString(),
        clientName: saleData.clientName || 'Cliente Mostrador',
        paymentMethod: saleData.paymentMethod || 'Efectivo',
        items: saleData.items || [],
        totalAmount: saleData.totalAmount || 0,
        isCancelled: false,
        status: 'completada'
      };

      // Deduct sold parts from inventory
      if (newSale.items) {
        newSale.items.forEach((item) => {
          const part = inventory.find((p) => p.id === item.id);
          if (part) {
            part.stock = Math.max(0, part.stock - (item.qty || 1));
          }
        });
      }

      sales.unshift(newSale);
      commitStore({ ...data, sales, inventory });
      return newSale;
    },
    [data, commitStore]
  );

  const cancelDirectSale = useCallback(
    (saleId) => {
      const sales = [...(data.sales || [])];
      const inventory = [...(data.inventory || [])];
      const sale = sales.find((s) => s.id === saleId);

      if (sale && !sale.isCancelled) {
        sale.isCancelled = true;
        sale.status = 'anulada';

        // Return parts stock to inventory
        if (sale.items) {
          sale.items.forEach((item) => {
            const part = inventory.find((p) => p.id === item.id);
            if (part) {
              part.stock = (part.stock || 0) + (item.qty || 1);
            }
          });
        }

        commitStore({ ...data, sales, inventory });
      }
      return sale;
    },
    [data, commitStore]
  );

  const getDashboardMetrics = useCallback(() => {
    const orders = (data.workOrders || []).filter(Boolean);
    const inventory = (data.inventory || []).filter(Boolean);
    const sales = (data.sales || []).filter(Boolean);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 6); // last 7 days
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helpers for period matching (local calendar boundaries)
    const getOrderEffectiveDate = (o) => o?.deliveryDate || o?.entryDate;

    const isToday = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    };

    const isThisWeek = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d >= weekStart;
    };

    const isThisMonth = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d >= monthStart;
    };

    // Active / status counts
    const activeOrders = orders.filter((o) => o && o.status !== 'entregada' && o.status !== 'cancelada');
    const readyOrders = orders.filter((o) => o && o.status === 'lista');

    // Revenue from paid / delivered work orders (exclude cancelled)
    const paidOrders = orders.filter((o) => o && (o.isPaid || o.status === 'entregada') && o.status !== 'cancelada');
    const workOrderRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Revenue from direct sales (non-cancelled)
    const activeSales = sales.filter((s) => s && !s.isCancelled && s.status !== 'anulada');
    const directSalesRevenue = activeSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalRevenue = workOrderRevenue + directSalesRevenue;

    // TODAY metrics: Work Orders + Direct Sales
    const todayOrders = paidOrders.filter((o) => isToday(getOrderEffectiveDate(o)));
    const todayOrderRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const todaySales = activeSales.filter((s) => isToday(s.date));
    const todaySalesRevenue = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const todayRevenue = todayOrderRevenue + todaySalesRevenue;
    const todayOrdersCount = todayOrders.length + todaySales.length;

    // WEEK metrics
    const weekOrders = paidOrders.filter((o) => isThisWeek(getOrderEffectiveDate(o)));
    const weekOrderRevenue = weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const weekSales = activeSales.filter((s) => isThisWeek(s.date));
    const weekSalesRevenue = weekSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const weekRevenue = weekOrderRevenue + weekSalesRevenue;

    // MONTH metrics
    const monthOrders = paidOrders.filter((o) => isThisMonth(getOrderEffectiveDate(o)));
    const monthOrderRevenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const monthSales = activeSales.filter((s) => isThisMonth(s.date));
    const monthSalesRevenue = monthSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const monthRevenue = monthOrderRevenue + monthSalesRevenue;

    // Inventory
    const lowStockParts = inventory.filter((p) => p && (p.stock || 0) <= (p.minStock || 0));

    // Status breakdown for chart
    const statusCounts = {
      recibida: orders.filter((o) => o?.status === 'recibida').length,
      diagnostico: orders.filter((o) => o?.status === 'diagnostico').length,
      reparacion: orders.filter((o) => o?.status === 'reparacion').length,
      lista: orders.filter((o) => o?.status === 'lista').length,
      entregada: orders.filter((o) => o?.status === 'entregada').length,
    };

    // Top mechanic by completed orders this month
    const mechanicStats = {};
    monthOrders.forEach((o) => {
      if (o?.mechanicName) {
        mechanicStats[o.mechanicName] = (mechanicStats[o.mechanicName] || 0) + 1;
      }
    });
    const topMechanic = Object.entries(mechanicStats).sort((a, b) => b[1] - a[1])[0];

    return {
      activeOrdersCount: activeOrders.length,
      readyOrdersCount: readyOrders.length,
      totalRevenue,
      lowStockCount: lowStockParts.length,
      // Daily
      todayRevenue,
      todayOrdersCount,
      todayOrderRevenue,
      todaySalesRevenue,
      // Weekly
      weekRevenue,
      weekOrdersCount: weekOrders.length + weekSales.length,
      // Monthly
      monthRevenue,
      monthOrdersCount: monthOrders.length + monthSales.length,
      // Extra
      statusCounts,
      topMechanic: topMechanic ? { name: topMechanic[0], count: topMechanic[1] } : null,
      totalOrdersCount: orders.length,
      completedOrdersCount: paidOrders.length,
    };
  }, [data.workOrders, data.inventory, data.sales]);

  const resetToDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    commitStore(INITIAL_DATA);
    return INITIAL_DATA;
  }, [commitStore]);

  const exportJSON = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importJSON = useCallback(
    (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed && parsed.inventory && parsed.workOrders) {
          commitStore(parsed);
          return true;
        }
      } catch (e) {
        console.error('Import failed', e);
      }
      return false;
    },
    [commitStore]
  );

  return (
    <DataContext.Provider
      value={{
        data,
        settings: getSettings(),
        saveSettings,
        mechanics: getMechanics(),
        saveMechanic,
        deleteMechanic,
        inventory: getInventory(),
        savePart,
        deletePart,
        services: getServices(),
        saveService,
        deleteService,
        clients: getClients(),
        vehicles: getVehicles(),
        getClientById,
        getVehicleById,
        saveClientAndVehicle,
        saveFullOrder,
        workOrders: getWorkOrders(),
        saveWorkOrder,
        updateOrderStatus,
        cancelWorkOrder,
        deleteWorkOrder,
        sales: getDirectSales(),
        saveDirectSale,
        cancelDirectSale,
        getDashboardMetrics,
        resetToDemo,
        exportJSON,
        importJSON
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

