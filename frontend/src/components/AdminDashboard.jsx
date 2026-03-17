import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CheckSquare, Briefcase, Trash2, PauseCircle, PlayCircle, Check, X, BarChart3 } from 'lucide-react';

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('verification');

    const [profiles, setProfiles] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    // state for viewing updates
    const [influencerUpdatesModalOpen, setInfluencerUpdatesModalOpen] = useState(false);
    const [selectedInfluencerUpdates, setSelectedInfluencerUpdates] = useState([]);
    const [selectedInfluencerName, setSelectedInfluencerName] = useState('');

    const [loading, setLoading] = useState(true);

    const fetchAdminData = async () => {
        if (!user || !user.token) {
            console.error('User not authenticated or token missing');
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            console.log('Making API calls with config:', config);

            const [profRes, usersRes, campRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/profiles', config),
                axios.get('http://localhost:5000/api/admin/users', config),
                axios.get('http://localhost:5000/api/admin/campaigns', config)
            ]);

            setProfiles(profRes.data);
            setUsersList(usersRes.data);
            setCampaigns(campRes.data);

            console.log('API calls successful');
        } catch (error) {
            console.error('Failed to fetch admin data', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    // fetch updates for influencer
    const fetchInfluencerUpdates = async (influencerId, name) => {
        if (!user || !user.token) {
            console.error('User not authenticated or token missing');
            alert('Authentication required');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            console.log('Fetching influencer updates for ID:', influencerId);
            const res = await axios.get(`http://localhost:5000/api/admin/influencers/${influencerId}/updates`, config);
            setSelectedInfluencerUpdates(res.data || []);
            setSelectedInfluencerName(name);
            setInfluencerUpdatesModalOpen(true);
            console.log('Influencer updates fetched successfully:', res.data);
        } catch (error) {
            console.error('Failed to load updates', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            alert('Unable to fetch influencer updates');
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [user]);

    // Actions
    const handleProfileStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/admin/profiles/${id}/status`, { status }, config);
            fetchAdminData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating profile');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user completely?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
            fetchAdminData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting user');
        }
    };

    const handleCampaignStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/admin/campaigns/${id}/status`, { status }, config);
            fetchAdminData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating campaign');
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm('Delete this campaign?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/campaigns/${id}`, config);
            fetchAdminData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting campaign');
        }
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage influencers, campaigns, and platform analytics</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-80">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Navigation</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setActiveTab('verification')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        activeTab === 'verification'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <CheckSquare className="w-5 h-5" />
                                    <span className="font-medium">Verification</span>
                                    {profiles.filter(p => p.status === 'Pending').length > 0 && (
                                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                            {profiles.filter(p => p.status === 'Pending').length}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setActiveTab('influencers')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        activeTab === 'influencers'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">Influencers</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('campaigns')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        activeTab === 'campaigns'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <Briefcase className="w-5 h-5" />
                                    <span className="font-medium">Campaigns</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        activeTab === 'analytics'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    <span className="font-medium">Analytics</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">

                        {/* Verification Tab */}
                        {activeTab === 'verification' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Influencer Verification</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {profiles.filter(p => p.status === 'Pending').length} pending reviews
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Influencer</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform & URL</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Followers</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Updates</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800/30 divide-y divide-slate-200 dark:divide-slate-700">
                                            {profiles.map(p => {
                                                const plat = p.socialPlatforms[0] || {};
                                                return (
                                                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                                                                        <span className="text-white font-semibold text-sm">
                                                                            {p.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.user?.name}</div>
                                                                    <div className="text-sm text-slate-500 dark:text-slate-400">{p.user?.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-slate-900 dark:text-slate-100 font-medium">{plat.platform} - {plat.handle}</div>
                                                            <a href={p.channelUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                                                                View Channel
                                                            </a>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-semibold">
                                                            {plat.followers?.toLocaleString() || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                                p.status === 'Approved'
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                    : p.status === 'Pending'
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            }`}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <button
                                                                onClick={() => fetchInfluencerUpdates(p.user._id, p.user?.name)}
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline transition-colors"
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                            {p.status !== 'Approved' && (
                                                                <button
                                                                    onClick={() => handleProfileStatus(p._id, 'Approved')}
                                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm hover:shadow-md"
                                                                >
                                                                    <Check className="w-4 h-4 mr-1" />
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {p.status !== 'Rejected' && (
                                                                <button
                                                                    onClick={() => handleProfileStatus(p._id, 'Rejected')}
                                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm hover:shadow-md"
                                                                >
                                                                    <X className="w-4 h-4 mr-1" />
                                                                    Reject
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {profiles.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No profiles available</h3>
                                        <p className="text-slate-600 dark:text-slate-400">Influencer profiles will appear here for verification.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Influencers Tab */}
                        {activeTab === 'influencers' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Influencer Management</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {usersList.filter(u => u.role === 'Influencer').length} total influencers
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Influencer</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800/30 divide-y divide-slate-200 dark:divide-slate-700">
                                            {usersList.filter(u => u.role === 'Influencer').map(u => (
                                                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
                                                                    <span className="text-white font-semibold text-sm">
                                                                        {u.name?.charAt(0)?.toUpperCase() || 'I'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400">Influencer</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                                                        {u.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm hover:shadow-md"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {usersList.filter(u => u.role === 'Influencer').length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No influencers found</h3>
                                        <p className="text-slate-600 dark:text-slate-400">Influencer accounts will appear here once they register.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Campaigns Tab */}
                        {activeTab === 'campaigns' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Campaign Management</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {campaigns.length} total campaigns
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800/30 divide-y divide-slate-200 dark:divide-slate-700">
                                            {campaigns.map(camp => (
                                                <tr key={camp._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{camp.title}</div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400">Created {new Date(camp.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8">
                                                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                                                                    <span className="text-white font-semibold text-xs">
                                                                        {camp.brand?.name?.charAt(0)?.toUpperCase() || 'B'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{camp.brand?.name}</div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400">{camp.brand?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        ${camp.budget?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                            camp.status === 'Active'
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                : camp.status === 'Draft'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                                : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-300'
                                                        }`}>
                                                            {camp.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                        {camp.status === 'Active' ? (
                                                            <button
                                                                onClick={() => handleCampaignStatus(camp._id, 'Draft')}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors shadow-sm hover:shadow-md"
                                                                title="Pause Campaign"
                                                            >
                                                                <PauseCircle className="w-4 h-4 mr-1" />
                                                                Pause
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCampaignStatus(camp._id, 'Active')}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm hover:shadow-md"
                                                                title="Activate Campaign"
                                                            >
                                                                <PlayCircle className="w-4 h-4 mr-1" />
                                                                Activate
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteCampaign(camp._id)}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm hover:shadow-md"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {campaigns.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Briefcase className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No campaigns found</h3>
                                        <p className="text-slate-600 dark:text-slate-400">Campaigns will appear here once brands create them.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Platform Analytics</h3>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        Real-time insights
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Influencers</p>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                    {usersList.filter(u => u.role === 'Influencer').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Campaigns</p>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                    {campaigns.filter(c => c.status === 'Active').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                                                <CheckSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Reviews</p>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                    {profiles.filter(p => p.status === 'Pending').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-slate-600 dark:text-slate-400">Advanced analytics dashboard coming soon...</p>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>

            {/* influencer updates modal */}
            {influencerUpdatesModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Updates by {selectedInfluencerName}</h4>
                            <button onClick={() => setInfluencerUpdatesModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
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
                                        <div className="mb-2">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaign: {u.campaignTitle}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                u.type === 'content' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                u.type === 'query' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                u.type === 'negotiation' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                            }`}>{u.type}</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-2">{u.message}</p>
                                        {u.fileUrl && (
                                            <a href={`http://localhost:5000${u.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View Attachment</a>
                                        )}
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
