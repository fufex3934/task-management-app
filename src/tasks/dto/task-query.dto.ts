import { IsOptional } from 'class-validator';
import { TaskStatus } from './update-task.dto';

export class TaskQueryDto {
  @IsOptional()
  status?: TaskStatus;
}
