import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';

const BrandAssignInfluencers = ({ user }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [approvedInfluencers, setApprovedInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [selectedInfluencers, setSelectedInfluencers] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentMessage, setAssignmentMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                
                const [campRes, infRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/campaigns', config),
                    axios.get('http://localhost:5000/api/profiles/approved', config)
                ]);

                setCampaigns(campRes.data);
                setApprovedInfluencers(infRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleSelectInfluencer = (influencerId) => {
        setSelectedInfluencers(prev => {
            if (prev.includes(influencerId)) {
                return prev.filter(id => id !== influencerId);
            } else {
                return [...prev, influencerId];
            }
        });
        setAssignmentMessage('');
    };

    const handleAssignInfluencers = async () => {
        if (!selectedCampaign) {
            alert('Please select a campaign');
            return;
        }

        if (selectedInfluencers.length === 0) {
            alert('Please select at least one influencer');
            return;
        }

        setIsAssigning(true);
        setAssignmentMessage('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            const results = await Promise.all(
                selectedInfluencers.map(influencerId =>
                    axios.put(
                        `http://localhost:5000/api/campaigns/${selectedCampaign}/assign`,
                        { influencerId },
                        config
                    )
                )
            );

            setAssignmentMessage(`✓ Successfully assigned ${selectedInfluencers.length} influencer(s) to the campaign!`);
            setSelectedInfluencers([]);
            setSelectedCampaign('');
            
            // Wait a moment before refreshing
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error assigning influencers';
            setAssignmentMessage(`✗ ${errorMsg}`);
        } finally {
            setIsAssigning(false);
        }
    };

    const selectedCampaignData = campaigns.find(c => c._id === selectedCampaign);

    if (loading) return <div className="text-center py-6">Loading data...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Assign Influencers to Campaigns</h2>

            {/* Campaign Selection */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Step 1: Select Campaign</h3>
                
                {campaigns.length > 0 ? (
                    <select 
                        value={selectedCampaign}
                        onChange={(e) => {
                            setSelectedCampaign(e.target.value);
                            setSelectedInfluencers([]);
                            setAssignmentMessage('');
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select a campaign --</option>
                        {campaigns.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.title} ({c.assignedInfluencers.length} influencers assigned)
                            </option>
                        ))}
                    </select>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No campaigns available. Create a campaign first.</p>
                )}

                {selectedCampaignData && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">{selectedCampaignData.title}</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">{selectedCampaignData.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                                <p className="font-semibold text-blue-600 dark:text-blue-300">${selectedCampaignData.budget}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <p className="font-semibold text-blue-600 dark:text-blue-300">{selectedCampaignData.status}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Product:</span>
                                <a 
                                    href={selectedCampaignData.productLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-blue-600 dark:text-blue-300 hover:underline text-xs truncate"
                                >
                                    View Link
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Influencer Selection */}
            {selectedCampaign && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Step 2: Select Influencers ({selectedInfluencers.length} selected)
                    </h3>

                    {approvedInfluencers.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {approvedInfluencers.map((influencer) => {
                                if (!influencer || !influencer.user) return null;
                                
                                const isAlreadyAssigned = selectedCampaignData?.assignedInfluencers.some(
                                    a => a.influencer?._id === influencer.user._id
                                );
                                const isSelected = selectedInfluencers.includes(influencer.user._id);

                                return (
                                    <div 
                                        key={influencer.user._id}
                                        onClick={() => !isAlreadyAssigned && handleSelectInfluencer(influencer.user._id)}
                                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                            isAlreadyAssigned
                                                ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-60'
                                                : isSelected
                                                ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-gray-700'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                                        {influencer.user.name}
                                                    </h4>
                                                    {isSelected && !isAlreadyAssigned && (
                                                        <CheckCircle size={20} className="text-green-500" />
                                                    )}
                                                    {isAlreadyAssigned && (
                                                        <AlertCircle size={20} className="text-orange-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {influencer.user.email}
                                                </p>
                                            </div>
                                        </div>

                                        {influencer.socialPlatforms && influencer.socialPlatforms.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {influencer.socialPlatforms.map((platform, idx) => (
                                                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">{platform.platform}:</span> {platform.followers} followers
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {isAlreadyAssigned && (
                                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-semibold">
                                                Already assigned to this campaign
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                            No approved influencers available. Admins must verify profiles first.
                        </p>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            {selectedCampaign && selectedInfluencers.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    {assignmentMessage && (
                        <div className={`mb-4 p-4 rounded-lg ${
                            assignmentMessage.includes('✓')
                                ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
                                : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
                        }`}>
                            {assignmentMessage}
                        </div>
                    )}

                    <button
                        onClick={handleAssignInfluencers}
                        disabled={isAssigning}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <Users size={20} />
                        {isAssigning ? 'Assigning...' : `Assign ${selectedInfluencers.length} Influencer(s)`}
                    </button>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                        Tracking URLs will be generated and associated with each influencer
                    </p>
                </div>
            )}
        </div>
    );
};

export default BrandAssignInfluencers;
