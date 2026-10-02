import { z } from 'zod';
import { AppointmentService } from '../appointments/appointment-service.enum.js';

export const EVENT_TYPES = {
  AppointmentCreated: 'appointment.created',
  AppointmentRescheduled: 'appointment.rescheduled',
  AppointmentCancelled: 'appointment.cancelled',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

const timestamp = z.iso.datetime({ offset: false });

const envelope = <TType extends EventType, TShape extends z.ZodRawShape>(
  type: TType,
  data: TShape,
) =>
  z.object({
    id: z.uuid(),
    type: z.literal(type),
    version: z.literal(1),
    occurredAt: timestamp,
    data: z.object(data),
  });

const appointmentSnapshot = {
  appointmentId: z.uuid(),
  ownerEmail: z.email(),
  petName: z.string().min(1),
  service: z.enum(AppointmentService),
  scheduledAt: timestamp,
};

export const appointmentCreatedSchema = envelope(
  EVENT_TYPES.AppointmentCreated,
  appointmentSnapshot,
);

export const appointmentRescheduledSchema = envelope(
  EVENT_TYPES.AppointmentRescheduled,
  { ...appointmentSnapshot, previousScheduledAt: timestamp },
);

export const appointmentCancelledSchema = envelope(
  EVENT_TYPES.AppointmentCancelled,
  { appointmentId: z.uuid(), scheduledAt: timestamp },
);

export const domainEventSchema = z.discriminatedUnion('type', [
  appointmentCreatedSchema,
  appointmentRescheduledSchema,
  appointmentCancelledSchema,
]);

export type AppointmentCreatedEvent = z.infer<typeof appointmentCreatedSchema>;
export type AppointmentRescheduledEvent = z.infer<
  typeof appointmentRescheduledSchema
>;
export type AppointmentCancelledEvent = z.infer<
  typeof appointmentCancelledSchema
>;
export type DomainEvent = z.infer<typeof domainEventSchema>;
