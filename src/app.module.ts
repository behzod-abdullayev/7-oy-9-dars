import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './auth/entities/auth.entity';
import { ConfigModule } from '@nestjs/config';

@Module({

  imports: [
    ConfigModule.forRoot({envFilePath: ".env", isGlobal: true}),
    TypeOrmModule.forRoot({
      type: "postgres",
      username: "postgres",
      host: "localhost",
      port: 5432,
      database: String(process.env.DB_NAME),
      password: String(process.env.DB_PASSWORD),
      entities: [AuthEntity],
      autoLoadEntities: true,
      synchronize: true,
      logging: false
    }),
    AuthModule, GraphQLModule.forRoot<ApolloDriverConfig>({
    playground: true,
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), "src/schema.gql")
  })

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
