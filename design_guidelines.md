# Design Guidelines: Aesthetic Gym Trainer Platform

## Design Approach

**Reference-Based Approach** drawing from premium fitness platforms (Nike Training Club, Peloton, Strava) combined with productivity tools (Notion, Linear). Emphasis on bold, energetic aesthetics while maintaining professional functionality for trainer workflows.

## Core Design Principles

1. **Bold & Energetic**: High-impact typography, strong visual hierarchy, confidence-inspiring layouts
2. **Data Clarity**: Clean presentation of workout/diet information for easy scanning
3. **Professional Output**: PDF-worthy design that clients will be proud to receive
4. **Mobile-First**: Trainers work on-the-go; every view must work perfectly on mobile

## Typography System

**Primary Font**: Inter or Manrope (Google Fonts) - clean, modern, highly legible
- Hero/Headers: font-bold, text-4xl to text-6xl, tight leading
- Section Headers: font-semibold, text-2xl to text-3xl
- Body Text: font-normal, text-base, leading-relaxed
- Data/Numbers: font-mono for exercise metrics (sets, reps, calories)
- Labels: font-medium, text-sm, uppercase tracking-wide

**Secondary Font**: Space Grotesk or DM Sans for accent elements

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16 (e.g., p-4, gap-6, mb-8, py-12, mt-16)

**Grid Structure**:
- Dashboard: 3-column grid on desktop (lg:grid-cols-3), single column mobile
- Client cards: 2-column on tablet (md:grid-cols-2), 3-column desktop (lg:grid-cols-3)
- Plan builder: Single column form with full-width calendar/schedule views
- Container max-width: max-w-7xl for main content areas

## Component Library

### Navigation
- Top navigation bar: Sticky header with logo left, trainer name/profile right
- Active tab indicator with bold underline
- Mobile: Hamburger menu with slide-out drawer

### Dashboard Cards
- Elevated cards with subtle shadow (shadow-md)
- Client cards: Avatar, name, current program status, quick actions
- Stats cards: Large numbers with labels, icon accents (Heroicons)
- Rounded corners: rounded-lg throughout

### Plan Builder Interface
- Calendar grid: Month view with visual indicators for workout/diet days
- Day detail view: Expandable sections for exercises and meals
- Exercise cards: Exercise name, sets×reps display, rest time badge
- Meal cards: Meal type header, food items list, calorie totals

### Forms & Inputs
- Floating labels or clear top labels
- Focus states with ring offset
- Add/remove buttons for dynamic lists (+ Exercise, + Meal)
- Inline edit capability for quick updates

### Action Buttons
- Primary CTA: Large, bold buttons (Generate PDF, Share to WhatsApp)
- Secondary: Outlined or ghost style
- Icon buttons: For quick actions (edit, delete, duplicate)
- WhatsApp button: Green accent with WhatsApp icon (Font Awesome)

### PDF Preview/Export
- Print-optimized layout card showing preview
- Download button with loading state
- Clean, professional formatting matching web design

## Images

**Hero Section**: Full-width, high-impact hero image
- Image: Professional gym environment with trainer working with client, bright and motivational
- Placement: Top of landing/login page
- Treatment: Subtle gradient overlay (dark bottom fade) for text readability
- Buttons on hero: Blurred glass-morphism background (backdrop-blur-sm with bg-white/20)

**Dashboard**: No hero image - focus on functionality
**Client Profiles**: Optional small avatar/profile images only

## Interactions & Animations

**Minimal & Purposeful**:
- Hover states: Subtle scale (scale-105) on cards
- Button states: Standard hover/active built into components
- Loading states: Spinner for PDF generation
- Success feedback: Brief checkmark animation on save/export

**No Page Transitions**: Instant navigation for speed

## Key Screens Layout

**Trainer Dashboard**:
- Welcome banner with trainer stats
- Client grid (3-col desktop)
- Quick actions bar (New Client, New Plan)

**Client Profile**:
- Header: Client info, goals, progress metrics
- Tabs: Workout Plans | Diet Plans | History
- Calendar overview below tabs

**Plan Builder**:
- Side-by-side: Calendar view (left 40%) | Day detail (right 60%)
- Bottom action bar: Save Draft, Generate PDF, Share

**PDF Export View**:
- Clean A4-sized preview
- Header: Trainer branding, client name, date range
- Organized sections: Weekly workout schedule, daily meal plans
- Footer: Trainer contact info

## Icon Library

**Heroicons** (via CDN) for all interface icons:
- Navigation, actions, status indicators
- Exercise categories (strength, cardio icons)
- Meal types (breakfast, lunch, dinner icons)

---

**Design Mandate**: Create a visually striking platform that feels premium and professional while keeping trainer workflows efficient. Bold when presenting, clean when working.