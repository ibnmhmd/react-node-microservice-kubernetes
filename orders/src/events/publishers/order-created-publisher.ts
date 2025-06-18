import { OrderCreatedEvent, OrderStatus, Publisher, Subjects } from "@ticko/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    async publish(data: OrderCreatedEvent['data']): Promise<void> {
        await super.publish(data);
    }
}