import { AppointmentService } from './appointment-service.enum.js';

export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Cancelled = 'cancelled',
}

export interface Appointment {
  id: string;
  ownerName: string;
  ownerEmail: string;
  petName: string;
  service: AppointmentService;
  scheduledAt: Date;
  status: AppointmentStatus;
}
