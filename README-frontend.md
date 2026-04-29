# 📱 Cuure Health — Frontend

A cross-platform mobile application built with **React Native + Expo** that allows patients to browse doctors, view availability, check prescriptions, and get AI-powered specialist recommendations.

---

## 📌 Overview

The frontend is a TypeScript-based Expo app with bottom-tab navigation, a centralized API layer, and a standout **Health Story Bot** — a floating AI assistant powered by **Google Gemini 2.5 Flash Lite** that analyzes patient symptoms and recommends the right specialist.

---

## ✨ Features

- **Home Screen** — Hero carousel, quick actions, specialization grid, consult banners, WhatsApp help bar
- **Doctor Listing** — Browse all doctors with rating, fee, specialty, and experience
- **Doctor Detail Modal** — Full doctor profile with bio, resume, and certificate
- **Availability Screen** — 7-day date picker with time slots grouped by Morning / Afternoon / Evening
- **Specialization Filter** — View doctors filtered by a specific medical specialty
- **Doctor Search Modal** — Search across all doctors, optionally pre-filtered by specialization
- **Prescriptions & Reports Timeline** — Patient treatment history with attached documents
- **Health Story Bot (AI)** — Describe symptoms in natural language → get urgency level + specialist recommendation
- **Profile Screen** — Placeholder for future user profile management
- **Responsive Layout** — Desktop-aware layout using `useWindowDimensions` (≥920px breakpoint)

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.81.5 | Cross-platform mobile UI |
| Expo | ~54.0.33 | Development platform |
| TypeScript | ~5.9.2 | Type safety |
| React Navigation | v7 | Stack + bottom-tab navigation |
| Axios | ^1.15.2 | HTTP client with interceptors |
| React Native Paper | ^5.15.1 | UI components |
| Expo Linear Gradient | ~15.0.8 | Gradient effects |
| Expo File System | ~19.0.21 | Document access |
| Expo Sharing | ~14.0.8 | Share documents |
| Google Gemini API | 2.5 Flash Lite | AI symptom analysis |

---

## 📁 Folder Structure

```
App-frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── HealthStoryBot.tsx      # AI floating chatbot (Gemini-powered)
│   │   │   ├── HamburgerMenu.tsx       # Sidebar navigation menu
│   │   │   ├── Button.tsx              # Reusable button
│   │   │   ├── Card.tsx                # Reusable card
│   │   │   └── SectionHeader.tsx       # Section title component
│   │   ├── home/
│   │   │   ├── TopBar.tsx              # Sticky scroll-aware top bar
│   │   │   ├── HeroCarousel.tsx        # Auto-scrolling banner carousel
│   │   │   ├── QuickActions.tsx        # Quick access grid
│   │   │   ├── ConsultBanner.tsx       # Online consult promo banner
│   │   │   ├── ClinicBanner.tsx        # Clinic visit promo banner
│   │   │   ├── ConsultForGrid.tsx      # Specialization category grid
│   │   │   └── WhatsAppHelpBar.tsx     # WhatsApp support bar
│   │   ├── DoctorCard.tsx              # Doctor list item card
│   │   ├── DoctorDetails.tsx           # Doctor detail bottom modal
│   │   └── prescriptions/
│   │       └── PrescriptionsReportsTimeline.tsx  # Timeline UI component
│   ├── navigation/
│   │   ├── AppNavigator.tsx            # Root bottom-tab navigator (3 tabs)
│   │   ├── HomeStackNavigator.tsx      # Home tab stack navigator
│   │   └── DoctorStackNavigator.tsx    # Doctor tab stack navigator
│   ├── screens/
│   │   ├── HomeScreen.tsx              # Main home screen
│   │   ├── DoctorScreen.tsx            # Doctor listing + detail
│   │   ├── AvailabilityDetailsScreen.tsx  # Slot calendar for a doctor
│   │   ├── PrescriptionsReportsScreen.tsx # Prescriptions timeline
│   │   ├── Doctorsbyspecializationscreen.tsx  # Specialty-filtered doctors
│   │   ├── Doctorsearchmodal.tsx       # Doctor search modal
│   │   └── ProfileScreen.tsx           # User profile (placeholder)
│   ├── services/
│   │   └── api.ts                      # Centralized Axios API service + types
│   ├── context/
│   │   └── UserContext.tsx             # React Context for global user state
│   └── styles/
│       ├── colors.ts                   # Color design tokens
│       ├── spacing.ts                  # Spacing design tokens
│       └── typography.ts               # Typography design tokens
├── assets/                             # App images and icons
├── App.tsx                             # Root component (SafeAreaProvider)
├── index.ts                            # Expo entry point
├── app.json                            # Expo app configuration
├── expo-config.json                    # Additional Expo configuration
├── tsconfig.json                       # TypeScript configuration
├── .env                                # Environment variables (never commit)
└── package.json                        # Dependencies
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js >= 18
- Expo Go app on your phone (or an Android/iOS emulator)

### Steps

**1. Navigate to the frontend folder:**
```bash
cd App-frontend
```

**2. Install dependencies:**
```bash
npm install --legacy-peer-deps
```

**3. Create a `.env` file in the root:**
```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:8000/api/v1
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Use your machine's local IP** (not `localhost`) so your phone can reach the backend.
> Find it with `ipconfig` on Windows or `ifconfig` on Mac/Linux.

> 🔑 **Get a free Gemini API key** at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

**4. Start the development server:**
```bash
npm start
```

**5. Run on a specific platform:**
```bash
npm run android   # Android emulator or device
npm run ios       # iOS simulator (Mac only)
npm run web       # Browser
```

---

## 🗺️ Navigation Structure

```
AppNavigator (Bottom Tabs)
├── Home Tab → HomeStackNavigator
│   ├── HomeMain (HomeScreen)
│   ├── PrescriptionsReports
│   └── DoctorsBySpecialization
├── Doctor Tab → DoctorStackNavigator
│   ├── DoctorHome (DoctorScreen)
│   └── AvailabilityDetails
└── Profile Tab → ProfileScreen
```

---

## 🔌 API Integration

All API calls go through `src/services/api.ts` — a centralized Axios instance with:

- **Base URL** from `EXPO_PUBLIC_API_BASE_URL`
- **10-second timeout**
- **Request interceptor** — ready for auth token injection
- **Response interceptor** — normalizes all errors into readable messages

### Available API modules:

```ts
doctorApi.getAll()                          // Fetch all doctors
doctorApi.getById(id)                       // Fetch single doctor
doctorApi.getBySpecialization(spec)         // Filter doctors client-side
doctorApi.getSlots(doctorId, from, days)    // Fetch availability slots

patientApi.getAll()
patientApi.getById(id)

prescriptionApi.getAll()
prescriptionApi.getByPatient(patientId)

documentApi.getByPrescription(prescriptionId)
```

---

## 🤖 Health Story Bot — How It Works

The Health Story Bot is a **floating action button (🤖)** on the Home screen with a pulse animation.

**User Flow:**
1. Tap the robot FAB → modal opens
2. Type symptoms in free-form text (or use quick example chips)
3. Tap **"Analyze My Story"** → request sent to Gemini API
4. Results shown:
   - **Detected Symptoms** — keyword chips
   - **Summary** — plain-language explanation
   - **Urgency Card** — color-coded: 🟢 Low / 🟡 Medium / 🔴 High
   - **Recommended Specialist** — top match + alternatives
5. Tap **"Find Doctors →"** → Doctor Search Modal opens pre-filtered to recommended specialty

**Gemini Prompt Design:**
- Temperature: `0.2` (deterministic, low creativity)
- Max tokens: `512`
- Returns strict JSON with: `specialization`, `all_specializations`, `keywords`, `summary`, `urgency`, `urgency_reason`

---

## 🎨 Design Tokens

All colors, spacing, and typography are centralized in `src/styles/`:

```ts
// colors.ts
primary:   "#5B2EFF"   // Purple — brand primary
secondary: "#7C4DFF"   // Light purple
background:"#F5F6FA"   // App background
white:     "#FFFFFF"
text:      "#1A1A1A"
gray:      "#8A8A8A"
lightGray: "#EDEDED"
card:      "#FFFFFF"
```

---

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API base URL (e.g. `http://192.168.1.5:8000/api/v1`) |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for the Health Story Bot |

> ⚠️ **Security:** Never commit your `.env` file to version control. It is already listed in `.gitignore`.

---

## 🚀 Future Improvements

- Complete the **Profile Screen** with editable patient details
- Add **JWT authentication** — login/signup flow with token storage
- Implement actual **appointment booking** from the availability screen
- Add **push notifications** for appointment reminders via Expo
- Implement **offline caching** for doctor lists and prescriptions
- Add **dark mode** support using the existing design token system
- Write **component tests** with React Native Testing Library
- Replace hardcoded user in `UserContext` with real logged-in user data

---

*Cuure Health Frontend © 2026*
