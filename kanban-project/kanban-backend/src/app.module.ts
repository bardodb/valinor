import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { KanbanResolver } from './graphql/kanban.resolver';
import { KanbanService } from './services/kanban.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      debug: true,
      introspection: true,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
        numberScalarMode: 'float',
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService, KanbanResolver, KanbanService],
})
export class AppModule {}
