import { InputType, Field } from '@nestjs/graphql';
import { TaskStatus } from '../task.model';

/**
 * Input type for creating a new task.
 */
@InputType()
export class CreateTaskInput {
  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field()
  assigned_user!: string;

  @Field()
  project_id!: string;
}
