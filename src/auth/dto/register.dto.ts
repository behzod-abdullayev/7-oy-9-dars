import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

@InputType()
export class RegisterUserDto {
  @Field()
  @IsNotEmpty({ message: "Username bo'sh bo'lmasligi kerak" })
  username: string;

  @Field()
  @IsEmail({}, { message: "Email formati noto'g'ri" })
  email: string;

  @Field()
  @MinLength(8, { message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" })
  password: string;
}