
import { Subjects, ITicketCreatedEvent , Publisher } from "@ticko/common";

class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;

    async publish(data: ITicketCreatedEvent['data']): Promise<void> {
        await super.publish(data);
    }
}
export { TicketCreatedPublisher };

