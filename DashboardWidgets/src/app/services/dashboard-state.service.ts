import { Injectable, signal, computed, effect } from '@angular/core';

export interface WidgetConfig {
  id: string;
  type: 'progress' | 'statistics' | 'timeline' | 'realtime';
  projectId?: number;
}

export interface DashboardFilters {
  searchText: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private readonly STORAGE_KEY = 'dashboard_state';

  private defaultWidgets: WidgetConfig[] = [
    { id: '1', type: 'progress', projectId: 1 },
    { id: '2', type: 'statistics', projectId: 2 },
    { id: '3', type: 'timeline', projectId: 3 }
  ];

  private defaultFilters: DashboardFilters = {
    searchText: '',
    status: 'all'
  };

  widgets = signal<WidgetConfig[]>(this.defaultWidgets);
  filters = signal<DashboardFilters>(this.defaultFilters);

  searchText = computed(() => this.filters().searchText);
  statusFilter = computed(() => this.filters().status);

  constructor() {
    this.loadState();

    effect(() => {
      this.saveState();
    });
  }

  updateWidgets(widgets: WidgetConfig[]): void {
    this.widgets.set(widgets);
  }

  addWidget(widget: WidgetConfig): void {
    this.widgets.update(current => [...current, widget]);
  }

  removeWidget(widgetId: string): void {
    this.widgets.update(current => current.filter(w => w.id !== widgetId));
  }

  updateSearchText(searchText: string): void {
    this.filters.update(current => ({ ...current, searchText }));
  }

  updateStatusFilter(status: string): void {
    this.filters.update(current => ({ ...current, status }));
  }

  private saveState(): void {
    try {
      const state = {
        widgets: this.widgets(),
        filters: this.filters()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save dashboard state:', error);
    }
  }

  private loadState(): void {
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.widgets.set(parsed.widgets || this.defaultWidgets);
        this.filters.set(parsed.filters || this.defaultFilters);
      }
    } catch (error) {
      console.error('Failed to load dashboard state:', error);
    }
  }

  resetState(): void {
    this.widgets.set(this.defaultWidgets);
    this.filters.set(this.defaultFilters);
  }
}
