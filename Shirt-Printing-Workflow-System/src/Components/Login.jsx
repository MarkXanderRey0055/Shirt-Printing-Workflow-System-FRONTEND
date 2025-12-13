import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('owner');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    /*const [error, setError] = useState('');*/

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        /*setError('');*/

        if (onLogin) {
            onLogin(role); // Pass the selected role to parent
        }

        navigate('/dashboard');

    };

    

    const Spinner = () => (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <>
        <main className="main">
            <section className="container">
                {/*Logo*/}
                <article className="text-center mb-8">
                    <div className="logo">VMV</div>
                    <h1 className="text-3xl font-bold text-gray-900">PrintFlow</h1>
                    <p className="text-gray-600 mt-2 mb-6">Sublimation and Printing Services</p>
                
                    {/*{error && (
                        <div className="error">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}*/}

                    {/* Login From */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <article>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <User size={16} className="mr-2" />
                                    Select Access Level
                                </div>

                            </label>
                            <select
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="role"
                                disabled={loading}
                            >
                                <option value="owner">👑 Owner / Administrator</option>
                                <option value="staff">👤 Staff / Team Member</option>
                            </select>

                            <div className="mt-2 text-xs text-gray-500"></div>
                        </article>

                        {/* Password Input */}
                        <article>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <Lock size={16} className="mr-2" />
                                    Password
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="password"
                                placeholder="Enter your password"
                                disabled={loading}
                                />
                                <button type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="showBtn"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div >
                        </article>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="loginBtn"
                            disabled={loading || !password.trim()}
                        >
                            {loading ? (
                                <>
                                    <Spinner />
                                    Authenticating...
                                </>
                            ) : (
                                `Access as ${userType === 'owner' ? 'Owner' : 'Staff'}`
                            )}
                        </button>
                    </form>         
                </article>
            </section>
        </main>
        </>
    )
}

export default Login;