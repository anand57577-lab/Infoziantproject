# Brand Dashboard Implementation Guide

## Overview
The Brand Dashboard has been completely restructured with a navigation-based interface that provides three main sections: **Analytics**, **Create Campaign**, and **Assign Influencers**. Each section allows brands to manage their campaigns and influencer assignments with automatic tracking URL generation.

---

## Architecture & Components

### 1. **BrandDashboard.jsx** (Main Container)
**Location:** `frontend/src/components/BrandDashboard.jsx`

**Purpose:** Navigation hub that manages which section is displayed

**Key Features:**
- Tab-based navigation with icons
- Active state highlighting
- Route between Analytics, Campaigns, and Assign Influencers sections

**State Management:**
- `activeSection`: Controls which component is rendered

**Navigation Items:**
```
- Analytics (BarChart3 icon) - View campaign performance
- Create Campaign (Plus icon) - Create new campaigns with product links
- Assign Influencers (Users icon) - Assign influencers to campaigns
```

---

### 2. **BrandAnalytics.jsx**
**Location:** `frontend/src/components/BrandAnalytics.jsx`

**Purpose:** Displays campaign performance metrics and charts

**Key Features:**
- Bar chart showing clicks and conversions per campaign
- Summary cards displaying:
  - Total Clicks across all campaigns
  - Total Conversions
  - Conversion Rate percentage
- Responsive grid layout
- Dark mode support

**Data Flow:**
1. Fetches analytics from `/api/analytics/brand`
2. Populates chart with campaign data
3. Calculates aggregate metrics

---

### 3. **BrandCampaigns.jsx**
**Location:** `frontend/src/components/BrandCampaigns.jsx`

**Purpose:** Manage campaigns with product link integration

**Key Features:**
- **Create Campaign Form** with fields:
  - Campaign Title
  - Description
  - Budget ($)
  - Product Link (new field) - The URL for the product being promoted
  
- **Campaign Display** showing:
  - Campaign title and status
  - Budget and creation date
  - Number of assigned influencers
  - Product link (expandable)
  - List of assigned influencers with their status

- **Form Validation:**
  - Ensures all fields are filled before submission
  - Validates URL format for product link

**Data Flow:**
1. Fetches campaigns from `/api/campaigns`
2. Brand creates campaign with `productLink`
3. Campaign POST includes product link
4. Campaign stored in database with tracking-ready product link

---

### 4. **BrandAssignInfluencers.jsx**
**Location:** `frontend/src/components/BrandAssignInfluencers.jsx`

**Purpose:** Multi-step influencer assignment with automatic tracking URL generation

**Key Features:**

**Step 1: Campaign Selection**
- Dropdown showing all available campaigns
- Displays campaign details (title, description, budget, status, product link)
- Visual feedback with blue highlight box

**Step 2: Influencer Selection**
- Scrollable list of approved influencers
- Shows:
  - Influencer name
  - Email
  - Social platform information (platform, follower count)
- Status indicators:
  - ✓ Green checkmark for selected influencers
  - ⚠ Orange alert icon for already-assigned influencers
  - Disabled state prevents re-assignment
- Multi-select capability with checkbox-like behavior

**Step 3: Bulk Assignment**
- Displays count of selected influencers
- Upon submission:
  - Sends assignment requests for each selected influencer via `/api/campaigns/:id/assign`
  - Server generates unique tracking URL for each influencer
  - Success message confirms assignments
  - Refreshes page to show updated campaign data

**Automatic Tracking URL Generation:**
- Server generates 16-character hex unique link per influencer
- Creates tracking URL: `http://localhost:5000/api/tracking/{uniqueLink}`
- Stored in database alongside influencer record

---

## Database Schema Changes

### Campaign Model Update
**File:** `backend/models/Campaign.js`

**New Fields:**
```javascript
productLink: {
    type: String,
    required: false,
}
```

**Updated assignedInfluencers sub-schema:**
```javascript
trackingUrl: {
    type: String
}
```

**Full Structure:**
```
Campaign {
  brand: ObjectId (ref User)
  title: String
  description: String
  budget: Number
  productLink: String    ← NEW
  status: String (Draft/Active/Completed)
  assignedInfluencers: [{
    influencer: ObjectId (ref User)
    uniqueLink: String
    trackingUrl: String   ← NEW
    status: String (Pending/Accepted/Rejected)
  }]
}
```

---

## Backend Changes

### Campaign Controller Updates
**File:** `backend/controllers/campaignController.js`

**1. createCampaign()**
- Now accepts `productLink` from request body
- Stores product link in campaign database record

**2. assignInfluencer()**
- Generates unique 16-character hex link: `crypto.randomBytes(8).toString('hex')`
- Creates tracking URL: `http://localhost:5000/api/tracking/{uniqueLink}`
- Stores tracking URL in `assignedInfluencers[].trackingUrl`
- Returns updated campaign with new tracking information

---

## User Flow

### Brand Creating a Campaign with Product Link
1. Brand navigates to **"Create Campaign"** tab
2. Fills in:
   - Campaign Title: "Summer Collection 2024"
   - Description: "Promote our new summer line"
   - Budget: "$5000"
   - **Product Link: "https://yourstore.com/summer-collection"**
3. Clicks "Create Campaign"
4. Campaign saved to database with product link

### Brand Assigning Influencers with Automatic Tracking
1. Brand navigates to **"Assign Influencers"** tab
2. **Step 1:** Selects campaign (e.g., "Summer Collection 2024")
   - Sees campaign details including product link
3. **Step 2:** Multi-selects influencers to assign
   - Can see which influencers are already assigned
   - Visual feedback shows selection
4. **Step 3:** Clicks "Assign X Influencer(s)"
5. **Server-Side Actions:**
   - Creates unique tracking URL for each influencer
   - Links tracking URL to original product link
   - Stores tracking URLs in database
6. Success message confirms assignment
7. Page refreshes to show updated campaign with tracking assignments

### Tracking URLs Made Available to Influencers
- Each influencer sees their assigned campaigns in **Influencer Dashboard**
- Tracking links associated with their assignments are visible
- When shared, tracking URL records clicks and conversions
- Analytics available in Brand Analytics dashboard

---

## API Endpoints

### Existing Endpoints (Updated)
- **GET /api/campaigns** - Fetch campaigns (now includes trackingUrl data)
- **POST /api/campaigns** - Create campaign (now accepts productLink)
- **PUT /api/campaigns/:id/assign** - Assign influencer (now generates trackingUrl)

### Tracking Endpoints (Existing)
- **GET /api/tracking/:uniqueLink** - Record click via tracking link
- **POST /api/tracking/:uniqueLink/conversion** - Record conversion

---

## Features Summary

### ✅ Navigation-Based UI
- Three distinct sections via button-based navigation
- Clean separation of concerns
- Active state highlighting

### ✅ Product Link Integration
- Brands enter product links during campaign creation
- Forms basis for tracking URL generation
- Stored and retrievable for reference

### ✅ Automatic Tracking URL Generation
- Server generates unique links for each influencer assignment
- Tracking URLs stored in database
- Ready for distribution to influencers

### ✅ Multi-Select Influencer Assignment
- Assign multiple influencers in one action
- Visual feedback for selected and already-assigned influencers
- Bulk operations reduce user friction

### ✅ Campaign Management
- View all campaigns with details
- Filter by status
- See assigned influencers per campaign
- Access product links for reference

### ✅ Analytics Dashboard
- Visual performance charts
- Summary metrics (clicks, conversions, rates)
- Per-campaign breakdown

---

## Testing Checklist

- [ ] Create campaign with product link
- [ ] Verify product link stored in database
- [ ] Assign single influencer to campaign
- [ ] Verify tracking URL generated
- [ ] Assign multiple influencers in bulk
- [ ] Verify unique tracking URLs for each
- [ ] Check influencer dashboard for assigned campaigns
- [ ] Verify tracking URLs visible to influencers
- [ ] Test click tracking via tracking URL
- [ ] Verify conversion tracking
- [ ] Check analytics dashboard updates
- [ ] Test dark mode in all sections
- [ ] Test responsive layout on mobile

---

## Technical Stack

**Frontend:**
- React 19.2.0
- React Router DOM 7.13.1
- Axios for API calls
- Chart.js for analytics visualization
- Lucide React for icons
- Tailwind CSS for styling

**Backend:**
- Express.js 5.2.1
- MongoDB with Mongoose 9.2.4
- JWT authentication
- Node.js

---

## Next Steps / Future Enhancements

1. **Influencer Dashboard Integration** - Display assigned campaigns and tracking links
2. **Tracking Analytics** - Real-time tracking data in influencer dashboard
3. **Campaign Templates** - Pre-built campaign templates for faster creation
4. **Bulk Import** - Import influencers from CSV
5. **Payment Integration** - Track campaign spending against budget
6. **Performance Tiers** - Bonus structures based on performance metrics
7. **Notification System** - Alert influencers of new assignments
8. **Campaign Scheduling** - Schedule campaigns for future dates

