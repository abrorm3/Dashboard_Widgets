import {Project, ProjectStatus} from '../models/project.model';

export function getProjectStatus(project: Project): ProjectStatus {
  const now = new Date();
  const endDate = new Date(project.endDate);
  const startDate = new Date(project.startDate);

  if (project.tasksCompleted === project.tasksTotal) {
    return ProjectStatus.COMPLETED;
  }

  if (now < startDate) {
    return ProjectStatus.NOT_STARTED;
  }

  if (now > endDate) {
    return ProjectStatus.OVERDUE;
  }

  return ProjectStatus.IN_PROGRESS;
}

export function getProjectProgress(project: Project): number {
  return (project.tasksCompleted / project.tasksTotal) * 100;
}
