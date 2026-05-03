# 🌾 Live Mandi Prices Module - Integration Guide

## Overview

The **Live Mandi Prices** module is a standalone, self-contained feature for AgriSense that displays real-time agricultural commodity prices from APMC (Agricultural Produce Market Committee) mandis across India.

- **Data Source**: [Data.gov.in](https://data.gov.in/) - Open Government Data Platform
- **Update Frequency**: Demand-based (users click Refresh)
- **Architecture**: Client-side API calls to Data.gov.in + optional FastAPI backend

---

## 📁 File Structure

```
frontend/
├── app/mandi/
│   └── page.tsx                    # Route: /mandi
├── components/mandi/
│   ├── MandiPage.tsx               # Main page shell
│   ├── FilterBar.tsx               # State & commodity filters
│   ├── PriceTable.tsx              # Sortable data table
│   ├── PriceTrendChart.tsx         # Sparkline charts
│   ├── StatCard.tsx                # Summary statistics
│   └── PriceDetailSheet.tsx        # Detail modal
├── lib/
│   ├── api/mandi.ts                # Data.gov.in client
│   ├── store/useMandiStore.ts      # Zustand state
│   ├── types/mandi.ts              # TypeScript interfaces
│   └── utils/mandiHelpers.ts       # Formatters & helpers
└── components/ui/DynamicPill.tsx   # Updated with nav link

apps/
└── api/
    ├── main.py                      # FastAPI backend (optional)
    ├── requirements.txt             # Python dependencies
    └── __init__.py
```

---

## 🚀 Quick Start

### 1. **Frontend is Ready**

The frontend code is fully integrated and requires no additional setup:

```bash
# Already included in your project
cd frontend
npm run dev  # Start development server at http://localhost:3000
```

Visit:
- **Home**: http://localhost:3000
- **Mandi Prices**: http://localhost:3000/mandi

### 2. **Backend (Optional)**

The frontend works directly with Data.gov.in API, so backend is optional. However, for production (to proxy requests and avoid CORS issues), set up the FastAPI backend:

```bash
# Install backend dependencies
cd apps/api
pip install -r requirements.txt

# Run the FastAPI server
python main.py
# Server will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 3. **Navigation Integration**

The **DynamicPill** is now visible at the top center of the page:
- Shows "Prices" link with TrendingUp icon
- Routes to `/mandi`
- Updates automatically with next app restart (no rebuild needed)

---

## 🔌 API Endpoints

### Frontend API (via Data.gov.in)

The frontend calls Data.gov.in directly without authentication burden:

```
GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
  ?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b
  &format=json
  &limit=20
  &offset=0
  &filters[State]=Maharashtra (optional)
  &filters[Commodity]=Rice (optional)
```

### Backend API (FastAPI - Optional)

If you run the FastAPI backend, use these endpoints:

#### Get Prices
```bash
GET /api/v1/mandi?state=Maharashtra&commodity=Rice&page=1&limit=20
```

**Response:**
```json
{
  "records": [
    {
      "state": "Maharashtra",
      "district": "Nashik",
      "market": "NASHIK",
      "commodity": "Rice",
      "variety": "Common",
      "arrival_date": "15/05/2025",
      "min_price": 2000,
      "max_price": 2200,
      "modal_price": 2100
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

#### Get Commodities
```bash
GET /api/v1/mandi/commodities
```

**Response:**
```json
{
  "commodities": ["Rice", "Wheat", "Maize", "Tomato", ...]
}
```

#### Get States
```bash
GET /api/v1/mandi/states
```

**Response:**
```json
{
  "states": ["Maharashtra", "Karnataka", "Punjab", ...]
}
```

---

## 🎨 UI Features

### Dashboard Cards
- **Avg Modal Price**: Average price across all records (with animated counter)
- **Highest Price**: Maximum modal price
- **Lowest Price**: Minimum modal price
- **Markets Listed**: Count of unique markets

### Interactive Table
- **Clickable Rows**: Open detailed price breakdown
- **Sortable Columns**: Click headers to sort by:
  - Commodity
  - Market
  - Modal Price
  - Arrival Date
- **Client-Side Sorting**: No API call needed
- **Pagination**: Navigate through 20 records per page
- **Price Indicators**: Trending up/down badges based on average

### Filter Bar
- **State Dropdown**: Filter by state (e.g., Maharashtra, Punjab)
- **Commodity Dropdown**: Filter by crop (e.g., Rice, Wheat)
- **Clear Filters Button**: Reset all filters to show all data

### Detail Sheet
- **Price Breakdown**: Min/Modal/Max in visual cards
- **Price Position Bar**: Visual indicator of modal price in range
- **Trend Chart**: 7-day synthetic price trend (estimated)
- **Market Information**: Arrival date, market name, district, state
- **Price Comparison**: vs. average price across dataset

### Live Indicator
- Pulsing green dot labeled "Live" in header
- Tooltip: "Refreshes on demand · Source: Data.gov.in"
- Refresh button with spinning icon while loading

---

## 🔒 Security & Data Flow

```
┌─────────────┐
│  Frontend   │  (Next.js React)
│ /mandi page │
└──────┬──────┘
       │
       ├──→ Option A: Direct to Data.gov.in (no auth needed)
       │    └─→ GET https://api.data.gov.in/resource/...
       │        (API key in request, CORS may apply)
       │
       └──→ Option B: Through FastAPI Backend (recommended for production)
            └─→ GET http://localhost:8000/api/v1/mandi
                └─→ FastAPI proxies to Data.gov.in
                    └─→ Response cached (15 min TTL)
```

**Important**: 
- The API key is hardcoded in frontend code for direct calls (acceptable for public API)
- For production, use the FastAPI backend to proxy requests
- Backend has built-in caching to reduce API calls

---

## 📊 State Management (Zustand)

The `useMandiStore` manages all Mandi-related state:

```typescript
const store = useMandiStore()

// State
store.records              // Array of MandiRecord
store.total               // Total records count
store.isLoading           // Loading state
store.error               // Error message
store.stats               // Computed statistics
store.commodities         // Dropdown options
store.states              // Dropdown options
store.selectedRecord      // Currently viewed record
store.filters             // Current filter/sort state

// Actions
store.fetchPrices()       // Fetch records with current filters
store.fetchDropdowns()    // Load commodity/state options
store.setFilter(key, val) // Update filter and re-fetch
store.setPage(page)       // Go to page number
store.setSortBy(col, dir) // Sort records (client-side)
store.setSelectedRecord() // Open detail sheet
```

---

## 🧮 Utility Functions

### `mandiHelpers.ts`

```typescript
formatINR(2500)           // "₹2,500" (Indian style)
formatDate("15/05/2025")  // "15 May 2025"
priceChangeColor(2100, 2000)  // "text-emerald-400" (above avg)
getPriceLevel(2100, 2000, 2200) // 50 (position in range 0-100)
generateSparkData(record) // 7 synthetic price points
getCommodityEmoji("Rice") // "🌾"
```

---

## ✨ Design System Integration

All components use existing AgriSense design tokens:

- **Glass surfaces**: `.glass`, `.glass-strong`, `.glass-pill`
- **Colors**: emerald-400, amber-400, rose-400, teal-400
- **Animations**: Framer Motion with spring config `{ type: "spring", stiffness: 400, damping: 30 }`
- **Typography**: Space Grotesk (headings), Sora (body)
- **Icons**: Lucide React (matching existing app)

---

## 🐛 Troubleshooting

### Issue: "No records found"
- **Cause**: Filters too restrictive or API temporarily unavailable
- **Solution**: 
  - Click "Clear" to reset filters
  - Check internet connection
  - Wait 15 seconds (API rate limiting)

### Issue: DynamicPill not showing
- **Cause**: Layout not updated with latest code
- **Solution**: 
  - Clear browser cache (Ctrl+Shift+Delete)
  - Hard refresh (Ctrl+Shift+R)
  - Restart dev server

### Issue: Charts not rendering
- **Cause**: Recharts not installed
- **Solution**: `npm install recharts` (already done)

### Issue: Prices look wrong
- **Cause**: Data.gov.in API outdated or under maintenance
- **Solution**: Check https://data.gov.in/resources (site status)

---

## 📝 Environment Variables

### Frontend (.env.local)
```env
# Already configured, no additional vars needed
# API calls use hardcoded Data.gov.in key
```

### Backend (.env in apps/api/)
```env
# Optional: Override API key
AGRISENSE_DATAGOV_API_KEY=your_key_here

# Defaults to built-in key if not set
```

---

## 🔄 Production Deployment

### Frontend
```bash
# Deploy to Vercel/Netlify as usual
npm run build
```

### Backend (if used)
```bash
# Deploy FastAPI on Heroku, Railway, or AWS Lambda
# Ensure environment variables are set
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 📚 Additional Notes

### Data Refresh
- Click the **Refresh** button in the header to fetch latest prices
- Data is cached server-side (15 min) to avoid rate limiting
- Frontend Zustand store updates immediately on new data

### Performance
- Table pagination: 20 records per page (configurable in MandiFilters.limit)
- Sorting: Client-side only (no API call)
- Filtering: Triggers new API request, resets to page 1
- Charts: Memoized with React.memo to prevent unnecessary re-renders

### Known Limitations
- Synthetic trend data (7-day chart) is generated locally, not real historical data
- Prices are per quintal (100 kg)
- Data updates depend on APMC mandi reporting frequency

---

## 🤝 Integration Checklist

- ✅ Frontend components created
- ✅ Zustand store implemented
- ✅ API client working with Data.gov.in
- ✅ DynamicPill added to layout
- ✅ /mandi route accessible
- ✅ FastAPI backend (optional) ready
- ✅ TypeScript types verified
- ✅ Build completes without errors
- ✅ All glass design tokens applied
- ✅ Framer Motion animations configured

---

## 📖 Quick Reference

| Feature | Status | File |
|---------|--------|------|
| Types | ✅ | `lib/types/mandi.ts` |
| API Client | ✅ | `lib/api/mandi.ts` |
| Zustand Store | ✅ | `lib/store/useMandiStore.ts` |
| Components | ✅ | `components/mandi/*` |
| Route | ✅ | `app/mandi/page.tsx` |
| Navigation | ✅ | `components/ui/DynamicPill.tsx` |
| Backend (optional) | ✅ | `apps/api/main.py` |

---

**Enjoy! 🎉 The Live Mandi Prices module is fully integrated and ready to use.**
