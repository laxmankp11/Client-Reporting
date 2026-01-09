import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { Plus, ThreeDotsVertical, Globe, Person, CodeSlash, Activity, CheckCircle, XCircle } from 'react-bootstrap-icons';

const AdminWebsites = () => {
    const [websites, setWebsites] = useState([]);
    const [clients, setClients] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        client: null,
        developers: [],
        gscPropertyUrl: ''
    });

    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            const [webRes, userRes] = await Promise.all([
                axios.get(`${API_URL}/websites`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setWebsites(webRes.data);
            setClients(userRes.data.filter(u => u.role === 'client').map(u => ({ value: u._id, label: u.name })));
            setDevelopers(userRes.data.filter(u => u.role === 'developer').map(u => ({ value: u._id, label: u.name })));
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
            const payload = {
                ...formData,
                client: formData.client ? formData.client.value : null,
                developers: formData.developers.map(d => d.value)
            };

            if (editingWebsite) {
                await axios.put(`${API_URL}/websites/${editingWebsite._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/websites`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setShowModal(false);
            setEditingWebsite(null);
            setFormData({ name: '', url: '', client: null, developers: [], gscPropertyUrl: '' });
            fetchData();
        } catch (error) {
            alert('Operation failed');
        }
    };

    const handleEdit = (website) => {
        setEditingWebsite(website);
        setFormData({
            name: website.name,
            url: website.url,
            client: website.client ? { value: website.client._id, label: website.client.name } : null,
            developers: website.developers ? website.developers.map(d => ({ value: d._id, label: d.name })) : [],
            gscPropertyUrl: website.gscPropertyUrl || ''
        });
        setShowModal(true);
    };

    const handleScan = async (websiteId) => {
        setScanning(true);
        setScanResult(null);
        setShowScanModal(true);
        try {
            const res = await axios.post(`${API_URL}/websites/${websiteId}/scan`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setScanResult(res.data);
            fetchData(); // Refresh list to show new score
        } catch (error) {
            setScanResult({ error: 'Scan failed. Please verify URL is reachable.' });
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2 font-['Outfit']">Websites</h2>
                    <p className="text-slate-500 font-medium">Manage client projects and team assignments</p>
                </div>
                <button
                    onClick={() => { setEditingWebsite(null); setFormData({ name: '', url: '', client: '', developers: [], gscPropertyUrl: '' }); setShowModal(true); }}
                    className="btn-premium btn-primary-gradient flex items-center gap-2"
                >
                    <Plus size={20} /> New Project
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {websites.map(site => (
                    <div key={site._id} className="glass-card p-6 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-inner">
                                    <Globe />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{site.name}</h3>
                                    <a href={site.url} target="_blank" rel="noreferrer" className="text-slate-400 text-sm hover:text-indigo-500 transition-colors truncate block max-w-[200px]">{site.url}</a>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleScan(site._id)} title="Run Health Check" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                    <Activity size={18} />
                                </button>
                                <button onClick={() => handleEdit(site)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                    <ThreeDotsVertical size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SEO Health</span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${!site.seoHealthScore ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                    site.seoHealthScore > 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        site.seoHealthScore > 50 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                    {site.seoHealthScore || 0}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${!site.seoHealthScore ? 'bg-slate-300' :
                                        site.seoHealthScore > 80 ? 'bg-emerald-500' :
                                            site.seoHealthScore > 50 ? 'bg-amber-500' :
                                                'bg-rose-500'
                                        }`}
                                    style={{ width: `${site.seoHealthScore || 0}%` }}
                                />
                            </div>
                            {site.lastSeoScan && (
                                <div className="text-right mt-2 text-[10px] text-slate-400 italic">
                                    Last scan: {new Date(site.lastSeoScan).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                                    <Person size={14} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs text-slate-400 font-medium uppercase block mb-0.5">Client</span>
                                    <span className="text-sm font-semibold text-slate-700">{site.client?.name || 'Unassigned'}</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-500">
                                        <CodeSlash size={14} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium uppercase">Developers</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pl-9">
                                    {site.developers && site.developers.length > 0 ? (
                                        site.developers.map(dev => (
                                            <span key={dev._id} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 shadow-sm flex items-center gap-1">
                                                {dev.name.split(' ')[0]}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No developers assigned</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scan Results Modal */}
            <Modal show={showScanModal} onHide={() => setShowScanModal(false)} centered size="lg" contentClassName="border-0 shadow-2xl rounded-2xl overflow-hidden">
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-800 m-0">SEO Health Scan</h3>
                    <button onClick={() => setShowScanModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
                </div>
                <Modal.Body className="p-8 bg-white">
                    {scanning && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500 font-medium">Analyzing website performance & tags...</p>
                        </div>
                    )}

                    {!scanning && scanResult && scanResult.error && (
                        <div className="text-center py-12 bg-rose-50 rounded-2xl border border-rose-100">
                            <XCircle size={48} className="text-rose-500 mx-auto mb-4" />
                            <h5 className="font-bold text-rose-700 text-lg mb-2">Scan Failed</h5>
                            <p className="text-rose-600/80 max-w-md mx-auto">{scanResult.error}</p>
                        </div>
                    )}

                    {!scanning && scanResult && !scanResult.error && (
                        <div className="animate-fade-in-up">
                            <div className="text-center mb-8">
                                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 mb-4 ${scanResult.seoHealthScore > 80 ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                                    scanResult.seoHealthScore > 50 ? 'border-amber-100 bg-amber-50 text-amber-600' :
                                        'border-rose-100 bg-rose-50 text-rose-600'
                                    }`}>
                                    <span className="text-5xl font-bold">{scanResult.seoHealthScore}%</span>
                                </div>
                                <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Overall Health Score</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Details Grid - Refactored for Tailwind */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <h6 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-4">Meta Tags</h6>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            {scanResult.seoData?.title ? <CheckCircle className="text-emerald-500 mt-1 shrink-0" /> : <XCircle className="text-rose-500 mt-1 shrink-0" />}
                                            <div className="flex-1 overflow-hidden">
                                                <div className="font-semibold text-sm text-slate-700">Title Tag</div>
                                                <div className="text-xs text-slate-500 truncate">{scanResult.seoData?.title || 'Missing'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            {scanResult.seoData?.description ? <CheckCircle className="text-emerald-500 mt-1 shrink-0" /> : <XCircle className="text-rose-500 mt-1 shrink-0" />}
                                            <div className="flex-1 overflow-hidden">
                                                <div className="font-semibold text-sm text-slate-700">Meta Description</div>
                                                <div className="text-xs text-slate-500 truncate">{scanResult.seoData?.description || 'Missing'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <h6 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-4">Performance & Social</h6>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            {scanResult.seoData?.loadTime < 2000 ? <CheckCircle className="text-emerald-500 mt-1 shrink-0" /> : <Activity className="text-amber-500 mt-1 shrink-0" />}
                                            <div>
                                                <div className="font-semibold text-sm text-slate-700">Load Speed</div>
                                                <div className="text-xs text-slate-500">{scanResult.seoData?.loadTime}ms</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            {scanResult.seoData?.ogImage ? <CheckCircle className="text-emerald-500 mt-1 shrink-0" /> : <XCircle className="text-rose-500 mt-1 shrink-0" />}
                                            <div>
                                                <div className="font-semibold text-sm text-slate-700">Social Image</div>
                                                <div className="text-xs text-slate-500">{scanResult.seoData?.ogImage ? 'Optimized' : 'Missing'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Edit/Add Modal - Kept Structure but styled content */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-2xl rounded-2xl">
                <div className="bg-white p-6 rounded-2xl">
                    <h3 className="font-bold text-xl text-slate-800 mb-6">{editingWebsite ? 'Edit Website' : 'Add New Website'}</h3>
                    <Form onSubmit={handleSubmit} className="space-y-4">
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Website Name</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="px-4 py-3 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">URL</Form.Label>
                            <Form.Control
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                required
                                className="px-4 py-3 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                                placeholder="https://example.com"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">GSC URL (Optional)</Form.Label>
                            <Form.Control
                                value={formData.gscPropertyUrl}
                                onChange={e => setFormData({ ...formData, gscPropertyUrl: e.target.value })}
                                className="px-4 py-3 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client</Form.Label>
                                    <Select
                                        options={clients}
                                        value={formData.client}
                                        onChange={option => setFormData({ ...formData, client: option })}
                                        classNamePrefix="react-select"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Developers</Form.Label>
                                    <Select
                                        isMulti
                                        options={developers}
                                        value={formData.developers}
                                        onChange={selected => setFormData({ ...formData, developers: selected || [] })}
                                        classNamePrefix="react-select"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">{editingWebsite ? 'Update' : 'Create'}</button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default AdminWebsites;
