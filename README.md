# Dashboard Widgets - Interactive Project Management Dashboard

An advanced Angular 18 application for managing projects with customizable, draggable widgets that persist state across sessions.

## Features

- **Dynamic Widget System**: Add, remove, and reorder widgets using drag & drop
- **Multiple Widget Types**:
  - Progress Widget: Visual progress bars with completion percentage
  - Task Statistics Widget: Comprehensive task statistics with Chart.js visualizations
  - Timeline Widget: Project timeline with status indicators
  - Real-time Widget: Auto-updating widget with 5-second refresh interval
- **Advanced Filtering**: Filter projects by name and status (In Progress, Completed, Not Started, Overdue)
- **State Persistence**: Dashboard configuration saved in localStorage
- **Async Data Loading**: Simulated HTTP requests with 500-1000ms delay
- **Performance Optimized**: OnPush change detection strategy, lazy loading components
- **Responsive Design**: Modern, gradient-based UI with smooth animations

## Architecture

### Project Structure

```
DashboardWidgets/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── project.model.ts          # Project interface, status enums
│   │   ├── services/
│   │   │   ├── project.service.ts        # Project data management with signals
│   │   │   └── dashboard-state.service.ts # State persistence with signals & effect
│   │   ├── pages/
│   │   │   └── home/
│   │   │       ├── home.component.ts     # Home page with dashboard logic
│   │   │       ├── home.component.html
│   │   │       └── home.component.scss
│   │   ├── widgets/
│   │   │   ├── progress-widget/
│   │   │   │   ├── progress-widget.component.ts
│   │   │   │   ├── progress-widget.component.html
│   │   │   │   └── progress-widget.component.scss
│   │   │   ├── task-statistics-widget/
│   │   │   │   ├── task-statistics-widget.component.ts
│   │   │   │   ├── task-statistics-widget.component.html
│   │   │   │   └── task-statistics-widget.component.scss
│   │   │   ├── timeline-widget/
│   │   │   │   ├── timeline-widget.component.ts
│   │   │   │   ├── timeline-widget.component.html
│   │   │   │   └── timeline-widget.component.scss
│   │   │   └── realtime-widget/
│   │   │       ├── realtime-widget.component.ts
│   │   │       ├── realtime-widget.component.html
│   │   │       └── realtime-widget.component.scss
│   │   ├── utils/
│   │   │   └── project.utils.ts          # Project helper functions
│   │   ├── app.component.ts              # Root component with router
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.routes.ts                 # Routing configuration
│   │   └── app.config.ts                 # Application configuration
│   └── styles.scss                       # Global styles
```

### Key Architectural Decisions

#### 1. Standalone Components Architecture
All widgets are implemented as **standalone Angular components**, eliminating the need for NgModules and enabling:
- Better tree-shaking and smaller bundle sizes
- Simplified dependency management
- Easier testing and maintenance

#### 2. Angular 18 Signals Architecture
The application uses Angular's latest **signals** and **computed signals** for reactive state management:
- All services use `signal()` for reactive state instead of RxJS BehaviorSubject
- Components use `computed()` for derived state
- Automatic reactivity without manual change detection
- `effect()` for side effects like auto-save to localStorage
- Eliminates the need for OnPush change detection strategy

#### 3. Angular 18 Control Flow Syntax
Using Angular's new built-in control flow directives:
- `@if` / `@else` instead of `*ngIf`
- `@for` instead of `*ngFor`
- `@switch` / `@case` for conditional rendering
- `@defer` for lazy loading widgets on viewport intersection

Example:
```typescript
@defer (on viewport) {
  <app-progress-widget [projectIdInput]="widget.projectId" />
} @placeholder {
  <div class="widget-placeholder">Loading widget...</div>
}
```

#### 4. Routing Architecture
The application uses **Angular Router** with standalone components:
- Route configuration in `app.routes.ts`
- Root path (`/`) redirects to `/home`
- Home component contains the dashboard logic
- Router-outlet in the root app component
- Easy to extend with additional routes

#### 5. State Management with Signals
**DashboardStateService** and **ProjectService** use signals for state management:
- `signal()` for reactive state updates
- `computed()` for derived values (filtered projects, filtered widgets)
- `effect()` for automatic localStorage persistence
- No manual subscriptions needed - automatic cleanup
- Simulated async loading with delays (500-1000ms)

#### 6. Drag & Drop Implementation
Using **@angular/cdk/drag-drop**:
- Reorderable widget grid with `cdkDropList` and `cdkDrag`
- Visual feedback during drag operations
- Drag handle (appears on hover) for better UX
- Automatic state persistence after reordering
- Prevents replacement when dragging to the same position

## Technical Implementation Details

### Signals-Based State Management
```typescript
export class ProjectService {
  projects = signal<Project[]>(this.initialProjects);
  isLoading = signal<boolean>(true);

  constructor() {
    setTimeout(() => {
      this.isLoading.set(false);
    }, Math.floor(Math.random() * 500) + 500);
  }

  getProjectById(id: number) {
    return computed(() => this.projects().find(p => p.id === id));
  }
}
```

### Computed Signals for Derived State
Components use computed signals for reactive derived values:
```typescript
export class HomeComponent {
  filteredWidgets = computed(() => {
    const widgets = this.widgets();
    const search = this.searchText();
    const status = this.statusFilter();

    return widgets.filter(widget => {
      const project = this.projects().find(p => p.id === widget.projectId);
      if (!project) return false;

      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || getProjectStatus(project) === status;
      return matchesSearch && matchesStatus;
    });
  });
}
```

### Automatic State Persistence with Effect
Dashboard state automatically persists using Angular's `effect()`:
```typescript
export class DashboardStateService {
  widgets = signal<WidgetConfig[]>(this.defaultWidgets);
  filters = signal<DashboardFilters>(this.defaultFilters);

  constructor() {
    this.loadState();
    effect(() => {
      // Automatically runs when widgets or filters change
      this.saveState();
    });
  }
}
```

### Chart Integration
Task Statistics Widget uses Chart.js for data visualization:
```typescript
const config: ChartConfiguration = {
  type: 'doughnut',
  data: {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [completed, remaining],
      backgroundColor: ['#4CAF50', '#E0E0E0']
    }]
  }
};
```

## AI-Assisted Development

This project extensively utilized AI assistance (Claude Code) throughout development:

### 1. Architecture Planning
- **AI Used For**: Designing the component structure and service layer architecture
- **Impact**: Established a clean separation of concerns with standalone components, ensuring scalability and maintainability

### 2. RxJS Stream Optimization
- **AI Used For**: Implementing efficient observable patterns for project data streams
- **Example**: Real-time update mechanism using `interval` and `BehaviorSubject`
- **Impact**: Optimized data flow with proper subscription management, preventing memory leaks

### 3. Drag & Drop Implementation
- **AI Used For**: Angular CDK drag-drop integration and event handling
- **Impact**: Fully functional drag-and-drop system with state persistence in minimal time

### 4. Chart.js Integration
- **AI Used For**: Implementing Chart.js in Angular with proper TypeScript typing
- **Challenge Solved**: Chart.js configuration and lifecycle management in OnPush components
- **Impact**: Successfully integrated interactive charts with minimal boilerplate

### 5. CSS Styling & Animations
- **AI Used For**: Creating modern gradient designs and smooth animations
- **Example**: Pulse animation for real-time indicator, drag-and-drop visual feedback
- **Impact**: Professional, polished UI without extensive CSS experimentation

## Installation & Setup

1. Clone the repository
```bash
git clone <repository-url>
cd Dashboard_Widgets/DashboardWidgets
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm start
```

4. Open browser at `http://localhost:4200`

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in `dist/dashboard-widgets/`.

## Usage

1. **Add Widget**: Click "Add Widget" button, select project and widget type
2. **Remove Widget**: Click the "×" button on any widget
3. **Reorder Widgets**: Drag widgets using the drag handle (appears on hover)
4. **Filter Projects**: Use search box or status dropdown to filter
5. **Reset Dashboard**: Click "Reset Dashboard" to restore default configuration

## Technologies Used

- **Angular 18**: Latest framework features (standalone components, signals, @defer, @if/@for control flow)
- **TypeScript 5.5**: Strong typing and modern JavaScript features
- **Angular Router**: Client-side routing with lazy loading
- **@angular/cdk**: Drag-and-drop functionality
- **Chart.js**: Data visualization with ng2-charts
- **SCSS**: Advanced styling with nested rules and variables
- **SVG Icons**: Custom scalable vector graphics for icons

## Performance Optimizations

1. **Signals Architecture**: Automatic reactivity without manual change detection
2. **Lazy Loading**: Widgets load on-demand using `@defer (on viewport)`
3. **Computed Signals**: Efficient derived state with automatic dependency tracking
4. **Effect-based Auto-save**: State persistence only when data changes
5. **LocalStorage Caching**: Instant state restoration on page load
6. **Route-based Code Splitting**: Separate bundles for each route

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- IndexedDB for larger state storage
- WebSocket integration for true real-time updates
- Custom widget builder
- Export/import dashboard configurations
- Multi-dashboard support
- Collaborative editing

## License

MIT License

## Author

Built with AI assistance using Claude Code - demonstrating modern Angular development best practices.
