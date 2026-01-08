import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Nav } from 'react-bootstrap';
import { Speedometer2, People, BoxArrowRight, Grid, CodeSlash, Globe, Calendar3, List } from 'react-bootstrap-icons';
import { useState } from 'react';

import WebsiteSelector from './WebsiteSelector';
import { useWebsite } from '../context/WebsiteContext';

const Sidebar = ({ isOpen, toggle }) => {
    const { user, logout } = useAuth();
    const { websites, selectedWebsiteId, handleWebsiteSelect } = useWebsite();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static shadow-2xl flex flex-column`}>
            {/* Header */}
            <div className="flex flex-col border-b border-slate-800">
                <div className="flex items-center h-20 px-8">
                    <Link to="/" className="flex items-center gap-3 text-white no-underline group">
                        <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
                            <Grid size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold font-['Outfit'] tracking-tight">Agency<span className="text-indigo-400">Panel</span></span>
                    </Link>
                </div>

                {/* Website Selector in Sidebar */}
                {(user?.role === 'client' || user?.role === 'developer') && websites.length > 0 && (
                    <div className="px-4 pb-4">
                        <WebsiteSelector
                            websites={websites}
                            selectedId={selectedWebsiteId}
                            onSelect={handleWebsiteSelect}
                            className="text-slate-800"
                        />
                    </div>
                )}
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</div>
                <Nav className="flex-column gap-1">
                    <NavItem to="/" icon={<Speedometer2 />} label="Dashboard" active={isActive('/')} />

                    {user?.role === 'admin' && (
                        <>
                            <div className="mt-6 px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</div>
                            <NavItem to="/clients" icon={<People />} label="Clients" active={isActive('/clients')} />
                            <NavItem to="/developers" icon={<CodeSlash />} label="Developers" active={isActive('/developers')} />
                            <NavItem to="/websites" icon={<Globe />} label="Websites" active={isActive('/websites')} />
                        </>
                    )}

                    <div className="mt-6 px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Work</div>
                    <NavItem to="/worklogs" icon={<Calendar3 />} label="Project Activity" active={isActive('/worklogs')} />
                </Nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/20">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <div className="font-medium text-sm truncate text-slate-200">{user?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-sm font-medium transition-all group"
                >
                    <BoxArrowRight className="group-hover:translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label, active }) => (
    <Nav.Item>
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'}>{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </Link>
    </Nav.Item>
);

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
                    <span className="font-bold font-['Outfit'] text-slate-800">AgencyPanel</span>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-slate-100 text-slate-600">
                        <List size={24} />
                    </button>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Overlay for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Layout;
