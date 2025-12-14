import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Navigate } from 'react-router-dom';

const Reports = ({ userRole }) => {
  // 1. Role-based Access Control (from V1/V2)
  if (userRole !== 'owner') {
    return <Navigate to="/dashboard" />;
  }

  const { orders, inventory } = useData();
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Utility to map inventory items for O(1) lookup (from V2)
  const inventoryMap = inventory.reduce((map, item) => {
    map[item.item] = item;
    return map;
  }, {});

  // Filter orders by date range (from V1/V2)
  const getFilteredData = () => {
    if (!dateRange.start && !dateRange.end) {
      return orders;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      let pass = true;
      if (startDate) pass = pass && orderDate >= startDate;
      // Add one day to end date to make filter inclusive of the end date
      if (endDate) {
          const inclusiveEndDate = new Date(endDate);
          inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
          pass = pass && orderDate < inclusiveEndDate;
      }
      return pass;
    });
  };

  const filteredOrders = getFilteredData();
  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // 2. Material Cost Calculation (Improved V2 Logic)
  const calculateMaterialCosts = () => {
    return completedOrders.reduce((sum, order) => {
      let orderCost = 0;
      let materialsSource = [];

      // PRIORITY 1: Use actual materials consumed (V2 improvement)
      if (order.materialsUsed && Array.isArray(order.materialsUsed) && order.materialsUsed.length > 0) {
        materialsSource = order.materialsUsed;
      } 
      // PRIORITY 2: Fallback to items ordered, using inventory cost (V2/V1 fallback)
      else if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        materialsSource = order.items;
      }
      // PRIORITY 3: Fallback to simplified number/average cost (V2/V1 tertiary fallback)
      else if (typeof order.items === 'number' && inventory.length > 0) {
        const tshirtItems = inventory.filter(item => 
          (item.category?.toLowerCase().includes('shirt')) || (item.item?.toLowerCase().includes('shirt'))
        );
        if (tshirtItems.length > 0) {
          const avgCost = tshirtItems.reduce((s, item) => {
            const cost = typeof item.cost === 'string' ? parseFloat(item.cost) || 0 : item.cost || 0;
            return s + cost;
          }, 0) / tshirtItems.length;
          return sum + (order.items * avgCost);
        }
        return sum; // No costs found for tertiary fallback
      }


      orderCost = materialsSource.reduce((itemSum, used) => {
          // Use item name for lookup
          const itemName = used.item || used.name; 
          const inventoryItem = inventoryMap[itemName]; 
          const itemCost = inventoryItem ? (parseFloat(inventoryItem.cost) || 0) : 0;
          const quantity = parseFloat(used.quantity) || 0;
          return itemSum + (quantity * itemCost);
      }, 0);

      return sum + orderCost;
    }, 0);
  };

  const materialCosts = calculateMaterialCosts();
  const grossProfit = totalRevenue - materialCosts;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Formatting utility (from V1/V2)
  const formatPeso = (amount) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const exportReport = () => {
    const reportData = {
      dateGenerated: new Date().toLocaleString(),
      dateRange: { start: dateRange.start || 'All Time', end: dateRange.end || 'All Time' },
      summary: {
        totalOrders: filteredOrders.length,
        completedOrders: completedOrders.length,
        totalRevenue,
        averageOrderValue: avgOrderValue,
        materialCosts,
        grossProfit,
        profitMargin: profitMargin.toFixed(1) + '%'
      },
      orders: filteredOrders
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 3. Render and Styling (V1 preferred layout/classes)
  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 xl:px-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mt-1">Business overview and metrics</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg border border-gray-200">
        <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Filter by Date</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs md:text-sm lg:text-base text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm lg:text-base text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors text-sm md:text-base lg:text-base"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-2">Total Orders</p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{filteredOrders.length}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">{completedOrders.length} completed</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-2">Total Revenue</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600 break-words">{formatPeso(totalRevenue)}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">From completed orders</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-2">Material Costs</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600 break-words">{formatPeso(materialCosts)}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">Actual items used</p>
        </div>

        <div className={`bg-white p-4 md:p-6 rounded-lg border ${grossProfit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className="text-xs md:text-sm text-gray-600 mb-2">Gross Profit</p>
          <p className={`text-xl md:text-2xl lg:text-3xl font-bold break-words ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPeso(grossProfit)}
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">{profitMargin.toFixed(1)}% margin</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
        <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Order Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {['pending', 'in-progress', 'completed'].map((status) => {
            const statusOrders = filteredOrders.filter(o => o.status === status);
            const percentage = filteredOrders.length > 0 ? (statusOrders.length / filteredOrders.length) * 100 : 0;
            const colors = {
              'pending': { text: 'text-yellow-700', bg: 'bg-yellow-500' },
              'in-progress': { text: 'text-blue-700', bg: 'bg-blue-500' },
              'completed': { text: 'text-green-700', bg: 'bg-green-500' }
            };

            return (
              <div key={status} className="p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-sm md:text-base text-gray-900 capitalize">{status.replace('-', ' ')}</p>
                <p className={`text-xl md:text-2xl lg:text-3xl font-bold ${colors[status].text} mt-2`}>{statusOrders.length}</p>
                <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full ${colors[status].bg}`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;