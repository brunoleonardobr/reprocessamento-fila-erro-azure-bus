import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PagamentoModule } from './pagamento/pagamento.module';

@Module({
  imports: [PagamentoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
