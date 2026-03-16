import { TaskStatus } from '../dto/update-task.dto';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
}
