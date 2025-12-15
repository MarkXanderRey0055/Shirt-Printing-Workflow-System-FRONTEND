import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const Inventory = () => {
  const { inventory, addInventoryItem, updateInventoryItem, reorderInventory } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReorderForm, setShowReorderForm] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [newItem, setNewItem] = useState({
    item: '',
    stock: '',
    minStock: '',
    cost: '',
    unit: 'pieces',
    category: '' 
  });
  const [reorderQuantity, setReorderQuantity] = useState('');

  const categories = ['T-Shirt', 'Polo Shirt', 'Jersey', 'Raw Materials'];
  const units = ['pieces', 'liters', 'meters', 'rolls', 'kilograms', 'boxes']; 

  const filteredInventory = filterCategory
    ? inventory.filter(item => item.category === filterCategory)
    : inventory;

  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);
  const totalUnitsInStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const lowStockItems = inventory.filter(item => item.stock < item.minStock);
  const outOfStockItems = inventory.filter(item => item.stock === 0);
  const totalUsedInProduction = inventory.reduce((sum, item) => sum + (item.usedInProduction || 0), 0);

  const handleAddItem = () => {
    if (newItem.item && newItem.stock && newItem.minStock && newItem.cost && newItem.category) {
      addInventoryItem({
        ...newItem,
        stock: parseInt(newItem.stock),
        minStock: parseInt(newItem.minStock),
        cost: parseFloat(newItem.cost),
        unit: newItem.unit,
        usedInProduction: 0,
        lastOrdered: new Date().toISOString().split('T')[0]
      });
      setNewItem({ item: '', stock: '', minStock: '', cost: '', unit: 'pieces', category: '' });
      setShowAddForm(false);
    } else {
      alert('Please fill out all fields including category.');
    }
  };

  const handleReorder = (itemName) => {
    if (reorderQuantity && !isNaN(reorderQuantity) && parseInt(reorderQuantity) > 0) {
      reorderInventory(itemName, parseInt(reorderQuantity));
      setShowReorderForm(null);
      setReorderQuantity('');
    }
  };

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1 md:mt-2">Track materials, stock levels, and production usage</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <select
            className="p-2 border border-gray-300 rounded-lg"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            + Add New Item
          </button>
        </div>
      </div>

      {/* Add Inventory Modal */}
      {showAddForm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative bg-white rounded-xl p-6 md:p-8 max-w-lg w-full z-10">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Inventory Item</h2>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ item: '', stock: '', minStock: '', cost: '', unit: 'pieces', category: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={newItem.item}
                onChange={(e) => setNewItem({...newItem, item: e.target.value})}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Stock"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Min Stock"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
                  min="0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Unit Cost"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                  min="0.01"
                />
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                >
                  {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>

              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <div className="flex space-x-3 pt-4 flex-wrap">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItem({ item: '', stock: '', minStock: '', cost: '', unit: 'pieces', category: '' });
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-6 rounded-xl shadow-lg">
          <p className="text-blue-200 text-sm">Total Inventory Value</p>
          <p className="text-3xl font-bold mt-2">₱{totalInventoryValue.toLocaleString()}</p>
          <p className="text-blue-300 text-sm mt-2">{inventory.length} items</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-200 text-sm">Total Units in Stock</p>
          <p className="text-3xl font-bold mt-2">{totalUnitsInStock.toLocaleString()}</p>
          <p className="text-gray-300 text-sm mt-2">Across all items</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900 to-orange-800 text-white p-6 rounded-xl shadow-lg">
          <p className="text-orange-200 text-sm">Used in Production</p>
          <p className="text-3xl font-bold mt-2">{totalUsedInProduction.toLocaleString()}</p>
          <p className="text-orange-300 text-sm mt-2">Total materials consumed</p>
        </div>
        <div className="bg-gradient-to-br from-red-900 to-red-800 text-white p-6 rounded-xl shadow-lg">
          <p className="text-red-200 text-sm">Items to Reorder</p>
          <p className="text-3xl font-bold mt-2">{lowStockItems.length}</p>
          <p className="text-red-300 text-sm mt-2">{outOfStockItems.length} out of stock</p>
        </div>
      </div>

      {/* Inventory List */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 mb-4">No inventory items found.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Add New Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map(item => {
            const isLowStock = item.stock < item.minStock;
            const isOutOfStock = item.stock === 0;
            const percentage = item.minStock > 0 ? Math.min((item.stock / item.minStock) * 100, 100) : 0;

            return (
              <div key={item.item} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.item}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{item.category}</span>
                      <span className="text-gray-600 text-xs">{item.unit}</span>
                    </div>
                  </div>
                  {isOutOfStock ? (
                    <span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-sm font-medium">Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full text-sm font-medium">Low Stock</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-sm font-medium">In Stock</span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Current: </span>
                      <input
                        type="number"
                        value={item.stock}
                        disabled
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-gray-900 bg-gray-100 cursor-not-allowed"
                      />
                      <span className="text-gray-600 ml-2">{item.unit}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Min: </span>
                      <input
                        type="number"
                        value={item.minStock}
                        disabled
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Stock Progress */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>Stock Level: {Math.round(percentage)}%</span>
                    <span>{item.minStock} (min)</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Unit Cost</p>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">₱</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.cost}
                          disabled
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-lg font-bold text-gray-900 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="font-bold text-lg">₱{(item.stock * item.cost).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Add Stock / Reorder Buttons */}
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => setShowReorderForm(item.item)}
                      className={`py-2 px-3 font-semibold rounded-lg transition-colors duration-200 ${
                        isLowStock || isOutOfStock
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {isOutOfStock ? 'Restock Now' : isLowStock ? 'Add Stock' : 'Add More'}
                    </button>

                    {/* Inline Stock Input */}
                    {showReorderForm === item.item && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          placeholder="Enter quantity"
                          value={reorderQuantity}
                          onChange={(e) => setReorderQuantity(e.target.value)}
                          className="px-2 py-1 border rounded w-full"
                          min="1"
                        />
                        <button
                          onClick={() => handleReorder(item.item)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 rounded"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowReorderForm(null);
                            setReorderQuantity('');
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inventory;
