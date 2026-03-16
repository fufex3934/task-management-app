import { Injectable } from '@nestjs/common';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './enums/task.enum';
import { ConfigService } from 'config/config.service';

@Injectable()
export class TasksService {
  constructor(private configService: ConfigService) {}
  private tasks: Task[] = [];

  getAllTasks(status?: TaskStatus): Task[] {
    if (status) {
      return this.tasks.filter((task) => task.status === status);
    }
    return this.tasks;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const task: Task = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      id: uuidv4(),
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: TaskStatus.OPEN,
      createdAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  updateTask(id: string, updateTaskDto: UpdateTaskDto): Task | undefined {
    const task = this.getTaskById(id);
    if (task) {
      task.title = updateTaskDto.title ?? task.title;
      task.description = updateTaskDto.description ?? task.description;
      task.status = updateTaskDto.status ?? task.status;
      return task;
    }
    return undefined;
  }
  deleteTask(id: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }
}
