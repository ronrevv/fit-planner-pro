# Changelog

## [Unreleased]

## [2025-12-20] - 06:20 IST
### Added
- **Multi-Gym Architecture**: Transformed the platform to support multiple gyms/tenants.
- **Authentication**: Added secure session-based authentication (Login/Logout) using Passport.js.
- **User Roles**: Introduced Super Admin, Gym Admin, and Trainer roles with permission scopes.
- **Admin Dashboards**: Added Platform Admin dashboard for gym onboarding and Gym Admin dashboard for staff management.
- **Data Isolation**: Enforced strict data visibility rules (Trainers see only their clients, Gym Admins see their gym's data).

## [2025-12-15] - 18:00 IST
### Added
- **Injury Tracking**: Added ability to log injuries, track status (Active, Recovering, Recovered), and view history for each client.
- **Body Measurement Logs**: Implemented detailed tracking for weight, height, and various body part measurements (chest, waist, hips, arms, thighs) along with notes.
- **Health & Progress Tab**: Added a new tab in the Client Detail view to house injury and measurement logs.
- **Backend Infrastructure**: Added `InjuryLog` and `MeasurementLog` schemas, database storage support, and API endpoints.

### Changed
- Updated `client-detail.tsx` to include the new tracking components.
