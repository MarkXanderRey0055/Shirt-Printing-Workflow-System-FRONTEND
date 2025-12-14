import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const Orders = ({ userRole }) => {
    const { orders, updateOrder, deleteOrder, addOrder } = useData();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [newOrder, setNewOrder] = useState({
        customer: '',
        design: '',
        items: '',
        amount: '',
        status: 'pending'
    });

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.design.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const handleAddOrder = (e) => {
        e.preventDefault();
        if (newOrder.customer && newOrder.design && newOrder.items && newOrder.amount) {
            addOrder({
                ...newOrder,
                items: parseInt(newOrder.items),
                amount: parseFloat(newOrder.amount)
            });
            setNewOrder({ customer: '', design: '', items: '', amount: '', status: 'pending' });
            setShowAddForm(false);
        }
    };

    const handleUpdateOrder = (id, status) => {
        updateOrder(id, { status });
    };

    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setNewOrder({
            customer: order.customer,
            design: order.design,
            items: order.items.toString(),
            amount: order.amount.toString(),
            status: order.status
        });
        setShowAddForm(true);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (editingOrder && newOrder.customer && newOrder.design && newOrder.items && newOrder.amount) {
            updateOrder(editingOrder.id, {
                customer: newOrder.customer,
                design: newOrder.design,
                items: parseInt(newOrder.items),
                amount: parseFloat(newOrder.amount),
                status: newOrder.status
            });
            setEditingOrder(null);
            setNewOrder({ customer: '', design: '', items: '', amount: '', status: 'pending' });
            setShowAddForm(false);
        }
    };

    return (
        <section className="max-w-7xl mx-auto px-3 md:px-6 xl:px-10 space-y-6 md:space-y-8">
            <article className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Design, Order & Quality Control</h1>
                    <p className="text-gray-600 mt-2">Track, manage, and fulfill customer orders</p>
                </div>
                <button onClick={() => {
                    setEditingOrder(null);
                    setNewOrder({ customer: '', design: '', items: '', amount: '', status: 'pending' });
                    setShowAddForm(true);
                }}
                    className="createOrderBtn"
                >
                    + Create New Order
                </button>
            </article>

            {/* Filters */}
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
            </article>

            {/* Add/Edit Order */}
            {showAddForm && (
                <section className="orderForm bg-black bg-opacity-50">
                    <article className="bg-white rounded-xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingOrder ? 'Edit Order' : 'Create New Order'}
                            </h2>

                            <button 
                                onClick={() =>{
                                    setShowAddForm(false);
                                    setEditingOrder(null);
                                    setNewOrder({ customer: '', design: '', items: '', amount: '', status: 'pending' });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={editingOrder ? handleSaveEdit : handleAddOrder} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="orderText"
                                value={newOrder.customer}
                                onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Design Description"
                                className="orderText"
                                value={newOrder.design}
                                onChange={(e) => setNewOrder({...newOrder, design: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Number of Items"
                                className="orderText"
                                value={newOrder.items}
                                onChange={(e) => setNewOrder({...newOrder, items: e.target.value})}
                                required
                            />
                            {userRole === 'owner' && (
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Total Amount (₱)"
                                    className="orderText"
                                    value={newOrder.amount}
                                    onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                                    required
                                />
                            )}

                            <select
                                className="orderText"
                                value={newOrder.status}
                                onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingOrder(null);
                                        setNewOrder({ customer: '', design: '', items: '', amount: '', status: 'pending' });
                                    }}
                                    className="orderBtn2 bg-gray-100 hover:bg-gray-200 text-gray-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="orderBtn2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {editingOrder ? 'Save Changes' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </article>
                </section>
            )}

            {/* Orders Table */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <article className="overflow-x-auto">
                    {orders.length === 0? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No orders yet. Create your first order!</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No orders match your search criteria.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="orderTblText">Order Id</th>
                                    <th className="orderTblText">Customer</th>
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
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="orderMini">
                                        <td className="py-4 px-6 font-semibold text-gray-900">{order.id}</td>
                                        <td className="py-4 px-6 text-gray-700">{order.customer}</td>
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
                    )}

                </article>
            </section>
            
        </section>
    );
};

export default Orders;