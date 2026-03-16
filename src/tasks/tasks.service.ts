/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository, DataSource, Brackets } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './enums/task.enum';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private dataSource: DataSource, // For transactions
  ) {}

  async getAllTasks(filterDto: GetTasksFilterDto): Promise<{
    data: Task[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    // Create query builder for more complex queries
    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    // Apply search
    if (search) {
      // MySQL full-text search (if searchVector is populated)
      // queryBuilder.andWhere('MATCH(task.searchVector) AGAINST (:search IN NATURAL LANGUAGE MODE)', { search });
      // Or use LIKE for simpler searches
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('task.title LIKE :search', {
            search: `%${search}%`,
          }).orWhere('task.description LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const data = await queryBuilder
      .orderBy(`task.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;

    // Create task instance
    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    try {
      // Save to database
      const savedTask = await this.taskRepository.save(task);
      this.logger.log(`Created task with ID ${savedTask.id}`);
      return savedTask;
    } catch (error) {
      this.logger.error(
        `Failed to create task. Data: ${JSON.stringify(createTaskDto)}`,
        error.stack,
      );

      // Handle MySQL specific errors
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Task with this title already exists');
      }

      throw error;
    }
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.getTaskById(id);

    // Update only provided fields
    Object.assign(task, updateTaskDto);

    try {
      const updatedTask = await this.taskRepository.save(task);
      return updatedTask;
    } catch (error) {
      this.logger.error(
        `Failed to update task ${id}. Data: ${JSON.stringify(updateTaskDto)}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.updateTask(id, { status });
  }

  // MySQL specific: Bulk insert with transaction
  async createBulkTasks(createTaskDtos: CreateTaskDto[]): Promise<Task[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tasks: Task[] = [];

      for (const dto of createTaskDtos) {
        const task = this.taskRepository.create(dto);
        const saved = await queryRunner.manager.save(task);
        tasks.push(saved);
      }

      await queryRunner.commitTransaction();
      return tasks;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Bulk insert failed', err.stack);
      throw new BadRequestException('Failed to create bulk tasks');
    } finally {
      await queryRunner.release();
    }
  }

  // MySQL specific: Using raw query for complex operations
  async getTaskStats(): Promise<any> {
    const result = await this.dataSource.query(`
      SELECT 
        status,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM tasks
      GROUP BY status, DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    return result;
  }
}
