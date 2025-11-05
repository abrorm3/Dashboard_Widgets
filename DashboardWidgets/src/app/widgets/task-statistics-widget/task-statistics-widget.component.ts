import {
  Component,
  Input,
  ChangeDetectionStrategy,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  computed,
  signal,
  effect
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectService} from '../../services/project.service';
import {Chart, ChartConfiguration, registerables} from 'chart.js';
import {getProjectProgress} from '../../utils/project.utils';

Chart.register(...registerables);

@Component({
  selector: 'app-task-statistics-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-statistics-widget.component.html',
  styleUrls: ['./task-statistics-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskStatisticsWidgetComponent implements AfterViewInit {
  @Input() onRemove?: () => void;
  @Input() set projectIdInput(value: number | undefined) {
    this.projectId.set(value);
  }
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
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
  tasksRemaining = computed(() => {
    const proj = this.project();
    return proj ? proj.tasksTotal - proj.tasksCompleted : 0;
  });
  private chart?: Chart;

  constructor() {
    effect(() => {
      const proj = this.project();
      if (proj && this.chartCanvas) {
        this.updateChart();
      }
    });
  }

  ngAfterViewInit() {
    if (this.project() && this.chartCanvas) {
      this.initChart();
    }
  }

  onClose() {
    if (this.onRemove) {
      this.onRemove();
    }
  }

  private initChart() {
    if (!this.chartCanvas || !this.project()) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const proj = this.project()!;
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [proj.tasksCompleted, proj.tasksTotal - proj.tasksCompleted],
          backgroundColor: ['#4CAF50', '#E0E0E0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart || !this.project()) return;

    const proj = this.project()!;
    this.chart.data.datasets[0].data = [proj.tasksCompleted, proj.tasksTotal - proj.tasksCompleted];
    this.chart.update();
  }
}
