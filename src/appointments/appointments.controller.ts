import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Appointment } from './appointment.js';
import { AppointmentsService } from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto.js';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.service.create(dto);
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    return this.service.reschedule(id, dto.scheduledAt);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.service.cancel(id);
  }
}
