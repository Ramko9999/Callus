# tools

Developer tooling that is not part of the shipped app.

## `app-store-screenshots/`

Next.js app that composes App Store marketing screenshots: a headline, a
subline, and a device-framed phone screenshot, rendered to JPG.

```bash
cd tools/app-store-screenshots
npm install
npm run dev -- --port 3100     # 8081/8082 are taken by React Native Metro
```

Then use **Export All Sizes** to write all four iPhone sizes to
`app_store/screenshots/iphone/en-US/<size>/<index>-<slide>.jpg`.

Sizes produced: 6.9" (1320×2868), 6.5" (1284×2778), 6.3" (1206×2622),
6.1" (1125×2436).

Source phone screenshots live in `public/callus/screens/` and must be captured
at **1320×2868** (iPhone 17 Pro Max). Slide copy lives in `src/translations.ts`.

## `seed-data/`

Generates and installs realistic training history so screenshots are not of an
empty app.

```bash
node tools/seed-data/generate.js                 # writes seed.json
node tools/seed-data/seed-simulator.js <UDID>    # writes it into a simulator
```

`generate.js` produces ~13 weeks of Push/Pull/Legs training with progressive
overload, plateaus, and rest days. Tunable constants are at the top of the file.

`seed-simulator.js` writes straight into the simulator's SQLite database
(`Documents/SQLite/store-v9.db`) and sets the `user_details` metadata so
onboarding is skipped. It also shifts every timestamp forward so the most
recent workout is today — otherwise the History tab opens on an empty month.

The app's Import feature is deliberately not used for this: it discards the
routines array (see `components/sheets/import-progress.tsx`), and driving a
file picker from a script is fragile.

Launch the app once on a fresh simulator before seeding, so it creates its
database.

## Capturing screenshots

Build **Release**, not debug — a debug build needs Metro, shows a dev warning
toast, and can attach to another project's packager on port 8081:

```bash
cd mobile
npx expo run:ios --configuration Release --device <UDID>
```

Set a clean status bar before capturing:

```bash
xcrun simctl status_bar <UDID> override \
  --time "9:41" --batteryState charged --batteryLevel 100 \
  --cellularBars 4 --wifiBars 3 --dataNetwork wifi

xcrun simctl io <UDID> screenshot tools/app-store-screenshots/public/callus/screens/1-live-workout.png
```
