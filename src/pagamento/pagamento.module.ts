import { Module } from '@nestjs/common';
import { AzureBusClient } from './azure-bus-client';
import { PagamentoController } from './pagamento.controller';

@Module({
  controllers: [PagamentoController],
  providers: [AzureBusClient],
})
export class PagamentoModule {}
