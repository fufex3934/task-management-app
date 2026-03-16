import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ConfigService } from 'config/config.service';

@Module({
  providers: [TasksService, ConfigService],
  controllers: [TasksController],
})
export class TasksModule {}
