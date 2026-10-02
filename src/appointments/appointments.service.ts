import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Appointment, AppointmentStatus } from './appointment.js';
import { EventPublisher } from '../events/event-publisher.js';
import {
  appointmentCancelled,
  appointmentCreated,
  appointmentRescheduled,
} from './appointment-events.js';
import { AppointmentsRepository } from './appointments.repository.js';
import { Clock } from './clock.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly repository: AppointmentsRepository,
    private readonly clock: Clock,
    private readonly events: EventPublisher,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const scheduledAt = await this.requireFreeFutureSlot(dto.scheduledAt);
    const saved = await this.repository.save({
      id: randomUUID(),
      ownerName: dto.ownerName,
      ownerEmail: dto.ownerEmail,
      petName: dto.petName,
      service: dto.service,
      scheduledAt,
      status: AppointmentStatus.Scheduled,
    });
    await this.events.publish(appointmentCreated(saved, this.clock.now()));
    return saved;
  }

  async reschedule(id: string, newScheduledAt: string): Promise<Appointment> {
    const appointment = await this.requireScheduled(id);
    const scheduledAt = await this.requireFreeFutureSlot(newScheduledAt, id);
    const saved = await this.repository.save({ ...appointment, scheduledAt });
    await this.events.publish(
      appointmentRescheduled(saved, appointment.scheduledAt, this.clock.now()),
    );
    return saved;
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.requireScheduled(id);
    const saved = await this.repository.save({
      ...appointment,
      status: AppointmentStatus.Cancelled,
    });
    await this.events.publish(appointmentCancelled(saved, this.clock.now()));
    return saved;
  }

  private async requireScheduled(id: string): Promise<Appointment> {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }
    if (appointment.status === AppointmentStatus.Cancelled) {
      throw new ConflictException(`Appointment ${id} is already cancelled`);
    }
    return appointment;
  }

  private async requireFreeFutureSlot(
    isoDate: string,
    ignoreId?: string,
  ): Promise<Date> {
    const scheduledAt = new Date(isoDate);
    if (scheduledAt.getTime() <= this.clock.now().getTime()) {
      throw new BadRequestException(
        'Appointments cannot be scheduled in the past',
      );
    }
    const taken = await this.repository.findScheduledAt(scheduledAt);
    if (taken && taken.id !== ignoreId) {
      throw new ConflictException('That time slot is already booked');
    }
    return scheduledAt;
  }
}
