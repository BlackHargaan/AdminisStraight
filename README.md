# AdminisStraight Desktop — 0.1.1 test edition

A local-first desktop version of the AdminisStraight school leadership planner. Includes Today, three priorities, Quick Jot and Inbox, school schedule and time-block imports, live periods, walkthroughs and coverage, follow-ups, and the Google Calendar handoff.

## Install a Mac test package

Requires macOS 13 Ventura or later. Choose the Apple silicon package for an M-series Mac, or the Intel package for an Intel Mac. Apple menu → About This Mac identifies the chip. Extract the ZIP and move AdminisStraight.app to Applications.

These first packages are unsigned and not notarized. macOS may block them. They have been cross-packaged on Linux and have not been launched on a Mac; they are test packages, not a signed production release. Do not disable system-wide security settings. A signed and notarized release requires a Mac build with Apple Developer credentials.

## Bring your existing planner

1. In the web app, open Workspace settings and Export backup on the browser that holds your records.
2. Open the desktop app and choose Import existing planner backup, or File → Import planner backup.
3. Select the JSON backup and confirm replacement. Your browser copy remains separate.

New desktop profiles start empty rather than with sample staff records. The separately converted schedule CSV contains class periods only; use a full JSON backup to transfer notes, goals, follow-ups and walkthroughs as well.

## Local saving and recovery

Planner records are stored in planner.json in the application's user-data folder. On macOS this is normally ~/Library/Application Support/AdminisStraight/. Use File → Show data and recovery copies for the actual folder. Saves are atomic. The backups subfolder keeps the previous 30 changed versions. No backup is made for an unchanged save. Backups are on the same disk: export a copy to another location for protection against disk loss. Files are ordinary JSON, not encrypted by the app.

If the data file cannot be read, the app preserves it and pauses writes until a valid backup is explicitly imported from the File menu. To recover a previous version, import one of the JSON files in backups. Appearance and pulse preferences remain local to the desktop profile.

There is no cloud sync or automatic synchronization with the web version. Import/export is a one-time transfer, not two-way sync. Use Workspace settings → Update app to check for newer releases. Downloads and installation happen only when you choose. Do not edit the same data folder from multiple devices or put its live file in a sync folder.

The planner itself works offline with system fonts and bundled interface files. Google Calendar opens in your default browser and requires internet access. Calendar events are reviewed/saved there and do not sync changes back to the planner.

## Run from source

Install Node.js 24 LTS. In this folder:

    npm ci
    npm test
    npm start

On macOS, produce Intel and Apple silicon test ZIPs with:

    npm run build:mac

On Windows:

    npm run build:windows

The included GitHub Actions workflow can build unsigned Mac and Windows packages when this source is placed in a GitHub repository. Run the workflow from GitHub Actions to generate downloadable build artifacts. Manual workflow runs produce test artifacts. Version-tag runs also create a draft GitHub Release for review; they never publish it automatically.

## Verification and release work

Node tests cover planner validation, CSV imports, time-block mapping, live-period time boundaries, coverage, priorities, restart persistence, recovery copies, failed writes, and restoration after corrupt data. Packaging validates the Mac app bundle structures; Mac GUI launch, print, dialogs, and Gatekeeper behavior require testing on a Mac.

Before a public release: test both Mac architectures, provision Apple signing/notarization, sign Windows packages if distributed, and validate the update channel on both platforms. No signing credentials are bundled. The browser version was not modified by this desktop packaging task.

Framework references: https://www.electronjs.org/docs/latest/tutorial/security/ and https://www.electron.build/multi-platform-build.html

## Update app

Workspace settings → Update app shows the installed version and offers Check for updates, Downloads, and Test builds. Help → Check for updates opens the same panel. Enable Include preview / test releases to check published prereleases as well as stable releases. GitHub Actions artifacts alone do not appear in update checks.

On Windows and Linux AppImage installations, choose Download update, then Restart to update. A verified signed Mac installation uses the same flow. Unsigned or ad-hoc Mac test builds use Download new version instead: download the matching ZIP or DMG, quit AdminisStraight, and replace its app in Applications. Keep the existing user-data folder; planner records, recovery copies, appearance, and time-format preferences remain there. Export a backup before testing an upgrade. Source runs show download links rather than trying to replace the checkout.

Apps installed before this feature need one manual upgrade to 0.1.1 (or later). After that, the update panel is available. No background downloads, automatic installation on quit, or downgrades are enabled. Checks and downloads require Internet access; planning continues to work offline.

### Prepare an update release

1. Increase package.json and package-lock.json versions together (for example, `npm version 0.1.2 --no-git-tag-version`). Use a SemVer prerelease such as `0.1.2-beta.1` for a preview. Stable users receive stable releases; preview users may receive newer prereleases.
2. Commit the change and push a matching version tag (for example, `v0.1.2`). The workflow validates that the tag matches the app version, tests, and builds Mac ZIP/DMG and Windows NSIS packages with update metadata and blockmaps. Build scripts never publish on their own.
3. The workflow prepares a draft release with all assets. Test the packages and a real upgrade on the target operating systems, then review and publish the draft. The draft and workflow artifacts are not visible to ordinary installed-app update checks. Published prereleases are only offered to users who opt in.

The configured feed is `BlackHargaan/AdminisStraight` on GitHub. Releases and their assets must be publicly readable for ordinary users. If the source repository is private, use a public distribution repository and change the `build.publish` owner/repo in package.json and the fixed URLs in desktop/updates.cjs together; adjust the release workflow to upload there using a scoped CI credential. Do not embed repository tokens in the desktop app. No release was published as part of this change.

For signed Mac releases, provide `MAC_CSC_LINK`, `MAC_CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` as GitHub Actions secrets. These are optional for unsigned testing; signed distribution requires valid Apple credentials and notarization. Windows signing uses `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD` for its certificate and password. The app keeps signature and artifact-checksum verification enabled. Mac signature detection chooses manual installation unless a non-ad-hoc signature verifies. Native signing, notarization, installer behavior, and end-to-end updates still require Mac/Windows release validation.
