# 🎯 Quick Start Guide - Live Mandi Prices Module

## For Developers

This guide helps you quickly understand the Mandi Prices module structure and how to get started.

---

## ⚡ 30-Second Overview

The **Live Mandi Prices** module adds a new `/mandi` page to AgriSense that displays real-time agricultural commodity prices from Indian APMC (mandi) markets.

```
User visits /mandi → 
  Loads live prices from Data.gov.in → 
  Displays in a sortable, filterable table → 
  Click row for detailed price analysis
```

**Tech Stack**:
- Frontend: Next.js 14, React 18, Zustand, Recharts, Framer Motion
- Backend (optional): FastAPI, httpx, Pydantic, cachetools
- Data: Data.gov.in public API (APMC prices dataset)

---

## 📁 Quick File Tour

### Core Modules

```
frontend/
├── lib/
│   ├── types/mandi.ts           ← All TypeScript interfaces
│   ├── api/mandi.ts             ← API client for Data.gov.in
│   ├── store/useMandiStore.ts   ← Zustand state management
│   └── utils/mandiHelpers.ts    ← Helpers & formatters
│
├── components/mandi/
│   ├── MandiPage.tsx            ← Main component orchestrator
│   ├── FilterBar.tsx            ← Filter UI
│   ├── PriceTable.tsx           ← Table + pagination
│   ├── PriceTrendChart.tsx      ← Sparkline charts
│   ├── StatCard.tsx             ← Stat cards
│   └── PriceDetailSheet.tsx     ← Detail modal
│
└── app/mandi/page.tsx           ← Route: /mandi
```

### Architecture

```
Component Tree:

MandiPage (orchestrator)
├── Header (sticky, with refresh button)
├── FilterBar (state/commodity filters)
├── StatCard × 4 (avg price, max, min, markets)
├── PriceTable
│   ├── Table Header (sortable columns)
│   ├── TableRow × 20
│   │   └── PriceTrendChart (memoized)
│   └── Pagination
└── PriceDetailSheet (modal, on row click)
    ├── Price breakdown cards
    ├── Price position bar
    ├── Trend chart (larger)
    └── Market info section
```

### Data Flow

```
1. User visits /mandi
   ↓
2. useEffect calls:
   - store.fetchDropdowns() → Get commodity & state options
   - store.fetchPrices()   → Get initial records
   ↓
3. API calls to Data.gov.in:
   - GET /resource/9ef84268-d588-465a-a308-a864a43d0070?...
   ↓
4. mandi.ts parses & transforms raw API data
   ↓
5. Store computes stats & caches results
   ↓
6. Components render from store state
   ↓
7. User interacts:
   - Filter → setFilter() → re-fetch
   - Sort → setSortBy() → client-side sort
   - Paginate → setPage() → fetch new page
   - Click row → setSelectedRecord() → show sheet
```

---

## 🔑 Key Concepts

### 1. Zustand Store

```typescript
const store = useMandiStore()

// State
store.records        // MandiRecord[]
store.isLoading      // boolean
store.stats          // { avgPrice, maxPrice, minPrice, markets, lastUpdated }
store.filters        // { state, commodity, sortBy, sortDir, page, limit }

// Actions
store.fetchPrices()           // Fetch with current filters
store.setFilter(key, val)     // Change filter + re-fetch
store.setSortBy(col, dir)     // Sort client-side
store.setPage(page)           // Go to page
store.setSelectedRecord(rec)  // Open detail sheet
```

### 2. API Client Pattern

```typescript
// In mandi.ts
export async function fetchMandiPrices(filters: MandiFilters) {
  // 1. Build query string (with proper encoding)
  const query = buildQueryString(filters)
  
  // 2. Call Data.gov.in
  const res = await fetch(`${BASE}${query}`)
  
  // 3. Handle errors
  if (!res.ok) throw MandiError(...)
  
  // 4. Parse response
  const data = await res.json()
  
  // 5. Transform records
  const records = data.records.map(parseRecord)
  
  // 6. Compute statistics
  const stats = computeStats(records)
  
  // 7. Return
  return { records, total: data.total }
}
```

### 3. Component Patterns

**Container Component** (MandiPage.tsx)
```tsx
export function MandiPage() {
  // 1. Setup store
  const { fetchPrices, stats } = useMandiStore()
  
  // 2. Side effects
  useEffect(() => {
    fetchPrices()
  }, [])
  
  // 3. Handle errors
  if (error) return <ErrorCard />
  
  // 4. Render children
  return (
    <>
      <FilterBar />
      <StatCard />
      <PriceTable />
      <PriceDetailSheet />
    </>
  )
}
```

**Presentational Component** (StatCard.tsx)
```tsx
interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  color: 'emerald' | 'amber' | 'rose' | 'teal'
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  // 1. Local state for animation
  const [displayValue, setDisplayValue] = useState(0)
  
  // 2. Animate on value change
  useEffect(() => { /* animate */ }, [value])
  
  // 3. Render with Framer Motion
  return (
    <motion.div initial={{}} animate={{}} transition={{}}>
      {/* Content */}
    </motion.div>
  )
}
```

---

## 🚀 Getting Started

### Step 1: Explore the Code

Read files in order:
1. `frontend/lib/types/mandi.ts` - Understand the data model
2. `frontend/lib/api/mandi.ts` - See how API calls work
3. `frontend/lib/store/useMandiStore.ts` - Learn state management
4. `frontend/components/mandi/MandiPage.tsx` - Understand orchestration

### Step 2: Run Locally

```bash
cd frontend
npm run dev
# Visit http://localhost:3000/mandi
```

### Step 3: Make Changes

Example: Add a new filter

```typescript
// 1. Add to MandiFilters in types/mandi.ts
export interface MandiFilters {
  district?: string  // NEW
  // ...existing
}

// 2. Update buildQueryString in api/mandi.ts
export function buildQueryString(filters: MandiFilters): string {
  if (filters.district) {
    params.append("filters[District]", filters.district)
  }
  // ...existing
}

// 3. Add to store in store/useMandiStore.ts
setFilter: async (key, value) => {
  // Already handles any filter key!
  const filters = { ...get().filters, [key]: value, page: 1 }
  // ...
}

// 4. Add UI in components/mandi/FilterBar.tsx
<select 
  value={districtValue}
  onChange={(e) => setFilter("district", e.target.value)}
>
  {/* Options */}
</select>
```

### Step 4: Test

```bash
npm run build  # Check for TypeScript errors
npm run dev    # Manual testing
```

---

## 🎨 Design System Integration

All components use existing AgriSense design tokens:

### Glass Surfaces
```tsx
className="rounded-2xl border border-white/10 bg-card/70 backdrop-blur-glass"
//                      ↑                 ↑                   ↑
//                 border token      bg token             glass filter
```

### Colors
```tsx
// Emerald (positive)
className="text-emerald-400 bg-emerald-500/10"

// Amber (warning)
className="text-amber-400 bg-amber-500/10"

// Rose (negative)
className="text-rose-400 bg-rose-500/10"

// Teal (info)
className="text-teal-400 bg-teal-500/10"
```

### Animations
```tsx
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    type: "spring",
    stiffness: 400,  // Standard for AgriSense
    damping: 30      // Standard for AgriSense
  }}
>
  Content
</motion.div>
```

---

## 🔧 Common Tasks

### Task: Add a new stat card

```typescript
// 1. In MandiPage.tsx, add to stat section
<StatCard
  label="Total Value"
  value={computeTotalValue(stats)}  // NEW
  icon={DollarSign}
  color="teal"
/>

// 2. Implement computeTotalValue in mandiHelpers.ts
export function computeTotalValue(stats: MandiStats): number {
  // Your logic
}
```

### Task: Add sorting by a new column

```typescript
// 1. Already supported! Just click the column header
// 2. Handler in PriceTable.tsx:
const handleSort = (col: MandiFilters["sortBy"]) => {
  // Automatically handles any column in sortBy union
  setSortBy(col, newDir)
}
```

### Task: Change page title

```typescript
// In app/mandi/page.tsx
export const metadata: Metadata = {
  title: "New Title — AgriSense",  // Edit this
  description: "Updated description"  // Or this
}
```

---

## 📚 Code Organization Principles

1. **Separation of Concerns**
   - Types in `types/`
   - API logic in `api/`
   - State in `store/`
   - UI in `components/`
   - Utilities in `utils/`

2. **Naming Conventions**
   - Components: PascalCase (MandiPage.tsx)
   - Utilities: camelCase (formatINR)
   - Types: PascalCase interfaces (MandiRecord)
   - Files: kebab-case for multi-word (price-table.tsx)

3. **Component Props**
   - Define interfaces for all props
   - Use `type Props = { ... }`
   - Export type for testing/reuse

4. **Error Handling**
   - Use custom `MandiError` class
   - Catch in store actions
   - Show in UI with AlertCircle icon
   - Provide "Try again" button

5. **Performance**
   - Memoize chart components (React.memo)
   - Client-side sorting (no API call)
   - Paginate results (20 per page)
   - Cache dropdowns on first load

---

## 🐛 Debugging Tips

### Check Store State
```typescript
// In browser console
import { useMandiStore } from '@/lib/store/useMandiStore'
const store = useMandiStore()
console.log(store.records)      // See data
console.log(store.filters)      // See current filters
console.log(store.stats)        // See statistics
```

### Monitor API Calls
```
DevTools → Network tab → Filter by 'data.gov.in'
- Look for XHR requests to the Data.gov.in API
- Check response status (200 = good)
- View response JSON to see raw data
- Check query parameters are correct
```

### TypeScript Errors
```bash
npm run build  # Shows all type errors
# Fix them before running dev server
```

### React DevTools
```
DevTools → Components tab
- Inspect MandiPage component
- See store state in real-time
- Modify state to test UI changes
- Check component tree structure
```

---

## 📖 Further Reading

- `MANDI_INTEGRATION_GUIDE.md` - Complete integration documentation
- `IMPLEMENTATION_SUMMARY.md` - What was created and why
- `VERIFICATION_CHECKLIST.md` - Testing checklist
- Zustand docs: https://github.com/pmndrs/zustand
- Recharts docs: https://recharts.org
- Next.js docs: https://nextjs.org/docs

---

## ✅ You're Ready!

You now understand:
- ✅ Module architecture
- ✅ Data flow
- ✅ Component patterns
- ✅ How to make changes
- ✅ Design system
- ✅ Debugging techniques

**Happy coding!** 🚀
