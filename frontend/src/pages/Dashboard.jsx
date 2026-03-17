import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import AdminDashboard from '../components/AdminDashboard';
import BrandDashboard from '../components/BrandDashboard';
import InfluencerDashboard from '../components/InfluencerDashboard';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (!user) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            {/* Navigation Bar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                Influencer Campaign Manager
                            </h1>
                        </div>
                        <div className="flex items-center space-x-6">
                            <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-300 hover:text-blue-500 transition-colors">
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <span className="text-sm font-medium">
                                Welcome, {user.name} ({user.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {user.role === 'Admin' && <AdminDashboard user={user} />}
                {user.role === 'Brand' && <BrandDashboard user={user} />}
                {user.role === 'Influencer' && <InfluencerDashboard user={user} />}
            </main>
        </div>
    );
};

export default Dashboard;
