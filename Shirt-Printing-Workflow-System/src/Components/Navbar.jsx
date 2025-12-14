import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ userRole, onLogout }) => {
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) =>
        pathname === path || (path === '/dashboard' && pathname === '/');

    const navClass = (path) => 
        `block md:inline-block px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-all duration-200 ${
            isActive(path)
                ? 'text-green-600 bg-[#FFFDF6] font-semibold'
                : 'text-white hover:text-gray-900 hover:bg-gray-50'
        }`;

    const navItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Orders', path: '/orders' },
        { label: 'Inventory', path: '/inventory' },
    ];

    // ✅ Settings removed here
    const ownerItems = [
        { label: 'Reports', path: '/reports' },
    ];

    return (
        <header className="bg-green-600 shadow-sm mb-8">
            <section className="max-w-8xl mx-auto px-4 md:px-8 py-4">
                <article className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center 
                            justify-center font-bold text-white text-lg ${
                            userRole === 'owner'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                                : 'bg-gradient-to-br from-gray-500 to-gray-700'
                        }`}>
                            {userRole === 'owner' ? 'A' : 'S'}
                        </div>

                        <div className="hidden sm:block">
                            <h1 className="text-lg md:text-2xl font-bold text-white">ShirtPrint</h1>
                            <p className="text-xs md:text-sm text-gray-200">
                                Business Management System
                            </p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map(({ label, path }) => (
                            <Link key={path} to={path} className={navClass(path)}>
                                {label}
                            </Link>
                        ))}

                        {userRole === 'owner' &&
                            ownerItems.map(({ label, path }) => (
                                <Link key={path} to={path} className={navClass(path)}>
                                    {label}
                                </Link>
                            ))}
                    </nav>

                    {/* Logout */}
                    <article className="hidden md:flex items-center space-x-4">
                        <div className="text-right">
                            <p className="font-medium text-gray-900 text-sm md:text-base">
                                {userRole === 'owner' ? '👑 Admin User' : '👤 Staff Member'}
                            </p>
                            <p className="text-xs md:text-sm text-gray-200">
                                {userRole === 'owner' ? 'Full Access' : 'Limited Access'}
                            </p>
                        </div>

                        <button
                            onClick={onLogout}
                            className="bg-[#FFFDF6] hover:bg-gray-200 text-green-600 font-medium py-2 px-4 rounded-lg"
                        >
                            Logout
                        </button>
                    </article>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white text-2xl"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        ☰
                    </button>
                </article>

                {/* Mobile Menu */}
                {menuOpen && (
                    <article className="md:hidden mt-4 space-y-2 border-t pt-4">
                        {[...navItems, ...(userRole === 'owner' ? ownerItems : [])].map(
                            ({ label, path }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => setMenuOpen(false)}
                                    className={navClass(path)}
                                >
                                    {label}
                                </Link>
                            )
                        )}

                        <div className="pt-4 border-t">
                            <p className="font-medium text-gray-900">
                                {userRole === 'owner' ? '👑 Admin User' : '👤 Staff Member'}
                            </p>
                            <p className="text-sm text-white-200 mb-3">
                                {userRole === 'owner' ? 'Full Access' : 'Limited Access'}
                            </p>

                            <button
                                onClick={onLogout}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg"
                            >
                                Logout
                            </button>
                        </div>
                    </article>
                )}
            </section>
        </header>
    );
};

export default Navbar;
