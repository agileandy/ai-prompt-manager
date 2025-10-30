# AI Prompt Manager - Web Application

A sophisticated browser-based AI prompt management system with hierarchical tagging, version control, and AI-powered generation capabilities.

**Experience Qualities**:
1. **Professional** - Clean, organized interface that feels like a serious productivity tool
2. **Efficient** - Fast interactions with minimal clicks to accomplish tasks
3. **Intelligent** - Smart AI integration that enhances rather than complicates the workflow

**Complexity Level**: Complex Application (advanced functionality with state management)
- Multiple interconnected features including prompt CRUD, hierarchical tags, version history, AI integration
- Persistent local storage with useKV for data that survives sessions
- Modal-based workflows for creating/editing prompts and configuring AI settings

## Essential Features

### Prompt Management
- **Functionality**: Create, read, update, delete prompts with title, description, content, and tags. Usage tracking via copy counter.
- **Purpose**: Central hub for organizing AI prompts with searchable metadata and usage analytics
- **Trigger**: Click "New Prompt" button, select existing prompt from list, or click card to view details
- **Progression**: Click new → Modal opens → Fill form → Add tags → Save → Prompt appears in list. Click card → View details with tabs → Access version history
- **Success criteria**: Prompts persist across sessions, searchable by title/content, display in organized grid, usage counter increments on copy, version number visible on card

### Hierarchical Tag System
- **Functionality**: Nested tag structure using `/` separator (e.g., `coding/javascript/react`)
- **Purpose**: Organize prompts with flexible categorization supporting multiple levels
- **Trigger**: Click tag management icon in sidebar
- **Progression**: Click manage tags → View tree → Expand/collapse nodes → Create/edit/delete tags → Auto-update prompt associations
- **Success criteria**: Tags display hierarchically with accurate counts, cascading updates work, orphan cleanup functions

### Version Control
- **Functionality**: Automatic versioning on every prompt edit with history viewer and copy functionality
- **Purpose**: Never lose previous iterations, track changes over time, access any version
- **Trigger**: Click on any prompt card to view details and version history
- **Progression**: Click card → View modal with tabs → Switch to "Version History" tab → Browse versions → Copy any version content
- **Success criteria**: Each edit creates numbered version with full snapshot (title, description, content), versions display chronologically, copy to clipboard works, version number shown on card front

### AI Integration
- **Functionality**: Generate prompts from descriptions and optimize existing prompts
- **Purpose**: Accelerate prompt creation with AI assistance
- **Trigger**: Click "Generate with AI" or "Optimize" buttons
- **Progression**: Click generate → Enter description → Select provider/model → Generate → Preview → Accept/edit → Save
- **Success criteria**: OpenRouter and Ollama providers work, model selection updates correctly, responses integrate into editor

### Search & Filter
- **Functionality**: Real-time search across titles and content, filter by tags
- **Purpose**: Quickly find specific prompts in large collections
- **Trigger**: Type in search bar or click tag filter
- **Progression**: Type query → Results update live → Click tag → Filter applied → Clear to reset
- **Success criteria**: Search responds within 100ms, matches partial text, tag filters combine correctly

## Edge Case Handling
- **Empty States** - Show helpful onboarding messages when no prompts or tags exist
- **Delete Protection** - Confirm before deleting prompts or tags with usage warnings
- **Invalid AI Config** - Graceful error messages when API keys missing or endpoints unreachable
- **Offline Mode** - App works fully without AI features when network unavailable
- **Large Collections** - Virtual scrolling for 1000+ prompts without performance degradation
- **Concurrent Edits** - Last-write-wins strategy with clear modification timestamps

## Design Direction
The design should feel professional and focused like a developer tool - clean, minimal interface with dark theme as primary. Data density is important but balanced with breathing room. The aesthetic should evoke VS Code or Linear - purposeful, efficient, beautiful without being playful.

## Color Selection
**Triadic** - Using deep purple, teal, and amber for a sophisticated tech aesthetic that balances cool professionalism with warm accents.

- **Primary Color**: Deep Purple `oklch(0.45 0.15 280)` - Main brand color for key actions and focus states, communicates creativity and intelligence
- **Secondary Colors**: Dark Slate `oklch(0.25 0.02 250)` for cards and elevated surfaces, Cool Gray `oklch(0.55 0.01 250)` for muted text
- **Accent Color**: Teal `oklch(0.65 0.12 190)` for highlights and success states, creates energy without overwhelming
- **Foreground/Background Pairings**:
  - Background (Near Black `oklch(0.12 0.01 250)`): Light Gray text `oklch(0.92 0.01 250)` - Ratio 14.2:1 ✓
  - Card (Dark Slate `oklch(0.25 0.02 250)`): White text `oklch(0.98 0 0)` - Ratio 11.8:1 ✓
  - Primary (Deep Purple `oklch(0.45 0.15 280)`): White text `oklch(0.98 0 0)` - Ratio 6.2:1 ✓
  - Accent (Teal `oklch(0.65 0.12 190)`): Dark text `oklch(0.15 0.01 250)` - Ratio 8.5:1 ✓
  - Muted (Cool Gray `oklch(0.35 0.01 250)`): Light text `oklch(0.85 0.01 250)` - Ratio 5.1:1 ✓

## Font Selection
Use Inter for its exceptional readability and modern tech aesthetic, perfect for data-heavy interfaces.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/24px/tight tracking
  - H2 (Section Headers): Inter Semibold/18px/normal tracking
  - H3 (Card Titles): Inter Medium/16px/normal tracking
  - Body (Content): Inter Regular/14px/relaxed leading (1.6)
  - Caption (Metadata): Inter Regular/12px/wide tracking/muted color

## Animations
Subtle and purposeful - motion should guide attention and confirm actions without calling attention to itself. Priority on instant feedback over decorative flourishes.

- **Purposeful Meaning**: Quick scale feedback on button press, smooth modal slide-ins, gentle tag expansion
- **Hierarchy of Movement**: Modals and dialogs get 300ms transitions, hovers get 150ms, inline updates get 200ms fades

## Component Selection
- **Components**: Dialog (prompt editor, AI generation, settings), Card (prompt display), Accordion (tag hierarchy), Tabs (settings sections), ScrollArea (tag tree, prompt list), Badge (tag chips), Button (all actions), Input/Textarea (forms), Select (dropdowns), Switch (toggles), Tooltip (help text)
- **Customizations**: Tag tree component with custom expand/collapse logic, Virtual scrolling wrapper for prompt grid
- **States**: Buttons show hover lift + color shift, inputs show focus ring in accent color, cards show subtle hover elevation
- **Icon Selection**: Plus (new prompt), MagnifyingGlass (search), Tag (tag management), Clock (version history), Sparkles (AI generation), Gear (settings), Trash (delete), Pencil (edit), Check (confirm), X (cancel)
- **Spacing**: Consistent 4px base unit - 16px card padding, 8px gaps in grids, 12px modal padding, 4px inline spacing
- **Mobile**: Single column layout below 768px, collapsible sidebar, full-screen modals, larger touch targets (44px minimum)
