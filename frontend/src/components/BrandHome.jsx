import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Megaphone, Users, TrendingUp, Handshake, Plus, Activity, ChevronDown, ChevronUp, X, CheckCircle, Clock, XCircle } from 'lucide-react';

// Status pill helper
const statusPill = (s) => {
    const map = {
        Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        Pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${map[s] || 'bg-gray-100 text-gray-700'}`}>{s}</span>;
};

const BrandHome = ({ user, setActiveSection }) => {
    const [analytics, setAnalytics] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Influencer detail panel
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [infLoading, setInfLoading] = useState(false);
    const [infDetail, setInfDetail] = useState(null); // { influencers: [...], accepted, pending, rejected }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [analyticsRes, campaignsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/analytics/brand', config),
                    axios.get('http://localhost:5000/api/campaigns', config)
                ]);
                setAnalytics(analyticsRes.data);
                setCampaigns(campaignsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const openInfluencerPanel = async (campaign) => {
        setSelectedCampaign(campaign);
        setInfLoading(true);
        setInfDetail(null);
        try {
            // Build detail from the campaign's assignedInfluencers (already populated)
            const influencers = campaign.assignedInfluencers.map(i => ({
                name: i.influencer?.name || 'Unknown',
                email: i.influencer?.email || '',
                status: i.status,
                trackingUrl: i.trackingUrl,
            }));
            setInfDetail({
                influencers,
                accepted: influencers.filter(i => i.status === 'Accepted').length,
                pending: influencers.filter(i => i.status === 'Pending').length,
                rejected: influencers.filter(i => i.status === 'Rejected').length,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setInfLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Loading your dashboard...</div>;

    // Summary Stats
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const pendingInfluencers = campaigns.reduce((sum, c) => sum + c.assignedInfluencers.filter(i => i.status === 'Pending').length, 0);
    const totalAssignedInfluencers = campaigns.reduce((sum, c) => sum + c.assignedInfluencers.length, 0);
    const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);
    const totalConversions = analytics.reduce((sum, a) => sum + a.conversions, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Welcome back, {user.name}!</h1>
                    <p className="text-blue-100 text-lg max-w-2xl opacity-90">Here's an overview of your campaign performance and upcoming tasks.</p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-indigo-400 opacity-20 blur-xl pointer-events-none"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/40 p-3 rounded-lg text-blue-600 dark:text-blue-400"><Megaphone size={24} /></div>
                        <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full">{activeCampaigns} Active</span>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Campaigns</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalCampaigns}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-50 dark:bg-purple-900/40 p-3 rounded-lg text-purple-600 dark:text-purple-400"><Users size={24} /></div>
                        {pendingInfluencers > 0 && (
                            <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full">{pendingInfluencers} Pending</span>
                        )}
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Influencers Assigned</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalAssignedInfluencers}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-50 dark:bg-green-900/40 p-3 rounded-lg text-green-600 dark:text-green-400"><Activity size={24} /></div>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Clicks</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalClicks.toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-50 dark:bg-orange-900/40 p-3 rounded-lg text-orange-600 dark:text-orange-400"><TrendingUp size={24} /></div>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Conversions</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalConversions.toLocaleString()}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 px-1">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => setActiveSection('campaigns')} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all text-left">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400"><Plus size={20} /></div>
                        <div><h4 className="font-semibold text-gray-800 dark:text-gray-100">Create Campaign</h4><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Launch a new marketing initiative</p></div>
                    </button>
                    <button onClick={() => setActiveSection('assign')} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-500 hover:shadow-md transition-all text-left">
                        <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full text-purple-600 dark:text-purple-400"><Handshake size={20} /></div>
                        <div><h4 className="font-semibold text-gray-800 dark:text-gray-100">Assign Influencers</h4><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Match creators with your campaigns</p></div>
                    </button>
                    <button onClick={() => setActiveSection('analytics')} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-green-500 hover:shadow-md transition-all text-left">
                        <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full text-green-600 dark:text-green-400"><TrendingUp size={20} /></div>
                        <div><h4 className="font-semibold text-gray-800 dark:text-gray-100">View Analytics</h4><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track your campaign performance</p></div>
                    </button>
                </div>
            </div>

            {/* Recent Campaigns — with expandable influencer rows */}
            {campaigns.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Campaigns</h2>
                        <button onClick={() => setActiveSection('campaigns')} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-4">Campaign Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Budget</th>
                                        <th className="px-6 py-4 text-center">Total</th>
                                        <th className="px-6 py-4 text-center">Active</th>
                                        <th className="px-6 py-4 text-center">Pending</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {campaigns.slice(0, 5).map(c => {
                                        const accepted = c.assignedInfluencers.filter(i => i.status === 'Accepted').length;
                                        const pending = c.assignedInfluencers.filter(i => i.status === 'Pending').length;
                                        const isOpen = selectedCampaign?._id === c._id;
                                        return (
                                            <>
                                                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{c.title}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            c.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                            : c.status === 'Expired' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>{c.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4">${c.budget.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-8 h-8 rounded-full font-semibold text-xs">
                                                            {c.assignedInfluencers.length}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 w-8 h-8 rounded-full font-semibold text-xs">{accepted}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs ${pending > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{pending}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => isOpen ? setSelectedCampaign(null) : openInfluencerPanel(c)}
                                                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            {isOpen ? <><ChevronUp size={13} /> Hide</> : <><ChevronDown size={13} /> View Influencers</>}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expandable Influencer Detail Row */}
                                                {isOpen && (
                                                    <tr key={`${c._id}-detail`}>
                                                        <td colSpan={7} className="px-6 py-4 bg-blue-50/50 dark:bg-slate-800/60">
                                                            {infLoading ? (
                                                                <div className="text-center py-4 text-gray-500 text-sm">Loading influencers...</div>
                                                            ) : infDetail && infDetail.influencers.length > 0 ? (
                                                                <div>
                                                                    {/* Summary pills */}
                                                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Distribution:</span>
                                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full text-xs font-semibold">✓ {infDetail.accepted} Active</span>
                                                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full text-xs font-semibold">⏳ {infDetail.pending} Pending</span>
                                                                        <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-full text-xs font-semibold">✗ {infDetail.rejected || 0} Rejected</span>
                                                                    </div>
                                                                    {/* Influencer table */}
                                                                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                                                                        <table className="w-full text-sm">
                                                                            <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
                                                                                <tr>
                                                                                    <th className="px-4 py-2 text-left">Influencer</th>
                                                                                    <th className="px-4 py-2 text-center">Status</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                                                                {infDetail.influencers.map((inf, idx) => (
                                                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                                                                        <td className="px-4 py-2">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                                                                    {(inf.name || 'U').charAt(0).toUpperCase()}
                                                                                                </div>
                                                                                                <div>
                                                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-xs">{inf.name}</p>
                                                                                                    <p className="text-gray-400 text-xs">{inf.email}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-center">{statusPill(inf.status)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-gray-500 text-sm text-center py-3">No influencers assigned to this campaign yet.</p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandHome;
