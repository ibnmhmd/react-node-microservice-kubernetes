import { Publisher } from './base-publisher';
import { ITicketCreatedEvent } from '../interface/ticket-created.interface';
import { Subjects } from '../enum/subjects.enum';

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;

    async publish(data: ITicketCreatedEvent['data']): Promise<void> {
        await super.publish(data);
    }
}