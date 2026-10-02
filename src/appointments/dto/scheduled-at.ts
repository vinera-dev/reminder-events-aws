import { applyDecorators } from '@nestjs/common';
import { IsISO8601, Matches } from 'class-validator';

const DATE_TIME_WITH_ZONE = /T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

export const IsScheduledAt = () =>
  applyDecorators(
    IsISO8601({ strict: true, strictSeparator: true }),
    Matches(DATE_TIME_WITH_ZONE, {
      message: 'scheduledAt must include a time and a UTC offset',
    }),
  );
