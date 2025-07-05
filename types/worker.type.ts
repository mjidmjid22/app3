
// types/worker.type.ts

export interface Worker {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber?: string;
  idCardNumber: string;
  dailyRate: number;
  hourlyRate: number;
  position: string;
  startDate: Date;
  isChecked?: boolean;
  isPaid?: boolean;
  presentDates?: string[];
  hoursWorked?: number;
  email: string;
  phone: string;
}
