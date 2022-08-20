import { ServiceBusClient } from '@azure/service-bus';
import {
  CustomTransportStrategy,
  Server,
  Transport,
} from '@nestjs/microservices';

export class AzureBusServer extends Server implements CustomTransportStrategy {
  transportId?: symbol | Transport;
  private serviceBusClient: ServiceBusClient;

  listen(callback: (...optionalParams: unknown[]) => any) {
    this.serviceBusClient = new ServiceBusClient(
      'Endpoint=sb://brunoleonardo.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=v9bsXtjsnZQ6qCKiy8UiEPQgsTIzo2w9LIsujh4SeXI=',
    );
    this.messageHandlers.forEach((handle, topic) => {
      const receiver = this.serviceBusClient.createReceiver(
        topic,
        'ms-logistica',
      );
      receiver.subscribe(
        {
          processMessage: async (message) => {
            await handle({ message, receiver });
          },
          processError: async (err) => {
            console.log(err);
          },
        },
        { autoCompleteMessages: false },
      );
    });
    callback();
  }
  close() {
    this.serviceBusClient.close();
  }
}
