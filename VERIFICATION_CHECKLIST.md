# ✅ Mandi Prices Module - Verification Checklist

Complete these steps to verify the implementation is working correctly.

---

## 📱 Frontend Verification

### 1. Start Development Server
```bash
cd frontend
npm run dev
```
**Expected**: Server starts at http://localhost:3000

### 2. Navigation Pill
- [ ] Visit http://localhost:3000
- [ ] Look at the top center of the page
- [ ] See floating pill with "Prices" link and TrendingUp icon
- [ ] Hover over "Prices" - should show tooltip

### 3. Click Prices Link
- [ ] Click "Prices" in DynamicPill
- [ ] Should navigate to http://localhost:3000/mandi
- [ ] URL changes to /mandi

### 4. Mandi Page Loads
- [ ] Page title shows "Live Mandi Prices" with "APMC · Data.gov.in" subtitle
- [ ] Live indicator (pulsing green dot) visible in header
- [ ] Refresh button visible (with icon)

### 5. Stats Cards Load
- [ ] See 4 stat cards in a grid (mobile: 2 cols, desktop: 4 cols)
- [ ] Cards show: Avg Modal Price, Highest Price, Lowest Price, Markets Listed
- [ ] Numbers animate from 0 to final value when page loads
- [ ] Each card has colored icon (emerald, amber, rose, teal)

### 6. Filters Work
- [ ] State dropdown populated with state names
- [ ] Commodity dropdown populated with crop names
- [ ] Select a state - table should update
- [ ] Select a commodity - table should update
- [ ] "Clear" button appears when filters are active
- [ ] Click "Clear" - resets to show all data

### 7. Price Table Displays
- [ ] Table shows at least 1 record
- [ ] Columns: Commodity, Variety, Market, State, Arrival Date, Min ₹, Max ₹, Modal ₹, Trend
- [ ] Numbers formatted as ₹ (Indian style, e.g., ₹2,100)
- [ ] State shows as pill/badge
- [ ] Trend column shows small sparkline chart
- [ ] Modal price shows up/down indicator if above/below average

### 8. Sorting Works
- [ ] Click "Modal ₹" header - sorts by price ascending
- [ ] Click again - sorts descending
- [ ] Up/down arrow shows in active column
- [ ] Sorting is client-side (instant, no loading)

### 9. Row Click Opens Detail Sheet
- [ ] Click any table row
- [ ] Bottom sheet slides up from bottom
- [ ] Shows commodity emoji and name
- [ ] Shows price breakdown (Min/Modal/Max in colored cards)
- [ ] Price position bar animates to show modal price position

### 10. Detail Sheet Features
- [ ] Trend chart shows 7-day synthetic data
- [ ] Market info section shows: Arrival Date, Market, District, State
- [ ] Price comparison section shows vs. average
- [ ] "Close" button at bottom works
- [ ] Click outside sheet to close (backdrop tap)
- [ ] Swipe down closes the sheet (on mobile)

### 11. Pagination Works
- [ ] If more than 20 records, "Page X of Y" text shows
- [ ] Pagination buttons: Prev, page numbers, Next
- [ ] Click next page - table updates with new records
- [ ] Can navigate through multiple pages
- [ ] Current page highlighted in emerald

### 12. Error Handling
- [ ] Disconnect internet → See error message
- [ ] Click "Try again" button → Retries fetch
- [ ] Reconnect → Data loads again

### 13. Loading States
- [ ] Refresh the page
- [ ] Table shows skeleton loaders (animated pulse)
- [ ] Stat cards show skeleton loaders
- [ ] Once loaded, they animate in

### 14. Responsive Design
- [ ] On mobile (< 768px): 2 columns for stats, stacked filters
- [ ] On desktop (≥ 768px): 4 columns for stats, horizontal filters
- [ ] Table scrolls horizontally on small screens
- [ ] All text readable and touch-friendly

---

## ⚙️ Backend Verification (Optional)

### 1. Install Dependencies
```bash
cd apps/api
pip install -r requirements.txt
```
**Expected**: All packages installed successfully

### 2. Start FastAPI Server
```bash
python main.py
```
**Expected**: Server starts at http://localhost:8000

### 3. Check Health Endpoint
```bash
curl http://localhost:8000/api/v1/health
```
**Expected**: `{"status":"ok","service":"agrisense-mandi-api"}`

### 4. Get Prices Endpoint
```bash
curl "http://localhost:8000/api/v1/mandi?page=1&limit=20"
```
**Expected**: JSON response with records array, total, page, limit

### 5. Get Commodities Endpoint
```bash
curl http://localhost:8000/api/v1/mandi/commodities
```
**Expected**: JSON with commodities array (Rice, Wheat, Maize, etc.)

### 6. Get States Endpoint
```bash
curl http://localhost:8000/api/v1/mandi/states
```
**Expected**: JSON with states array (Maharashtra, Punjab, etc.)

### 7. API Docs
- [ ] Visit http://localhost:8000/docs
- [ ] See Swagger UI with all 3 endpoints documented
- [ ] Try out the endpoints from the UI

### 8. Caching Works
- [ ] Call endpoint twice quickly
- [ ] First call: ~1-2 seconds
- [ ] Second call: <100ms (from cache)

---

## 🔧 Code Quality

### 1. Build Succeeds
```bash
cd frontend
npm run build
```
**Expected**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (5/5)
```

### 2. No TypeScript Errors
**Expected**: Zero errors in output

### 3. Routes Generated
- [ ] Should see `○ /mandi` in route list
- [ ] Size ~108 kB, First Load JS ~231 kB

---

## 🎨 Design & UX

### 1. Glass Morphism
- [ ] All cards have semi-transparent glass background
- [ ] Cards have subtle border (white/10)
- [ ] Blur effect visible behind cards

### 2. Colors
- [ ] Emerald (green) used for positive metrics
- [ ] Amber (orange) used for high values
- [ ] Rose (red) used for low values
- [ ] Teal used for market count

### 3. Animations
- [ ] Page elements fade in on load
- [ ] Stat cards have smooth counter animations
- [ ] Table rows have staggered fade-in
- [ ] Price position bar animates smoothly
- [ ] Buttons have spring animation on click

### 4. Typography
- [ ] Headings use Space Grotesk (font-display)
- [ ] Body text uses Sora
- [ ] Text hierarchy clear (sizes, weights)

---

## 📊 Data Validation

### 1. Number Formatting
- [ ] All prices show as ₹ with commas (e.g., ₹2,100)
- [ ] Large numbers: ₹1,23,456 (Indian style)
- [ ] No decimals for whole numbers

### 2. Date Formatting
- [ ] Dates show as "15 May 2025" format
- [ ] Not "15/05/2025" raw format

### 3. Statistics Calculation
- [ ] Avg price is correctly calculated (should be sensible value)
- [ ] Max > Avg > Min (logical ordering)
- [ ] Markets count matches unique markets in table

### 4. Data Completeness
- [ ] No "undefined" or "null" text visible
- [ ] Missing fields show as "-" or empty string
- [ ] No console errors in browser DevTools

---

## 🌐 Network & API

### 1. API Calls Made
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Reload /mandi page
- [ ] Should see requests to api.data.gov.in/resource/...
- [ ] Check response status: 200 OK

### 2. CORS Works
- [ ] No CORS errors in console
- [ ] Data loads successfully
- [ ] No red errors in Network tab

### 3. Error Recovery
- [ ] Temporarily block network (DevTools)
- [ ] See error message
- [ ] Re-enable network
- [ ] Click "Try again" → data loads

---

## 📋 Integration with Existing App

### 1. Home Page Still Works
- [ ] Visit http://localhost:3000
- [ ] See dashboard, prediction form, price tracker
- [ ] No broken components

### 2. Other Routes Work
- [ ] All existing pages load normally
- [ ] No navigation issues
- [ ] No console errors from new code

### 3. Styling Consistent
- [ ] DynamicPill matches existing design
- [ ] Mandi page uses same glass tokens
- [ ] Color palette matches
- [ ] Fonts match

---

## 🚀 Deployment Readiness

### 1. Production Build
```bash
npm run build && npm start
```
**Expected**: App starts in production mode, /mandi works

### 2. No Console Warnings
- [ ] Open DevTools Console
- [ ] No warnings or errors
- [ ] Only info-level logs (if any)

### 3. Performance
- [ ] Page loads in < 3 seconds
- [ ] Table renders smoothly
- [ ] Interactions responsive (< 100ms)

---

## ✨ All Checks Passed?

If all items are checked:

```
✅ Frontend fully functional
✅ Backend ready (optional)
✅ Design system integrated
✅ No breaking changes
✅ Data flowing correctly
✅ Production ready
```

**The Mandi Prices module is fully integrated and ready for deployment!** 🎉

---

## 📞 Troubleshooting

If any check fails, see `MANDI_INTEGRATION_GUIDE.md` for solutions.

| Problem | Check |
|---------|-------|
| DynamicPill not showing | Clear cache, restart server |
| Table empty | Check internet, try filters |
| Charts not rendering | Verify recharts installed (`npm list recharts`) |
| Numbers wrong | Check API response in Network tab |
| Page slow | Check Performance tab, look for slow requests |

---

**For detailed documentation, see:**
- `MANDI_INTEGRATION_GUIDE.md` - Full integration guide
- `IMPLEMENTATION_SUMMARY.md` - What was created
