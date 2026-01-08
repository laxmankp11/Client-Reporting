import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert } from 'react-bootstrap'; // Keep bootstrap for form internals to minimize breakages
import { Grid, ArrowRight } from 'react-bootstrap-icons';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-6 ring-1 ring-slate-100">
                        <Grid size={32} className="text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 font-['Outfit']">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to access your platform</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-white/50 p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-center">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></span>
                            {error}
                        </div>
                    )}

                    <Form onSubmit={handleSubmit} className="space-y-5">
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block ml-1">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all font-medium"
                                placeholder="name@company.com"
                                style={{ border: '1px solid #e2e8f0' }} // Bootstrap override
                            />
                        </Form.Group>

                        <Form.Group>
                            <div className="flex justify-between items-center mb-2">
                                <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0 ml-1">Password</Form.Label>
                                <a href="#" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 no-underline">Forgot?</a>
                            </div>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all font-medium"
                                placeholder="••••••••"
                                style={{ border: '1px solid #e2e8f0' }} // Bootstrap override
                            />
                        </Form.Group>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </Form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-slate-400 text-xs">
                        &copy; 2026 AgencyPanel Platform. <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a> &bull; <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
