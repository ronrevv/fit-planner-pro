# Changelog

All timestamps are in IST (Indian Standard Time).

## [Unreleased]

### Added
- **2025-12-13 19:03:30 IST** - Started implementation of "Client Management Suite" features.
- **2025-12-13 19:05:00 IST** - Defined database schemas for Injuries, Extended Progress (Measurements/Photos), Daily Log Extensions (Skip/Cheat), and Trainer Notes.
- **2025-12-13 19:15:24 IST** - Implemented "Client Management Suite":
    - **Cheat Meal & Skip Day:** Added logic in Client Portal to mark days as skipped or swap meals for cheat meals.
    - **Injuries Tracker:** Added `InjuriesCard` to Client Detail to log active/past injuries.
    - **Measurements:** Enhanced progress logging to include body measurements (Waist, Hips, etc.).
    - **Trainer Notes:** Added a dedicated section for session notes in Client Detail.
