import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const Dashboard = ({ userRole }) => {
  const {
    orders,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockItems,
  } = useData();

  /* ------------------------------
     Reusable Stat Card
  ------------------------------ */
  const StatCard = ({ label, value, trend, trendValue, color }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-300' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-300' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-l-yellow-300' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-l-red-300' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-l-gray-300' }
    };

    return (
      <div
        className={`bg-white p-4 md:p-6 rounded-xl border border-gray-100
        border-l-4 ${colorClasses[color].border} ${colorClasses[color].bg}
        shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200`}
      >
        <div className="text-gray-600 text-xs md:text-sm mb-1">{label}</div>
        <div className={`text-2xl md:text-3xl font-bold mb-2 ${colorClasses[color].text}`}>
          {value}
        </div>
        <div
          className={`text-xs md:text-sm ${
            trend === 'positive'
              ? 'text-green-500'
              : trend === 'negative'
              ? 'text-red-500'
              : 'text-gray-500'
          }`}
        >
          {trend === 'positive' ? '↗' : trend === 'negative' ? '↘' : ''} {trendValue}
        </div>
      </div>
    );
  };

  /* ------------------------------
     Helpers
  ------------------------------ */
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => o.date === today).length;

  /* ------------------------------
     Render
  ------------------------------ */
  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 xl:px-10 space-y-6 md:space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
            Welcome back{userRole === 'owner' ? ', Admin' : ', Team Member'}. Here's your business overview.
          </p>
        </div>

        {/* Removed New Order button */}

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Total Orders"
          value={totalOrders}
          trend={totalOrders > 0 ? 'positive' : 'neutral'}
          trendValue={totalOrders > 0 ? 'Keep it up!' : 'Start adding orders'}
          color="blue"
        />

        <StatCard
          label="Pending Orders"
          value={pendingOrders}
          trend={pendingOrders > 0 ? 'negative' : 'positive'}
          trendValue={pendingOrders > 0 ? 'Needs attention' : 'All clear'}
          color="yellow"
        />

        {userRole === 'owner' ? (
          <StatCard
            label="Revenue"
            value={`₱${totalRevenue.toLocaleString()}`}
            trend={totalRevenue > 0 ? 'positive' : 'neutral'}
            trendValue={totalRevenue > 0 ? 'Good work!' : 'No revenue yet'}
            color="green"
          />
        ) : (
          <StatCard
            label="Today's Orders"
            value={todaysOrders}
            trend={todaysOrders > 0 ? 'positive' : 'neutral'}
            trendValue="For today"
            color="gray"
          />
        )}

        {userRole === 'owner' ? (
          <StatCard
            label="Low Stock Items"
            value={lowStockItems}
            trend={lowStockItems > 0 ? 'negative' : 'positive'}
            trendValue={lowStockItems > 0 ? 'Restock needed' : 'Well stocked'}
            color="red"
          />
        ) : (
          <StatCard
            label="Completion Rate"
            value={`${totalOrders > 0
              ? Math.round(((totalOrders - pendingOrders) / totalOrders) * 100)
              : 0}%`}
            trend="neutral"
            trendValue="Order completion"
            color="gray"
          />
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Orders</h2>
          <span className="text-sm text-gray-600">
            {orders.length === 0 ? 'No orders yet' : `${orders.length} total orders`}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No orders yet. Create your first order!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 md:px-4">Order ID</th>
                  <th className="text-left py-3 px-3 md:px-4">Customer</th>
                  <th className="text-left py-3 px-3 md:px-4">Items</th>
                  {userRole === 'owner' && (
                    <th className="text-left py-3 px-3 md:px-4">Amount</th>
                  )}
                  <th className="text-left py-3 px-3 md:px-4">Status</th>
                  <th className="text-left py-3 px-3 md:px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(-5).reverse().map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 md:px-4 font-semibold">{order.id}</td>
                    <td className="py-3 px-3 md:px-4">{order.customer}</td>
                    <td className="py-3 px-3 md:px-4">{order.items}</td>
                    {userRole === 'owner' && (
                      <td className="py-3 px-3 md:px-4 font-bold">₱{order.amount}</td>
                    )}
                    <td className="py-3 px-3 md:px-4">
                      <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium
                        ${order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-4 text-gray-600">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Removed Add Order Modal */}

    </div>
  );
};

export default Dashboard;
