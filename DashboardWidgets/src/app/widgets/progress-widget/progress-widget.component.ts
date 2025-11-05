import {Component, Input, ChangeDetectionStrategy, computed, inject, signal, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectService} from '../../services/project.service';
import {getProjectProgress} from '../../utils/project.utils';

@Component({
  selector: 'app-progress-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-widget.component.html',
  styleUrls: ['./progress-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressWidgetComponent {
  @Input() onRemove?: () => void;
  @Input() set projectIdInput(value: number | undefined) {
    this.projectId.set(value);
  }

  private projectService = inject(ProjectService);

  projectId = signal<number | undefined>(undefined);
  project = computed(() => {
    const id = this.projectId();
    if (!id) return undefined;
    return this.projectService.projects().find(p => p.id === id);
  });
  progress = computed(() => {
    const proj = this.project();
    return proj ? getProjectProgress(proj) : 0;
  });

  onClose() {
    if (this.onRemove) {
      this.onRemove();
    }
  }
}
