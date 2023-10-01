import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { Connection } from 'typeorm';
import connectOptions from '../ormconfig'
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(connectOptions), UsersModule,ConfigModule.forRoot(), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // constructor(private readonly connection: Connection) {}
} 
