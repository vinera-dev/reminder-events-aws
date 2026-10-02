import { Module } from '@nestjs/common';
import { EventPublisher } from './event-publisher.js';
import { InMemoryEventPublisher } from './in-memory-event-publisher.js';

@Module({
  providers: [{ provide: EventPublisher, useClass: InMemoryEventPublisher }],
  exports: [EventPublisher],
})
export class EventsModule {}
