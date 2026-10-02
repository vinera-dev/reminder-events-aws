import { AppointmentService } from '../appointments/appointment-service.enum.js';

export const EVENT_TYPES = {
  AppointmentCreated: 'appointment.created',
  AppointmentRescheduled: 'appointment.rescheduled',
  AppointmentCancelled: 'appointment.cancelled',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export interface EventEnvelope<TType extends EventType, TData> {
  id: string;
  type: TType;
  version: 1;
  occurredAt: string;
  data: TData;
}

export interface AppointmentSnapshot {
  appointmentId: string;
  ownerEmail: string;
  petName: string;
  service: AppointmentService;
  scheduledAt: string;
}

export type AppointmentCreatedEvent = EventEnvelope<
  typeof EVENT_TYPES.AppointmentCreated,
  AppointmentSnapshot
>;

export type AppointmentRescheduledEvent = EventEnvelope<
  typeof EVENT_TYPES.AppointmentRescheduled,
  AppointmentSnapshot & { previousScheduledAt: string }
>;

export type AppointmentCancelledEvent = EventEnvelope<
  typeof EVENT_TYPES.AppointmentCancelled,
  { appointmentId: string; scheduledAt: string }
>;

export type DomainEvent =
  | AppointmentCreatedEvent
  | AppointmentRescheduledEvent
  | AppointmentCancelledEvent;
