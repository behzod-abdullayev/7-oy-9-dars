import { InputType, Field } from "@nestjs/graphql";
import { IsEmail } from "class-validator";

@InputType()
export class ForgotPasswordDto {
  @Field()
  @IsEmail()
  email: string;
}