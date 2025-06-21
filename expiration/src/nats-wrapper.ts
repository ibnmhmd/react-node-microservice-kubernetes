import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
    private _client?: Stan;
    get client(): Stan {
        if (!this._client) {
            throw new Error('Cannot access NATS client before connecting');
        }
        return this._client;
    }

    connect(clusterId: string, clientId: string, url: string): Promise<void> {
        this._client = nats.connect(clusterId, clientId, { url });
     
        return new Promise((resolve, reject) => {
            this.client['on']('connect', () => {
                console.log(`${process.env.POD_NAME} has successfully connected to NATS server with clientId: ${clientId}`);
                resolve();
            });
            this.client['on']('error', (err) => {
                console.error(`Error connecting ${process.env.POD_NAME} to NATS: ${err}`);
                reject(err);
            });
        });
    }
}

export const natsWrapper = new NatsWrapper();