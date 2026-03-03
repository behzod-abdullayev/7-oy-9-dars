import { InputType, Field } from "@nestjs/graphql";
import { IsNotEmpty, MinLength } from "class-validator";

@InputType()
export class ChangePasswordDto {
  @Field()
  @IsNotEmpty()
  oldPassword: string;

  @Field()
  @MinLength(8)
  newPassword: string;
}