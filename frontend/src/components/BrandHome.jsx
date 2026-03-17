import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Megaphone, Users, TrendingUp, Handshake, Plus, Activity } from 'lucide-react';

const BrandHome = ({ user, setActiveSection }) => {
    const [analytics, setAnalytics] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="text-center py-10 text-gray-500">Loading your dashboard...</div>;

    // Calculate Summary Stats
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const pendingInfluencers = campaigns.reduce((sum, c) => sum + c.assignedInfluencers.filter(i => i.status === 'Pending').length, 0);
    const totalAssignedInfluencers = campaigns.reduce((sum, c) => sum + c.assignedInfluencers.length, 0);
    
    const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);
    const totalConversions = analytics.reduce((sum, a) => sum + a.conversions, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
                        Welcome back, {user.name}!
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl opacity-90">
                        Here's an overview of your campaign performance and upcoming tasks. Let's make today productive.
                    </p>
                </div>
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-indigo-400 opacity-20 blur-xl pointer-events-none"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/40 p-3 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 transition-colors">
                            <Megaphone size={24} />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full">
                            {activeCampaigns} Active
                        </span>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Campaigns</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalCampaigns}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-50 dark:bg-purple-900/40 p-3 rounded-lg text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 transition-colors">
                            <Users size={24} />
                        </div>
                        {pendingInfluencers > 0 && (
                            <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full">
                                {pendingInfluencers} Pending
                            </span>
                        )}
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Influencers Assigned</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalAssignedInfluencers}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-50 dark:bg-green-900/40 p-3 rounded-lg text-green-600 dark:text-green-400 group-hover:bg-green-100 transition-colors">
                            <Activity size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Clicks</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalClicks.toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-50 dark:bg-orange-900/40 p-3 rounded-lg text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 transition-colors">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Conversions</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalConversions.toLocaleString()}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 px-1">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => setActiveSection('campaigns')}
                        className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all text-left"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Create Campaign</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Launch a new marketing initiative</p>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setActiveSection('assign')}
                        className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-500 hover:shadow-md transition-all text-left"
                    >
                        <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full text-purple-600 dark:text-purple-400">
                            <Handshake size={20} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Assign Influencers</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Match creators with your campaigns</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveSection('analytics')}
                        className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-green-500 hover:shadow-md transition-all text-left"
                    >
                        <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full text-green-600 dark:text-green-400">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">View Analytics</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track your campaign performance</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Campaigns Previews (Optional visual upgrade) */}
            {campaigns.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Campaigns</h2>
                        <button 
                            onClick={() => setActiveSection('campaigns')}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-4">Campaign Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Budget</th>
                                        <th className="px-6 py-4 text-center">Influencers</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {campaigns.slice(0, 4).map(c => (
                                        <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                                                {c.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    c.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">${c.budget.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-8 h-8 rounded-full font-semibold text-xs">
                                                    {c.assignedInfluencers.length}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
