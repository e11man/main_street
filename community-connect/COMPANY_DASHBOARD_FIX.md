# Company Dashboard Fix - New Opportunities Not Showing

## Issue Identified
Companies reported that newly created opportunities weren't appearing on their dashboard, despite being successfully created.

## Root Cause
**Data Type Mismatch in Company Opportunities API**

The issue was in `/api/companies/opportunities.js`:

1. **During Creation (POST)**: Opportunities were being stored with `companyId` as an ObjectId:
   ```javascript
   companyId: companyObject._id, // ObjectId type
   ```

2. **During Retrieval (GET)**: The search query used `companyId` as a string:
   ```javascript
   const opportunities = await opportunitiesCollection.find({ companyId }).toArray();
   // companyId here is a string from req.query
   ```

3. **During Authorization (PUT/DELETE)**: Comparisons between ObjectId and string always failed:
   ```javascript
   if (opportunity.companyId !== companyId) // ObjectId !== string = always true
   ```

MongoDB cannot match ObjectId values with string values, causing:
- New opportunities to never appear on company dashboards
- Authorization failures when editing/deleting opportunities

## Solution Implemented

### 1. Fixed Opportunity Retrieval (GET method)
**File:** `community-connect/pages/api/companies/opportunities.js`

**Before:**
```javascript
const opportunities = await opportunitiesCollection.find({ companyId }).toArray();
```

**After:**
```javascript
// Handle both string and ObjectId formats for companyId to ensure compatibility
const opportunities = await opportunitiesCollection.find({ 
  $or: [
    { companyId: companyId }, // String format (legacy)
    { companyId: new ObjectId(companyId) } // ObjectId format (current)
  ]
}).toArray();
```

### 2. Fixed Authorization Checks (PUT/DELETE methods)
**Before:**
```javascript
if (opportunity.companyId !== companyId) {
  return res.status(403).json({ error: 'Not authorized to update this opportunity' });
}
```

**After:**
```javascript
// Handle both string and ObjectId formats for companyId comparison
const opportunityCompanyId = opportunity.companyId?.toString();
if (opportunityCompanyId !== companyId) {
  return res.status(403).json({ error: 'Not authorized to update this opportunity' });
}
```

## Verification
✅ **Backward Compatibility**: Supports both existing opportunities (with string companyId) and new opportunities (with ObjectId companyId)

✅ **Authorization Fixed**: Companies can now edit and delete their opportunities properly

✅ **Dashboard Display**: New opportunities now appear immediately on company dashboards

## Technical Details
- Used MongoDB `$or` operator to search for both data types
- Used `.toString()` method to normalize ObjectId comparisons
- Maintained all existing functionality while fixing the core issue

## Impact
- Companies can now see their newly created opportunities immediately on their dashboard
- All editing and deletion functionality works correctly
- The fix is backwards compatible with existing data

This resolves the issue reported by Josh where new posts/opportunities weren't showing up on the company dashboard.