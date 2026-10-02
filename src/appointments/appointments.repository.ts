import { Appointment } from './appointment.js';

export abstract class AppointmentsRepository {
  abstract save(appointment: Appointment): Promise<Appointment>;
  abstract findById(id: string): Promise<Appointment | undefined>;
  abstract findScheduledAt(scheduledAt: Date): Promise<Appointment | undefined>;
}
