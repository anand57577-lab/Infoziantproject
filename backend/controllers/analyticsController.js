import TrackingData from '../models/TrackingData.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get basic analytics for campaigns (Brand view)
// @route   GET /api/analytics/brand
// @access  Private/Brand
export const getBrandAnalytics = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ brand: req.user._id }).select('_id title budget status');
        const campaignIds = campaigns.map(c => c._id);

        const stats = await TrackingData.aggregate([
            { $match: { campaign: { $in: campaignIds } } },
            {
                $group: {
                    _id: { campaign: '$campaign', actionType: '$actionType' },
                    count: { $sum: 1 },
                    totalValue: { $sum: '$conversionValue' }
                }
            }
        ]);

        const results = campaigns.map(c => {
            const clickStat = stats.find(s => s._id.campaign.toString() === c._id.toString() && s._id.actionType === 'Click');
            const convStat  = stats.find(s => s._id.campaign.toString() === c._id.toString() && s._id.actionType === 'Conversion');
            return {
                _id: c._id,
                title: c.title,
                budget: c.budget,
                clicks: clickStat ? clickStat.count : 0,
                conversions: convStat ? convStat.count : 0,
                roiValue: convStat ? convStat.totalValue : 0
            };
        });

        res.json(results);
    } catch (error) {
        console.error('getBrandAnalytics error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed analytics – campaign-level + per-influencer breakdown
// @route   GET /api/analytics/brand/detailed
// @access  Private/Brand
export const getBrandAnalyticsDetailed = async (req, res) => {
    try {
        const { campaignId, influencerId, startDate, endDate } = req.query;

        /* ── 1. Fetch campaigns owned by this brand ── */
        const campaignQuery = { brand: req.user._id };
        if (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) {
            campaignQuery._id = new mongoose.Types.ObjectId(campaignId);
        }

        const campaigns = await Campaign.find(campaignQuery)
            .select('_id title budget status assignedInfluencers');

        /* No campaigns → return empty but valid structure */
        if (!campaigns.length) {
            return res.json({
                summary: { totalClicks: 0, totalConversions: 0, totalRevenue: 0, topInfluencer: null },
                campaigns: []
            });
        }

        const campaignIds = campaigns.map(c => c._id);

        /* ── 2. Build aggregation match filters ── */
        const matchConditions = { campaign: { $in: campaignIds } };

        if (influencerId && mongoose.Types.ObjectId.isValid(influencerId)) {
            matchConditions.influencer = new mongoose.Types.ObjectId(influencerId);
        }
        if (startDate || endDate) {
            matchConditions.createdAt = {};
            if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchConditions.createdAt.$lte = end;
            }
        }

        /* ── 3. Aggregate: clicks + conversions per (campaign, influencer) ── */
        const stats = await TrackingData.aggregate([
            { $match: matchConditions },
            {
                $group: {
                    _id: {
                        campaign:   '$campaign',
                        influencer: '$influencer',
                        actionType: '$actionType'
                    },
                    count:      { $sum: 1 },
                    totalValue: { $sum: '$conversionValue' }
                }
            }
        ]);

        /* ── 4. Resolve influencer names from User collection ── */
        const rawInfluencerIds = [
            ...new Set(
                stats
                    .map(s => s._id.influencer)
                    .filter(id => id != null)
                    .map(id => id.toString())
            )
        ];

        const influencerMap = {};
        if (rawInfluencerIds.length > 0) {
            const influencerDocs = await User.find({ _id: { $in: rawInfluencerIds } }).select('_id name email');
            influencerDocs.forEach(inf => {
                influencerMap[inf._id.toString()] = inf.name || inf.email || 'Unknown';
            });
        }

        /* ── 5. Build per-campaign results ── */
        const campaignResults = campaigns.map(campaign => {
            const campaignStats = stats.filter(
                s => s._id.campaign && s._id.campaign.toString() === campaign._id.toString()
            );

            /* Group by influencer */
            const infMap = {};
            campaignStats.forEach(s => {
                if (!s._id.influencer) return;
                const infId = s._id.influencer.toString();
                if (!infMap[infId]) infMap[infId] = { clicks: 0, conversions: 0, revenue: 0 };
                if (s._id.actionType === 'Click') {
                    infMap[infId].clicks += s.count;
                } else if (s._id.actionType === 'Conversion') {
                    infMap[infId].conversions += s.count;
                    infMap[infId].revenue     += s.totalValue;
                }
            });

            const influencerBreakdown = Object.entries(infMap).map(([infId, data]) => ({
                influencerId:   infId,
                influencerName: influencerMap[infId] || 'Unknown',
                clicks:         data.clicks,
                conversions:    data.conversions,
                revenue:        parseFloat(data.revenue.toFixed(2)),
                conversionRate: data.clicks > 0
                    ? parseFloat(((data.conversions / data.clicks) * 100).toFixed(1))
                    : 0
            }));

            const totalClicks      = influencerBreakdown.reduce((acc, i) => acc + i.clicks,      0);
            const totalConversions = influencerBreakdown.reduce((acc, i) => acc + i.conversions,  0);
            const totalRevenue     = parseFloat(influencerBreakdown.reduce((acc, i) => acc + i.revenue, 0).toFixed(2));

            return {
                _id: campaign._id,
                title: campaign.title,
                budget: campaign.budget,
                status: campaign.status,
                totalClicks,
                totalConversions,
                totalRevenue,
                influencerBreakdown
            };
        });

        /* ── 6. Overall summary ── */
        const totalClicks      = campaignResults.reduce((acc, c) => acc + c.totalClicks,      0);
        const totalConversions = campaignResults.reduce((acc, c) => acc + c.totalConversions,  0);
        const totalRevenue     = parseFloat(campaignResults.reduce((acc, c) => acc + c.totalRevenue, 0).toFixed(2));

        /* Top influencer (highest total clicks across all campaigns) */
        const globalInfMap = {};
        campaignResults.forEach(c => {
            c.influencerBreakdown.forEach(inf => {
                if (!globalInfMap[inf.influencerId]) {
                    globalInfMap[inf.influencerId] = { name: inf.influencerName, clicks: 0, conversions: 0, revenue: 0 };
                }
                globalInfMap[inf.influencerId].clicks      += inf.clicks;
                globalInfMap[inf.influencerId].conversions += inf.conversions;
                globalInfMap[inf.influencerId].revenue     += inf.revenue;
            });
        });

        const topInfluencer = Object.values(globalInfMap).sort((a, b) => b.clicks - a.clicks)[0] || null;

        return res.json({
            summary: { totalClicks, totalConversions, totalRevenue, topInfluencer },
            campaigns: campaignResults
        });

    } catch (error) {
        console.error('getBrandAnalyticsDetailed error:', error);
        res.status(500).json({ message: error.message });
    }
};
