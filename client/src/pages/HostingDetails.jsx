import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useWebsite } from '../context/WebsiteContext';
import WebsiteSelector from '../components/WebsiteSelector';
import axios from 'axios';
import API_URL from '../config/api';
import { Hdd, Save, Eye, EyeSlash } from 'react-bootstrap-icons';

const HostingDetails = () => {
    const { user } = useAuth();
    const { websites, selectedWebsiteId, handleWebsiteSelect } = useWebsite();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [hostingData, setHostingData] = useState({
        provider: '',
        domain: '',
        ftpHost: '',
        ftpUser: '',
        ftpPassword: ''
    });

    const isReadOnly = user.role === 'developer';

    useEffect(() => {
        if (selectedWebsiteId) {
            fetchHostingDetails();
        } else {
            // Reset if no website selected
            setHostingData({
                provider: '',
                domain: '',
                ftpHost: '',
                ftpUser: '',
                ftpPassword: ''
            });
        }
    }, [selectedWebsiteId]);

    const fetchHostingDetails = async () => {
        setLoading(true);
        try {
            // We get basic website info from context, but need to fetch fresh to get hosting details if they weren't populated
            // Or rely on the list if it's already there. 
            // The getWebsites controller returns all fields, but let's check if hostingDetails is in the context list.
            // If the context list is lightweight, we might need a dedicated fetch.
            // But let's look at the getWebsites controller... it does `await Website.find(query)`.
            // So fields should be there. Let's find the selected website from the `websites` array first.
            const website = websites.find(w => w._id === selectedWebsiteId);

            if (website && website.hostingDetails) {
                setHostingData({
                    provider: website.hostingDetails.provider || '',
                    domain: website.hostingDetails.domain || '',
                    ftpHost: website.hostingDetails.ftpHost || '',
                    ftpUser: website.hostingDetails.ftpUser || '',
                    ftpPassword: website.hostingDetails.ftpPassword || ''
                });
            } else {
                setHostingData({
                    provider: '',
                    domain: '',
                    ftpHost: '',
                    ftpUser: '',
                    ftpPassword: ''
                });
            }

        } catch (error) {
            console.error(error);
            setMessage({ type: 'danger', text: 'Failed to load details' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedWebsiteId) return;

        setSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/websites/${selectedWebsiteId}/hosting`, hostingData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Hosting details updated successfully!' });

            // Optionally update local context if needed, but for now user can just stay on page

        } catch (error) {
            console.error(error);
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Failed to save' });
        } finally {
            setSaving(false);
        }
    };

    if (!selectedWebsiteId && websites.length > 0) {
        // Just a friendly prompt if nothing selected
    }

    return (
        <Container fluid className="px-0" style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 24px' }}>
            <Container style={{ maxWidth: '1000px' }}>

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Hdd className="text-indigo-600" />
                            Hosting Details
                        </h2>
                        <p style={{ color: '#64748b', margin: 0 }}>Manage domain, hosting provider, and FTP access</p>
                    </div>
                    {/* Website Selector */}
                    <div style={{ width: '300px' }}>
                        <WebsiteSelector
                            websites={websites}
                            selectedId={selectedWebsiteId}
                            onSelect={handleWebsiteSelect}
                        />
                    </div>
                </div>

                {!selectedWebsiteId ? (
                    <Alert variant="info">Please select a website to view hosting details.</Alert>
                ) : (
                    <Card style={{ border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Card.Body style={{ padding: '32px' }}>
                            {message && <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>{message.text}</Alert>}

                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-4">
                                        <Col md={12}>
                                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#475569', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                                General Information
                                            </h5>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Hosting Provider</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={hostingData.provider}
                                                    onChange={e => setHostingData({ ...hostingData, provider: e.target.value })}
                                                    placeholder="e.g. GoDaddy, AWS, Vercel"
                                                    readOnly={isReadOnly}
                                                    style={{ borderRadius: '8px', padding: '10px 14px' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Domain Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={hostingData.domain}
                                                    onChange={e => setHostingData({ ...hostingData, domain: e.target.value })}
                                                    placeholder="e.g. example.com"
                                                    readOnly={isReadOnly}
                                                    style={{ borderRadius: '8px', padding: '10px 14px' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-4">
                                        <Col md={12}>
                                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#475569', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                                FTP / SFTP Access
                                            </h5>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Host / IP Address</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={hostingData.ftpHost}
                                                    onChange={e => setHostingData({ ...hostingData, ftpHost: e.target.value })}
                                                    placeholder="ftp.example.com"
                                                    readOnly={isReadOnly}
                                                    style={{ borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Username</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={hostingData.ftpUser}
                                                    onChange={e => setHostingData({ ...hostingData, ftpUser: e.target.value })}
                                                    readOnly={isReadOnly}
                                                    style={{ borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={showPassword ? "text" : "password"}
                                                        value={hostingData.ftpPassword}
                                                        onChange={e => setHostingData({ ...hostingData, ftpPassword: e.target.value })}
                                                        readOnly={isReadOnly}
                                                        style={{ borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', paddingRight: '40px' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '10px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#64748b',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {!isReadOnly && (
                                        <div className="d-flex justify-content-end gap-3 mt-4 pt-4 border-top border-slate-100">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                disabled={saving}
                                                style={{
                                                    padding: '10px 24px',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {saving ? <Spinner size="sm" /> : <Save />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                    {isReadOnly && (
                                        <div className="mt-4 pt-4 border-top border-slate-100 text-center text-muted fst-italic">
                                            Stats: Read-only access for developers
                                        </div>
                                    )}
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </Container>
    );
};

export default HostingDetails;
