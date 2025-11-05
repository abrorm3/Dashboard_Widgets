import {Component, Input, ChangeDetectionStrategy, inject, computed, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectService} from '../../services/project.service';
import {getProjectStatus} from '../../utils/project.utils';
import {ProjectStatus} from '../../models/project.model';

@Component({
  selector: 'app-timeline-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-widget.component.html',
  styleUrls: ['./timeline-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineWidgetComponent {
  @Input() onRemove?: () => void;

  private projectService = inject(ProjectService);

  projectId = signal<number | undefined>(undefined);

  @Input() set projectIdInput(value: number | undefined) {
    this.projectId.set(value);
  }

  project = computed(() => {
    const id = this.projectId();
    if (!id) return undefined;
    return this.projectService.projects().find(p => p.id === id);
  });

  statusClass = computed(() => {
    const proj = this.project();
    if (!proj) return '';
    const status = getProjectStatus(proj);
    return status.replace('_', '-');
  });

  statusLabel = computed(() => {
    const proj = this.project();
    if (!proj) return '';
    const status = getProjectStatus(proj);
    const labels: Record<ProjectStatus, string> = {
      [ProjectStatus.NOT_STARTED]: 'Not Started',
      [ProjectStatus.IN_PROGRESS]: 'In Progress',
      [ProjectStatus.COMPLETED]: 'Completed',
      [ProjectStatus.OVERDUE]: 'Overdue'
    };
    return labels[status];
  });

  duration = computed(() => {
    const proj = this.project();
    if (!proj) return 0;
    const start = new Date(proj.startDate);
    const end = new Date(proj.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });

  daysElapsed = computed(() => {
    const proj = this.project();
    if (!proj) return 0;
    const start = new Date(proj.startDate);
    const now = new Date();
    const elapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(elapsed, this.duration()));
  });

  daysRemaining = computed(() => {
    const proj = this.project();
    if (!proj) return 0;
    const end = new Date(proj.endDate);
    const now = new Date();
    const remaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
  });

  timeProgress = computed(() => {
    const dur = this.duration();
    if (dur === 0) return 0;
    const elapsed = this.daysElapsed();
    return Math.min((elapsed / dur) * 100, 100);
  });

  tasksLeft = computed(() => {
    const proj = this.project();
    if (!proj) return 0;
    return proj.tasksTotal - proj.tasksCompleted + '/' + proj.tasksTotal;
  });

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
  }

  onClose() {
    if (this.onRemove) {
      this.onRemove();
    }
  }
}
