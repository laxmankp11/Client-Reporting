import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { useAuth } from './AuthContext';

const WebsiteContext = createContext();

export const useWebsite = () => useContext(WebsiteContext);

export const WebsiteProvider = ({ children }) => {
    const [websites, setWebsites] = useState([]);
    const [selectedWebsiteId, setSelectedWebsiteId] = useState(localStorage.getItem('selectedWebsiteId') || null);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth(); // Assuming AuthContext provides token

    useEffect(() => {
        const fetchWebsites = async () => {
            if (!user || !token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/websites`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWebsites(res.data);

                // Auto-select logic
                const savedId = localStorage.getItem('selectedWebsiteId');
                const validSavedId = res.data.find(w => w._id === savedId)?._id;

                if (res.data.length === 1) {
                    handleWebsiteSelect(res.data[0]._id);
                } else if (validSavedId) {
                    setSelectedWebsiteId(validSavedId);
                } else if (!validSavedId && savedId) {
                    // Invalid ID stored, clear it
                    handleWebsiteSelect(null);
                }
            } catch (error) {
                console.error('Failed to fetch websites');
            } finally {
                setLoading(false);
            }
        };

        fetchWebsites();
    }, [user, token]);

    const handleWebsiteSelect = (id) => {
        setSelectedWebsiteId(id);
        if (id) {
            localStorage.setItem('selectedWebsiteId', id);
        } else {
            localStorage.removeItem('selectedWebsiteId');
        }
    };

    const value = {
        websites,
        selectedWebsiteId,
        selectedWebsite: websites.find(w => w._id === selectedWebsiteId),
        handleWebsiteSelect,
        loading
    };

    return (
        <WebsiteContext.Provider value={value}>
            {children}
        </WebsiteContext.Provider>
    );
};
