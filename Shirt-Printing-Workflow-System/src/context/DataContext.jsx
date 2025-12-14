import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Initial empty state
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [userRole, setUserRole] = useState('owner');

  // Order functions
  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0]
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (id, updates) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, ...updates } : order
    ));
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  // Inventory functions
  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      lastOrdered: new Date().toISOString().split('T')[0]
    };
    setInventory([...inventory, newItem]);
  };

  const updateInventoryItem = (itemName, updates) => {
    setInventory(inventory.map(item => 
      item.item === itemName ? { ...item, ...updates } : item
    ));
  };

  const reorderInventory = (itemName, quantity) => {
    setInventory(inventory.map(item => 
      item.item === itemName 
        ? { ...item, stock: item.stock + parseInt(quantity) }
        : item
    ));
  };

  // Sales data functions
  const addSalesRecord = (record) => {
    setSalesData([...salesData, record]);
  };

  // Stats calculation
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const lowStockItems = inventory.filter(i => i.stock < i.minStock).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const averageOrderValue = completedOrders > 0 ? (totalRevenue / completedOrders).toFixed(2) : '0.00';

  const value = {
    orders,
    inventory,
    salesData,
    userRole,
    setUserRole,
    addOrder,
    updateOrder,
    deleteOrder,
    addInventoryItem,
    updateInventoryItem,
    reorderInventory,
    addSalesRecord,
    totalOrders,
    completedOrders,
    totalRevenue,
    lowStockItems,
    pendingOrders,
    averageOrderValue
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
