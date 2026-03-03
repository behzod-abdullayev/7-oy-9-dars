import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthEntity } from './entities/auth.entity';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
  ) {}

  // 1. register
  async register(dto: RegisterUserDto) {
    const existing = await this.authRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException("Bu email allaqachon mavjud");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const user = this.authRepository.create({
      ...dto,
      password: hashedPassword,
      otpCode,
      otpExpires,
    });
    return await this.authRepository.save(user);
  }

  // 2. verify
  async verify(dto: VerifyDto) {
    const user = await this.authRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

    if (
      user.otpCode !== dto.otpCode || 
      !user.otpExpires || 
      user.otpExpires < new Date()
    ) {
      throw new BadRequestException("Kod noto'g'ri yoki muddati o'tgan");
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    return await this.authRepository.save(user);
  }

  // 3. login
  async login(dto: LoginDto) {
    const user = await this.authRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Email yoki parol xato");

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException("Email yoki parol xato");

    if (!user.isVerified) throw new BadRequestException("Avval hisobingizni tasdiqlang");

    return user; 
  }

  // 4. resend otp
  async resendOtp(dto: ResendOtpDto) {
    const user = await this.authRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

    user.otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    return await this.authRepository.save(user);
  }

  // 5. forgot password
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.authRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException("Email topilmadi");

    user.otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    return await this.authRepository.save(user);
  }

  // 6. reset password
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.authRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

    if (
      user.otpCode !== dto.otpCode || 
      !user.otpExpires || 
      user.otpExpires < new Date()
    ) {
      throw new BadRequestException("Kod noto'g'ri yoki muddati o'tgan");
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.otpCode = null;
    user.otpExpires = null;
    return await this.authRepository.save(user);
  }

  // 7. change password
  async changePassword(dto: ChangePasswordDto) {
    
    const user = await this.authRepository.findOne({ where: { id: 1 } }); 
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");
    
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException("Eski parol noto'g'ri");

    user.password = await bcrypt.hash(dto.newPassword, 10);
    return await this.authRepository.save(user);
  }
}