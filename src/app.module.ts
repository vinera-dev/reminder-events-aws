import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { createValidationPipe } from './appointments/validation.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [HealthModule, AppointmentsModule],
  providers: [{ provide: APP_PIPE, useFactory: createValidationPipe }],
})
export class AppModule {}
