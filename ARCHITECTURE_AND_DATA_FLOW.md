# Brand Dashboard - Complete Data Flow & Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BRAND DASHBOARD                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Navigation Bar                             │   │
│  │  [Analytics] [Create Campaign] [Assign Influencers]          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              BrandDashboard Component                         │   │
│  │         (Routes between child components)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌──────────────────┬────────────────────┬──────────────────────┐   │
│  │    Analytics     │     Campaigns      │   Assign Influencers │   │
│  │   (BrandAnalytics) │  (BrandCampaigns) │  (BrandAssignInflu)  │   │
│  └──────────────────┴────────────────────┴──────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
           ↓                    ↓                    ↓
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │   /analytics │    │  /campaigns  │    │ /campaigns   │
    │   /brand     │    │              │    │ /:id/assign  │
    └──────────────┘    └──────────────┘    └──────────────┘
           ↓                    ↓                    ↓
    ┌─────────────────────────────────────────────────────┐
    │          MongoDB Database (MERN Stack)             │
    │                                                     │
    │  Collections:                                      │
    │  • campaigns (with productLink & trackingUrl)     │
    │  • users (brand, influencers)                     │
    │  • trackingData (clicks, conversions)            │
    └─────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.jsx
└── Dashboard.jsx (page)
    └── BrandDashboard.jsx (main container)
        ├── BrandAnalytics.jsx (tab content)
        │   └── Chart.js (Bar chart)
        │
        ├── BrandCampaigns.jsx (tab content)
        │   ├── Create Campaign Form
        │   └── Campaign Cards Grid
        │
        └── BrandAssignInfluencers.jsx (tab content)
            ├── Step 1: Campaign Selection
            ├── Step 2: Influencer Selection
            └── Step 3: Bulk Assignment
```

---

## Data Flow: Campaign Creation with Product Link

```
┌─────────────────────────────────────────────────────┐
│ Brand fills Create Campaign Form:                  │
│ • Title: "Summer Collection"                        │
│ • Description: "New summer items"                   │
│ • Budget: 5000                                      │
│ • Product Link: "https://store.com/summer"          │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ FormSubmit Handler Validates:                      │
│ - All fields filled                                │
│ - Product Link is valid URL                        │
│ - Budget is positive number                        │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Axios POST to /api/campaigns                       │
│ {                                                   │
│   title: "Summer Collection",                      │
│   description: "New summer items",                 │
│   budget: 5000,                                    │
│   productLink: "https://store.com/summer"          │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Backend: campaignController.createCampaign()       │
│ 1. Create new Campaign document                    │
│ 2. Set brand = req.user._id                        │
│ 3. Set productLink = req.body.productLink          │
│ 4. Set status = 'Active'                           │
│ 5. Save to MongoDB                                 │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ MongoDB Campaign Document Created:                 │
│ {                                                   │
│   _id: ObjectId(...),                              │
│   brand: ObjectId(...),                            │
│   title: "Summer Collection",                      │
│   description: "New summer items",                 │
│   budget: 5000,                                    │
│   productLink: "https://store.com/summer",         │
│   status: "Active",                                │
│   assignedInfluencers: [],                         │
│   createdAt: ...,                                  │
│   updatedAt: ...                                   │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Success Response & UI Update:                      │
│ - Close form modal                                 │
│ - Show success message                             │
│ - Refresh campaign list                            │
│ - Display new campaign in grid                     │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow: Bulk Influencer Assignment with Tracking URL Generation

```
┌──────────────────────────────────────────────────────┐
│ Step 1: Brand Selects Campaign                     │
│ • Dropdown shows all brand's campaigns             │
│ • Campaign details displayed:                      │
│   - Title, Description, Budget                     │
│   - Status, Product Link                           │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ Step 2: Brand Multi-Select Influencers             │
│ • Renders list of approved influencers             │
│ • Shows social platform info (followers, etc)      │
│ • Click to select (checkbox-like behavior)         │
│ • Visual feedback: selection highlight appears     │
│ • Prevents selection of already-assigned            │
│ • Brand selects: Influencer A, B, C                │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ Step 3: Click "Assign 3 Influencers"               │
│ State before: selectedInfluencers = [A, B, C]      │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ handleAssignInfluencers() Triggered                │
│ Loop through selectedInfluencers:                  │
│   For Influencer A:                                │
│   For Influencer B:                                │
│   For Influencer C:                                │
│                                                    │
│ Axios.put() × 3 to /api/campaigns/:id/assign      │
│ with { influencerId: A, B, C }                     │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ Backend: assignInfluencer() × 3 (parallel)          │
│                                                    │
│ For Each Request:                                  │
│ 1. Find campaign by ID                             │
│ 2. Verify brand authorization                      │
│ 3. Check if influencer already assigned            │
│ 4. Generate unique tracking code:                  │
│    crypto.randomBytes(8).toString('hex')           │
│    Example: "a1b2c3d4e5f6g7h8"                    │
│ 5. Create tracking URL:                            │
│    "http://localhost:5000/api/tracking/a1b2c3d..." │
│ 6. Push to assignedInfluencers:                    │
│    {                                               │
│      influencer: ObjectId(influencerId),           │
│      uniqueLink: "a1b2c3d4e5f6g7h8",               │
│      trackingUrl: "http://localhost:5000/api/...",│
│      status: "Pending"                             │
│    }                                               │
│ 7. Save campaign                                   │
│ 8. Return updated campaign                         │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ MongoDB Campaign Updated:                          │
│ {                                                   │
│   ...existing campaign data...                     │
│   assignedInfluencers: [                           │
│     {                                              │
│       influencer: ObjectId(A),                     │
│       uniqueLink: "a1b2c3d4e5f6g7h8",             │
│       trackingUrl: "http://localhost:5000...",    │
│       status: "Pending"                            │
│     },                                             │
│     {                                              │
│       influencer: ObjectId(B),                     │
│       uniqueLink: "x9y8z7a6b5c4d3e2",             │
│       trackingUrl: "http://localhost:5000...",    │
│       status: "Pending"                            │
│     },                                             │
│     {                                              │
│       influencer: ObjectId(C),                     │
│       uniqueLink: "m1n2o3p4q5r6s7t8",             │
│       trackingUrl: "http://localhost:5000...",    │
│       status: "Pending"                            │
│     }                                              │
│   ]                                                │
│ }                                                   │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ Frontend Success Response Handling:                │
│ • Display success message:                         │
│   "✓ Successfully assigned 3 influencer(s)..."     │
│ • Clear selected influencers array                 │
│ • Reset campaign selection                         │
│ • Wait 2 seconds                                   │
│ • Refresh page to show updated campaign data       │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ Tracking URLs Ready for Distribution              │
│ • Each influencer has unique tracking URL         │
│ • URL format: .../api/tracking/{uniqueLink}       │
│ • URLs stored in campaign document                │
│ • URLs will be visible in Influencer Dashboard    │
│ • URLs ready to be shared by influencers          │
└──────────────────────────────────────────────────────┘
```

---

## Tracking URL Lifecycle

```
┌──────────────────────────────────────────────────────┐
│ 1. GENERATION (Backend)                            │
│    • Influencer assigned to campaign               │
│    • Server generates unique hex code              │
│    • Creates tracking URL with code                │
│    • Stores both in database                       │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ 2. STORAGE (MongoDB)                               │
│    In campaign.assignedInfluencers[]:              │
│    • uniqueLink: "a1b2c3d4e5f6g7h8"               │
│    • trackingUrl: "http://localhost:5000/api..."   │
│    • status: "Pending"                             │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ 3. RETRIEVAL (Frontend - Future)                   │
│    • Influencer Dashboard fetches campaigns        │
│    • Displays tracking URLs to influencer          │
│    • Influencer copies link to share               │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ 4. ACTIVATION (Public Click)                       │
│    • Influencer shares tracking URL                │
│    • User clicks link                              │
│    • GET /api/tracking/{uniqueLink}               │
│    • trackingController.trackClick() executes      │
│    • Records click in TrackingData collection      │
│    • Redirects to product or landing page          │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ 5. CONVERSION TRACKING (User Action)                │
│    • User makes purchase or converts               │
│    • POST /api/tracking/{uniqueLink}/conversion    │
│    • trackingController.trackConversion() logs it  │
│    • Records conversion with value                 │
│    • Updates analytics database                    │
└──────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────┐
│ 6. ANALYTICS (Brand Dashboard)                     │
│    • Brand views Analytics tab                     │
│    • Fetches /api/analytics/brand                  │
│    • Shows charts with clicks & conversions        │
│    • Per-campaign performance visible              │
│    • ROI data calculated                           │
└──────────────────────────────────────────────────────┘
```

---

## State Management Flow

### BrandDashboard Component State
```
activeSection: 'analytics' | 'campaigns' | 'assign'
     ↓
Determines which child component renders
     ↓
(BrandAnalytics | BrandCampaigns | BrandAssignInfluencers)
```

### BrandCampaigns Component State
```
campaigns: Campaign[]           ← Fetched from API
loading: boolean                ← Loading state
showForm: boolean               ← Modal toggle
selectedCampaign: Campaign | null  ← Expandable details
title, description, budget: string | number
productLink: string             ← NEW: Product URL for tracking
isSubmitting: boolean           ← Form submission state
```

### BrandAssignInfluencers Component State
```
campaigns: Campaign[]           ← Fetched from API
approvedInfluencers: Profile[] ← Fetched from API
loading: boolean                ← Initial data load
selectedCampaign: string        ← Selected campaign ID
selectedInfluencers: string[]   ← Multi-select array
isAssigning: boolean            ← Assignment action state
assignmentMessage: string       ← Success/error feedback
```

---

## API Request/Response Examples

### POST /api/campaigns (Campaign Creation)
**Request:**
```json
{
  "title": "Summer Collection",
  "description": "New summer products",
  "budget": 5000,
  "productLink": "https://store.com/summer-collection"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "brand": "507f1f77bcf86cd799439012",
  "title": "Summer Collection",
  "description": "New summer products",
  "budget": 5000,
  "productLink": "https://store.com/summer-collection",
  "status": "Active",
  "assignedInfluencers": [],
  "createdAt": "2024-03-07T10:00:00Z",
  "updatedAt": "2024-03-07T10:00:00Z"
}
```

### PUT /api/campaigns/:id/assign (Influencer Assignment)
**Request:**
```json
{
  "influencerId": "507f1f77bcf86cd799439013"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "brand": "507f1f77bcf86cd799439012",
  "title": "Summer Collection",
  "description": "New summer products",
  "budget": 5000,
  "productLink": "https://store.com/summer-collection",
  "status": "Active",
  "assignedInfluencers": [
    {
      "influencer": "507f1f77bcf86cd799439013",
      "uniqueLink": "a1b2c3d4e5f6g7h8",
      "trackingUrl": "http://localhost:5000/api/tracking/a1b2c3d4e5f6g7h8",
      "status": "Pending"
    }
  ],
  "createdAt": "2024-03-07T10:00:00Z",
  "updatedAt": "2024-03-07T10:00:05Z"
}
```

---

## Error Handling Flow

```
User Action (e.g., Create Campaign)
         ↓
Form Validation (Client-side)
    ✓ Pass → Continue
    ✗ Fail → Show validation message
         ↓
Axios Request
    ✓ Success (200-201) → Process response
    ✗ Error (4xx-5xx) → Catch block
         ↓
Error Handler
    • Extract error message from response
    • Show alert or message to user
    • Log error to console
    • Allow user to retry
```

---

## Key Features Summary

| Feature | Component | Status |
|---------|-----------|--------|
| Navigation Bar | BrandDashboard | ✅ Completed |
| Analytics Tab | BrandAnalytics | ✅ Completed |
| Create Campaign Form | BrandCampaigns | ✅ Completed |
| Product Link Field | BrandCampaigns | ✅ Completed |
| Campaign List | BrandCampaigns | ✅ Completed |
| Assign Influencers Tab | BrandAssignInfluencers | ✅ Completed |
| Multi-Select UI | BrandAssignInfluencers | ✅ Completed |
| Bulk Assignment | BrandAssignInfluencers | ✅ Completed |
| Tracking URL Generation | Backend Controller | ✅ Completed |
| Database Schema Update | Campaign Model | ✅ Completed |

