import { IsEnum, IsOptional } from 'class-validator';

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class UpdateTaskDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
