# NeuroHack App

A React Native application for tracking and visualizing emotional states before and after neurofeedback sessions.

## Features

- Track emotional states before and after sessions
- Visualize progress over time with interactive charts
- Monitor both positive and negative emotional changes
- Filter statistics by different time periods
- Beautiful and intuitive user interface

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js >= 18
- Ruby >= 2.6.0 (for iOS development)
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS development)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd NeuroHackApp
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies:
```bash
cd ios && pod install && cd ..
```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

## Development

The project structure is organized as follows:

```
src/
  ├── screens/          # Main screen components
  ├── components/       # Reusable components
  ├── navigation/       # Navigation configuration
  ├── hooks/           # Custom React hooks
  └── constants/       # Constants and configuration
```

## Tech Stack

- React Native
- React Navigation
- React Native Chart Kit
- React Native Reanimated
- AsyncStorage for local data persistence
- Linear Gradient for UI effects

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
