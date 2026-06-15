import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CardModule } from './card/card.module';
import { auth } from './auth/auth';
import { toNodeHandler } from 'better-auth/node';
import { ConfigModule } from '@nestjs/config';

const handler = toNodeHandler(auth);

@Module({
  imports: [CardModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: any, res: any, next: any) => {
        const url: string = req.originalUrl ?? req.url ?? '';
        if (url.startsWith('/api/auth')) {
          return handler(req, res);
        }
        next();
      })
      .forRoutes('*');
  }
}
