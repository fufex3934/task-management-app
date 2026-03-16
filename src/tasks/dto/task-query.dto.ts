import { IsOptional } from 'class-validator';
import { TaskStatus } from '../enums/task.enum';

export class TaskQueryDto {
  @IsOptional()
  status?: TaskStatus;
}
