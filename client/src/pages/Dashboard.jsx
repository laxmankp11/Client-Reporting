import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWebsite } from '../context/WebsiteContext';
import { Row, Col, Table, Container } from 'react-bootstrap';
import { People, Globe, FileText, ArrowUpRight, Activity, CheckCircle, XCircle, Search, Calendar, ChevronRight, Envelope } from 'react-bootstrap-icons';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocation } from 'react-router-dom';

const GscChart = ({ websiteId, token }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchGsc = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:5002/api/websites/${websiteId}/gsc`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })));
            } catch (error) {
                console.error('Failed to load GSC data');
            }
        };
        if (websiteId) fetchGsc();
    }, [websiteId, token]);

    if (data.length === 0) return <div className="text-slate-400 text-xs font-medium text-center py-8">Gathering analytics data...</div>;

    return (
        <div style={{ height: '160px', width: '100%' }}>
            <ResponsiveContainer>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
            </ResponsiveContainer>
            <div className="text-center mt-[-10px] relative z-10">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">30 Day Clicks</span>
            </div>
        </div>
    );
};

const ClientDashboard = () => {
    const { websites, selectedWebsiteId, selectedWebsite, loading: contextLoading } = useWebsite();
    const [allWorkLogs, setAllWorkLogs] = useState([]); // Store all logs
    const [logsLoading, setLogsLoading] = useState(true);

    const token = localStorage.getItem('token');
    const { user } = useAuth();

    // Fetch Logs separately (Websites are managed by Context)
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLogsLoading(true);
                const logRes = await axios.get('http://127.0.0.1:5002/api/worklogs', { headers: { Authorization: `Bearer ${token}` } });
                setAllWorkLogs(logRes.data);
                setLogsLoading(false);
            } catch (error) {
                console.error('Error fetching logs');
                setLogsLoading(false);
            }
        };
        fetchLogs();
    }, [token]);

    const loading = contextLoading || logsLoading;

    // Filtered Data
    const filteredWorkLogs = allWorkLogs.filter(log => log.website?._id === selectedWebsiteId || log.website === selectedWebsiteId);

    if (loading) return <div className="text-center py-20 text-slate-400">Loading your dashboard...</div>;

    // If no website selected (and we have > 1), show selection prompt (though now it's in sidebar, we can show a welcome message)
    if (!selectedWebsiteId && websites.length > 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-sm">
                        <Globe size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 font-['Outfit']">Select a Website</h2>
                    <p className="text-slate-500 mb-8">Please choose a website from the sidebar to view reports.</p>
                </div>
            </div>
        );
    }

    // If user has 0 websites
    if (websites.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Globe size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-500 font-medium">No active websites found</h3>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-indigo-50 mb-3 border border-white/10">
                            <Globe size={12} />
                            <span>Currently Viewing</span>
                        </div>
                        <h2 className="text-3xl font-bold font-['Outfit'] mb-1">{selectedWebsite?.name}</h2>
                        <a href={selectedWebsite?.url} target="_blank" rel="noreferrer" className="text-indigo-200 hover:text-white transition-colors flex items-center gap-1 text-sm">
                            {selectedWebsite?.url} <ArrowUpRight size={12} />
                        </a>
                    </div>
                </div>
                {/* Abstract Shapes */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute left-0 bottom-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
            </div>

            <Row className="g-6">
                {/* Health Score Card */}
                <Col md={6} lg={3}>
                    <div className="glass-card p-6 h-full relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Health Score</p>
                        <div className="flex items-end gap-2 mb-2 relative z-10">
                            <span className={`text-4xl font-black font-['Outfit'] ${!selectedWebsite?.seoHealthScore ? 'text-slate-400' : selectedWebsite.seoHealthScore > 80 ? 'text-emerald-500' : selectedWebsite.seoHealthScore > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {selectedWebsite?.seoHealthScore || 0}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${!selectedWebsite?.seoHealthScore ? 'bg-slate-300' : selectedWebsite.seoHealthScore > 80 ? 'bg-emerald-500' : selectedWebsite.seoHealthScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${selectedWebsite?.seoHealthScore || 0}%` }}></div>
                        </div>
                    </div>
                </Col>

                {/* Load Time Card */}
                <Col md={6} lg={3}>
                    <div className="glass-card p-6 h-full relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Load Time</p>
                        <div className="flex items-end gap-2 relative z-10">
                            <span className="text-4xl font-black font-['Outfit'] text-slate-700">
                                {selectedWebsite?.seoData?.loadTime ? `${(selectedWebsite.seoData.loadTime / 1000).toFixed(1)}s` : 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
                            {selectedWebsite?.seoData?.loadTime < 2000 ? <CheckCircle className="text-emerald-500" /> : <Activity className="text-amber-500" />}
                            Performance Status
                        </div>
                    </div>
                </Col>

                {/* H1 Status Card */}
                <Col md={6} lg={3}>
                    <div className="glass-card p-6 h-full relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">H1 Structure</p>
                        <div className="flex items-center gap-3 mt-1 relative z-10">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedWebsite?.seoData?.h1?.length ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                {selectedWebsite?.seoData?.h1?.length ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            </div>
                            <div>
                                <div className="font-bold text-slate-700">{selectedWebsite?.seoData?.h1?.length ? 'Optimized' : 'Missing'}</div>
                                <div className="text-xs text-slate-400">{selectedWebsite?.seoData?.h1?.length || 0} H1 Tags Found</div>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* GSC Mini Chart Card */}
                <Col md={6} lg={3}>
                    <div className="glass-card p-0 h-full overflow-hidden flex flex-col">
                        <div className="p-4 pb-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Traffic Trend</p>
                        </div>
                        <div className="flex-1 min-h-[80px]">
                            <GscChart websiteId={selectedWebsite?._id} token={token} />
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Recent Activity / Work Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">Last 30 Days</span>
                    </div>
                    <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden min-h-[300px]">
                        {filteredWorkLogs.length > 0 ? (
                            <Table hover className="mb-0 align-middle">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Date & Developer</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Task Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredWorkLogs.map(log => (
                                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 border-none">
                                                <div className="font-bold text-slate-700 text-sm">{new Date(log.createdAt).toLocaleDateString()}</div>
                                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                                    {log.developer?.name || 'Developer'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-none">
                                                <div className="text-sm text-slate-700 font-medium mb-1">{log.description}</div>
                                                {log.tags && log.tags.length > 0 && (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {log.tags.map((tag, idx) => (
                                                            <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 border-none text-right">
                                                <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">{log.durationMinutes}m</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-16">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                    <Calendar className="text-slate-300" size={24} />
                                </div>
                                <h4 className="text-slate-500 font-medium">No activity logs found</h4>
                                <p className="text-slate-400 text-xs mt-1">Check back later for updates from your dev team.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 px-1">Project Details</h3>
                    <div className="glass-card p-6 space-y-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Developers</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedWebsite?.developers && selectedWebsite.developers.length > 0 ? (
                                    selectedWebsite.developers.map((dev, idx) => (
                                        <div key={dev._id || idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 pr-4">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                {dev.name?.[0] || 'D'}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">{dev.name}</div>
                                                <div className="text-[10px] text-slate-400">Developer</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-slate-400 italic">No developers assigned</div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
                            <button className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mb-2">
                                <Envelope size={14} /> Contact Team
                            </button>
                            <button className="w-full py-2.5 px-4 bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium rounded-xl text-sm shadow-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                                <FileText size={14} /> Download Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card p-6 flex items-center justify-between group hover:border-indigo-100">
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold font-['Outfit'] text-slate-800">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 ${color}`}>
            <Icon />
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ clients: 0, developers: 0, websites: 0, workLogs: 0 });
    const token = localStorage.getItem('token');
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, websitesRes, logsRes] = await Promise.all([
                    axios.get('http://127.0.0.1:5002/api/users', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://127.0.0.1:5002/api/websites', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://127.0.0.1:5002/api/worklogs', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                const clients = usersRes.data.filter(u => u.role === 'client').length;
                const developers = usersRes.data.filter(u => u.role === 'developer').length;
                setStats({ clients, developers, websites: websitesRes.data.length, workLogs: logsRes.data.length });
            } catch (error) {
                console.error('Error fetching admin stats');
            }
        };
        fetchStats();
    }, [token]);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold font-['Outfit'] text-slate-800 mb-1">Dashboard</h1>
                    <p className="text-slate-500">Welcome, {user?.name}</p>
                </div>
            </div>

            <Row className="g-6">
                <Col md={3}>
                    <StatCard title="Total Clients" value={stats.clients} icon={People} color="bg-blue-50 text-blue-600" />
                </Col>
                <Col md={3}>
                    <StatCard title="Developers" value={stats.developers} icon={People} color="bg-amber-50 text-amber-600" />
                </Col>
                <Col md={3}>
                    <StatCard title="Active Websites" value={stats.websites} icon={Globe} color="bg-emerald-50 text-emerald-600" />
                </Col>
                <Col md={3}>
                    <StatCard title="Total Work Logs" value={stats.workLogs} icon={FileText} color="bg-indigo-50 text-indigo-600" />
                </Col>
            </Row>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <Activity size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Detailed Analytics</h3>
                    <p className="text-slate-500 max-w-xs">Deep dive analytics and reporting features are coming in the next update.</p>
                </div>
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <ArrowUpRight size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Performance Trends</h3>
                    <p className="text-slate-500 max-w-xs">Trend analysis for website SEO and health scores will appear here.</p>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    if (user && user.role === 'client') return <ClientDashboard />;
    return <AdminDashboard />;
};

export default Dashboard;
