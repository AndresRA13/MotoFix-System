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
        if (!parsed.mechanics || parsed.mechanics.length === 0) parsed.mechanics = DEFAULT_MECHANICS;
        if (!parsed.sales) parsed.sales = [];
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
            const merged = {
              settings: val.settings || prev.settings || DEFAULT_SETTINGS,
              mechanics: val.mechanics || prev.mechanics || DEFAULT_MECHANICS,
              inventory: val.inventory || prev.inventory || [],
              services: val.services || prev.services || [],
              clients: val.clients || prev.clients || [],
              vehicles: val.vehicles || prev.vehicles || [],
              workOrders: val.workOrders || prev.workOrders || [],
              sales: val.sales || prev.sales || []
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

      commitStore({ ...data, clients, vehicles });
      return { client, vehicle };
    },
    [data, commitStore]
  );

  const getWorkOrders = useCallback(() => data.workOrders || [], [data.workOrders]);

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
    (orderId, newStatus) => {
      const workOrders = [...(data.workOrders || [])];
      const inventory = [...(data.inventory || [])];
      const order = workOrders.find((o) => o.id === orderId);

      if (order) {
        order.status = newStatus;
        if (newStatus === 'entregada' && !order.isPaid) {
          order.isPaid = true;
          // Deduct parts stock
          if (order.items) {
            order.items.forEach((item) => {
              if (item.type === 'part') {
                const part = inventory.find((p) => p.id === item.id);
                if (part) {
                  part.stock = Math.max(0, part.stock - (item.qty || 1));
                }
              }
            });
          }
        }
        commitStore({ ...data, workOrders, inventory });
      }
      return order;
    },
    [data, commitStore]
  );

  const getDirectSales = useCallback(() => data.sales || [], [data.sales]);

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
    const orders = data.workOrders || [];
    const inventory = data.inventory || [];
    const sales = data.sales || [];

    const activeOrders = orders.filter((o) => o.status !== 'entregada' && o.status !== 'cancelada');
    const readyOrders = orders.filter((o) => o.status === 'lista');

    const workOrderRevenue = orders
      .filter((o) => o.isPaid || o.status === 'entregada')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const directSalesRevenue = sales
      .filter((s) => !s.isCancelled && s.status !== 'anulada')
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const totalRevenue = workOrderRevenue + directSalesRevenue;
    const lowStockParts = inventory.filter((p) => p.stock <= p.minStock);

    return {
      activeOrdersCount: activeOrders.length,
      readyOrdersCount: readyOrders.length,
      totalRevenue,
      lowStockCount: lowStockParts.length
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
        workOrders: getWorkOrders(),
        saveWorkOrder,
        updateOrderStatus,
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

