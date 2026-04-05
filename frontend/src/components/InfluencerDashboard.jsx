import { useState, useEffect } from 'react';
import axios from 'axios';
import { Copy, ExternalLink, Activity, Link2, CheckCircle, Clock, XCircle, User, MessageSquare, Plus, Calendar, AlertTriangle } from 'lucide-react';

// ── Helper utilities ────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
};

const CountdownBadge = ({ endDate, status }) => {
    if (status === 'Expired') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                <AlertTriangle className="w-3 h-3" /> Expired
            </span>
        );
    }
    if (!endDate) return null;
    const days = getRemainingDays(endDate);
    if (days < 0) return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
            <AlertTriangle className="w-3 h-3" /> Expired
        </span>
    );
    const color = days <= 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        : days <= 7 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
            <Clock className="w-3 h-3" /> {days}d left
        </span>
    );
};

const CampaignUpdates = ({ campaignId, user, isExpired }) => {
    const [updates, setUpdates] = useState([]);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [updateType, setUpdateType] = useState('content');
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateFile, setUpdateFile] = useState(null);

    useEffect(() => {
        fetchUpdates();
    }, [campaignId]);

    const fetchUpdates = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns/${campaignId}/updates`, config);
            setUpdates(response.data);
        } catch (error) {
            console.error('Error fetching updates:', error);
        }
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const formData = new FormData();
            formData.append('type', updateType);
            formData.append('message', updateMessage);
            if (updateFile) {
                formData.append('file', updateFile);
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/api/campaigns/${campaignId}/updates`, formData, {
                ...config,
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });

            alert('Update posted successfully!');
            setShowUpdateForm(false);
            setUpdateMessage('');
            setUpdateFile(null);
            fetchUpdates();
        } catch (error) {
            alert(error.response?.data?.message || 'Error posting update');
        }
    };

    return (
        <div className="border-t border-slate-200 dark:border-slate-600 pt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        Campaign Communication
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Stay connected with the brand and share your progress</p>
                </div>
                <button
                    onClick={() => setShowUpdateForm(true)}
                    disabled={isExpired}
                    className={`font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-200 ${
                        isExpired
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl transform hover:scale-105'
                    }`}
                >
                    <Plus className="w-4 h-4" />
                    {isExpired ? 'Campaign Ended' : 'Post Update'}
                </button>
            </div>

            {/* Updates List */}
            <div className="space-y-4 mb-6">
                {updates.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                        <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 dark:text-slate-400">No updates yet. Start the conversation!</p>
                    </div>
                ) : (
                    updates.map((update) => (
                        <div key={update._id} className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {(update.sender.name || 'User').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            {update.sender.name} ({update.sender.role})
                                        </span>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(update.createdAt).toLocaleDateString()} at {new Date(update.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                    update.type === 'content' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                    update.type === 'query' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                    update.type === 'negotiation' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                                }`}>
                                    {update.type}
                                </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">{update.message}</p>
                            {update.fileUrl && (
                                <a href={`${import.meta.env.VITE_API_URL}${update.fileUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    View Attachment
                                </a>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Update Form Modal */}
            {showUpdateForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Post Campaign Update</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Share your progress with the brand</p>
                            </div>
                            <button
                                onClick={() => setShowUpdateForm(false)}
                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Update Type</label>
                                <select
                                    value={updateType}
                                    onChange={(e) => setUpdateType(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    <option value="content">Content Posted</option>
                                    <option value="query">Question/Query</option>
                                    <option value="negotiation">Pricing Negotiation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Message</label>
                                <textarea
                                    value={updateMessage}
                                    onChange={(e) => setUpdateMessage(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Describe your update, content posted, question, or negotiation details..."
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Attachment (Optional)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setUpdateFile(e.target.files[0])}
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-600">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    Post Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateForm(false)}
                                    className="px-6 py-3 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
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

const InfluencerDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [campaigns, setCampaigns] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProfileForm, setShowProfileForm] = useState(false);

    // Profile Form State
    const [platform, setPlatform] = useState('');
    const [handle, setHandle] = useState('');
    const [channelUrl, setChannelUrl] = useState('');
    const [followers, setFollowers] = useState('');
    const [category, setCategory] = useState('');
    const [niche, setNiche] = useState('');
    const [engagement, setEngagement] = useState('');

    const fetchDashboardData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [campRes, profRes] = await Promise.all([
                axios.get('${import.meta.env.VITE_API_URL}/api/campaigns', config),
                axios.get('${import.meta.env.VITE_API_URL}/api/profiles/me', config).catch(() => ({ data: null }))
            ]);
            setCampaigns(campRes.data);
            if (profRes.data) {
                setProfile(profRes.data);
                const plat = profRes.data.socialPlatforms[0] || {};
                setPlatform(plat.platform || '');
                setHandle(plat.handle || '');
                setFollowers(plat.followers || '');
                setChannelUrl(profRes.data.channelUrl || '');
                setCategory(profRes.data.category || '');
                setNiche(profRes.data.niche || '');
                setEngagement(profRes.data.engagement || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('${import.meta.env.VITE_API_URL}/api/profiles', {
                platform, handle, channelUrl, followers: Number(followers), category, niche, engagement
            }, config);
            alert('Profile submitted successfully! Pending verification.');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting profile');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const handleCampaignResponse = async (campaignId, status, reason = '') => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/campaigns/${campaignId}/respond`, {
                status,
                reason
            }, config);
            alert(`Campaign ${status.toLowerCase()} successfully!`);
            fetchDashboardData();
        } catch (error) {
            console.error('handleCampaignResponse error', error);
            const statusMsg = error.response ? `${error.response.status} ${error.response.statusText}` : '';
            const bodyMsg = error.response?.data?.message || error.message;
            alert(`Failed to update campaign: ${statusMsg} ${bodyMsg}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Influencer Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your profile, campaigns, and track your performance</p>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-1">
                    <div className="flex space-x-1">
                        <button
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                activeTab === 'profile'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-[1.02]'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                            }`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <User className="w-4 h-4" />
                                My Profile
                            </div>
                        </button>
                        <button
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                activeTab === 'requests'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-[1.02]'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                            }`}
                            onClick={() => setActiveTab('requests')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Campaign Requests
                            </div>
                        </button>
                        <button
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                activeTab === 'campaigns'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-[1.02]'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                            }`}
                            onClick={() => setActiveTab('campaigns')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Activity className="w-4 h-4" />
                                Active Campaigns
                            </div>
                        </button>
                    </div>
                </div>

            {activeTab === 'profile' && (
                <div className="max-w-6xl mx-auto">
                    {!profile ? (
                        // Show Create Profile card for new users
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center transform hover:scale-[1.02] transition-all duration-300">
                            <div className="mb-8">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Welcome to Your Dashboard!</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                                    Create your professional influencer profile to start receiving personalized campaign opportunities from top brands.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowProfileForm(true)}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <Plus className="w-5 h-5" />
                                Create Your Profile
                            </button>
                        </div>
                    ) : (
                        // Show profile view for existing users
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        My Profile
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400">Manage your influencer profile and track your performance</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                                        profile.status === 'Approved'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : profile.status === 'Rejected'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                    }`}>
                                        {profile.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> :
                                         profile.status === 'Rejected' ? <XCircle className="w-4 h-4" /> :
                                         <Clock className="w-4 h-4" />}
                                        {profile.status}
                                    </span>
                                    <button
                                        onClick={() => setShowProfileForm(true)}
                                        className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Profile Information */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-blue-500" />
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name</span>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</span>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                            <Link2 className="w-5 h-5 text-blue-500" />
                                            Social Platform
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Platform</span>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{profile.socialPlatforms[0]?.platform}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Handle</span>
                                                <p className="font-semibold text-blue-600 dark:text-blue-400">@{profile.socialPlatforms[0]?.handle}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Followers</span>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{profile.socialPlatforms[0]?.followers?.toLocaleString()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Profile URL</span>
                                                <a href={profile.channelUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
                                                    View Profile
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content & Statistics */}
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-blue-500" />
                                            Content Focus
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</span>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{profile.category}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Niche</span>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{profile.niche}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Engagement</span>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{profile.engagement}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics Cards */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Active Campaigns</p>
                                                    <p className="text-3xl font-bold">--</p>
                                                </div>
                                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                                    <Activity className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Earnings</p>
                                                    <p className="text-3xl font-bold">--</p>
                                                </div>
                                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Form Modal */}
                    {showProfileForm && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                            {profile ? 'Edit Profile' : 'Create Your Profile'}
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                                            {profile ? 'Update your information to keep your profile current' : 'Fill in your details to get started with campaigns'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowProfileForm(false)}
                                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Account Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={user.name}
                                                    disabled
                                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    disabled
                                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Social Media Presence</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Platform</label>
                                                <select
                                                    value={platform}
                                                    onChange={e => setPlatform(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                >
                                                    <option value="">Select Platform</option>
                                                    <option value="Instagram">Instagram</option>
                                                    <option value="YouTube">YouTube</option>
                                                    <option value="TikTok">TikTok</option>
                                                    <option value="Twitter">Twitter</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Channel/Profile Name</label>
                                                <input
                                                    type="text"
                                                    value={handle}
                                                    onChange={e => setHandle(e.target.value)}
                                                    required
                                                    placeholder="@username"
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile URL</label>
                                            <input
                                                type="url"
                                                value={channelUrl}
                                                onChange={e => setChannelUrl(e.target.value)}
                                                required
                                                placeholder="https://"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Content & Audience</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Follower Count</label>
                                                <input
                                                    type="number"
                                                    value={followers}
                                                    onChange={e => setFollowers(e.target.value)}
                                                    required
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content Category</label>
                                                <input
                                                    type="text"
                                                    value={category}
                                                    onChange={e => setCategory(e.target.value)}
                                                    required
                                                    placeholder="e.g. Tech, Fashion"
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specific Niche</label>
                                                <input
                                                    type="text"
                                                    value={niche}
                                                    onChange={e => setNiche(e.target.value)}
                                                    required
                                                    placeholder="e.g. Mechanical Keyboards"
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Avg. Engagement</label>
                                                <input
                                                    type="text"
                                                    value={engagement}
                                                    onChange={e => setEngagement(e.target.value)}
                                                    placeholder="e.g. 10k views/video"
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-600">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                        >
                                            {profile ? 'Update Profile' : 'Submit Profile for Verification'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowProfileForm(false)}
                                            className="px-6 py-3 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {profile?.status === 'Rejected' && (
                                        <p className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                            Your profile was rejected. Please update your details and resubmit.
                                        </p>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="space-y-8">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Campaign Requests</h2>
                                <p className="text-slate-600 dark:text-slate-400">Review and respond to new campaign opportunities</p>
                            </div>
                        </div>

                        {campaigns.filter(camp => {
                            const myAssignment = camp.assignedInfluencers.find(i =>
                                typeof i.influencer === 'object' ? i.influencer._id === user._id : i.influencer === user._id
                            );
                            return myAssignment && myAssignment.status === 'Pending';
                        }).length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No Pending Requests</h3>
                                <p className="text-slate-600 dark:text-slate-400">Check back later for new campaign opportunities.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-1">
                                {campaigns.filter(camp => {
                                    const myAssignment = camp.assignedInfluencers.find(i =>
                                        typeof i.influencer === 'object' ? i.influencer._id === user._id : i.influencer === user._id
                                    );
                                    return myAssignment && myAssignment.status === 'Pending';
                                }).map((camp) => {
                                    const myAssignment = camp.assignedInfluencers.find(i =>
                                        typeof i.influencer === 'object' ? i.influencer._id === user._id : i.influencer === user._id
                                    );

                                    return (
                                        <div key={camp._id} className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
                                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{camp.title}</h3>
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-sm font-semibold shadow-sm">
                                                            <Clock className="w-4 h-4" />
                                                            Pending Response
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">{camp.description}</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                                                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Budget</span>
                                                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${camp.budget}</p>
                                                        </div>
                                                        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                                                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Brand</span>
                                                            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">{camp.brand.name || camp.brand.email}</p>
                                                        </div>
                                                    </div>

                                                    {camp.productLink && (
                                                        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                                                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Product Link</span>
                                                            <a href={camp.productLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
                                                                <Link2 className="w-4 h-4" />
                                                                View Product
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-4 lg:w-80">
                                                    <button
                                                        onClick={() => handleCampaignResponse(camp._id, 'Accepted')}
                                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                        Accept Campaign
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Please provide a reason for rejecting this campaign:');
                                                            if (reason) handleCampaignResponse(camp._id, 'Rejected', reason);
                                                        }}
                                                        className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                        Reject Campaign
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'campaigns' && (
                <div className="space-y-8">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Active Campaigns</h2>
                                <p className="text-slate-600 dark:text-slate-400">Track your performance and communicate with brands</p>
                            </div>
                        </div>

                        {campaigns.filter(camp => {
                            const myAssignment = camp.assignedInfluencers.find(i =>
                                typeof i.influencer === 'object' ? i.influencer._id === user._id : i.influencer === user._id
                            );
                            return myAssignment && myAssignment.status === 'Accepted';
                        }).length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Activity className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No Active Campaigns</h3>
                                <p className="text-slate-600 dark:text-slate-400">Accept campaign requests to start earning and tracking performance.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 grid-cols-1">
                                {campaigns.filter(camp => {
                                    const myAssignment = camp.assignedInfluencers.find(i =>
                                        typeof i.influencer === 'object' ? i.influencer._id === user._id : i.influencer === user._id
                                    );
                                    return myAssignment && myAssignment.status === 'Accepted';
                                }).map((camp) => {
                                    const myAssignment = camp.assignedInfluencers.find(i =>
                                        typeof i.influencer === 'object' ? i.influencer._id === user._id : i.influencer === user._id
                                    );

                                    const trackingUrl = `${import.meta.env.VITE_API_URL}/api/tracking/${myAssignment.uniqueLink}`;
                                    const isExpired = camp.status === 'Expired';

                                    return (
                                        <div key={camp._id} className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                                            isExpired
                                                ? 'bg-slate-100/90 dark:bg-slate-900/90 border-slate-300/50 dark:border-slate-600/50 opacity-80'
                                                : 'bg-white/90 dark:bg-slate-800/90 border-slate-200/50 dark:border-slate-700/50'
                                        }`}>
                                            {/* Expired Banner */}
                                            {isExpired && (
                                                <div className="bg-red-600 text-white text-sm font-semibold text-center py-2 flex items-center justify-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    This campaign has expired — promotion and tracking are no longer active
                                                </div>
                                            )}
                                            <div className="p-8">
                                                <div className="flex flex-col lg:flex-row justify-between gap-8">
                                                    <div className="flex-1">
                                                        {/* Title + Status */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className={`text-2xl font-bold ${isExpired ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{camp.title}</h3>
                                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                                                                camp.status === 'Active'
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                    : camp.status === 'Expired'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                                                            }`}>
                                                                {camp.status === 'Active' ? <CheckCircle className="w-4 h-4" /> : camp.status === 'Expired' ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                                {camp.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4">{camp.description}</p>

                                                        {/* Campaign Duration Row */}
                                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 mb-6 border border-slate-200/50 dark:border-slate-600/50">
                                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                                <span className="font-medium">
                                                                    {fmtDate(camp.startDate || camp.createdAt)}
                                                                    {camp.endDate ? <> &rarr; {fmtDate(camp.endDate)}</> : ' → No end date'}
                                                                </span>
                                                            </div>
                                                            <CountdownBadge endDate={camp.endDate} status={camp.status} />
                                                        </div>

                                                        {/* Tracking Link Section */}
                                                        <div className={`rounded-xl p-6 border mb-6 ${
                                                            isExpired
                                                                ? 'bg-slate-100 dark:bg-slate-700/30 border-slate-300/50 dark:border-slate-600/50'
                                                                : 'bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 border-slate-200/50 dark:border-slate-600/50'
                                                        }`}>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Link2 className={`w-5 h-5 ${isExpired ? 'text-slate-400' : 'text-blue-500'}`} />
                                                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tracking Link</span>
                                                                {isExpired && <span className="text-xs text-red-500 font-medium">(Disabled — Campaign Expired)</span>}
                                                            </div>
                                                            <div className={`flex items-center space-x-3 ${isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
                                                                <input
                                                                    readOnly
                                                                    value={trackingUrl}
                                                                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-800 dark:text-slate-100 transition-colors"
                                                                />
                                                                <button
                                                                    onClick={() => !isExpired && copyToClipboard(trackingUrl)}
                                                                    disabled={isExpired}
                                                                    className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors group"
                                                                    title="Copy"
                                                                >
                                                                    <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200" />
                                                                </button>
                                                                <a
                                                                    href={isExpired ? '#' : trackingUrl}
                                                                    onClick={e => isExpired && e.preventDefault()}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-3 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 rounded-lg transition-colors group"
                                                                    title="Test Link"
                                                                >
                                                                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Analytics Panel */}
                                                    <div className="lg:w-80 space-y-4">
                                                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                                                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                                                <Activity className="w-5 h-5 text-blue-500" />
                                                                Performance Metrics
                                                            </h4>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Clicks</p>
                                                                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">--</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                                                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Conversions</p>
                                                                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">--</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isExpired ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                                                            <Clock className={`w-5 h-5 ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tracking Status</p>
                                                                            <p className={`text-sm font-semibold ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                                                {isExpired ? 'Tracking Ended' : 'Tracking Active'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Campaign Updates Section */}
                                                <CampaignUpdates campaignId={camp._id} user={user} isExpired={isExpired} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default InfluencerDashboard;
