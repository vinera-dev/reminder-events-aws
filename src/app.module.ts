import { Module } from '@nestjs/common';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [HealthModule, AppointmentsModule],
})
export class AppModule {}
