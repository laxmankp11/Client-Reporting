import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Modal, Form } from 'react-bootstrap';
import { Plus, ThreeDotsVertical, Envelope, Globe } from 'react-bootstrap-icons';

const AdminClients = () => {
    const [clients, setClients] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const [editingClient, setEditingClient] = useState(null);

    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            const [usersRes, websitesRes] = await Promise.all([
                axios.get('http://127.0.0.1:5002/api/users', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://127.0.0.1:5002/api/websites', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setClients(usersRes.data.filter(u => u.role === 'client'));
            setWebsites(websitesRes.data);
        } catch (error) {
            console.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password;

                await axios.put(`http://127.0.0.1:5002/api/users/${editingClient._id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post('http://127.0.0.1:5002/api/users',
                    { ...formData, role: 'client' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setShowModal(false);
            setEditingClient(null);
            setFormData({ name: '', email: '', password: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            email: client.email,
            password: ''
        });
        setShowModal(true);
    };

    const getWebsiteCount = (clientId) => {
        return websites.filter(site => site.client && site.client._id === clientId).length;
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2 font-['Outfit']">Clients</h2>
                    <p className="text-slate-500 font-medium">Manage access and configure client portals</p>
                </div>
                <button
                    onClick={() => { setEditingClient(null); setFormData({ name: '', email: '', password: '' }); setShowModal(true); }}
                    className="btn-premium btn-primary-gradient flex items-center gap-2"
                >
                    <Plus size={20} /> Add Client
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {clients.map(client => (
                    <div key={client._id} className="glass-card p-6 group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-inner border border-blue-100">
                                {client.name[0]?.toUpperCase()}
                            </div>
                            <button onClick={() => handleEdit(client)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all">
                                <ThreeDotsVertical size={18} />
                            </button>
                        </div>

                        <div className="mb-6 flex-1">
                            <h3 className="font-bold text-lg text-slate-800 mb-1 leading-snug">{client.name}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Envelope size={14} />
                                <span className="truncate">{client.email}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2 text-slate-600 font-medium text-sm bg-slate-50 px-3 py-1.5 rounded-lg">
                                <Globe size={14} className="text-indigo-500" />
                                {getWebsiteCount(client._id)} <span className="text-slate-400 font-normal">Sites</span>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline uppercase tracking-wide">
                                Manage
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-2xl rounded-2xl">
                <div className="bg-white p-6 rounded-2xl">
                    <h3 className="font-bold text-xl text-slate-800 mb-6">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
                    <Form onSubmit={handleSubmit} className="space-y-4">
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client Name</Form.Label>
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
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password {editingClient && '(Leave blank to keep current)'}</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required={!editingClient}
                                className="px-4 py-3 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            />
                        </Form.Group>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">{editingClient ? 'Update' : 'Create'}</button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default AdminClients;
