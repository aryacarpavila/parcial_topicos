import { InputType, Field } from '@nestjs/graphql';

/**
 * Input type for creating a new task.
 */
@InputType()
export class CreateTaskInput {
  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field()
  assigned_user!: string;

  @Field()
  project_id!: string;
}
