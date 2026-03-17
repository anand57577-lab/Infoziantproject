import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

const BrandCampaigns = ({ user }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [productLink, setProductLink] = useState('');
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

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        if (!title || !description || !budget || !productLink) {
            alert('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/campaigns', 
                { title, description, budget: parseFloat(budget), productLink }, 
                config
            );
            
            setTitle('');
            setDescription('');
            setBudget('');
            setProductLink('');
            setShowForm(false);
            fetchCampaigns();
            alert('Campaign created successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-6">Loading campaigns...</div>;

    return (
        <div className="space-y-6">
            {/* Create Campaign Button */}
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

            {/* Create Campaign Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">New Campaign</h3>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Campaign Title
                            </label>
                            <input 
                                type="text" 
                                placeholder="e.g., Summer Collection Launch" 
                                required 
                                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea 
                                placeholder="Describe your campaign goals and details" 
                                required 
                                rows={4}
                                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Budget ($)
                            </label>
                            <input 
                                type="number" 
                                placeholder="5000" 
                                required 
                                step="0.01"
                                min="0"
                                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={budget}
                                onChange={e => setBudget(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Product Link (for tracking)
                            </label>
                            <input 
                                type="url" 
                                placeholder="https://yoursite.com/product" 
                                required 
                                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={productLink}
                                onChange={e => setProductLink(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                This link will be combined with tracking parameters for each influencer
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Campaign'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Campaign List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {campaigns.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {campaigns.map((campaign) => (
                            <div 
                                key={campaign._id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg dark:hover:bg-gray-700 transition-all"
                                onClick={() => setSelectedCampaign(selectedCampaign?._id === campaign._id ? null : campaign)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{campaign.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        campaign.status === 'Active' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}>
                                        {campaign.status}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{campaign.description}</p>
                                
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
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Created</p>
                                        <p className="font-bold text-orange-600 dark:text-orange-400 text-xs">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {selectedCampaign?._id === campaign._id && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Product Link:</p>
                                            <a 
                                                href={campaign.productLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                                            >
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
        </div>
    );
};

export default BrandCampaigns;
