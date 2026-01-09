import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Modal, Form } from 'react-bootstrap';
import { Plus, ThreeDotsVertical, CodeSlash, Envelope } from 'react-bootstrap-icons';

const AdminDevelopers = () => {
    const [developers, setDevelopers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const [editingDeveloper, setEditingDeveloper] = useState(null);

    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const fetchDevelopers = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDevelopers(data.filter(u => u.role === 'developer'));
        } catch (error) {
            console.error('Failed to fetch developers');
        }
    };

    useEffect(() => {
        fetchDevelopers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDeveloper) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password;

                await axios.put(`${API_URL}/users/${editingDeveloper._id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(`${API_URL}/users`,
                    { ...formData, role: 'developer' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setShowModal(false);
            setEditingDeveloper(null);
            setFormData({ name: '', email: '', password: '' });
            fetchDevelopers();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (developer) => {
        setEditingDeveloper(developer);
        setFormData({
            name: developer.name,
            email: developer.email,
            password: ''
        });
        setShowModal(true);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2 font-['Outfit']">Developers</h2>
                    <p className="text-slate-500 font-medium">Manage your development team</p>
                </div>
                <button
                    onClick={() => { setEditingDeveloper(null); setFormData({ name: '', email: '', password: '' }); setShowModal(true); }}
                    className="btn-premium btn-primary-gradient flex items-center gap-2"
                >
                    <Plus size={20} /> Add Developer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {developers.map(dev => (
                    <div key={dev._id} className="glass-card p-6 group flex flex-col h-full hover:border-amber-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shadow-inner border border-amber-100">
                                {dev.name[0]?.toUpperCase()}
                            </div>
                            <button onClick={() => handleEdit(dev)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all">
                                <ThreeDotsVertical size={18} />
                            </button>
                        </div>

                        <div className="mb-6 flex-1">
                            <h3 className="font-bold text-lg text-slate-800 mb-1 leading-snug">{dev.name}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Envelope size={14} />
                                <span className="truncate">{dev.email}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                ACTIVE
                            </div>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline uppercase tracking-wide">
                                Activity
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-2xl rounded-2xl">
                <div className="bg-white p-6 rounded-2xl">
                    <h3 className="font-bold text-xl text-slate-800 mb-6">{editingDeveloper ? 'Edit Developer' : 'Add New Developer'}</h3>
                    <Form onSubmit={handleSubmit} className="space-y-4">
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Developer Name</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="px-4 py-3 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="px-4 py-3 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password {editingDeveloper && '(Leave blank to keep current)'}</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required={!editingDeveloper}
                                className="px-4 py-3 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            />
                        </Form.Group>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">{editingDeveloper ? 'Update' : 'Create'}</button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDevelopers;
