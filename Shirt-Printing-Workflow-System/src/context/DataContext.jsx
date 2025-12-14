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
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [userRole, setUserRole] = useState('owner');

  const materialConsumptionRates = {
    'T-Shirt': { rate: 1, unit: 'pieces', description: 'One T-Shirt blank per order item' },
    'Polo Shirt': { rate: 1, unit: 'pieces', description: 'One Polo Shirt blank per order item' },
    'Jersey': { rate: 1, unit: 'pieces', description: 'One Jersey blank per order item' },
    
    'Raw Materials': { rate: 0.1, unit: 'units', description: 'Estimated general consumables (ink/vinyl/etc) per shirt' },
  };

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],

      apparelItem: order.apparelItem 
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

  const calculateMaterialsForOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return [];

    const shirtsCount = order.items;
    const estimatedMaterials = [];
    
    
    const apparelItem = inventory.find(i => i.item === order.apparelItem);
    
    if (apparelItem && materialConsumptionRates[apparelItem.category]?.rate === 1) {
      estimatedMaterials.push({
        item: apparelItem.item,
        quantity: shirtsCount, // Consumes 1 unit per item ordered
        unit: apparelItem.unit,
        category: apparelItem.category,
        estimatedPerShirt: 1
      });
    }

    inventory.forEach(item => {
      const category = item.category;
      
      if (category === 'Raw Materials') {
          const config = materialConsumptionRates[category];
          const estimatedPerShirt = config.rate; 
          const estimatedQuantity = estimatedPerShirt * shirtsCount;
          
          if (estimatedQuantity > 0) {
              estimatedMaterials.push({
                item: item.item,
                quantity: estimatedQuantity,
                unit: item.unit || config.unit,
                category: category,
                estimatedPerShirt: estimatedPerShirt
              });
          }
      }
    });

    return estimatedMaterials;
  };

  const completeProductionAndUpdateStock = (orderId, actualMaterialsUsed) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    console.log('Completing production for order:', orderId);
    console.log('Materials to deduct:', actualMaterialsUsed);

    setOrders(prevOrders => 
      prevOrders.map(o => 
        o.id === orderId 
          ? { 
              ...o, 
              status: 'completed',
              materialsUsed: actualMaterialsUsed,
              completedDate: new Date().toISOString().split('T')[0]
            }
          : o
      )
    );

    setInventory(prevInventory => {
      const updatedInventory = prevInventory.map(item => {
        const usedMaterial = actualMaterialsUsed.find(m => m.item === item.item);
        
        if (usedMaterial && usedMaterial.quantity > 0) {
          const quantityToDeduct = parseFloat(usedMaterial.quantity);
          const newStock = Math.max(0, item.stock - quantityToDeduct);
          const usedInProduction = (item.usedInProduction || 0) + quantityToDeduct;
          
          console.log(`Updating ${item.item}: ${item.stock} -> ${newStock} (deducted ${quantityToDeduct})`);
          
          return {
            ...item,
            stock: newStock,
            usedInProduction: usedInProduction
          };
        }
        return item;
      });
      
      console.log('Inventory updated successfully');
      return updatedInventory;
    });
  };

 
  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: item.id || `INV-${String(inventory.length + 1).padStart(3, '0')}`,
      lastOrdered: item.lastOrdered || new Date().toISOString().split('T')[0],
      usedInProduction: item.usedInProduction || 0
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
        ? { 
            ...item, 
            stock: item.stock + parseInt(quantity),
            lastOrdered: new Date().toISOString().split('T')[0]
          }
        : item
    ));
  };

 
  const addSalesRecord = (record) => {
    setSalesData([...salesData, record]);
  };

  
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
    calculateMaterialsForOrder,
    completeProductionAndUpdateStock,
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