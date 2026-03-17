import { useState } from 'react';
import { BarChart3, Plus, Users, LayoutDashboard } from 'lucide-react';
import BrandHome from './BrandHome';
import BrandAnalytics from './BrandAnalytics';
import BrandCampaigns from './BrandCampaigns';
import BrandAssignInfluencers from './BrandAssignInfluencers';

const BrandDashboard = ({ user }) => {
    const [activeSection, setActiveSection] = useState('home');

    const navItems = [
        {
            id: 'home',
            label: 'Dashboard',
            icon: <LayoutDashboard size={20} />
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 size={20} />
        },
        {
            id: 'campaigns',
            label: 'Create Campaign',
            icon: <Plus size={20} />
        },
        {
            id: 'assign',
            label: 'Assign Influencers',
            icon: <Users size={20} />
        }
    ];

    return (
        <div className="space-y-6">
            {/* Navigation Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeSection === item.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div>
                {activeSection === 'home' && <BrandHome user={user} setActiveSection={setActiveSection} />}
                {activeSection === 'analytics' && <BrandAnalytics user={user} />}
                {activeSection === 'campaigns' && <BrandCampaigns user={user} />}
                {activeSection === 'assign' && <BrandAssignInfluencers user={user} />}
            </div>
        </div>
    );
};

export default BrandDashboard;
