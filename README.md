# CalorieTracker

A simple nutrition tracking app built with React Native and Expo.

CalorieTracker helps users track their daily calorie and protein intake,
set personalized nutrition goals, and review their progress over time.

## Current Features

### Daily Nutrition Tracking
- Log food with calories, protein, and serving amounts.
- Track daily progress using circular calorie and protein indicators
- Customize daily calorie and protein goals
- Edit and delete logged foods
- Carbonhydrates and fat tracking
- Sugar, fiber, and sodium information
- Expanded nutrition sumamries
- Additional nutrition goals

### Food History
- View previous food logs using a monthly calendar
- See daily calorie and protein summaries
- Tack whether daily nutrition goals were achieved

### Saved and Recent Foods
- Save frequently eaten foods for quick logging
- Automatically access previously logged foods
- Search saved and recent foods
- Edit and delete saved food templates
- Adjust serving quantities with automatic nutrition calculations
- Convert between compatible measurement units.

### Barcode Scanning
- Scan packaged food barcodes using iPhone camera
- Retrieve food information from Open Food Facts
- Display product names, serving sizes, calories, and protein
- Adjust the number of servings consumed
- Automatically calculate total calories and protein
- Add scanned foods directly to daily log
- Save scanned product for future use
- Detect previously saved barcodes to prevent duplicate saved entries

## Beta Testing

This app is currently in beta and available through Apple Testflight

**iOS TestFlight:** [Join the Beta](https://testflight.apple.com/join/H7tykydQ)

Feedback and bug reports are greatly appreciated

## Roadmap

### Future
- Photo-based food analysis
- Detailed historical food logs
- Personalized goals with ai
- Meal suggestion with ai

## Tech Stack

- React Native - Mobile application framework
- Expo - Development and navigation
- Expo router - Development and navigation
- TypeScript - application code
- SQLite - Local food and settings storage
- Jest - Unit test
- Expo Camera - Barcode Scanning
- Open Food Facts API - Food database for barcode scanning

## Nutrition Data
Barcode product information is provided by Open Food Facts, a community-maintained food
database. Nutrition values may be incomplete or inaccurate. Users should verify information against
product label when necessary.

## Development

Install dependencies

```bash
npm install
```

start the development server:

```bash
npx expo start
```

Run tests:

```bash
npm test
```

## Status
Current Beta: v0.5.1

This project is actively under development.
