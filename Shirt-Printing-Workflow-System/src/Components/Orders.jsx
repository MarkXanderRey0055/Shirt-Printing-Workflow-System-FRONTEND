import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Orders = ({ userRole }) => {
    const { 
        orders, 
        updateOrder, 
        deleteOrder, 
        addOrder,
        calculateMaterialsForOrder,
        completeProductionAndUpdateStock,
        inventory
    } = useData();

    const apparelOptions = inventory.filter(item => 
        ['T-Shirt', 'Polo Shirt', 'Jersey'].includes(item.category)
    ).map(item => ({
        name: item.item,
        category: item.category
    }));

    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showProductionModal, setShowProductionModal] = useState(null);
    const [materialUsage, setMaterialUsage] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);

    const [newOrder, setNewOrder] = useState({
        customer: '',
        design: '',
        items: '',
        amount: '',
        status: 'pending',
        apparelItem: apparelOptions.length > 0 ? apparelOptions[0].name : ''
    });

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.design.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (order.apparelItem && order.apparelItem.toLowerCase().includes(searchQuery.toLowerCase())); 
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const handleAddOrder = (e) => {
        e.preventDefault();
        
        if (newOrder.customer && newOrder.design && newOrder.items && newOrder.amount && newOrder.apparelItem) {
            // Generate a unique ID for the new order
            const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 100)}`;
            const currentDate = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            const orderToAdd = {
                id: orderId,
                customer: newOrder.customer,
                design: newOrder.design,
                items: parseInt(newOrder.items),
                amount: parseFloat(newOrder.amount),
                status: newOrder.status,
                apparelItem: newOrder.apparelItem,
                date: currentDate
            };
            
            console.log('Adding order:', orderToAdd); 
            
            addOrder(orderToAdd);
            
            setNewOrder({ 
                customer: '', 
                design: '', 
                items: '', 
                amount: '', 
                status: 'pending',
                apparelItem: apparelOptions.length > 0 ? apparelOptions[0].name : ''
            });
            setShowAddForm(false);
        } else {
            alert('Please fill in all required fields');
        }
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (editingOrder && newOrder.customer && newOrder.design && newOrder.items && newOrder.amount && newOrder.apparelItem) {
            const updatedOrder = {
                customer: newOrder.customer,
                design: newOrder.design,
                items: parseInt(newOrder.items),
                amount: parseFloat(newOrder.amount),
                status: newOrder.status,
                apparelItem: newOrder.apparelItem
            };
            
            console.log('Updating order:', editingOrder.id, updatedOrder);
            
            updateOrder(editingOrder.id, updatedOrder);
            
            setEditingOrder(null);
            setNewOrder({ 
                customer: '', 
                design: '', 
                items: '', 
                amount: '', 
                status: 'pending',
                apparelItem: apparelOptions.length > 0 ? apparelOptions[0].name : ''
            });
            setShowAddForm(false);
        } else {
            alert('Please fill in all required fields');
        }
    };

    const exportOrdersToPDF = () => {
        if (selectedOrders.length === 0) {
            alert('Please select at least one order to export.');
            return;
        }

        const ordersToExport = orders.filter(order => selectedOrders.includes(order.id));
        
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Order Details Report', 14, 20);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Total Orders: ${ordersToExport.length}`, 14, 36);
        
        let yPos = 45;
        
        ordersToExport.forEach((order, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`Order #${index + 1}: ${order.id}`, 14, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            
            const details = [
                [`Customer:`, order.customer],
                [`Design:`, order.design],
                [`Apparel Item:`, order.apparelItem || 'N/A'],
                [`Items:`, order.items],
                [`Status:`, order.status],
                [`Date:`, order.date],
                [`Amount:`, userRole === 'owner' ? `P${order.amount}` : 'Hidden']
            ];
            
            details.forEach(([label, value]) => {
                doc.text(label, 14, yPos);
                doc.text(value.toString(), 50, yPos);
                yPos += 6;
            });
            
            if (index < ordersToExport.length - 1) {
                yPos += 4;
                doc.setLineWidth(0.2);
                doc.line(14, yPos, 200, yPos);
                yPos += 8;
            }
        });
        
        doc.save(`orders_export_${new Date().toISOString().split('T')[0]}.pdf`);
        setSelectedOrders([]);
    };

    const toggleOrderSelection = (orderId) => {
        setSelectedOrders(prev => {
            if (prev.includes(orderId)) {
                return prev.filter(id => id !== orderId);
            } else {
                return [...prev, orderId];
            }
        });
    };

    const selectAllFilteredOrders = () => {
        const filteredIds = filteredOrders.map(order => order.id);
        setSelectedOrders(filteredIds);
    };

    const clearAllSelections = () => {
        setSelectedOrders([]);
    };

    const handleCompleteProduction = () => {
        if (showProductionModal) {
            const actualMaterials = materialUsage.map(m => ({
                item: m.item,
                quantity: parseFloat(m.actualQuantity) || 0,
                unit: m.unit
            }));
            
            completeProductionAndUpdateStock(showProductionModal.id, actualMaterials);
            setShowProductionModal(null);
            setMaterialUsage([]);
        }
    };

    const handleUpdateOrder = (id, status) => {
        if (status === 'completed') {
            const order = orders.find(o => o.id === id);
            if (order) {
                const estimatedMaterials = calculateMaterialsForOrder(id);
                setMaterialUsage(estimatedMaterials.map(m => ({
                    ...m,
                    actualQuantity: m.quantity
                })));
                setShowProductionModal(order);
            }
        } else {
            updateOrder(id, { status });
        }
    };

    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setNewOrder({
            customer: order.customer,
            design: order.design,
            items: order.items.toString(),
            amount: order.amount.toString(),
            status: order.status,
            apparelItem: order.apparelItem || (apparelOptions.length > 0 ? apparelOptions[0].name : '') 
        });
        setShowAddForm(true);
    };

    const updatedFilteredOrders = filteredOrders.map(order => ({
        ...order,
        isSelected: selectedOrders.includes(order.id)
    }));

    return (
        <section className="max-w-7xl mx-auto px-3 md:px-6 xl:px-10 space-y-6 md:space-y-8">
            <article className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Design, Order & Quality Control</h1>
                    <p className="text-gray-600 mt-2">Track, manage, and fulfill customer orders</p>
                </div>
                <button onClick={() => {
                    setEditingOrder(null);
                    setNewOrder({ 
                        customer: '', 
                        design: '', 
                        items: '', 
                        amount: '', 
                        status: 'pending',
                        apparelItem: apparelOptions.length > 0 ? apparelOptions[0].name : ''
                    });
                    setShowAddForm(true);
                }}
                    className="createOrderBtn"
                >
                    + Create New Order
                </button>
            </article>

            <article className="orderCon">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="orderField"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <select
                        className="orderField"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>

                    <input
                        type="date"
                        className="orderField"
                    />
                    <button className="orderBtn">
                        Apply Filters
                    </button>
                </div>
                
                {selectedOrders.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-semibold text-blue-900">
                                    {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                                </span>
                                <button 
                                    onClick={clearAllSelections}
                                    className="ml-3 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Clear selection
                                </button>
                            </div>
                            <button
                                onClick={exportOrdersToPDF}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Export Selected to PDF</span>
                            </button>
                        </div>
                    </div>
                )}
            </article>

            {showProductionModal && (
                <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Complete Production</h2>
                            <button 
                                onClick={() => {
                                    setShowProductionModal(null);
                                    setMaterialUsage([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Order Details</h3>
                            <p className="text-sm text-blue-800">Order ID: {showProductionModal.id}</p>
                            <p className="text-sm text-blue-800">Customer: {showProductionModal.customer}</p>
                            <p className="text-sm text-blue-800">Design: {showProductionModal.design}</p>
                            {showProductionModal.apparelItem && (
                                <p className="text-sm text-blue-800">Apparel Item: {showProductionModal.apparelItem}</p>
                            )}
                            <p className="text-sm text-blue-800">Shirts to Produce: {showProductionModal.items}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Materials Used in Production</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Adjust the quantities below to match actual materials used. Stock will be updated accordingly.
                            </p>
                            
                            {materialUsage.length === 0 ? (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-800 text-sm">
                                        No materials were calculated. Ensure an apparel item is selected and materials are in Inventory.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {materialUsage.map((material, index) => {
                                        const inventoryItem = inventory.find(i => i.item === material.item);
                                        const hasEnoughStock = inventoryItem && inventoryItem.stock >= material.actualQuantity;
                                        
                                        return (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{material.item}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Estimated: {material.quantity.toFixed(2)} {material.unit}
                                                        {inventoryItem && (
                                                            <span className={`ml-2 ${hasEnoughStock ? 'text-green-600' : 'text-red-600'}`}>
                                                                (Available: {inventoryItem.stock} {material.unit})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={material.actualQuantity}
                                                        onChange={(e) => {
                                                            const updated = [...materialUsage];
                                                            updated[index].actualQuantity = e.target.value;
                                                            setMaterialUsage(updated);
                                                        }}
                                                        className={`w-24 px-3 py-2 border rounded-lg text-right ${
                                                            !hasEnoughStock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                        min="0"
                                                    />
                                                    <span className="text-gray-600 text-sm w-16">{material.unit}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowProductionModal(null);
                                    setMaterialUsage([]);
                                }}
                                className="flex-1 orderBtn2 bg-gray-100 hover:bg-gray-200 text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteProduction}
                                className="flex-1 orderBtn2 bg-green-600 hover:bg-green-700 text-white"
                            >
                                Complete Production & Update Stock
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {showAddForm && (
                <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <article className="bg-white rounded-xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingOrder ? 'Edit Order' : 'Create New Order'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingOrder(null);
                                    setNewOrder({ 
                                        customer: '', 
                                        design: '', 
                                        items: '', 
                                        amount: '', 
                                        status: 'pending',
                                        apparelItem: apparelOptions.length > 0 ? apparelOptions[0].name : ''
                                    });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={editingOrder ? handleSaveEdit : handleAddOrder} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Customer Name *</label>
                                <input
                                    type="text"
                                    placeholder="Customer Name"
                                    className="orderText"
                                    value={newOrder.customer}
                                    onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Design Description *</label>
                                <input
                                    type="text"
                                    placeholder="Design Description"
                                    className="orderText"
                                    value={newOrder.design}
                                    onChange={(e) => setNewOrder({...newOrder, design: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Apparel Item *</label>
                                <select 
                                    className="orderText"
                                    value={newOrder.apparelItem}
                                    onChange={(e) => setNewOrder({...newOrder, apparelItem: e.target.value})}
                                    required
                                >
                                    {apparelOptions.length === 0 ? (
                                        <option value="">No Apparel Items Available</option>
                                    ) : (
                                        <>
                                            <option value="">Select an apparel item</option>
                                            {apparelOptions.map(item => (
                                                <option key={item.name} value={item.name}>
                                                    {item.name} ({item.category})
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                                {apparelOptions.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Please add apparel items in Inventory first.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Number of Items *</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Number of Items"
                                    className="orderText"
                                    value={newOrder.items}
                                    onChange={(e) => setNewOrder({...newOrder, items: e.target.value})}
                                    required
                                />
                            </div>

                            {userRole === 'owner' && (
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Total Amount (₱) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Total Amount (₱)"
                                        className="orderText"
                                        value={newOrder.amount}
                                        onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Status</label>
                                <select
                                    className="orderText"
                                    value={newOrder.status}
                                    onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {!newOrder.customer || !newOrder.design || !newOrder.items || !newOrder.amount || !newOrder.apparelItem ? (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        * Please fill in all required fields
                                    </p>
                                </div>
                            ) : null}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingOrder(null);
                                        setNewOrder({ 
                                            customer: '', 
                                            design: '', 
                                            items: '', 
                                            amount: '', 
                                            status: 'pending',
                                            apparelItem: apparelOptions.length > 0 ? apparelOptions[0].name : ''
                                        });
                                    }}
                                    className="orderBtn2 bg-gray-100 hover:bg-gray-200 text-gray-800 flex-1"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="orderBtn2 bg-green-600 hover:bg-green-700 text-white flex-1"
                                    disabled={!newOrder.customer || !newOrder.design || !newOrder.items || !newOrder.amount || !newOrder.apparelItem}
                                >
                                    {editingOrder ? 'Save Changes' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </article>
                </section>
            )}

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <article className="overflow-x-auto">
                    {orders.length === 0? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No orders yet. Create your first order!</p>
                        </div>
                    ) : updatedFilteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No orders match your search criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length > 0 && selectedOrders.length === updatedFilteredOrders.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                selectAllFilteredOrders();
                                            } else {
                                                clearAllSelections();
                                            }
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">
                                        Select all {updatedFilteredOrders.length} filtered orders
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {selectedOrders.length} selected
                                </div>
                            </div>
                            
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="orderTblText w-12">Select</th>
                                        <th className="orderTblText">Order Id</th>
                                        <th className="orderTblText">Customer</th>
                                        <th className="orderTblText">Apparel</th>
                                        <th className="orderTblText">Design</th>
                                        <th className="orderTblText">Items</th>
                                        {userRole === 'owner' && (
                                            <th className="orderTblText">Amount</th>
                                        )}
                                        <th className="orderTblText">Status</th>
                                        <th className="orderTblText">Date</th>
                                        <th className="orderTblText">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {updatedFilteredOrders.map(order => (
                                        <tr key={order.id} className="orderMini">
                                            <td className="py-4 px-6">
                                                <input
                                                    type="checkbox"
                                                    checked={order.isSelected}
                                                    onChange={() => toggleOrderSelection(order.id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-gray-900">{order.id}</td>
                                            <td className="py-4 px-6 text-gray-700">{order.customer}</td>
                                            <td className="py-4 px-6 text-gray-700">{order.apparelItem || 'N/A'}</td>
                                            <td className="py-4 px-6 text-gray-700">{order.design}</td>
                                            <td className="py-4 px-6 text-gray-700">{order.items}</td>
                                            {userRole === 'owner' && (
                                                <td className="py-4 px-6 font-bold text-gray-900">₱{order.amount}</td>
                                            )}
                                            <td className="py-4 px-6">
                                                <select
                                                    className="orderMiniDrop"
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrder(order.id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{order.date}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => handleEditOrder(order)}
                                                        className="orderEditBtn"
                                                    >
                                                        Edit
                                                    </button>
                                                    {userRole === 'owner' && (
                                                        <button
                                                            onClick={() =>{
                                                                if(window.confirm('Are you sure you want to delete this order?')){
                                                                    deleteOrder(order.id);
                                                                }
                                                            }}
                                                            className="orderDeleteBtn"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </article>
            </section>
        </section>
    );
};

export default Orders;