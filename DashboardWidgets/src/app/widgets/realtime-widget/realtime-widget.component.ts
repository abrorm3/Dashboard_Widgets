import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import {getProjectProgress} from '../../utils/project.utils';

@Component({
  selector: 'app-realtime-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './realtime-widget.component.html',
  styleUrls: ['./realtime-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealtimeWidgetComponent implements OnInit, OnDestroy {
  @Input() onRemove?: () => void;

  private projectService = inject(ProjectService);

  projectId = signal<number | undefined>(undefined);
  lastUpdate = signal<Date>(new Date());
  isUpdating = signal<boolean>(false);

  @Input() set projectIdInput(value: number | undefined) {
    this.projectId.set(value);
  }

  project = computed(() => {
    const id = this.projectId();
    if (!id) return undefined;
    return this.projectService.projects().find(p => p.id === id);
  });

  progress = computed(() => {
    const proj = this.project();
    return proj ? getProjectProgress(proj) : 0;
  });

  private updateInterval?: number;

  constructor() {
    effect(() => {
      const proj = this.project();
      if (proj) {
        this.lastUpdate.set(new Date());
        this.isUpdating.set(true);
        setTimeout(() => this.isUpdating.set(false), 500);
      }
    });
  }

  ngOnInit() {
    this.startAutoUpdate();
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private startAutoUpdate() {
    this.updateInterval = window.setInterval(() => {
      const id = this.projectId();
      if (id) {
        this.projectService.updateProjectProgress(id);
      }
    }, 5000);
  }

  onClose() {
    if (this.onRemove) {
      this.onRemove();
    }
  }
}
