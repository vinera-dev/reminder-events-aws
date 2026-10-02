import { randomUUID } from 'node:crypto';
import { Appointment } from './appointment.js';
import {
  AppointmentCancelledEvent,
  AppointmentCreatedEvent,
  AppointmentRescheduledEvent,
  EVENT_TYPES,
} from '../events/contracts.js';

const snapshot = (appointment: Appointment) => ({
  appointmentId: appointment.id,
  ownerEmail: appointment.ownerEmail,
  petName: appointment.petName,
  service: appointment.service,
  scheduledAt: appointment.scheduledAt.toISOString(),
});

export const appointmentCreated = (
  appointment: Appointment,
  occurredAt: Date,
): AppointmentCreatedEvent => ({
  id: randomUUID(),
  type: EVENT_TYPES.AppointmentCreated,
  version: 1,
  occurredAt: occurredAt.toISOString(),
  data: snapshot(appointment),
});

export const appointmentRescheduled = (
  appointment: Appointment,
  previousScheduledAt: Date,
  occurredAt: Date,
): AppointmentRescheduledEvent => ({
  id: randomUUID(),
  type: EVENT_TYPES.AppointmentRescheduled,
  version: 1,
  occurredAt: occurredAt.toISOString(),
  data: {
    ...snapshot(appointment),
    previousScheduledAt: previousScheduledAt.toISOString(),
  },
});

export const appointmentCancelled = (
  appointment: Appointment,
  occurredAt: Date,
): AppointmentCancelledEvent => ({
  id: randomUUID(),
  type: EVENT_TYPES.AppointmentCancelled,
  version: 1,
  occurredAt: occurredAt.toISOString(),
  data: {
    appointmentId: appointment.id,
    scheduledAt: appointment.scheduledAt.toISOString(),
  },
});
