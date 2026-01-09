import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { useWebsite } from '../context/WebsiteContext';
import { useAuth } from '../context/AuthContext';
import { Modal, Form } from 'react-bootstrap';
import { Plus, Trash, Globe, BoxArrowUpRight } from 'react-bootstrap-icons';

const Competitors = () => {
    const [competitors, setCompetitors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', url: '' });
    const [loading, setLoading] = useState(false);

    const { selectedWebsiteId } = useWebsite();
    const token = localStorage.getItem('token');

    const fetchCompetitors = async () => {
        if (!selectedWebsiteId) return;
        try {
            const response = await axios.get(`${API_URL}/competitors?websiteId=${selectedWebsiteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompetitors(response.data);
        } catch (error) {
            console.error('Failed to fetch competitors');
        }
    };

    useEffect(() => {
        fetchCompetitors();
    }, [selectedWebsiteId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedWebsiteId) return alert('Please select a website first');

        setLoading(true);
        try {
            await axios.post(`${API_URL}/competitors`,
                { ...formData, url: `https://${formData.url}`, websiteId: selectedWebsiteId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowModal(false);
            setFormData({ name: '', url: '' });
            fetchCompetitors();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this competitor?')) return;
        try {
            await axios.delete(`${API_URL}/competitors/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCompetitors();
        } catch (error) {
            console.error('Failed to delete competitor');
        }
    };

    if (!selectedWebsiteId) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="bg-indigo-50 p-6 rounded-full mb-4">
                    <Globe size={40} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Website</h3>
                <p className="text-slate-500 max-w-sm">Please select a website from the sidebar to manage its competitors.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2 font-['Outfit']">Competitors</h2>
                    <p className="text-slate-500 font-medium">Track and monitor competitor websites</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-premium btn-primary-gradient flex items-center gap-2"
                >
                    <Plus size={20} /> Add Competitor
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Competitor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Website URL</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Added</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {competitors.map(comp => (
                                <tr key={comp._id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-100">
                                                {comp.name[0]?.toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-800">{comp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={comp.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg"
                                        >
                                            <span className="truncate max-w-[250px]">{comp.url}</span>
                                            <BoxArrowUpRight size={12} />
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                        {new Date(comp.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(comp._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Competitor"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {competitors.length === 0 && (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-50 p-4 rounded-full shadow-sm mb-4">
                            <Globe size={24} className="text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-700 mb-1">No competitors added yet</h4>
                        <p className="text-slate-500 text-sm mb-4">Add your first competitor to start tracking them.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-indigo-600 font-bold text-sm hover:underline"
                        >
                            Add New Competitor
                        </button>
                    </div>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-2xl rounded-2xl">
                <div className="bg-white p-6 rounded-2xl">
                    <h3 className="font-bold text-xl text-slate-800 mb-6">Add Competitor</h3>
                    <Form onSubmit={handleSubmit} className="space-y-4">
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Competitor Name</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Acme Corp"
                                className="px-4 py-3 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Website URL</Form.Label>
                            <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                                <span className="px-4 py-3 bg-slate-100 text-slate-500 font-medium border-r border-slate-200">https://</span>
                                <Form.Control
                                    type="text"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value.replace(/^https?:\/\//, '') })}
                                    required
                                    placeholder="example.com"
                                    className="px-4 py-3 bg-slate-50 border-0 focus:ring-0 rounded-none w-full"
                                />
                            </div>
                        </Form.Group>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-70"
                            >
                                {loading ? 'Adding...' : 'Add Competitor'}
                            </button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default Competitors;
