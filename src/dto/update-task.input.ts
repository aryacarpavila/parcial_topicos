import { InputType, Field, ID } from '@nestjs/graphql';
import { TaskStatus } from '../task.model';

/**
 * Input type for updating an existing task.
 */
@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  assigned_user?: string;

  @Field({ nullable: true })
  project_id?: string;
}
