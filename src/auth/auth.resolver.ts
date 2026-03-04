import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthEntity } from './entities/auth.entity';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Resolver(() => AuthEntity)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String, { name: 'sayHello' })
  sayHello() {
    return 'Auth resolver is working!';
  }

  @Mutation(() => AuthEntity)
  registerAuth(@Args('registerInput') registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Mutation(() => AuthEntity)
  loginAuth(@Args('loginInput') loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Mutation(() => AuthEntity)
  verifyAuth(@Args('verifyInput') verifyDto: VerifyDto) {
    return this.authService.verify(verifyDto);
  }

  @Mutation(() => AuthEntity)
  resendOtpAuth(@Args('resendOtpInput') resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Mutation(() => AuthEntity)
  forgotPasswordAuth(@Args('forgotPasswordInput') forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Mutation(() => AuthEntity)
  resetPasswordAuth(@Args('resetPasswordInput') resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Mutation(() => AuthEntity)
  changePasswordAuth(@Args('changePasswordInput') changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }
}