# 01BO v0.32 development checkpoint

- HTTPS API integration, location search and road-route display.
- Zerobo itinerary/report actions, Word export and Gmail OAuth delivery confirmation.
- Android NFC + GPS visit verification, native speech input and experimental wake settings.
- Updated logo, adaptive launcher icons, splash assets and UI transitions/theme handling.
- Backend source and tests included under `backend/`.

Android: versionName 0.32, versionCode 7. This is a development/demo build, not the formal v1.0 release.

Before Android builds run `python3 scripts/prepare-wake-model.py` to provision the checksum-verified offline Korean model, then build the frontend and sync Capacitor. Generated web assets, model binaries, APKs and private demo recordings are excluded from Git.

Device verification on 2026-10-27 covered GPS check-in, NFC+GPS checkout, AI itinerary creation/change, reports, Word export and Gmail delivery. Voice was skipped at the user's request; OCR was not tested with a receipt. Known issues: admin totals/activity display, sent-mail state after reopening chat, and incomplete translations. No claim of full production readiness.
