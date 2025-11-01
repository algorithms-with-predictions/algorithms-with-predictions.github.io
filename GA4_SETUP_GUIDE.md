# Quick Setup Guide for Google Analytics

## 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Create an account name (e.g., "ALPS Website")
4. Create a property name (e.g., "algorithms-with-predictions.github.io")
5. Select your reporting time zone and currency
6. Choose "Web" as your platform
7. Enter your website URL: `https://algorithms-with-predictions.github.io/`
8. Accept the terms of service

## 2. Get Your Measurement ID

After creating the property:

1. Look for your **Measurement ID** (format: G-XXXXXXXXXX)
2. Copy this ID

## 3. Configure Your Website

1. Open your `.env` file in the project root
2. Replace `GA_MEASUREMENT_ID` with your actual measurement ID:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## 4. Deploy Your Website

Run your build and deployment process:

```bash
npm run build
npm run deploy
```

## 5. Verify It's Working

1. Visit your deployed website
2. In Google Analytics, go to "Reports" > "Realtime"
3. Browse your website in another tab
4. You should see your activity appear in the realtime report

## What You'll See in Analytics

### Geographic Data

- **Audience** > **Demographics** > **Geography** shows countries, regions, cities
- Real-time geographic data in the Realtime reports
- User location data for research insights

### Usage Statistics

- **Reports** > **Engagement** > **Pages and screens** shows most popular pages
- Session duration and bounce rates
- New vs returning visitors

### Custom Events (Academic Focus)

- Search terms used by visitors
- Which research categories are most popular
- Paper interaction patterns
- Filter usage statistics

### Advanced Reports

- **Explore** section for custom analysis
- Export data for research publications
- Integration with other Google services (Sheets, Data Studio)

## Privacy Compliance

The current setup includes:

- **Cookie Consent Banner**: Users must explicitly accept cookies before tracking begins
- **Enhanced Privacy Settings**: IP anonymization, no ad personalization, no Google Signals
- **Consent Respect**: Analytics only runs after user accepts cookies
- **Privacy Page**: Clear explanation of data collection at `/privacy`
- **User Control**: Users can reset preferences and opt out anytime
- **GDPR/CCPA Friendly**: Explicit consent mechanism for international compliance

### Cookie Consent Features:

- ✅ Explicit consent required before any tracking
- ✅ Clear explanation of data usage
- ✅ Easy decline option
- ✅ Persistent user choice storage
- ✅ Reset preferences functionality

## Troubleshooting

**Not seeing data?**

1. Check that your Measurement ID is correct in `.env`
2. Verify the site is deployed with the new analytics code
3. Try browsing in an incognito window
4. Check browser developer tools for any JavaScript errors

**Want more detailed events?** The analytics utility (`src/utils/analytics.js`) can be extended with
more custom events for specific academic metrics you want to track.
