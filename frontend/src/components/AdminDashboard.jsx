import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CheckSquare, Briefcase, Trash2, PauseCircle, PlayCircle, Check, X, BarChart3, ChevronDown, ChevronUp, Activity, MousePointerClick, RefreshCw } from 'lucide-react';

// ── Status badge helpers ──────────────────────────────────────────────────────
const assignmentBadge = (s) => {
    const map = {
        Accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        Pending:  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${map[s] || 'bg-gray-100 text-gray-700'}`}>{s}</span>;
};

const campaignBadge = (s) => {
    const map = {
        Active:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        Draft:     'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        Expired:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${map[s] || 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-300'}`}>{s}</span>;
};

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('verification');

    const [profiles, setProfiles] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    // Influencer updates modal (existing)
    const [influencerUpdatesModalOpen, setInfluencerUpdatesModalOpen] = useState(false);
    const [selectedInfluencerUpdates, setSelectedInfluencerUpdates] = useState([]);
    const [selectedInfluencerName, setSelectedInfluencerName] = useState('');

    // Campaign influencer detail (expandable rows)
    const [expandedCampaignId, setExpandedCampaignId] = useState(null);
    const [campInfData, setCampInfData] = useState({}); // { [campaignId]: { loading, data } }

    const [loading, setLoading] = useState(true);

    const fetchAdminData = async () => {
        if (!user?.token) { setLoading(false); return; }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [profRes, usersRes, campRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/profiles', config),
                axios.get('http://localhost:5000/api/admin/users', config),
                axios.get('http://localhost:5000/api/admin/campaigns', config)
            ]);
            setProfiles(profRes.data);
            setUsersList(usersRes.data);
            setCampaigns(campRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInfluencerUpdates = async (influencerId, name) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`http://localhost:5000/api/admin/influencers/${influencerId}/updates`, config);
            setSelectedInfluencerUpdates(res.data || []);
            setSelectedInfluencerName(name);
            setInfluencerUpdatesModalOpen(true);
        } catch (error) {
            alert('Unable to fetch influencer updates');
        }
    };

    // Toggle & lazy-load campaign influencer data
    const toggleCampaignExpand = async (campaignId) => {
        if (expandedCampaignId === campaignId){
            setExpandedCampaignId(null);
            return;
        }
        setExpandedCampaignId(campaignId);
        if (campInfData[campaignId]) return; // Already loaded

        setCampInfData(prev => ({ ...prev, [campaignId]: { loading: true, data: null } }));
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`http://localhost:5000/api/admin/campaigns/${campaignId}/influencers`, config);
            setCampInfData(prev => ({ ...prev, [campaignId]: { loading: false, data: res.data } }));
        } catch (err) {
            setCampInfData(prev => ({ ...prev, [campaignId]: { loading: false, data: null, error: true } }));
        }
    };

    const refreshCampaignInfluencers = async (campaignId) => {
        setCampInfData(prev => ({ ...prev, [campaignId]: { loading: true, data: null } }));
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`http://localhost:5000/api/admin/campaigns/${campaignId}/influencers`, config);
            setCampInfData(prev => ({ ...prev, [campaignId]: { loading: false, data: res.data } }));
        } catch (err) {
            setCampInfData(prev => ({ ...prev, [campaignId]: { loading: false, data: null, error: true } }));
        }
    };

    useEffect(() => { fetchAdminData(); }, [user]);

    // Actions
    const handleProfileStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/admin/profiles/${id}/status`, { status }, config);
            fetchAdminData();
        } catch (error) { alert(error.response?.data?.message || 'Error updating profile'); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user completely?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
            fetchAdminData();
        } catch (error) { alert(error.response?.data?.message || 'Error deleting user'); }
    };

    const handleCampaignStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/admin/campaigns/${id}/status`, { status }, config);
            fetchAdminData();
        } catch (error) { alert(error.response?.data?.message || 'Error updating campaign'); }
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm('Delete this campaign?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/campaigns/${id}`, config);
            fetchAdminData();
        } catch (error) { alert(error.response?.data?.message || 'Error deleting campaign'); }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading Admin Dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage influencers, campaigns, and platform analytics</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-80">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Navigation</h2>
                            <div className="space-y-3">
                                {[
                                    { key: 'verification', icon: <CheckSquare className="w-5 h-5" />, label: 'Verification', badge: profiles.filter(p => p.status === 'Pending').length },
                                    { key: 'influencers',  icon: <Users className="w-5 h-5" />,       label: 'Influencers' },
                                    { key: 'campaigns',    icon: <Briefcase className="w-5 h-5" />,    label: 'Campaigns' },
                                    { key: 'analytics',    icon: <BarChart3 className="w-5 h-5" />,    label: 'Analytics' },
                                ].map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                            activeTab === tab.key
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                                        }`}
                                    >
                                        {tab.icon}
                                        <span className="font-medium">{tab.label}</span>
                                        {tab.badge > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">{tab.badge}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">

                        {/* ── Verification Tab ── */}
                        {activeTab === 'verification' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Influencer Verification</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">{profiles.filter(p => p.status === 'Pending').length} pending reviews</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                {['Influencer', 'Platform & URL', 'Followers', 'Status', 'Updates', 'Actions'].map(h => (
                                                    <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800/30 divide-y divide-slate-200 dark:divide-slate-700">
                                            {profiles.map(p => {
                                                const plat = p.socialPlatforms[0] || {};
                                                return (
                                                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm mr-4">
                                                                    {p.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.user?.name}</div>
                                                                    <div className="text-sm text-slate-500 dark:text-slate-400">{p.user?.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{plat.platform} - {plat.handle}</div>
                                                            <a href={p.channelUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View Channel</a>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">{plat.followers?.toLocaleString() || 'N/A'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${p.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : p.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>{p.status}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <button onClick={() => fetchInfluencerUpdates(p.user._id, p.user?.name)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline">View</button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                                                            {p.status !== 'Approved' && <button onClick={() => handleProfileStatus(p._id, 'Approved')} className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"><Check className="w-4 h-4 mr-1" />Approve</button>}
                                                            {p.status !== 'Rejected' && <button onClick={() => handleProfileStatus(p._id, 'Rejected')} className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"><X className="w-4 h-4 mr-1" />Reject</button>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {profiles.length === 0 && <div className="text-center py-12 text-slate-500">No profiles available for verification.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── Influencers Tab ── */}
                        {activeTab === 'influencers' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Influencer Management</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">{usersList.filter(u => u.role === 'Influencer').length} total influencers</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                {['Influencer', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                                    <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800/30 divide-y divide-slate-200 dark:divide-slate-700">
                                            {usersList.filter(u => u.role === 'Influencer').map(u => (
                                                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm mr-4">
                                                                {u.name?.charAt(0)?.toUpperCase() || 'I'}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400">Influencer</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{u.email}</td>
                                                    <td className="px-6 py-4"><span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{u.role}</span></td>
                                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => handleDeleteUser(u._id)} className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm">
                                                            <Trash2 className="w-4 h-4 mr-1" />Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {usersList.filter(u => u.role === 'Influencer').length === 0 && <div className="text-center py-12 text-slate-500">No influencer accounts found.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── Campaigns Tab ── */}
                        {activeTab === 'campaigns' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Campaign Management</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">{campaigns.length} total campaigns</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active</th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800/30 divide-y divide-slate-200 dark:divide-slate-700">
                                            {campaigns.map(camp => {
                                                const total    = camp.assignedInfluencers.length;
                                                const accepted = camp.assignedInfluencers.filter(i => i.status === 'Accepted').length;
                                                const pending  = camp.assignedInfluencers.filter(i => i.status === 'Pending').length;
                                                const rejected = camp.assignedInfluencers.filter(i => i.status === 'Rejected').length;
                                                const isExpanded = expandedCampaignId === camp._id;
                                                const campData = campInfData[camp._id];

                                                return (
                                                    <>
                                                        {/* Campaign Row */}
                                                        <tr key={camp._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{camp.title}</div>
                                                                <div className="text-xs text-slate-500 dark:text-slate-400">Created {new Date(camp.createdAt).toLocaleDateString()}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                                                        {camp.brand?.name?.charAt(0)?.toUpperCase() || 'B'}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{camp.brand?.name}</div>
                                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{camp.brand?.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">${camp.budget?.toLocaleString()}</td>
                                                            <td className="px-6 py-4">{campaignBadge(camp.status)}</td>

                                                            {/* Influencer count cells */}
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full font-semibold text-xs">{total}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full font-semibold text-xs">{accepted}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs ${pending > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'}`}>{pending}</span>
                                                            </td>

                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                                                {/* View Influencers toggle */}
                                                                <button
                                                                    onClick={() => toggleCampaignExpand(camp._id)}
                                                                    className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                                                                    title="View influencer distribution"
                                                                >
                                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                    {isExpanded ? 'Hide' : 'Members'}
                                                                </button>

                                                                {camp.status === 'Active' ? (
                                                                    <button onClick={() => handleCampaignStatus(camp._id, 'Draft')} className="inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors">
                                                                        <PauseCircle className="w-3.5 h-3.5 mr-1" />Pause
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={() => handleCampaignStatus(camp._id, 'Active')} className="inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                                                                        <PlayCircle className="w-3.5 h-3.5 mr-1" />Activate
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleDeleteCampaign(camp._id)} className="inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
                                                                    <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                                                                </button>
                                                            </td>
                                                        </tr>

                                                        {/* ── Expanded Influencer Detail Row ── */}
                                                        {isExpanded && (
                                                            <tr key={`${camp._id}-inf`}>
                                                                <td colSpan={8} className="px-6 py-5 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/60 dark:to-slate-700/30 border-l-4 border-blue-500">
                                                                    {campData?.loading ? (
                                                                        <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                                                            Loading influencer data...
                                                                        </div>
                                                                    ) : campData?.error ? (
                                                                        <p className="text-red-500 text-sm">Failed to load influencer data. <button onClick={() => refreshCampaignInfluencers(camp._id)} className="underline ml-1">Retry</button></p>
                                                                    ) : campData?.data ? (
                                                                        <div className="space-y-4">
                                                                            {/* Distribution summary */}
                                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Influencer Distribution</span>
                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">👥 {campData.data.total} Total</span>
                                                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full text-xs font-semibold">✓ {campData.data.accepted} Active</span>
                                                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full text-xs font-semibold">⏳ {campData.data.pending} Pending</span>
                                                                                    <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-full text-xs font-semibold">✗ {campData.data.rejected} Rejected</span>
                                                                                </div>
                                                                                <button onClick={() => refreshCampaignInfluencers(camp._id)} className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors" title="Refresh">
                                                                                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                                                                                </button>
                                                                            </div>

                                                                            {campData.data.influencers.length === 0 ? (
                                                                                <p className="text-slate-500 text-sm">No influencers assigned to this campaign yet.</p>
                                                                            ) : (
                                                                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
                                                                                    <table className="min-w-full text-sm">
                                                                                        <thead className="bg-slate-100 dark:bg-slate-700">
                                                                                            <tr>
                                                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Influencer</th>
                                                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assignment Status</th>
                                                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                                                                    <span className="flex items-center justify-center gap-1"><MousePointerClick className="w-3.5 h-3.5" />Clicks</span>
                                                                                                </th>
                                                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                                                                    <span className="flex items-center justify-center gap-1"><Activity className="w-3.5 h-3.5" />Conversions</span>
                                                                                                </th>
                                                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Revenue ($)</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                                                                                            {campData.data.influencers.map((inf, idx) => (
                                                                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                                                                    <td className="px-4 py-3">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                                                                                {(inf.name || 'U').charAt(0).toUpperCase()}
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{inf.name}</p>
                                                                                                                <p className="text-slate-400 text-xs">{inf.email}</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-center">{assignmentBadge(inf.status)}</td>
                                                                                                    <td className="px-4 py-3 text-center">
                                                                                                        <span className="font-semibold text-blue-700 dark:text-blue-300">{inf.clicks.toLocaleString()}</span>
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-center">
                                                                                                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">{inf.conversions.toLocaleString()}</span>
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-center">
                                                                                                        <span className="font-semibold text-slate-800 dark:text-slate-100">${inf.revenue.toLocaleString()}</span>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : null}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {campaigns.length === 0 && <div className="text-center py-12 text-slate-500">No campaigns found.</div>}
                            </div>
                        )}

                        {/* ── Analytics Tab ── */}
                        {activeTab === 'analytics' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Platform Analytics</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Real-time insights</div>
                                </div>

                                {/* Summary cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {[
                                        { label: 'Total Influencers', value: usersList.filter(u => u.role === 'Influencer').length, icon: <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-100 dark:bg-blue-900/30' },
                                        { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'Active').length, icon: <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                                        { label: 'Pending Reviews', value: profiles.filter(p => p.status === 'Pending').length, icon: <CheckSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-100 dark:bg-amber-900/30' },
                                    ].map(card => (
                                        <div key={card.label} className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-full ${card.bg}`}>{card.icon}</div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.label}</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Campaign-wise influencer distribution summary table */}
                                <div>
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Campaign Influencer Distribution</h4>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Total</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Active</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Pending</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Rejected</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-slate-800/30 divide-y divide-slate-100 dark:divide-slate-700">
                                                {campaigns.map(camp => {
                                                    const total    = camp.assignedInfluencers.length;
                                                    const accepted = camp.assignedInfluencers.filter(i => i.status === 'Accepted').length;
                                                    const pending  = camp.assignedInfluencers.filter(i => i.status === 'Pending').length;
                                                    const rejected = camp.assignedInfluencers.filter(i => i.status === 'Rejected').length;
                                                    // Progress bar
                                                    const activeWidth = total > 0 ? Math.round((accepted / total) * 100) : 0;

                                                    return (
                                                        <tr key={camp._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                            <td className="px-6 py-4">
                                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{camp.title}</p>
                                                                <p className="text-xs text-slate-400">{camp.brand?.name}</p>
                                                            </td>
                                                            <td className="px-6 py-4">{campaignBadge(camp.status)}</td>
                                                            <td className="px-6 py-4 text-center font-semibold">{total}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{accepted}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`font-semibold ${pending > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400'}`}>{pending}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`font-semibold ${rejected > 0 ? 'text-red-700 dark:text-red-300' : 'text-slate-400'}`}>{rejected}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {campaigns.length === 0 && (
                                                    <tr><td colSpan={6} className="text-center py-8 text-slate-500">No campaign data available.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Influencer Updates Modal (existing) ── */}
            {influencerUpdatesModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Updates by {selectedInfluencerName}</h4>
                            <button onClick={() => setInfluencerUpdatesModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl">✕</button>
                        </div>
                        <div className="space-y-4">
                            {selectedInfluencerUpdates.length === 0 ? (
                                <p className="text-gray-500">No updates posted yet.</p>
                            ) : (
                                selectedInfluencerUpdates.map(u => (
                                    <div key={u._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{u.sender?.name} ({u.sender?.role})</div>
                                            <div className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleString()}</div>
                                        </div>
                                        <div className="mb-2"><span className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaign: {u.campaignTitle}</span></div>
                                        <div className="mb-2">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${u.type === 'content' ? 'bg-green-100 text-green-800' : u.type === 'query' ? 'bg-blue-100 text-blue-800' : u.type === 'negotiation' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{u.type}</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-2">{u.message}</p>
                                        {u.fileUrl && <a href={`http://localhost:5000${u.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">View Attachment</a>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
