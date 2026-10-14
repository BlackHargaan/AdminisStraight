# AdminisStraight Desktop — 0.1.0 test edition

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

There is no cloud sync or automatic synchronization with the web version. Import/export is a one-time transfer, not two-way sync. Desktop revisions are not automatically updated; install a newer package when one is released. Do not edit the same data folder from multiple devices or put its live file in a sync folder.

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

The included GitHub Actions workflow can build unsigned Mac and Windows packages when this source is placed in a GitHub repository. Run the workflow from GitHub Actions to generate downloadable build artifacts. It does not publish a release automatically.

## Verification and release work

Node tests cover planner validation, CSV imports, time-block mapping, live-period time boundaries, coverage, priorities, restart persistence, recovery copies, failed writes, and restoration after corrupt data. Packaging validates the Mac app bundle structures; Mac GUI launch, print, dialogs, and Gatekeeper behavior require testing on a Mac.

Before a public release: test both Mac architectures, provision Apple signing/notarization, sign Windows packages if distributed, and add an update channel. No signing credentials are bundled. The browser version was not modified by this desktop packaging task.

Framework references: https://www.electronjs.org/docs/latest/tutorial/security/ and https://www.electron.build/multi-platform-build.html
