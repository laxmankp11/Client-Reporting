import React from 'react';
import Select from 'react-select'; // Ensure react-select is installed
import { Globe } from 'react-bootstrap-icons';

const WebsiteSelector = ({ websites, selectedId, onSelect, className = '' }) => {
    // Transform websites to react-select options
    const options = websites.map(site => ({
        value: site._id,
        label: site.name,
        // Include full object if needed, but value/label is standard
        siteData: site
    }));

    const selectedOption = options.find(opt => opt.value === selectedId) || null;

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: '0.75rem',
            borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
            boxShadow: state.isFocused ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none',
            paddingLeft: '30px', // Space for icon
            minHeight: '46px',
            '&:hover': {
                borderColor: '#cbd5e1'
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1e293b',
            fontWeight: 600
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f8fafc' : 'white',
            color: state.isSelected ? '#4f46e5' : '#334155',
            cursor: 'pointer',
            padding: '10px 15px',
        })
    };

    return (
        <div className={`relative ${className}`}>
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
            <Select
                options={options}
                value={selectedOption}
                onChange={(opt) => onSelect(opt ? opt.value : null)}
                placeholder="Select a website..."
                styles={{
                    ...customStyles,
                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                }}
                className="w-full min-w-[200px]"
                isSearchable={true}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
            />
        </div>
    );
};

export default WebsiteSelector;
