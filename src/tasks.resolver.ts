import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Task } from './task.model';
import { TaskService } from './task.service';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

/**
 * Resolver for Task GraphQL queries and mutations.
 */
@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Retrieves all tasks.
   * @returns An array of tasks.
   */
  @Query(() => [Task], { name: 'tasks' })
  getTasks(): Task[] {
    return this.taskService.findAll();
  }

  /**
   * Retrieves a specific task by ID.
   * @param id The ID of the task to retrieve.
   * @returns The requested task.
   */
  @Query(() => Task, { name: 'task' })
  getTask(@Args('id') id: string): Task {
    return this.taskService.findOne(id);
  }

  /**
   * Creates a new task.
   * @param createTaskInput Data for the new task.
   * @returns The newly created task.
   */
  @Mutation(() => Task)
  createTask(@Args('createTaskInput') createTaskInput: CreateTaskInput): Task {
    return this.taskService.create(createTaskInput);
  }

  /**
   * Updates an existing task.
   * @param updateTaskInput Data to update the task.
   * @returns The updated task.
   */
  @Mutation(() => Task)
  updateTask(@Args('updateTaskInput') updateTaskInput: UpdateTaskInput): Task {
    return this.taskService.update(updateTaskInput);
  }

  /**
   * Resolves the ID field for the Task type.
   * @param task The parent task object.
   * @returns The mapped task ID.
   */
  @ResolveField(() => String, { name: 'id' })
  resolveId(@Parent() task: Task): string {
    return task.task_id;
  }
}
