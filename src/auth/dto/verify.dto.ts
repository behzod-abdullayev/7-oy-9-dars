import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, Length } from "class-validator";

@InputType()
export class VerifyDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(6, 6, { message: "Tasdiqlash kodi 6 xonali bo'lishi kerak" })
  otpCode: string;
}