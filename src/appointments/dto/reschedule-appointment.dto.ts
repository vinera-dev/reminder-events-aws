import { IsScheduledAt } from './scheduled-at.js';

export class RescheduleAppointmentDto {
  @IsScheduledAt()
  scheduledAt: string;
}
