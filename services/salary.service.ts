
// services/salary.service.ts

import { Worker } from '../types/worker.type';

export const calculateSalary = (worker: Worker, hoursWorked: number): number => {
  // This is a placeholder for salary calculation logic.
  // In a real app, you would have more complex logic to calculate salary,
  // including overtime, bonuses, and deductions.
  const salary = worker.hourlyRate * hoursWorked;
  return salary;
};
