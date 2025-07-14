# Fresh MongoDB Data Setup

This guide ensures your application always pulls fresh data from MongoDB with no caching.

## What's Been Implemented

### 1. **MongoDB Connection Updates**
- **File**: `lib/contentManager.js`
- **Changes**: 
  - Forces fresh connections every time (no connection pooling)
  - Disables all MongoDB caching mechanisms
  - Closes connections immediately after use
  - Uses `readConcern: 'local'` for immediate reads
  - Uses `writeConcern: { w: 1, j: true }` for immediate writes

### 2. **Next.js Configuration Updates**
- **File**: `next.config.js`
- **Changes**:
  - Disabled all static generation caching
  - Disabled ISR (Incremental Static Regeneration)
  - Disabled image optimization caching
  - Disabled compression to avoid caching issues
  - Force server-side rendering for all pages

### 3. **API Route Cache Busting**
- **Files**: 
  - `pages/api/content/index.js`
  - `pages/api/opportunities.js`
  - `pages/api/users.js`
- **Changes**:
  - Added comprehensive cache-busting headers
  - Added timestamp headers for cache invalidation
  - Force fresh data responses

### 4. **Middleware Cache Prevention**
- **File**: `middleware.js`
- **Changes**:
  - Disables caching for all API routes
  - Disables caching for admin and content pages
  - Adds cache-busting headers to all responses

## Quick Start Scripts

### Option 1: Full Fresh Start (Recommended)
```bash
# Run the comprehensive fresh start script
./fresh-start.sh
```

### Option 2: Manual Cache Clear
```bash
# Stop any running processes
pkill -f "next dev" || true
pkill -f "npm run dev" || true

# Clear Next.js cache
rm -rf .next
rm -rf .swc
rm -rf .cache

# Clear node modules
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Start development server
npm run dev
```

### Option 3: Quick Cache Clear (if already running)
```bash
# Stop the server
pkill -f "next dev" || true

# Clear Next.js cache only
rm -rf .next

# Restart
npm run dev
```

## Browser Cache Clearing

**IMPORTANT**: You must also clear your browser cache:

### Chrome/Edge
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "All time" for time range
3. Check all boxes
4. Click "Clear data"

### Firefox
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Everything" for time range
3. Check all boxes
4. Click "Clear Now"

### Safari
1. Press `Cmd+Option+E` to clear cache
2. Or go to Safari > Preferences > Advanced > Show Develop menu
3. Then Develop > Empty Caches

## Verification

After running the fresh start:

1. **Check MongoDB Connection**: The script will verify MongoDB connectivity
2. **Check Headers**: Open browser dev tools and verify no caching headers
3. **Test Content Updates**: Make changes in admin console and verify they appear immediately
4. **Check Network Tab**: Ensure API calls have cache-busting headers

## Troubleshooting

### If content still doesn't update:

1. **Clear browser cache completely** (see above)
2. **Hard refresh**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. **Check network tab**: Ensure no cached responses
4. **Verify MongoDB connection**: Check console for connection errors

### If the script fails:

1. **Check internet connection**
2. **Verify MongoDB connection string**
3. **Run manual steps** (Option 2 above)
4. **Check for port conflicts**: Ensure port 3000 is free

## Technical Details

### MongoDB Configuration
- **Connection Pooling**: Disabled (maxPoolSize: 1)
- **Read Preferences**: Primary only
- **Read Concern**: Local (immediate reads)
- **Write Concern**: { w: 1, j: true } (immediate writes)
- **Retry Logic**: Disabled

### Next.js Configuration
- **Static Generation**: Disabled
- **ISR**: Disabled
- **Image Optimization**: Disabled
- **Compression**: Disabled
- **ETags**: Disabled

### Cache Headers
- `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
- `Pragma: no-cache`
- `Expires: 0`
- `Surrogate-Control: no-store`
- `X-Cache-Timestamp: [timestamp]`

## Performance Impact

**Note**: Disabling all caching will impact performance but ensures data freshness:

- **Slower page loads** (no static generation)
- **More database queries** (no connection pooling)
- **Higher server load** (no compression)
- **More bandwidth usage** (no caching)

This is the trade-off for ensuring fresh data. For production, consider implementing selective caching strategies.

## Production Considerations

For production deployment:

1. **Selective Caching**: Implement caching for static assets only
2. **Database Optimization**: Use connection pooling for better performance
3. **CDN**: Use CDN for static assets while keeping dynamic content uncached
4. **Monitoring**: Monitor database connection performance

## Support

If you continue to experience caching issues:

1. Check the browser's Network tab for cached responses
2. Verify MongoDB connection in the console
3. Test with incognito/private browsing mode
4. Check for any proxy or CDN caching