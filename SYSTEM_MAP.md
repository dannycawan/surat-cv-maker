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
- EAS project ID: `1517bf4f-b8f6-4eb8-b4af-a9b5f2a62b1f`
- Monetization SDK: `react-native-google-mobile-ads`
- AdMob app ID: `ca-app-pub-6721734106426198~4233683077`

Do not change package/application identity without explicit owner approval.

## Current Technical Baseline

- Expo SDK: `~52.0.46`
- React Native: `0.76.9`
- React: `18.2.0`
- TypeScript: `strict` enabled through `expo/tsconfig.base`
- New Architecture: enabled by `app.json` via `newArchEnabled: true`
- EAS production Android build: app bundle via `:app:bundleRelease`
- EAS preview Android build: APK via `:app:assembleRelease`

## Repository Recovery State

- Current app root: `D:\github\Surat-CV-Maker`
- Root currently contains app source, config, `node_modules`, and `package-lock.json`.
- `git status` failed because the app root is not currently a Git repository.
- Nested `Surat-CV-Maker` folder also does not contain `.git`.
- Recovery priority: initialize or reconnect Git before risky upgrades or broad edits.

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
  - Writes/shares files using `expo-file-system` and `expo-sharing`.
  - `exportToDocx` currently writes HTML content with `.docx` extension.

- `src/utils/adMobService.tsx`
  - Provides `AdBanner`.
  - Creates singleton `interstitialAdManager`.
  - Uses test ad IDs in `__DEV__`.
  - Uses production banner and interstitial unit IDs otherwise.
  - Applies interstitial rate limiting of 3 minutes.

- `src/constants/templates.ts`
  - Defines template metadata and preview asset requires for job application, CV, and resignation documents.

- `src/theme/index.ts`
  - Defines app theme values used by Paper and navigation.

## Important Assets

- App icons and splash images under `assets`.
- Template preview images expected under `assets/templates`.

## Build And Compatibility Notes

- `app.json` still declares `WRITE_EXTERNAL_STORAGE` and `READ_EXTERNAL_STORAGE`; these are legacy Android permissions and should be audited during Android API 36 modernization.
- `expo-build-properties` is installed but not currently configured in `app.json` plugins.
- Production AAB build depends on EAS credentials and remote app version source.
- Do not publish or submit automatically.

## Known Risks / Recovery Gaps

- No Git repository is currently initialized in the app root.
- `SYSTEM_MAP.md` and `DEV_PROGRESS.md` were missing before this recovery pass.
- Some large screen files exceed 500 lines; inspect relevant functions only when modifying.
- Ads are production-configured; preserve monetization IDs unless owner explicitly requests changes.
- Android API 36 and 16 KB page size compatibility still need formal dependency/build audit.

## Maintenance Rules For Future Sessions

1. Read this file first.
2. Read `DEV_PROGRESS.md` second.
3. Resume from `DEV_PROGRESS.md` Next Exact Steps.
4. Use trace-by-flow analysis from UI to service/storage/export.
5. Keep changes incremental and synchronized with documentation.
