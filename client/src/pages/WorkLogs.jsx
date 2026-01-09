import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useWebsite } from '../context/WebsiteContext';
import { Container, Button, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Plus, Star, StarFill, CheckCircleFill, XCircleFill, Clock, FileText, Lightbulb, Trash, Paperclip } from 'react-bootstrap-icons';

const WorkLogs = () => {
    const [logs, setLogs] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showStarredOnly, setShowStarredOnly] = useState(false);
    const [expandedItems, setExpandedItems] = useState({});
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ logId: null, action: null, comment: '' });
    const observer = useRef();

    const { selectedWebsiteId, handleWebsiteSelect } = useWebsite();

    const [formData, setFormData] = useState({
        websiteId: '',
        type: 'log',
        title: '',
        description: '',
        durationMinutes: 60,
        tags: ''
    });
    const [questions, setQuestions] = useState([]);

    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const lastLogElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    const fetchData = async (pageNum, reset = false) => {
        setIsLoading(true);
        try {
            const limit = 15;
            const starQuery = showStarredOnly ? '&isStarred=true' : '';
            const typeQuery = filterType !== 'all' ? `&type=${filterType}` : '';
            const websiteQuery = selectedWebsiteId ? `&websiteId=${selectedWebsiteId}` : '';

            const logsRes = await axios.get(`${API_URL}/worklogs?page=${pageNum}&limit=${limit}${starQuery}${typeQuery}${websiteQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (reset) {
                setLogs(logsRes.data);
            } else {
                setLogs(prev => [...prev, ...logsRes.data]);
            }

            setHasMore(logsRes.data.length === limit);

            if (user.role === 'developer' || user.role === 'admin') {
                const webRes = await axios.get(`${API_URL}/websites`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWebsites(webRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setLogs([]);
        setHasMore(true);
        fetchData(1, true);
    }, [filterType, showStarredOnly, selectedWebsiteId]);

    useEffect(() => {
        if (page > 1) {
            fetchData(page, false);
        }
    }, [page]);

    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('websiteId', formData.websiteId);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('durationMinutes', formData.durationMinutes);
            formDataToSend.append('tags', formData.tags); // server handles string
            if (formData.title) formDataToSend.append('title', formData.title);

            selectedFiles.forEach(file => {
                formDataToSend.append('attachments', file);
            });

            if (questions.length > 0) {
                formDataToSend.append('questions', JSON.stringify(questions));
            }

            const res = await axios.post(`${API_URL}/worklogs`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const payload = res.data; // use response data which contains the created object

            setShowModal(false);
            setFormData({ clientId: '', websiteId: '', type: 'log', title: '', description: '', durationMinutes: 60, tags: '' });
            setQuestions([]);
            setSelectedFiles([]);

            // If the log was added for a different website than currently selected, switch to it
            if (payload.websiteId && payload.websiteId !== selectedWebsiteId) {
                handleWebsiteSelect(payload.websiteId);
                // useEffect will trigger fetchData
            } else {
                fetchData(1, true);
            }
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to log work';
            alert(message);
        }
    };

    const handleStarToggle = async (e, log) => {
        e.stopPropagation();
        try {
            const newStatus = !log.isStarred;
            setLogs(prevLogs => prevLogs.map(l => l._id === log._id ? { ...l, isStarred: newStatus } : l));

            await axios.put(`${API_URL}/worklogs/${log._id}`, { isStarred: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to toggle star');
            setLogs(prevLogs => prevLogs.map(l => l._id === log._id ? { ...l, isStarred: !log.isStarred } : l));
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackData.comment.trim()) {
            alert('Please add a comment');
            return;
        }

        try {
            await axios.put(`${API_URL}/worklogs/${feedbackData.logId}`, {
                status: feedbackData.action,
                clientResponse: feedbackData.comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowFeedbackModal(false);
            setFeedbackData({ logId: null, action: null, comment: '' });
            fetchData(1, true);
        } catch (error) {
            alert('Failed to update action item');
        }
    };

    const handleActionClick = (logId, action) => {
        setFeedbackData({ logId, action, comment: '' });
        setShowFeedbackModal(true);
    };

    const handleQuestionResponse = async (logId, questionIndex, response) => {
        const log = logs.find(l => l._id === logId);
        if (!log) return;

        const newQuestions = [...log.questions];
        newQuestions[questionIndex].response = response;

        // Optimistic UI Update
        setLogs(prevLogs => prevLogs.map(l => l._id === logId ? { ...l, questions: newQuestions } : l));

        try {
            await axios.put(`${API_URL}/worklogs/${logId}`, {
                questions: newQuestions
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error('Failed to save response');
            // Revert on failure (could retrieve original from server)
            fetchData(page, false);
        }
    };

    const handleDelete = async (e, logId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this activity?')) return;

        try {
            await axios.delete(`${API_URL}/worklogs/${logId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(1, true); // Refresh list
        } catch (error) {
            console.error('Failed to delete log', error);
            alert('Failed to delete activity');
        }
    };

    const getRelativeTime = (date) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const groupByDate = (items) => {
        const groups = {};
        items.forEach(item => {
            const date = new Date(item.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let label;
            if (date.toDateString() === today.toDateString()) {
                label = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                label = 'Yesterday';
            } else {
                label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(item);
        });
        return groups;
    };

    const groupedLogs = groupByDate(logs);

    // Question Builder Helpers
    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', type: 'approval', options: ['Yes', 'No'] }]);
    };

    const handleUpdateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;

        // If switching to approval, ensure 2 options
        if (field === 'type' && value === 'approval') {
            // If already has options, take first 2 or pad to 2
            let currentOpts = newQuestions[index].options || [];
            if (currentOpts.length > 2) currentOpts = currentOpts.slice(0, 2);
            while (currentOpts.length < 2) currentOpts.push(`Option ${currentOpts.length + 1}`);
            newQuestions[index].options = currentOpts;
        }

        setQuestions(newQuestions);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleAddOption = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push(`Option ${newQuestions[qIndex].options.length + 1}`);
        setQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(newQuestions);
    };

    return (
        <Container fluid className="px-0" style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 24px' }}>
            {/* Main Card Container */}
            <Container style={{ maxWidth: '1200px' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                }}>
                    {/* Header Section */}
                    <div style={{ padding: '32px 32px 24px 32px', borderBottom: '1px solid #f1f5f9' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem', color: '#0f172a' }}>Activity</h2>
                                <p className="mb-0" style={{ fontSize: '0.875rem', color: '#64748b' }}>Track work and manage action items</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant={showStarredOnly ? "warning" : "light"}
                                    size="sm"
                                    className="d-flex align-items-center gap-1"
                                    onClick={() => setShowStarredOnly(!showStarredOnly)}
                                    style={{ borderRadius: '8px', fontWeight: '500', fontSize: '0.875rem' }}
                                >
                                    {showStarredOnly ? <StarFill size={14} /> : <Star size={14} />}
                                    {showStarredOnly ? 'Starred' : 'All'}
                                </Button>
                                {(user.role === 'developer' || user.role === 'admin') && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setFormData({
                                                websiteId: selectedWebsiteId || '',
                                                type: 'log',
                                                title: '',
                                                description: '',
                                                durationMinutes: 60,
                                                tags: ''
                                            });
                                            setShowModal(true);
                                        }}
                                        className="d-flex align-items-center gap-1"
                                        style={{ borderRadius: '8px', fontWeight: '500', fontSize: '0.875rem' }}
                                    >
                                        <Plus size={16} /> New
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="d-flex gap-2" style={{ flexWrap: 'wrap' }}>
                            {['all', 'log', 'action', 'report', 'observation'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    style={{
                                        background: filterType === type ? '#3b82f6' : 'white',
                                        color: filterType === type ? 'white' : '#64748b',
                                        border: `1.5px solid ${filterType === type ? '#3b82f6' : '#e2e8f0'}`,
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {type === 'all' ? 'All Activity' : type === 'log' ? 'Work Logs' : type === 'action' ? 'Action Items' : type === 'report' ? 'Reports' : 'Observations'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Content */}
                    <div style={{ padding: '24px 32px 32px 32px', background: '#fafbfc' }}>
                        {Object.entries(groupedLogs).map(([date, items]) => (
                            <div key={date} style={{ marginBottom: '32px' }}>
                                {/* Sticky Date Header */}
                                <div style={{
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 10,
                                    background: '#f8fafc',
                                    padding: '8px 0',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{
                                        fontSize: '0.813rem',
                                        fontWeight: '700',
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {date}
                                    </div>
                                </div>

                                {/* Activity Items */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {items.map((item, index) => {
                                        const isLastElement = Object.keys(groupedLogs)[Object.keys(groupedLogs).length - 1] === date &&
                                            index === items.length - 1;
                                        const isAction = item.type === 'action';
                                        const isExpanded = expandedItems[item._id];

                                        // Status config
                                        let statusConfig = {
                                            color: '#3b82f6',
                                            bg: '#eff6ff',
                                            label: 'Log',
                                            icon: null
                                        };

                                        if (isAction) {
                                            if (item.status === 'pending') {
                                                statusConfig = { color: '#f59e0b', bg: '#fef3c7', label: 'Pending', icon: <Clock size={12} /> };
                                            } else if (item.status === 'approved') {
                                                statusConfig = { color: '#10b981', bg: '#d1fae5', label: 'Approved', icon: <CheckCircleFill size={12} /> };
                                            } else if (item.status === 'rejected') {
                                                statusConfig = { color: '#ef4444', bg: '#fee2e2', label: 'Rejected', icon: <XCircleFill size={12} /> };
                                            }
                                        } else if (item.type === 'report') {
                                            statusConfig = { color: '#8b5cf6', bg: '#f3e8ff', label: 'Report', icon: <FileText size={12} /> };
                                        } else if (item.type === 'observation') {
                                            statusConfig = { color: '#d97706', bg: '#fef3c7', label: 'Observation', icon: <Lightbulb size={12} /> };
                                        }

                                        const description = isAction ? item.description : item.description;
                                        const shouldTruncate = description && description.length > 200;
                                        const displayText = shouldTruncate && !isExpanded
                                            ? description.substring(0, 200) + '...'
                                            : description;

                                        return (
                                            <div
                                                key={item._id}
                                                ref={isLastElement ? lastLogElementRef : null}
                                                style={{
                                                    background: 'white',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#fafbfc';
                                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.08)';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.04)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                {/* Content */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {/* Header */}
                                                    <div className="d-flex align-items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                                                            {getRelativeTime(item.createdAt)}
                                                        </span>
                                                        <span
                                                            style={{
                                                                background: statusConfig.bg,
                                                                color: statusConfig.color,
                                                                padding: '3px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.688rem',
                                                                fontWeight: '700',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                border: `1px solid ${statusConfig.color}20`
                                                            }}
                                                        >
                                                            {statusConfig.icon}
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>

                                                    {/* Title (for actions) */}
                                                    {isAction && item.title && (
                                                        <div style={{
                                                            fontSize: '0.938rem',
                                                            fontWeight: '600',
                                                            color: '#1e293b',
                                                            marginBottom: '6px',
                                                            lineHeight: '1.4'
                                                        }}>
                                                            {item.title}
                                                        </div>
                                                    )}

                                                    {/* Description */}
                                                    {description && (
                                                        <div style={{
                                                            fontSize: '0.875rem',
                                                            color: '#475569',
                                                            lineHeight: '1.6',
                                                            whiteSpace: 'pre-wrap',
                                                            marginBottom: shouldTruncate ? '8px' : '10px'
                                                        }}>
                                                            {displayText}
                                                        </div>
                                                    )}

                                                    {/* Attachments */}
                                                    {item.attachments && item.attachments.length > 0 && (
                                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                                            {item.attachments.map((path, idx) => {
                                                                const isImage = path.match(/\.(jpeg|jpg|gif|png)$/) != null;
                                                                const fullUrl = `${API_URL.replace('/api', '')}${path}`;

                                                                if (isImage) {
                                                                    return (
                                                                        <a key={idx} href={fullUrl} target="_blank" rel="noopener noreferrer" className="d-block">
                                                                            <img
                                                                                src={fullUrl}
                                                                                alt="Attachment"
                                                                                style={{
                                                                                    maxWidth: '100%',
                                                                                    maxHeight: '200px',
                                                                                    borderRadius: '8px',
                                                                                    border: '1px solid #e2e8f0'
                                                                                }}
                                                                            />
                                                                        </a>
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <a
                                                                            key={idx}
                                                                            href={fullUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '6px',
                                                                                padding: '8px 12px',
                                                                                background: '#f8fafc',
                                                                                border: '1px solid #e2e8f0',
                                                                                borderRadius: '8px',
                                                                                color: '#475569',
                                                                                textDecoration: 'none',
                                                                                fontSize: '0.875rem',
                                                                                fontWeight: '500'
                                                                            }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                                        >
                                                                            <Paperclip size={14} />
                                                                            Download Attachment {idx + 1}
                                                                        </a>
                                                                    );
                                                                }
                                                            })}
                                                        </div>
                                                    )}

                                                    {shouldTruncate && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedItems(prev => ({ ...prev, [item._id]: !prev[item._id] }));
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#3b82f6',
                                                                fontSize: '0.813rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                padding: 0,
                                                                marginBottom: '10px',
                                                                textDecoration: 'none'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                        >
                                                            {isExpanded ? 'Show less' : 'Read more'}
                                                        </button>
                                                    )}

                                                    {/* Questions Display */}
                                                    {item.questions && item.questions.length > 0 && (
                                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                                            <div style={{ fontSize: '0.688rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                                                                Questions & Responses
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                {item.questions.map((q, qIdx) => {
                                                                    const canRespond = user.role === 'client'; // Logic: Only clients respond?
                                                                    // Or assume Admin can also edit responses on behalf of client? For now, let's allow client.

                                                                    return (
                                                                        <div key={qIdx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                                                                {q.text}
                                                                            </div>

                                                                            {q.type === 'approval' && (
                                                                                <div className="d-flex gap-2 flex-wrap">
                                                                                    {q.options.map((opt, i) => {
                                                                                        const isSelected = q.response === opt;
                                                                                        // Smart coloring: First option green, second red, others neutral
                                                                                        // Or just neutral unless selected.
                                                                                        // Let's use a dynamic color approach.
                                                                                        // If 2 options: 0=Green, 1=Red? Or just Blue/Slate.
                                                                                        // User asked for Male/Female, Agree/Disagree.
                                                                                        // Let's stick to Blue for selected, White for unselected.
                                                                                        const color = '#3b82f6';
                                                                                        return (
                                                                                            <button
                                                                                                key={i}
                                                                                                onClick={(e) => { e.stopPropagation(); if (canRespond) handleQuestionResponse(item._id, qIdx, opt); }}
                                                                                                disabled={!canRespond}
                                                                                                style={{
                                                                                                    padding: '6px 12px',
                                                                                                    borderRadius: '6px',
                                                                                                    border: `1px solid ${isSelected ? color : '#cbd5e1'}`,
                                                                                                    background: isSelected ? color : 'white',
                                                                                                    color: isSelected ? 'white' : '#64748b',
                                                                                                    fontSize: '0.75rem',
                                                                                                    fontWeight: '600',
                                                                                                    cursor: canRespond ? 'pointer' : 'default',
                                                                                                    opacity: (!canRespond && !isSelected) ? 0.6 : 1,
                                                                                                    transition: 'all 0.2s'
                                                                                                }}
                                                                                            >
                                                                                                {opt}
                                                                                            </button>
                                                                                        )
                                                                                    })}
                                                                                </div>
                                                                            )}

                                                                            {q.type === 'multiple_choice' && (
                                                                                <div className="d-flex flex-column gap-2">
                                                                                    {q.options.map((opt) => {
                                                                                        const currentResponses = Array.isArray(q.response) ? q.response : [];
                                                                                        const isChecked = currentResponses.includes(opt);
                                                                                        return (
                                                                                            <label key={opt} className="d-flex align-items-center gap-2" style={{ cursor: canRespond ? 'pointer' : 'default', fontSize: '0.875rem', color: '#475569' }}>
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    checked={isChecked}
                                                                                                    disabled={!canRespond}
                                                                                                    onChange={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        if (canRespond) {
                                                                                                            const newRes = isChecked
                                                                                                                ? currentResponses.filter(r => r !== opt)
                                                                                                                : [...currentResponses, opt];
                                                                                                            handleQuestionResponse(item._id, qIdx, newRes);
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                                {opt}
                                                                                            </label>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}

                                                                            {q.type === 'text' && (
                                                                                <div className="d-flex gap-2">
                                                                                    <Form.Control
                                                                                        size="sm"
                                                                                        as="textarea"
                                                                                        rows={2}
                                                                                        disabled={!canRespond}
                                                                                        defaultValue={q.response || ''}
                                                                                        placeholder={canRespond ? "Type your answer..." : "No response yet"}
                                                                                        onBlur={(e) => {
                                                                                            if (canRespond && e.target.value !== q.response) {
                                                                                                handleQuestionResponse(item._id, qIdx, e.target.value);
                                                                                            }
                                                                                        }}
                                                                                        onClick={e => e.stopPropagation()}
                                                                                        style={{ fontSize: '0.875rem' }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Client Response */}
                                                    {item.clientResponse && (
                                                        <div style={{
                                                            background: 'linear-gradient(to right, #f0f9ff, #f8fafc)',
                                                            padding: '10px 14px',
                                                            borderRadius: '8px',
                                                            borderLeft: '3px solid #3b82f6',
                                                            marginBottom: '10px',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '0.688rem',
                                                                fontWeight: '700',
                                                                color: '#475569',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                marginBottom: '4px'
                                                            }}>
                                                                Client Response
                                                            </div>
                                                            <div style={{ fontSize: '0.813rem', color: '#334155', lineHeight: '1.5' }}>
                                                                {item.clientResponse}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    {isAction && user.role === 'client' && item.status === 'pending' && (
                                                        <div className="d-flex gap-2 mb-2 mt-3 justify-content-end">
                                                            <button
                                                                onClick={() => handleActionClick(item._id, 'rejected')}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    borderRadius: '8px',
                                                                    border: '1.5px solid #fca5a5',
                                                                    background: 'white',
                                                                    color: '#dc2626',
                                                                    fontSize: '0.813rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = '#fee2e2';
                                                                    e.currentTarget.style.borderColor = '#dc2626';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'white';
                                                                    e.currentTarget.style.borderColor = '#fca5a5';
                                                                }}
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleActionClick(item._id, 'approved')}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    borderRadius: '8px',
                                                                    border: 'none',
                                                                    background: '#10b981',
                                                                    color: 'white',
                                                                    fontSize: '0.813rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = '#059669';
                                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = '#10b981';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                                                }}
                                                            >
                                                                Approve
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Footer */}
                                                    <div className="d-flex align-items-center justify-content-between" style={{ marginTop: '2px' }}>
                                                        <div className="d-flex gap-2 flex-wrap">
                                                            {item.tags && item.tags.length > 0 && item.tags.map((tag, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    style={{
                                                                        background: '#f1f5f9',
                                                                        color: '#64748b',
                                                                        padding: '3px 10px',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.688rem',
                                                                        fontWeight: '600',
                                                                        border: '1px solid #e2e8f0'
                                                                    }}
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleStarToggle(e, item)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: item.isStarred ? '#fbbf24' : '#cbd5e1',
                                                                cursor: 'pointer',
                                                                padding: '6px',
                                                                borderRadius: '6px',
                                                                transition: 'all 0.2s',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#fef3c7';
                                                                if (!item.isStarred) e.currentTarget.style.color = '#fbbf24';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'none';
                                                                if (!item.isStarred) e.currentTarget.style.color = '#cbd5e1';
                                                            }}
                                                        >
                                                            {item.isStarred ? <StarFill size={18} /> : <Star size={18} />}
                                                        </button>
                                                        {user.role === 'admin' && (
                                                            <button
                                                                onClick={(e) => handleDelete(e, item._id)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#cbd5e1',
                                                                    cursor: 'pointer',
                                                                    padding: '6px',
                                                                    borderRadius: '6px',
                                                                    transition: 'all 0.2s',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = '#fee2e2';
                                                                    e.currentTarget.style.color = '#ef4444';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'none';
                                                                    e.currentTarget.style.color = '#cbd5e1';
                                                                }}
                                                                title="Delete"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && !isLoading && (
                            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>No activity yet</h3>
                                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Try adjusting your filters or check back later</p>
                            </div>
                        )}

                        {isLoading && (
                            <div style={{ textAlign: 'center', padding: '24px' }}>
                                <Spinner animation="border" size="sm" variant="primary" />
                            </div>
                        )}
                    </div>
                </div>
            </Container>

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title style={{ fontSize: '1.125rem', fontWeight: '600' }}>Create Entry</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="d-flex gap-2 mb-3 p-1" style={{ background: '#f1f5f9', borderRadius: '8px', overflowX: 'auto' }}>
                            {['log', 'action', 'report', 'observation'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: formData.type === type ? 'white' : 'transparent',
                                        color: formData.type === type ? '#0f172a' : '#64748b',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: formData.type === type ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    {type === 'log' ? 'Work Log' : type === 'action' ? 'Action Item' : type === 'report' ? 'Report' : 'Observation'}
                                </button>
                            ))}
                        </div>

                        {(user.role === 'admin') && (
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569' }}>Client</Form.Label>
                                <Form.Select
                                    value={formData.clientId || ''}
                                    onChange={e => {
                                        setFormData(prev => ({
                                            ...prev,
                                            clientId: e.target.value,
                                            websiteId: '' // Reset website when client changes
                                        }));
                                    }}
                                    style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                                >
                                    <option value="">Select client...</option>
                                    {/* Extract unique clients from websites list */}
                                    {[...new Map(websites.filter(w => w.client).map(w => [w.client._id, w.client])).values()].map(client => (
                                        <option key={client._id} value={client._id}>{client.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569' }}>Website</Form.Label>
                            <Form.Select
                                value={formData.websiteId}
                                onChange={e => setFormData({ ...formData, websiteId: e.target.value })}
                                required
                                disabled={user.role === 'admin' && !formData.clientId}
                                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                            >
                                <option value="">Select website...</option>
                                {websites
                                    .filter(w => user.role !== 'admin' || (formData.clientId && w.client && w.client._id === formData.clientId))
                                    .map(w => (
                                        <option key={w._id} value={w._id}>{w.name}</option>
                                    ))}
                            </Form.Select>
                        </Form.Group>

                        {formData.type === 'action' && (
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569' }}>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                                    placeholder="What needs approval?"
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569' }}>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                                placeholder={formData.type === 'log' ? "What did you work on?" : "Details..."}
                            />
                        </Form.Group>

                        {/* Question Builder */}
                        {formData.type === 'action' && (
                            <div className="mb-4">
                                <Form.Label style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                    Interactive Questions
                                    <Button size="sm" variant="link" onClick={handleAddQuestion} style={{ padding: 0, textDecoration: 'none', fontSize: '0.75rem' }}>
                                        + Add Question
                                    </Button>
                                </Form.Label>
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} className="p-3 mb-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>Question {qIndex + 1}</span>
                                            <Trash size={14} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => handleRemoveQuestion(qIndex)} />
                                        </div>
                                        <Form.Control
                                            type="text"
                                            placeholder="Question text..."
                                            value={q.text}
                                            onChange={(e) => handleUpdateQuestion(qIndex, 'text', e.target.value)}
                                            className="mb-2"
                                            size="sm"
                                        />
                                        <Form.Select
                                            value={q.type}
                                            onChange={(e) => handleUpdateQuestion(qIndex, 'type', e.target.value)}
                                            className="mb-2"
                                            size="sm"
                                        >
                                            <option value="approval">Button Selection (e.g. Yes/No)</option>
                                            <option value="multiple_choice">Multiple Choice</option>
                                            <option value="text">Text Response</option>
                                        </Form.Select>

                                        {(q.type === 'multiple_choice' || q.type === 'approval') && (
                                            <div className="pl-3 border-l-2 border-slate-200">
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className="d-flex gap-2 mb-1">
                                                        <Form.Control
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                            size="sm"
                                                            placeholder={`Option ${oIndex + 1}`}
                                                        />
                                                        {/* Allow removal only if not approval, or if approval has > 2 (though we limit add to 2) */}
                                                        {/* Actually user said "only two", so maybe disallow removing if count is <= 2 for approval? */}
                                                        {/* Let's keeps it simple: Allow remove, but limit add. */}
                                                        <Button size="sm" variant="outline-danger" style={{ padding: '0 6px' }} onClick={() => handleRemoveOption(qIndex, oIndex)}>×</Button>
                                                    </div>
                                                ))}
                                                {/* Limit Approval to 2 options */}
                                                {(q.type !== 'approval' || q.options.length < 2) && (
                                                    <Button size="sm" variant="link" onClick={() => handleAddOption(qIndex)} style={{ padding: 0, fontSize: '0.75rem' }}>+ Add Option</Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569' }}>Attachments</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                            />
                            <Form.Text className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                                Allowed: Images (JPG, PNG, GIF, WEBP), PDF, Word (DOC/DOCX), Excel (XLS/XLSX), CSV
                            </Form.Text>
                        </Form.Group>

                        {formData.type === 'log' && (
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569' }}>Duration (min)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={formData.durationMinutes}
                                            onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                            required
                                            style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569' }}>Tags</Form.Label>
                                        <Form.Control
                                            value={formData.tags}
                                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                            style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                                            placeholder="frontend, api"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowModal(false)} style={{ borderRadius: '8px', fontSize: '0.875rem' }}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" style={{ borderRadius: '8px', fontSize: '0.875rem' }}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Client Feedback Modal */}
            <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                        {feedbackData.action === 'approved' ? 'Approve Action Item' : 'Reject Action Item'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                            {feedbackData.action === 'approved' ? 'Add your approval comment' : 'Explain why you\'re rejecting'}
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={feedbackData.comment}
                            onChange={e => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                            placeholder={feedbackData.action === 'approved' ?
                                "e.g., Looks great! Please proceed with implementation." :
                                "e.g., Please revise - need more details on the implementation."}
                            style={{
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                border: '1.5px solid #e2e8f0',
                                padding: '12px'
                            }}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                            This comment will be visible to the developer
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="light"
                        onClick={() => setShowFeedbackModal(false)}
                        style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={feedbackData.action === 'approved' ? 'success' : 'danger'}
                        onClick={handleFeedbackSubmit}
                        style={{ borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600' }}
                    >
                        {feedbackData.action === 'approved' ? 'Approve' : 'Reject'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container >
    );
};

export default WorkLogs;
