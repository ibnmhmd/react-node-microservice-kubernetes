import { ITicketUpdatedEvent, Listener, Subjects } from "@ticko/common";
import { queueGroupName } from "../../constants";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<ITicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: ITicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByIdAndPrevVersion(data);
        if(!ticket){
            throw new Error('No ticket found');
        }

        const { title , price  } = data;
        ticket.set({ title , price  });
        ticket.save();
        msg.ack();
    }
}