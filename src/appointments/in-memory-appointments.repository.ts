import { Injectable } from '@nestjs/common';
import { Appointment, AppointmentStatus } from './appointment.js';
import { AppointmentsRepository } from './appointments.repository.js';

@Injectable()
export class InMemoryAppointmentsRepository extends AppointmentsRepository {
  private readonly items = new Map<string, Appointment>();

  save(appointment: Appointment): Promise<Appointment> {
    this.items.set(appointment.id, { ...appointment });
    return Promise.resolve({ ...appointment });
  }

  findById(id: string): Promise<Appointment | undefined> {
    const found = this.items.get(id);
    return Promise.resolve(found ? { ...found } : undefined);
  }

  findScheduledAt(scheduledAt: Date): Promise<Appointment | undefined> {
    const found = [...this.items.values()].find(
      (item) =>
        item.status === AppointmentStatus.Scheduled &&
        item.scheduledAt.getTime() === scheduledAt.getTime(),
    );
    return Promise.resolve(found ? { ...found } : undefined);
  }
}
