# Analytics Setup Guide for ALPS

This document provides multiple options for tracking website usage and geographic data.

## Option 1: Google Analytics 4 (GA4) - ✅ Implemented

**Pros:**

- Free and comprehensive
- Detailed geographic data (country, city, region)
- Real-time analytics
- Integration with other Google services
- Custom events and conversions tracking
- Audience insights

**What it tracks:**

- Page views and user sessions
- Geographic location (country, region, city)
- Device and browser information
- User acquisition sources
- Custom events (search queries, filter usage, paper interactions)

**Setup completed:**

1. Added gtag library
2. Configured analytics utility (`src/utils/analytics.js`)
3. Added tracking to App.jsx for page views
4. Added search and filter tracking
5. Environment variable setup

**Next steps:**

1. Create a Google Analytics 4 property at https://analytics.google.com
2. Get your Measurement ID (format: G-XXXXXXXXXX)
3. Replace `GA_MEASUREMENT_ID` in `.env` file with your actual ID
4. Deploy and start collecting data

## Option 2: Simple Counter API (Privacy-Focused)

**Pros:**

- Privacy-friendly (no cookies)
- Very lightweight
- Simple to implement
- Free options available

**Services:**

- Simple Analytics (https://simpleanalytics.com) - €19/month
- Plausible Analytics (https://plausible.io) - €9/month
- Counter APIs (various free options)

## Option 3: Self-Hosted Analytics (Advanced)

**Options:**

- Matomo (free, self-hosted)
- Umami (free, self-hosted)
- GoatCounter (free service or self-hosted)

## Option 4: Vercel Analytics (if using Vercel)

If you deploy on Vercel, they provide built-in analytics.

## Recommended Approach

For academic/research projects, I recommend **Google Analytics 4** because:

1. It's free and comprehensive
2. Provides detailed geographic insights for research
3. Offers custom event tracking for academic metrics
4. Has good documentation and support
5. Integrates well with other tools

## Privacy Considerations

- Added GDPR-compliant setup with environment variables
- GA4 has improved privacy features compared to Universal Analytics
- Consider adding a cookie consent banner for EU visitors
- The current setup respects Do Not Track headers

## Data You'll Get

With the current GA4 setup, you'll track:

### Geographic Data:

- Countries of visitors
- Regions/states
- Cities
- Time zones

### Usage Analytics:

- Total visitors and sessions
- Page views per page
- Session duration
- Bounce rate
- Return vs new visitors

### Content Analytics:

- Most searched terms
- Popular filter combinations
- Most viewed papers
- User flow through the site

### Technical Data:

- Device types (desktop, mobile, tablet)
- Operating systems
- Browsers
- Screen resolutions

## Custom Events Implemented:

1. **Search tracking**: Captures search terms used
2. **Filter usage**: Tracks which filters are applied/removed
3. **Paper interactions**: Can track paper views and clicks
4. **Page navigation**: Automatic page view tracking

## Viewing Your Data

After setup, you can view data at:

- https://analytics.google.com
- Reports section for standard analytics
- Explore section for custom queries
- Real-time section for live data
