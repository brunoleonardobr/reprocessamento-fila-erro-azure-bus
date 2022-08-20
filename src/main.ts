import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AzureBusServer } from './pagamento/azure-bus-server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice(
    {
      strategy: new AzureBusServer(),
    },
    { inheritAppConfig: true },
  );
  app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
