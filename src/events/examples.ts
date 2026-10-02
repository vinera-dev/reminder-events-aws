import { AppointmentService } from '../appointments/appointment-service.enum.js';
import {
  AppointmentCancelledEvent,
  AppointmentCreatedEvent,
  AppointmentRescheduledEvent,
} from './contracts.js';

export const createdExample: AppointmentCreatedEvent = {
  id: '6f1d3c52-8a0e-4b0f-9d57-2c1f6d9a4e11',
  type: 'appointment.created',
  version: 1,
  occurredAt: '2030-05-01T10:00:00.000Z',
  data: {
    appointmentId: '0b6a4a0e-52c4-4f2b-bb1b-7a3b3b1e9c01',
    ownerEmail: 'ana@example.com',
    petName: 'Thor',
    service: AppointmentService.Consultation,
    scheduledAt: '2030-05-10T14:00:00.000Z',
  },
};

export const rescheduledExample: AppointmentRescheduledEvent = {
  id: '9a2c0f64-1d3b-4c8e-8f10-5e7d2b6a3c22',
  type: 'appointment.rescheduled',
  version: 1,
  occurredAt: '2030-05-02T09:30:00.000Z',
  data: {
    appointmentId: '0b6a4a0e-52c4-4f2b-bb1b-7a3b3b1e9c01',
    ownerEmail: 'ana@example.com',
    petName: 'Thor',
    service: AppointmentService.Consultation,
    scheduledAt: '2030-05-11T09:00:00.000Z',
    previousScheduledAt: '2030-05-10T14:00:00.000Z',
  },
};

export const cancelledExample: AppointmentCancelledEvent = {
  id: 'c4e8a7b1-3f5d-4a6c-9b20-8d1e0f2a7b33',
  type: 'appointment.cancelled',
  version: 1,
  occurredAt: '2030-05-03T16:45:00.000Z',
  data: {
    appointmentId: '0b6a4a0e-52c4-4f2b-bb1b-7a3b3b1e9c01',
    scheduledAt: '2030-05-11T09:00:00.000Z',
  },
};
