import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../services/project.service';
import { DashboardStateService, WidgetConfig } from '../../services/dashboard-state.service';
import { ProgressWidgetComponent } from '../../widgets/progress-widget/progress-widget.component';
import { TaskStatisticsWidgetComponent } from '../../widgets/task-statistics-widget/task-statistics-widget.component';
import { TimelineWidgetComponent } from '../../widgets/timeline-widget/timeline-widget.component';
import { RealtimeWidgetComponent } from '../../widgets/realtime-widget/realtime-widget.component';
import {getProjectStatus} from '../../utils/project.utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ProgressWidgetComponent,
    TaskStatisticsWidgetComponent,
    TimelineWidgetComponent,
    RealtimeWidgetComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private projectService = inject(ProjectService);
  private dashboardStateService = inject(DashboardStateService);

  title = 'Dashboard Widgets';

  projects = this.projectService.projects;
  isLoading = this.projectService.isLoading;

  widgets = this.dashboardStateService.widgets;
  searchText = this.dashboardStateService.searchText;
  statusFilter = this.dashboardStateService.statusFilter;

  showAddWidget = signal(false);
  selectedProjectId = signal<number | undefined>(undefined);
  selectedWidgetType = signal<'progress' | 'statistics' | 'timeline' | 'realtime'>('progress');

  filteredProjects = computed(() => {
    const projects = this.projects();
    const search = this.searchText();
    const status = this.statusFilter();

    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || getProjectStatus(project) === status;
      return matchesSearch && matchesStatus;
    });
  });

  filteredWidgets = computed(() => {
    const widgets = this.widgets();
    const search = this.searchText();
    const status = this.statusFilter();

    if (search === '' && status === 'all') {
      return widgets;
    }

    const projects = this.projects();
    return widgets.filter(widget => {
      const project = projects.find(p => p.id === widget.projectId);
      if (!project) return false;

      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || getProjectStatus(project) === status;
      return matchesSearch && matchesStatus;
    });
  });

  onSearchChange(value: string) {
    this.dashboardStateService.updateSearchText(value);
  }

  onStatusChange(value: string) {
    this.dashboardStateService.updateStatusFilter(value);
  }

  onDrop(event: CdkDragDrop<WidgetConfig[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const newWidgets = [...this.widgets()];
    moveItemInArray(newWidgets, event.previousIndex, event.currentIndex);
    this.dashboardStateService.updateWidgets(newWidgets);
  }

  openAddWidget() {
    const firstProject = this.filteredProjects()[0];
    this.selectedProjectId.set(firstProject?.id);
    this.showAddWidget.set(true);
  }

  closeAddWidget() {
    this.showAddWidget.set(false);
  }

  addWidget() {
    const projectId = this.selectedProjectId();
    if (!projectId) return;

    const newWidget: WidgetConfig = {
      id: Date.now().toString(),
      type: this.selectedWidgetType(),
      projectId: Number(projectId)
    };

    this.dashboardStateService.addWidget(newWidget);
    this.closeAddWidget();
  }

  removeWidget(widgetId: string) {
    this.dashboardStateService.removeWidget(widgetId);
  }

  resetDashboard() {
    if (confirm('Are you sure you want to reset the dashboard to default state?')) {
      this.dashboardStateService.resetState();
    }
  }
}
