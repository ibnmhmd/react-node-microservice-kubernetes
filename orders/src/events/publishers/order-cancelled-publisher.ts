
import { OrderCancelledEvent, Publisher, Subjects } from "@ticko/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

    async publish(data: OrderCancelledEvent['data']): Promise<void> {
        await super.publish(data);
    }
}