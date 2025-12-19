import { Ad, AdSet, Campaign } from "./traffic-types";

const CAMPAIGN_OBJECTIVES = ['CONVERSION', 'TRAFFIC', 'AWARENESS'];
const AD_FORMATS = ['IMAGE', 'VIDEO', 'CAROUSEL'] as const;
const STATUSES = ['active', 'paused', 'ended'] as const;

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function generateMockData(): { campaigns: Campaign[]; adSets: AdSet[]; ads: Ad[] } {
    const campaigns: Campaign[] = [];
    const adSets: AdSet[] = [];
    const ads: Ad[] = [];

    // Generate 5 Campaigns
    for (let c = 1; c <= 5; c++) {
        const campaignId = generateId();
        const impressions = randomInt(10000, 500000);
        const clicks = Math.floor(impressions * randomFloat(0.01, 0.035)); // 1-3.5% CTR
        const linkClicks = Math.floor(clicks * randomFloat(0.8, 0.95)); // Link Clicks < All Clicks
        const pageViews = Math.floor(linkClicks * randomFloat(0.6, 0.9)); // Connect Rate based on Link Clicks
        const spend = clicks * randomFloat(1.5, 5.0); // CPC 1.5 - 5.0
        const leads = Math.floor(pageViews * randomFloat(0.15, 0.5)); // 15-50% LP Conversion
        const conversions = Math.floor(leads * randomFloat(0.05, 0.2)); // 5-20% sales

        const campaign: Campaign = {
            id: campaignId,
            name: `[GITA] Campaign ${c} - ${CAMPAIGN_OBJECTIVES[c % 3]}`,
            status: STATUSES[c % 3], // mix of statuses
            objective: CAMPAIGN_OBJECTIVES[c % 3],
            startDate: randomDate(new Date(2025, 0, 1), new Date(2025, 2, 1)),
            impressions,
            reach: Math.floor(impressions * 0.8), // Freq ~1.2
            clicks,
            linkClicks,
            pageViews,
            spend,
            leads,
            conversions,
            ctr: (clicks / impressions) * 100,
            cpc: spend / clicks,
            cpm: (spend / impressions) * 1000,
            cpl: spend / (leads || 1),
            engagement: Math.floor(impressions * 0.05)
        };
        campaigns.push(campaign);

        // Generate 2-4 AdSets per Campaign
        const numAdSets = randomInt(2, 4);
        for (let as = 1; as <= numAdSets; as++) {
            const adSetId = generateId();
            // Distribute campaign metrics roughly
            const ratio = 1 / numAdSets;
            // Add some variance
            const variance = randomFloat(0.8, 1.2);

            const asImpressions = Math.floor(impressions * ratio * variance);
            const asClicks = Math.floor(clicks * ratio * variance);
            const asLinkClicks = Math.floor(linkClicks * ratio * variance);
            const asPageViews = Math.floor(pageViews * ratio * variance);
            const asSpend = spend * ratio * variance;
            const asLeads = Math.floor(leads * ratio * variance);
            const asConversions = Math.floor(conversions * ratio * variance);

            const adSet: AdSet = {
                id: adSetId,
                campaignId,
                name: `[${c}] AdSet ${as} - Interest`,
                status: Math.random() > 0.3 ? 'active' : 'paused',
                segmentation: ['Lookalike 1%', 'Interest: Marketing', 'Broad', 'Retargeting'][randomInt(0, 3)],
                startDate: campaign.startDate,
                impressions: asImpressions,
                reach: Math.floor(asImpressions * 0.9),
                clicks: asClicks,
                linkClicks: asLinkClicks,
                pageViews: asPageViews,
                spend: asSpend,
                leads: asLeads,
                conversions: asConversions,
                ctr: (asClicks / (asImpressions || 1)) * 100,
                cpc: asSpend / (asClicks || 1),
                cpm: (asSpend / (asImpressions || 1)) * 1000,
                cpl: asSpend / (asLeads || 1),
                engagement: Math.floor(asImpressions * 0.04)
            };
            adSets.push(adSet);

            // Generate 2-5 Ads per AdSet
            const numAds = randomInt(2, 5);
            for (let a = 1; a <= numAds; a++) {
                const adId = generateId();
                const adRatio = 1 / numAds;
                const adVar = randomFloat(0.8, 1.2);

                const aImpressions = Math.floor(asImpressions * adRatio * adVar);
                const aClicks = Math.floor(asClicks * adRatio * adVar);
                const aLinkClicks = Math.floor(asLinkClicks * adRatio * adVar);
                const aPageViews = Math.floor(asPageViews * adRatio * adVar);
                const aSpend = asSpend * adRatio * adVar;
                const aLeads = Math.floor(asLeads * adRatio * adVar);
                const aConversions = Math.floor(asConversions * adRatio * adVar);

                const ad: Ad = {
                    id: adId,
                    adSetId,
                    campaignId,
                    name: `Ad ${a} - ${['Benefit Hook', 'Social Proof', 'Urgency'][randomInt(0, 2)]}`,
                    status: Math.random() > 0.2 ? 'active' : 'paused',
                    format: AD_FORMATS[randomInt(0, 2)],
                    impressions: aImpressions,
                    reach: Math.floor(aImpressions * 0.95),
                    clicks: aClicks,
                    linkClicks: aLinkClicks,
                    pageViews: aPageViews,
                    spend: aSpend,
                    leads: aLeads,
                    conversions: aConversions,
                    ctr: (aClicks / (aImpressions || 1)) * 100,
                    cpc: aSpend / (aClicks || 1),
                    cpm: (aSpend / (aImpressions || 1)) * 1000,
                    cpl: aSpend / (aLeads || 1),
                    engagement: Math.floor(aImpressions * 0.03),
                    creativeUrl: `https://source.unsplash.com/random/400x400?sig=${adId}`
                };
                ads.push(ad);
            }
        }
    }

    return { campaigns, adSets, ads };
}
