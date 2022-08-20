import { ServiceBusClient } from '@azure/service-bus';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AzureBusClient } from 'src/pagamento/azure-bus-client';

@Controller('pagamento')
export class PagamentoController {
  private serviceBusClient: ServiceBusClient;

  constructor(private readonly azurebusClient: AzureBusClient) {
    this.serviceBusClient = new ServiceBusClient('<credencial azure>');
  }

  @EventPattern('topico-faturamento')
  async processaPagamento(@Payload() event) {
    const { receiver, message } = event;

    try {
      throw new Error('essse erro');

      console.log('Processando pagamento', message.body);
      await this.sleep();

      console.log('Pagamento processado com sucesso', message.body);

      this.azurebusClient.emit('fila-pagamento-result', {
        ...message.body,
        pagamento: Math.floor(Math.random() * 1000),
      });

      await receiver.completeMessage(message);
    } catch (error) {
      const tentativasFila = message.deliveryCount;
      const tentativasAgendamento = message.body.attempts;
      const tentativas = tentativasAgendamento
        ? tentativasAgendamento
        : tentativasFila;

      if (tentativas < 2) {
        console.log('voltar fila - tentativas:', tentativas);
        await receiver.abandonMessage(message);
      }

      if (tentativas >= 2 && tentativas < 5) {
        message.body.attempts = tentativas + 1;
        console.log('agendamento - tentativas agendamento:', tentativas);
        const agendamento = new Date(Date.now() + 2 * 1000);

        const sender = this.serviceBusClient.createSender('topico-faturamento');
        await sender.scheduleMessages(message, agendamento);

        await this.azurebusClient.scheduleMessages(
          'fila-pagamento',
          message.body,
          agendamento,
        );
        await receiver.completeMessage(message);
      }

      if (tentativas >= 5) {
        console.log('fila morta - tentativas fila:', tentativas);
        await receiver.deadLetterMessage(message);

        this.azurebusClient.emit('fila-pagamento-result', {
          message: 'Occoreu um erro no processamento do pagamento',
        });
      }
    }
  }

  private sleep() {
    return new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
}
