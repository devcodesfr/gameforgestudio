# GameForge Studio - Comprehensive Design Guidelines

## Design Approach

**Selected Framework**: Design System Approach inspired by modern developer productivity tools (VS Code, Linear, GitHub) with Material Design principles for data-rich components.

**Design Philosophy**: 
- Professional developer tool aesthetic with gaming industry edge
- Information density balanced with breathing room
- Consistent patterns across complex feature sets
- Performance-first interactions with minimal animations

---

## Typography System

**Font Families**:
- Primary: Inter (via Google Fonts CDN)
- Code/Monospace: JetBrains Mono or Fira Code

**Type Scale**:
- Headings: H1 (32px/2rem, Semi-bold), H2 (24px/1.5rem, Semi-bold), H3 (20px/1.25rem, Medium), H4 (18px/1.125rem, Medium)
- Body: Regular (16px/1rem, Regular), Small (14px/0.875rem, Regular), Caption (12px/0.75rem, Regular)
- Code: Monospace (14px/0.875rem)
- Line Height: 1.5 for body text, 1.2 for headings, 1.6 for code blocks

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24, 32
- Micro spacing (component internal): 2, 4
- Component spacing: 6, 8, 12
- Section spacing: 16, 20, 24
- Major sections: 32

**Grid Structure**:
- Sidebar: Fixed 280px width
- Main content: Flexible with max-width of 1400px, padding 24px
- Dashboard metrics: 5-column grid on desktop (grid-cols-5), 2-column on tablet, 1-column on mobile
- Dashboard tiles: 2-column layout (grid-cols-2)
- Asset Store products: 4-column grid (grid-cols-4) on desktop, responsive scaling

**Container Strategy**:
- Full-width sections with inner constraints
- Consistent 24px padding on all main content areas
- Card components with 20px internal padding
- Forms and inputs with 12px padding

---

## Navigation & Sidebar

**Sidebar Structure**:
- Logo area at top (64px height) with icon + text layout
- Navigation items (48px height each) with icon (20px) + label
- Active state: Full-width highlight with left border accent (4px)
- Hover state: Subtle background change
- Profile section pinned to bottom with 16px padding

**Navigation Patterns**:
- Single-level navigation (no nested menus)
- Clear active state indication
- Icon consistency using Font Awesome 6.0
- Badge/counter support for notifications on nav items

---

## Component Library

### Metric Cards (Dashboard)
- Height: 140px minimum
- Layout: Icon (left, 48px) + Content (right)
- Icon container: 56px × 56px with subtle background
- Metric value: H3 size, Semi-bold
- Label: Small text
- Change indicator: Caption size with icon prefix

### Project Cards
- Compact list view with 64px height per item
- Icon (emoji/logo, 40px) + Title + Status badge
- Status badges: Pill shape, 8px padding, Small text
- Hover: Entire card is clickable with subtle elevation

### Dashboard Tiles
- Header: H2 title + "View All" link (right-aligned)
- Content padding: 20px
- Minimum height: 400px
- Rounded corners: 8px
- Subtle shadow for depth

### Asset Store Product Cards
- Image area: 4:3 aspect ratio, 200px height
- Product info: 16px padding
- Price: Semi-bold, larger text
- "Add to Cart" button: Full-width at bottom
- Sale pricing: Strike-through original + new price side by side
- Discount badge: Absolute positioned top-right corner

### Team Member Cards
- Avatar: 48px circular
- Name + Role layout (vertical stack)
- Online status indicator: 8px dot, absolute positioned
- Click target: Full card area
- Grid layout: 4 columns on desktop

### Chat Interface
- Message bubbles: Max-width 70%, rounded corners (12px)
- User messages: Right-aligned
- Other messages: Left-aligned with avatar (32px)
- Input area: Fixed bottom, 56px height with send button
- Timestamp: Caption size above each message

### Code Editor Component
- Three-panel layout: Editor (60%) | Console (20%) | Output (20%)
- Line numbers: 40px gutter width
- Syntax highlighting: Use Prism.js or Monaco Editor
- Toolbar: 48px height with action buttons
- Font: Monospace, 14px, line-height 1.6

### Analytics Graphs
- Container: Minimum 400px height
- Filter controls: Top-right, inline layout
- Legend: Bottom-aligned, horizontal
- Tooltip on hover: Floating card with data points
- Use Chart.js or Recharts for implementation

### Modal/Pop-up System
- Overlay: Semi-transparent backdrop
- Modal: Max-width 800px, centered
- Header: 64px with title + close button
- Content: Scrollable area with 24px padding
- Footer: 64px with action buttons (right-aligned)
- Close interactions: X button, backdrop click, ESC key

### Form Elements
- Input fields: 48px height, 12px padding, rounded 6px
- Labels: Small text, 8px margin-bottom
- Buttons: 48px height, 16px horizontal padding, rounded 6px
- Primary button: Semi-bold text, prominent treatment
- Secondary button: Outlined style, same dimensions
- Form groups: 20px spacing between fields

### Calendar Component
- Month grid: 7 columns (days), 5-6 rows (weeks)
- Day cells: Square aspect ratio, minimum 80px
- Selected day: Distinct highlight
- Today indicator: Subtle border accent
- Event dots: 6px circles below date, max 3 visible
- Event list: Right panel (300px) showing details

### Shopping Cart
- Cart icon: Fixed position top-right with badge counter
- Dropdown preview: 400px width, max 500px height
- Product list: 80px per item with thumbnail
- Checkout button: Sticky bottom of dropdown
- Empty state: Centered message with icon

### Discussion Board
- Topic card: 80px height, flex layout
- Avatar (48px) + Content + Metadata (right)
- Reply threading: 40px left indent per level
- Like button: Icon + counter, inline layout
- "New Topic" button: Primary button, top-right

---

## Data Visualization

**Chart Styling**:
- Grid lines: Subtle, 1px width
- Data points: 6px diameter
- Line thickness: 2px
- Bar spacing: 8px gap
- Axis labels: Small text
- Interactive tooltips on hover

**Filters & Controls**:
- Dropdown filters: 200px width, 40px height
- Date range picker: Inline calendar dropdown
- Toggle switches: 48px width, 24px height
- Filter chips: Removable pills with X icon

---

## Notification System

**Toast Notifications**:
- Position: Top-right corner, 16px from edges
- Width: 360px
- Auto-dismiss: 5 seconds
- Stack vertically with 8px gap
- Icon (left) + Message + Close button (right)

**Badge Indicators**:
- Numeric badges: 20px circle, white text
- Dot indicators: 8px circle
- Position: Top-right of parent element

---

## Images

**Dashboard**:
- Project icons: Simple emoji or geometric logo representations (40px × 40px)
- No large hero images required

**Asset Store**:
- Product thumbnails: 200px height, 4:3 ratio
- Minimalistic representations of assets (3D models, textures, audio icons, etc.)
- Consistent lighting and background treatment across all products

**Team Section**:
- Member avatars: 48px circular (list view), generated profile images or initials
- Larger profile view: 120px circular on profile pages

**Community**:
- Topic thumbnails: Optional 60px × 60px preview images
- Event images: 300px × 200px for calendar events

**No hero images required** - This is a productivity application focused on dense information display and functional interfaces.

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (single column layouts)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full multi-column layouts)

**Sidebar on Mobile**:
- Collapsible hamburger menu
- Overlay navigation drawer
- Full-screen takeover on small screens

---

## Animation & Interaction

**Minimal Animation Strategy**:
- Navigation transitions: 150ms ease
- Modal fade-in: 200ms
- Hover states: Instant or 100ms
- Loading states: Skeleton screens (no spinners unless necessary)
- Chart animations: Disabled or subtle 300ms entry only
- Page transitions: None (instant content swap)

---

## Accessibility

- Focus states: 2px outline with offset
- Keyboard navigation: Full support for all interactive elements
- Color contrast: WCAG AA minimum for all text
- Screen reader labels: Comprehensive ARIA labels
- Form validation: Inline error messages with icons