<!--
Purpose: Persistent architecture and recovery map for the production Expo React Native app.
Caller: Human maintainers and future AI agents at the start of every maintenance session.
Dependencies: package.json, app.json, eas.json, App.tsx, src/navigation, src/screens, src/utils.
Main Functions: Records app identity, high-level flows, core modules, build configuration, and recovery risks.
Side Effects: Documentation only; no runtime side effects.
-->

# SYSTEM_MAP.md

## Project Identity

- App name: `Surat-CV-Maker`
- Expo slug: `Surat-CV-Maker`
- App version in Expo config: `1.1.1`
- Android package: `com.arielfikrua.SuratCVMaker`
- iOS bundle identifier: `com.arielfikrua.SuratCVMaker`
- Expo owner: `dannycawan`
- EAS project ID: `4bd57e0b-1211-465e-ab62-96a023b9b036`
- Monetization SDK: `react-native-google-mobile-ads`
- AdMob app ID: `ca-app-pub-6721734106426198~4233683077`

Do not change package/application identity without explicit owner approval.

## Current Technical Baseline

- Expo SDK: `~54.0.34`
- React Native: `0.81.5`
- React: `19.1.0`
- TypeScript: `strict` enabled through `expo/tsconfig.base`
- New Architecture: enabled by `app.json` via `newArchEnabled: true`
- Android compile SDK: `36` through `expo-build-properties`
- Android target SDK: `36` through `expo-build-properties`
- Native library legacy packaging: disabled through `expo-build-properties` for better 16 KB page-size alignment compatibility
- EAS production Android build: app bundle via `:app:bundleRelease`
- EAS preview Android build: APK via `:app:assembleRelease`

## Repository Recovery State

- Current app root: `D:\github\Surat-CV-Maker`
- Root currently contains app source, config, `node_modules`, and `package-lock.json`.
- Local Git repository initialized in the app root.
- GitHub remote: `https://github.com/dannycawan/surat-cv-maker.git`
- Primary branch: `main`
- Baseline commit: `bed0e59` (`chore: baseline recovered app state`).
- Nested `Surat-CV-Maker` folder is preserved as recovered source evidence but excluded from root TypeScript validation.
- Local `main` tracks `origin/main`.

## Entry Flow

1. `index.ts`
   - Calls Expo `registerRootComponent(App)`.
2. `App.tsx`
   - Loads Ionicons font.
   - Holds splash screen until app resources are ready.
   - Selects light/dark React Native Paper theme.
   - Wraps app in `GestureHandlerRootView`, `SafeAreaProvider`, `PaperProvider`, and `NavigationContainer`.
3. `src/navigation/index.tsx`
   - Defines root stack and bottom tabs.
   - Main tabs: Home, JobApplication, CV, Resignation.
   - Stack routes: document forms and Preview.

## Primary User Flows

### Home / Navigation

UI/View:
- `src/screens/Home/index.tsx`

Route/Event:
- Bottom tab route `Home`.
- Navigation actions lead to document categories and form screens.

Handler/Controller:
- Screen-level button handlers navigate into document creation flows.

Service/Data:
- Uses shared components and possibly draft summary utilities depending on screen implementation.

### Job Application Flow

UI/View:
- `src/screens/JobApplication/index.tsx`
- `src/screens/JobApplicationForm/index.tsx`
- `src/screens/Preview/index.tsx`

Route/Event:
- `JobApplication` tab.
- `JobApplicationForm` stack route with optional `draftId`.
- `Preview` stack route with `documentType: 'jobApplication'`.

Service/Data:
- Draft persistence through `src/utils/storageService.ts`.
- Export through `src/utils/exportUtils.ts`.
- HTML generation through `src/templates/htmlTemplates.ts` and job-specific templates.

### CV Flow

UI/View:
- `src/screens/CV/index.tsx`
- `src/screens/CVForm/index.tsx`
- `src/screens/Preview/index.tsx`

Route/Event:
- `CV` tab.
- `CVForm` stack route with optional `draftId`.
- `Preview` stack route with `documentType: 'cv'`.

Service/Data:
- Draft persistence through `storageService.ts`.
- Export through `exportUtils.ts`.
- HTML generation through `htmlTemplates.ts` and CV templates.

### Resignation Flow

UI/View:
- `src/screens/Resignation/index.tsx`
- `src/screens/ResignationForm/index.tsx`
- `src/screens/Preview/index.tsx`

Route/Event:
- `Resignation` tab.
- `ResignationForm` stack route with optional `draftId`.
- `Preview` stack route with `documentType: 'resignation'`.

Service/Data:
- Draft persistence through `storageService.ts`.
- Export through `exportUtils.ts`.
- HTML generation through `htmlTemplates.ts` and resignation templates.

## Core Modules

- `src/utils/storageService.ts`
  - Stores drafts in AsyncStorage.
  - Key prefixes:
    - `@SuratCVMaker:jobApplication:`
    - `@SuratCVMaker:cv:`
    - `@SuratCVMaker:resignation:`
  - Main functions: `saveDraft`, `getDraft`, `getDraftList`, `deleteDraft`, `getAllDrafts`.

- `src/utils/exportUtils.ts`
  - Generates HTML by document type.
  - Exports PDF using `expo-print`.
  - Writes/shares files using the `expo-file-system/legacy` API and `expo-sharing`.
  - `exportToDocx` currently writes HTML content with `.docx` extension.

- `src/utils/adMobService.tsx`
  - Provides `AdBanner`.
  - Creates singleton `interstitialAdManager`.
  - Uses test ad IDs in `__DEV__`.
  - Uses production banner and interstitial unit IDs otherwise.
  - Applies interstitial rate limiting of 3 minutes.
  - Banner placement currently appears in Home and document-list tabs, plus inline inside document form scroll content.
  - Interstitial placement currently appears after successful draft save and successful PDF/DOCX export.

- `src/constants/templates.ts`
  - Defines template metadata and preview asset requires for job application, CV, and resignation documents.

- `src/theme/index.ts`
  - Defines app theme values used by Paper and navigation.

## Important Assets

- App icons and splash images under `assets`.
- Template preview images expected under `assets/templates`.

## Build And Compatibility Notes

- `app.json` still declares `WRITE_EXTERNAL_STORAGE` and `READ_EXTERNAL_STORAGE`; these legacy Android permissions remain for behavior preservation and should be manually reviewed before production upload.
- `expo-build-properties` configures Android compile/target SDK 36, build tools `36.0.0`, and `useLegacyPackaging: false`.
- Expo SDK 54 / React Native 0.81 targets Android 16 / API 36.
- Production AAB build depends on EAS credentials and remote app version source.
- Do not publish or submit automatically.

## Known Risks / Recovery Gaps

- GitHub remote is configured, but branch protection/release workflow has not been configured yet.
- `SYSTEM_MAP.md` and `DEV_PROGRESS.md` were missing before recovery.
- Some large screen files exceed 500 lines; inspect relevant functions only when modifying.
- Ads are production-configured; preserve monetization IDs unless owner explicitly requests changes.
- Android API 36 configuration validates locally, but a real EAS Android AAB must still be built and inspected for 16 KB page-size compliance.
- Previous inaccessible EAS project ID was `1517bf4f-b8f6-4eb8-b4af-a9b5f2a62b1f`; the app is now re-linked under the `dannycawan` Expo account.
- Form-screen banner ads must remain inline inside scroll content, not fixed near the footer, so they do not block Previous/Next/Save actions.

## Maintenance Rules For Future Sessions

1. Read this file first.
2. Read `DEV_PROGRESS.md` second.
3. Resume from `DEV_PROGRESS.md` Next Exact Steps.
4. Use trace-by-flow analysis from UI to service/storage/export.
5. Keep changes incremental and synchronized with documentation.
