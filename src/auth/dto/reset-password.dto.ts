import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, Length, MinLength } from "class-validator";

@InputType()
export class ResetPasswordDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(6, 6, { message: "Kod noto'g'ri" })
  otpCode: string;

  @Field()
  @MinLength(8, { message: "Yangi parol kamida 8 ta belgidan iborat bo'lsin" })
  newPassword: string;
}