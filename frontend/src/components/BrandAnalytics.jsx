import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, MousePointerClick, DollarSign, Award, Filter, RefreshCw } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ─── Colour palette for influencers ─────────────────────────── */
const PALETTE = [
    { bg: 'rgba(99,102,241,0.75)',   border: 'rgb(99,102,241)' },
    { bg: 'rgba(16,185,129,0.75)',   border: 'rgb(16,185,129)' },
    { bg: 'rgba(245,158,11,0.75)',   border: 'rgb(245,158,11)' },
    { bg: 'rgba(239,68,68,0.75)',    border: 'rgb(239,68,68)' },
    { bg: 'rgba(6,182,212,0.75)',    border: 'rgb(6,182,212)' },
    { bg: 'rgba(168,85,247,0.75)',   border: 'rgb(168,85,247)' },
    { bg: 'rgba(249,115,22,0.75)',   border: 'rgb(249,115,22)' },
    { bg: 'rgba(236,72,153,0.75)',   border: 'rgb(236,72,153)' },
];

const colorFor = (idx) => PALETTE[idx % PALETTE.length];

/* ─── Helper: format currency ─────────────────────────────────── */
const fmt = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ─── Summary Card ────────────────────────────────────────────── */
const SummaryCard = ({ icon: Icon, label, value, accent }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-lg flex items-center gap-4 ${accent}`}>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-xs font-semibold text-white/80 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-extrabold text-white leading-tight mt-0.5">{value}</p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
    </div>
);

/* ─── Main Component ──────────────────────────────────────────── */
const BrandAnalytics = ({ user }) => {
    const [data, setData]           = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');

    /* filter state */
    const [selCampaign,   setSelCampaign]   = useState('all');
    const [selInfluencer, setSelInfluencer] = useState('all');
    const [startDate,     setStartDate]     = useState('');
    const [endDate,       setEndDate]       = useState('');
    const [activeMetric,  setActiveMetric]  = useState('clicks'); // clicks | conversions | revenue

    /* chart display mode */
    const [chartMode, setChartMode] = useState('grouped'); // grouped | stacked

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (selCampaign   !== 'all') params.campaignId   = selCampaign;
            if (selInfluencer !== 'all') params.influencerId  = selInfluencer;
            if (startDate)               params.startDate     = startDate;
            if (endDate)                 params.endDate       = endDate;

            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params,
            };
            const res = await axios.get('http://localhost:5000/api/analytics/brand/detailed', config);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Derived values ── */
    const campaignOptions = useMemo(() => data?.campaigns || [], [data]);

    /* All unique influencers across filtered campaigns */
    const allInfluencers = useMemo(() => {
        if (!data) return [];
        const map = {};
        data.campaigns.forEach(c =>
            c.influencerBreakdown.forEach(inf => {
                if (!map[inf.influencerId]) map[inf.influencerId] = inf.influencerName;
            })
        );
        return Object.entries(map).map(([id, name]) => ({ id, name }));
    }, [data]);

    /* Build Chart.js grouped/stacked datasets */
    const chartData = useMemo(() => {
        if (!data || !data.campaigns.length) return null;

        const labels = data.campaigns.map(c => c.title);

        /* Collect every influencer that appears in any campaign (respect filter) */
        const infSet = {};
        data.campaigns.forEach(c =>
            c.influencerBreakdown.forEach(inf => {
                if (!infSet[inf.influencerId]) infSet[inf.influencerId] = inf.influencerName;
            })
        );

        const influencers = Object.entries(infSet);
        const metricKey = activeMetric; // clicks | conversions | revenue

        const datasets = influencers.map(([infId, infName], idx) => {
            const color = colorFor(idx);
            return {
                label: infName,
                data: data.campaigns.map(c => {
                    const rec = c.influencerBreakdown.find(i => i.influencerId === infId);
                    return rec ? rec[metricKey] : 0;
                }),
                backgroundColor: color.bg,
                borderColor: color.border,
                borderWidth: 2,
                borderRadius: 6,
            };
        });

        /* Add a "Total" dataset in stacked mode? — replace with separate datasets */
        return { labels, datasets };
    }, [data, activeMetric]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } },
            },
            title: {
                display: true,
                text: `Campaign Performance — ${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)} by Influencer`,
                font: { size: 15, weight: 'bold' },
                padding: { bottom: 16 },
            },
            tooltip: {
                callbacks: {
                    title: (items) => `Campaign: ${items[0].label}`,
                    label: (item) => {
                        const camp = data?.campaigns[item.dataIndex];
                        const inf  = camp?.influencerBreakdown.find(i => i.influencerName === item.dataset.label);
                        if (!inf) return ` ${item.dataset.label}: ${item.formattedValue}`;
                        return [
                            ` 👤 ${inf.influencerName}`,
                            ` 🖱  Clicks: ${inf.clicks}`,
                            ` 🔄 Conversions: ${inf.conversions}`,
                            ` 💰 Revenue: ${fmt(inf.revenue)}`,
                            ` 📊 Conv. Rate: ${inf.conversionRate}%`,
                        ];
                    },
                },
                padding: 12,
                boxPadding: 4,
            },
        },
        scales: {
            x: { stacked: chartMode === 'stacked', grid: { display: false } },
            y: { stacked: chartMode === 'stacked', beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' } },
        },
    }), [data, activeMetric, chartMode]);

    /* ── Flat influencer table (aggregated across filtered campaigns) ── */
    const tableRows = useMemo(() => {
        if (!data) return [];
        const map = {};
        data.campaigns.forEach(c =>
            c.influencerBreakdown.forEach(inf => {
                if (!map[inf.influencerId]) {
                    map[inf.influencerId] = { name: inf.influencerName, clicks: 0, conversions: 0, revenue: 0 };
                }
                map[inf.influencerId].clicks      += inf.clicks;
                map[inf.influencerId].conversions += inf.conversions;
                map[inf.influencerId].revenue     += inf.revenue;
            })
        );
        return Object.values(map)
            .map(r => ({
                ...r,
                revenue: parseFloat(r.revenue.toFixed(2)),
                conversionRate: r.clicks > 0 ? parseFloat(((r.conversions / r.clicks) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.clicks - a.clicks);
    }, [data]);

    /* ── Render ── */
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading analytics…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl p-6 text-center">
                <p className="font-semibold text-lg">Error</p>
                <p className="mt-1 text-sm">{error}</p>
                <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Retry
                </button>
            </div>
        );
    }

    const { summary } = data || { summary: { totalClicks: 0, totalConversions: 0, totalRevenue: 0, topInfluencer: null } };
    const hasData = data?.campaigns?.length > 0 && tableRows.length > 0;

    return (
        <div className="space-y-6">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Analytics Dashboard</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track campaign & influencer performance in real time</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow transition-colors"
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard icon={MousePointerClick} label="Total Campaign Clicks"  value={summary.totalClicks.toLocaleString()}     accent="bg-gradient-to-br from-indigo-500 to-indigo-700" />
                <SummaryCard icon={TrendingUp}       label="Total Conversions"       value={summary.totalConversions.toLocaleString()} accent="bg-gradient-to-br from-emerald-500 to-emerald-700" />
                <SummaryCard icon={DollarSign}       label="Total Revenue"           value={fmt(summary.totalRevenue)}                  accent="bg-gradient-to-br from-amber-500 to-orange-600" />
                <SummaryCard icon={Award}            label="Top Influencer"          value={summary.topInfluencer?.name || '—'}         accent="bg-gradient-to-br from-purple-500 to-pink-600" />
            </div>

            {/* ── Filter Bar ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={16} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Campaign */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Campaign</label>
                        <select
                            value={selCampaign}
                            onChange={e => setSelCampaign(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="all">All Campaigns</option>
                            {campaignOptions.map(c => (
                                <option key={c._id} value={c._id}>{c.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Influencer */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Influencer</label>
                        <select
                            value={selInfluencer}
                            onChange={e => setSelInfluencer(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="all">All Influencers</option>
                            {allInfluencers.map(i => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={fetchData}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={() => { setSelCampaign('all'); setSelInfluencer('all'); setStartDate(''); setEndDate(''); }}
                        className="px-5 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* ── Chart ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                {/* Chart controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    {/* Metric toggle */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                        {['clicks','conversions','revenue'].map(m => (
                            <button
                                key={m}
                                onClick={() => setActiveMetric(m)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                                    activeMetric === m
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    {/* Chart mode toggle */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                        {[['grouped','Grouped'],['stacked','Stacked']].map(([val, lbl]) => (
                            <button
                                key={val}
                                onClick={() => setChartMode(val)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    chartMode === val
                                        ? 'bg-white dark:bg-gray-500 text-indigo-700 dark:text-white shadow'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {lbl}
                            </button>
                        ))}
                    </div>
                </div>

                {hasData && chartData ? (
                    <div className="h-96">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                        <TrendingUp size={48} className="mb-3 opacity-30" />
                        <p className="font-medium">No analytics data yet</p>
                        <p className="text-sm mt-1">Assign influencers to campaigns and generate tracking links to see data here.</p>
                    </div>
                )}
            </div>

            {/* ── Influencer Table ── */}
            {hasData && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Influencer Performance Breakdown</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Aggregated across all selected campaigns</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="text-left px-6 py-3">Influencer</th>
                                    <th className="text-right px-4 py-3">Clicks</th>
                                    <th className="text-right px-4 py-3">Conversions</th>
                                    <th className="text-right px-4 py-3">Revenue</th>
                                    <th className="text-right px-6 py-3">Conv. Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {tableRows.map((row, idx) => {
                                    const color = colorFor(idx);
                                    return (
                                        <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ background: color.border }}
                                                    />
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{row.name}</span>
                                                    {idx === 0 && (
                                                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Top</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">{row.clicks.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">{row.conversions.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">{fmt(row.revenue)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{ width: `${Math.min(row.conversionRate, 100)}%`, background: color.border }}
                                                        />
                                                    </div>
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums w-12 text-right">
                                                        {row.conversionRate}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Footer totals */}
                            <tfoot>
                                <tr className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-bold border-t-2 border-indigo-200 dark:border-indigo-700">
                                    <td className="px-6 py-3">Total</td>
                                    <td className="px-4 py-3 text-right font-mono">{summary.totalClicks.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono">{summary.totalConversions.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono">{fmt(summary.totalRevenue)}</td>
                                    <td className="px-6 py-3 text-right font-mono">
                                        {summary.totalClicks > 0
                                            ? `${((summary.totalConversions / summary.totalClicks) * 100).toFixed(1)}%`
                                            : '0%'}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Per-Campaign Breakdown Cards ── */}
            {hasData && (
                <div className="space-y-3">
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 px-1">Campaign-level Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.campaigns.map((c, ci) => (
                            <div key={c._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{c.title}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            c.status === 'Active'    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                          : c.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>{c.status}</span>
                                    </div>
                                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                        <p>Budget: <span className="font-semibold text-gray-700 dark:text-gray-300">{fmt(c.budget)}</span></p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[
                                        { label: 'Clicks',      val: c.totalClicks.toLocaleString(),    cls: 'text-indigo-600 dark:text-indigo-400' },
                                        { label: 'Conversions', val: c.totalConversions.toLocaleString(), cls: 'text-emerald-600 dark:text-emerald-400' },
                                        { label: 'Revenue',     val: fmt(c.totalRevenue),                 cls: 'text-amber-600 dark:text-amber-400'  },
                                    ].map(s => (
                                        <div key={s.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2 text-center">
                                            <p className={`text-lg font-extrabold ${s.cls}`}>{s.val}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Influencer mini-list */}
                                {c.influencerBreakdown.length > 0 && (
                                    <div className="space-y-1.5">
                                        {c.influencerBreakdown.sort((a,b) => b.clicks - a.clicks).map((inf, ii) => {
                                            const col = colorFor(ci * 10 + ii);
                                            return (
                                                <div key={inf.influencerId} className="flex items-center gap-2 text-xs">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.border }} />
                                                    <span className="flex-1 font-medium text-gray-700 dark:text-gray-300 truncate">{inf.influencerName}</span>
                                                    <span className="text-gray-500 dark:text-gray-400">{inf.clicks} clicks</span>
                                                    <span className="text-indigo-500 dark:text-indigo-400 font-semibold">{inf.conversionRate}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandAnalytics;
