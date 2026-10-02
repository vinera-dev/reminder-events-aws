import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module.js';
import { AppointmentsController } from './appointments.controller.js';
import { AppointmentsRepository } from './appointments.repository.js';
import { AppointmentsService } from './appointments.service.js';
import { Clock, SystemClock } from './clock.js';
import { InMemoryAppointmentsRepository } from './in-memory-appointments.repository.js';

@Module({
  imports: [EventsModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    {
      provide: AppointmentsRepository,
      useClass: InMemoryAppointmentsRepository,
    },
    { provide: Clock, useClass: SystemClock },
  ],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
