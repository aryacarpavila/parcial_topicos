import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

/**
 * Service to manage tasks operations.
 */
@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private tasks: Task[] = [];

  /**
   * Retrieves all tasks.
   * @returns An array of tasks.
   */
  findAll(): Task[] {
    this.logger.log('Retrieving all tasks');
    return this.tasks;
  }

  /**
   * Retrieves a task by its ID.
   * @param id The unique identifier of the task.
   * @returns The found task.
   */
  findOne(id: string): Task {
    this.logger.log(`Retrieving task with id: ${id}`);
    const task = this.tasks.find((t) => t.task_id === id);
    if (!task) {
      this.logger.error(`Task with id ${id} not found`);
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  /**
   * Creates a new task.
   * @param createTaskInput The data to create the task.
   * @returns The created task.
   */
  create(createTaskInput: CreateTaskInput): Task {
    this.logger.log(`Creating a new task with title: ${createTaskInput.title}`);
    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newTask: Task = {
      task_id: shortId,
      title: createTaskInput.title,
      description: createTaskInput.description,
      status: createTaskInput.status ?? TaskStatus.BACKLOG,
      tags: createTaskInput.tags || [],
      created_at: new Date().toISOString(),
      assigned_user: createTaskInput.assigned_user,
      project_id: createTaskInput.project_id,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  /**
   * Updates an existing task.
   * @param updateTaskInput The data to update the task.
   * @returns The updated task.
   */
  update(updateTaskInput: UpdateTaskInput): Task {
    this.logger.log(`Updating task with id: ${updateTaskInput.id}`);
    const task = this.findOne(updateTaskInput.id);

    if (updateTaskInput.title !== undefined) task.title = updateTaskInput.title;
    if (updateTaskInput.description !== undefined)
      task.description = updateTaskInput.description;
    if (updateTaskInput.status !== undefined)
      task.status = updateTaskInput.status;
    if (updateTaskInput.tags !== undefined) task.tags = updateTaskInput.tags;
    if (updateTaskInput.assigned_user !== undefined)
      task.assigned_user = updateTaskInput.assigned_user;
    if (updateTaskInput.project_id !== undefined)
      task.project_id = updateTaskInput.project_id;

    return task;
  }
}
