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
## 2025-05-23 11:15 IST (Feature Update)
- Added 'Resources & Info' tab to the public client portal.
- Implemented 'Trainer Profile' management in the dashboard for trainers to update their public contact info and bio.
- Implemented 'Client Resources' management in the client detail view, allowing trainers to share links and files with specific clients.
- Updated 'Client' schema to support resource sharing and trainer profile data storage.
