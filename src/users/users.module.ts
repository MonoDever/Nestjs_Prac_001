import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './Repositories/userRepository.entity';
import { EmailModule } from 'src/email/email.module';
import { UserDirectory } from './Repositories/userDirectory.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserRepository,UserDirectory]),EmailModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports:[UsersService]
})
export class UsersModule { }
