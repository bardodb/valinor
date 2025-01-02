import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { KanbanResolver } from './graphql/kanban.resolver';
import { KanbanService } from './services/kanban.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      debug: true,
      path: '/graphql',
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
          onConnect: (context) => {
            console.log('Client connected to WebSocket');
            return true;
          },
          onDisconnect: (context) => {
            console.log('Client disconnected from WebSocket');
          }
        }
      },
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
        numberScalarMode: 'float',
      }
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    KanbanResolver, 
    KanbanService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    }
  ],
})
export class AppModule {}
