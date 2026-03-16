import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getAllTasks(status?: TaskQueryDto): Task[] {
    return this.tasksService.getAllTasks(status?.status);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.createTask(createTaskDto);
  }

  @Get(':id')
  getTaskById(id: string): Task | undefined {
    return this.tasksService.getTaskById(id);
  }

  @Patch(':id')
  updateTask(
    id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Task | undefined {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  deleteTask(id: string): void {
    return this.tasksService.deleteTask(id);
  }
}
