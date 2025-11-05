import { Injectable, signal, computed } from '@angular/core';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private initialProjects: Project[] = [
    {
      id: 1,
      name: 'Проект A',
      tasksCompleted: 25,
      tasksTotal: 50,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    {
      id: 2,
      name: 'Проект B',
      tasksCompleted: 75,
      tasksTotal: 140,
      startDate: '2023-06-01',
      endDate: '2024-03-31'
    },
    {
      id: 3,
      name: 'Проект C',
      tasksCompleted: 80,
      tasksTotal: 85,
      startDate: '2024-06-01',
      endDate: '2024-09-30'
    },
    {
      id: 4,
      name: 'Проект D',
      tasksCompleted: 10,
      tasksTotal: 60,
      startDate: '2025-07-15',
      endDate: '2025-12-15'
    },
    {
      id: 5,
      name: 'Проект E',
      tasksCompleted: 45,
      tasksTotal: 90,
      startDate: '2023-11-01',
      endDate: '2024-08-31'
    }
  ];

  projects = signal<Project[]>(this.initialProjects);
  isLoading = signal<boolean>(true);

  constructor() {
    setTimeout(() => {
      this.isLoading.set(false);
    }, Math.floor(Math.random() * 500) + 500);
  }

  updateProjectProgress(projectId: number): void {
    const currentProjects = [...this.projects()];
    const project = currentProjects.find(p => p.id === projectId);

    if (project && project.tasksCompleted < project.tasksTotal) {
      project.tasksCompleted += Math.floor(Math.random() * 3) + 1;
      if (project.tasksCompleted > project.tasksTotal) {
        project.tasksCompleted = project.tasksTotal;
      }
      this.projects.set(currentProjects);
    }
  }
}
