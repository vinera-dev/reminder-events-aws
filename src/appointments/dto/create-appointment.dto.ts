import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { IsScheduledAt } from './scheduled-at.js';
import { AppointmentService } from '../appointment-service.enum.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateAppointmentDto {
  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(80)
  ownerName: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(120)
  ownerEmail: string;

  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(80)
  petName: string;

  @IsEnum(AppointmentService)
  service: AppointmentService;

  @IsScheduledAt()
  scheduledAt: string;
}
