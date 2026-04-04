import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Edit2, Calendar, Clock, AlertTriangle } from 'lucide-react';

// Helper: compute remaining days from today to endDate
const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
};

// Helper: format date nicely
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Countdown badge component
const CountdownBadge = ({ endDate, status }) => {
    if (status === 'Expired') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                <AlertTriangle size={11} /> Expired
            </span>
        );
    }
    if (!endDate) return null;
    const days = getRemainingDays(endDate);
    if (days < 0) return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
            <AlertTriangle size={11} /> Expired
        </span>
    );
    const color = days <= 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        : days <= 7 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            <Clock size={11} /> {days}d left
        </span>
    );
};

// Status badge
const StatusBadge = ({ status }) => {
    const colors = {
        Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        Expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.Draft}`}>
            {status}
        </span>
    );
};

// Returns today's date in YYYY-MM-DD for min attribute
const todayStr = () => new Date().toISOString().split('T')[0];

const BrandCampaigns = ({ user }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    // Edit modal state
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editBudget, setEditBudget] = useState('');
    const [editProductLink, setEditProductLink] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editError, setEditError] = useState('');

    // Create form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [productLink, setProductLink] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateError, setDateError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCampaigns = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.get('http://localhost:5000/api/campaigns', config);
            setCampaigns(response.data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [user]);

    // ─── Create Campaign ──────────────────────────────────────────────────────
    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        setDateError('');

        if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
            setDateError('End date cannot be earlier than start date.');
            return;
        }

        if (!title || !description || !budget || !productLink) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/campaigns',
                { title, description, budget: parseFloat(budget), productLink, startDate, endDate },
                config
            );

            setTitle(''); setDescription(''); setBudget(''); setProductLink('');
            setStartDate(''); setEndDate(''); setDateError('');
            setShowForm(false);
            fetchCampaigns();
            alert('Campaign created successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Open Edit Modal ──────────────────────────────────────────────────────
    const openEditModal = (campaign, e) => {
        e.stopPropagation();
        setEditingCampaign(campaign);
        setEditTitle(campaign.title);
        setEditDescription(campaign.description);
        setEditBudget(String(campaign.budget));
        setEditProductLink(campaign.productLink || '');
        setEditEndDate(campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '');
        setEditError('');
    };

    const closeEditModal = () => {
        setEditingCampaign(null);
        setEditError('');
    };

    // ─── Submit Edit Campaign ─────────────────────────────────────────────────
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError('');

        if (editEndDate && editingCampaign.startDate && new Date(editEndDate) < new Date(editingCampaign.startDate)) {
            setEditError('End date cannot be earlier than the campaign start date.');
            return;
        }

        setIsEditSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/campaigns/${editingCampaign._id}`,
                {
                    title: editTitle,
                    description: editDescription,
                    budget: parseFloat(editBudget),
                    productLink: editProductLink,
                    endDate: editEndDate || null
                },
                config
            );
            closeEditModal();
            fetchCampaigns();
            alert('Campaign updated successfully!');
        } catch (error) {
            setEditError(error.response?.data?.message || 'Error updating campaign');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-6">Loading campaigns...</div>;

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Campaigns</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Create Campaign
                </button>
            </div>

            {/* ── Create Campaign Form ── */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">New Campaign</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Title *</label>
                            <input type="text" placeholder="e.g., Summer Collection Launch" required
                                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                            <textarea placeholder="Describe your campaign goals and details" required rows={4}
                                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget ($) *</label>
                            <input type="number" placeholder="5000" required step="0.01" min="0"
                                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={budget} onChange={e => setBudget(e.target.value)} />
                        </div>

                        {/* Product Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Link (for tracking) *</label>
                            <input type="url" placeholder="https://yoursite.com/product" required
                                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={productLink} onChange={e => setProductLink(e.target.value)} />
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <Calendar size={14} className="inline mr-1" />Start Date
                                </label>
                                <input type="date" min={todayStr()}
                                    className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={startDate} onChange={e => { setStartDate(e.target.value); setDateError(''); }} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <Calendar size={14} className="inline mr-1" />End Date
                                </label>
                                <input type="date" min={startDate || todayStr()}
                                    className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={endDate} onChange={e => { setEndDate(e.target.value); setDateError(''); }} />
                            </div>
                        </div>
                        {dateError && <p className="text-red-600 text-sm">{dateError}</p>}

                        <div className="flex gap-3 pt-4">
                            <button type="submit" disabled={isSubmitting}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                {isSubmitting ? 'Creating...' : 'Create Campaign'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Campaign List ── */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {campaigns.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign._id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg dark:hover:bg-gray-700 transition-all"
                                onClick={() => setSelectedCampaign(selectedCampaign?._id === campaign._id ? null : campaign)}
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1 mr-2">{campaign.title}</h3>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <StatusBadge status={campaign.status} />
                                        <button
                                            onClick={(e) => openEditModal(campaign, e)}
                                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-colors"
                                            title="Edit Campaign"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{campaign.description}</p>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                    <div className="bg-blue-50 dark:bg-gray-700 p-2 rounded">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Budget</p>
                                        <p className="font-bold text-blue-600 dark:text-blue-400">${campaign.budget}</p>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-gray-700 p-2 rounded">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Influencers</p>
                                        <p className="font-bold text-purple-600 dark:text-purple-400">{campaign.assignedInfluencers.length}</p>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-gray-700 p-2 rounded">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Start</p>
                                        <p className="font-bold text-orange-600 dark:text-orange-400 text-xs">{fmtDate(campaign.startDate || campaign.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Duration + Countdown */}
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 mb-2">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                        <Calendar size={13} />
                                        <span>
                                            {fmtDate(campaign.startDate || campaign.createdAt)}
                                            {campaign.endDate ? <> → {fmtDate(campaign.endDate)}</> : ' → No end date'}
                                        </span>
                                    </div>
                                    <CountdownBadge endDate={campaign.endDate} status={campaign.status} />
                                </div>

                                {/* Expanded Detail */}
                                {selectedCampaign?._id === campaign._id && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Product Link:</p>
                                            <a href={campaign.productLink} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all">
                                                {campaign.productLink}
                                            </a>
                                        </div>
                                        {campaign.assignedInfluencers.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Assigned Influencers:</p>
                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                    {campaign.assignedInfluencers.map((inf, idx) => (
                                                        <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                                            <p className="font-medium text-gray-800 dark:text-gray-200">{inf.influencer?.name || 'Unknown'}</p>
                                                            <p className="text-gray-500 dark:text-gray-400">Status: {inf.status}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                        No campaigns created yet. Click "Create Campaign" to get started!
                    </p>
                )}
            </div>

            {/* ── Edit Campaign Modal ── */}
            {editingCampaign && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Campaign</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Update campaign details</p>
                            </div>
                            <button onClick={closeEditModal}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Title *</label>
                                <input type="text" required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                                <textarea required rows={3}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget ($) *</label>
                                    <input type="number" required step="0.01" min="0"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editBudget} onChange={e => setEditBudget(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        <Calendar size={13} className="inline mr-1" />End Date
                                    </label>
                                    <input type="date"
                                        min={editingCampaign.startDate ? new Date(editingCampaign.startDate).toISOString().split('T')[0] : todayStr()}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editEndDate} onChange={e => { setEditEndDate(e.target.value); setEditError(''); }} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Link *</label>
                                <input type="url" required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editProductLink} onChange={e => setEditProductLink(e.target.value)} />
                            </div>

                            {editError && (
                                <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg border border-red-200 dark:border-red-800">
                                    {editError}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={isEditSubmitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                                    {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={closeEditModal}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandCampaigns;
