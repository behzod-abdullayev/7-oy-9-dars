import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty } from "class-validator";

@InputType()
export class LoginDto {
  @Field()
  @IsEmail({}, { message: "Email noto'g'ri" })
  email: string;

  @Field()
  @IsNotEmpty({ message: "Parol kiritilishi shart" })
  password: string;
}