# Changelog

## [Unreleased]

## [2025-12-15] - 18:00 IST
### Added
- **Injury Tracking**: Added ability to log injuries, track status (Active, Recovering, Recovered), and view history for each client.
- **Body Measurement Logs**: Implemented detailed tracking for weight, height, and various body part measurements (chest, waist, hips, arms, thighs) along with notes.
- **Health & Progress Tab**: Added a new tab in the Client Detail view to house injury and measurement logs.
- **Backend Infrastructure**: Added `InjuryLog` and `MeasurementLog` schemas, database storage support, and API endpoints.

### Changed
- Updated `client-detail.tsx` to include the new tracking components.
