import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
    title: string;
    price: number;
    id: string;
    version: number;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByIdAndPrevVersion(event: { id: string , version : number }) : Promise<TicketDoc | null >;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin);
ticketSchema.statics.findByIdAndPrevVersion = (event : { id: string, version: number}) => {
    return Ticket.findOne({ _id: event.id , version: event?.version-1 });
}
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({ _id: attrs.id , title: attrs?.title , price: attrs?.price });
};

ticketSchema.methods.isReserved = async function () {
    // Placeholder for the actual logic to check if the ticket is reserved
    // This should query the database to see if there are any orders with this ticket
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [OrderStatus.Created, OrderStatus.AwaitingPayment , OrderStatus.Complete], // Adjust based on your OrderStatus enum
        },
    });
    return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };