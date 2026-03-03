import { InputType, Field } from "@nestjs/graphql";
import { IsEmail } from "class-validator";

@InputType()
export class ResendOtpDto {
  @Field()
  @IsEmail()
  email: string;
}