import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { AuthEntity, AuthResponse } from "./entities/auth.entity";
import { RegisterUserDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyDto } from "./dto/verify.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import * as nodemailer from "nodemailer";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  constructor(
    @InjectRepository(AuthEntity) private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "behzod2366@gmail.com",
        pass: process.env.APP_KEY,
      },
    });
  }

  // 1. REGISTER
  async register(createAuthDto: RegisterUserDto): Promise<AuthEntity> {
    try {
      const { username, email, password } = createAuthDto;
      const foundUser = await this.authRepository.findOne({ where: { email } });

      if (foundUser) throw new BadRequestException("Email allaqachon mavjud");

      const hashpassword = await bcrypt.hash(password, 10);
      const code = Math.floor(100000 + Math.random() * 900000);
      
      // VAQT: Millisekundda saqlaymiz
      const otpExpires = Date.now() + 120000; // 2 daqiqa

      await this.transporter.sendMail({
        from: "behzod2366@gmail.com",
        to: email,
        subject: "Tasdiqlash kodi",
        text: `Akkauntingizni tasdiqlashingiz uchun kod: ${code}`,
        html: `<h1>${code}</h1>`,
      });

      const user = this.authRepository.create({
        username,
        email,
        password: hashpassword,
        otpCode: String(code),
        otpExpires: otpExpires, // Raqam ketyapti
      });

      return await this.authRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

// 2. VERIFY
async verify(verifyAuthDto: VerifyDto): Promise<AuthResponse> {
  try {
    const { email, otpCode } = verifyAuthDto;
    const foundUser = await this.authRepository.findOne({ where: { email } });

    if (!foundUser) throw new BadRequestException("User not found");

    const currentTime = Date.now();
    const expiryTime = Number(foundUser.otpExpires);

    if (foundUser.otpCode !== otpCode || currentTime > expiryTime) {
      throw new BadRequestException("Kod noto'g'ri yoki muddati o'tgan");
    }

    await this.authRepository.update(foundUser.id, { 
      otpCode: "", 
      otpExpires: null, 
      isVerified: true 
    });

    const payload = { id: foundUser.id, email: foundUser.email, role: foundUser.role };
    const access_token = await this.jwtService.signAsync(payload);

    return { 
      access_token, 
      user: foundUser 
    };
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new InternalServerErrorException(error.message);
  }
}

 // 3. LOGIN
async login(dto: LoginDto): Promise<AuthResponse> {
  const user = await this.authRepository.findOne({ where: { email: dto.email } });
  if (!user) throw new UnauthorizedException("Email yoki parol xato");

  const isMatch = await bcrypt.compare(dto.password, user.password);
  if (!isMatch) throw new UnauthorizedException("Email yoki parol xato");

  if (!user.isVerified) throw new BadRequestException("Avval hisobingizni tasdiqlang");

  const payload = { id: user.id, email: user.email, role: user.role };
  const access_token = await this.jwtService.signAsync(payload);

  return { access_token, user };
}

 // 4. RESEND OTP
  async resendOtp(dto: ResendOtpDto) {
    const { email } = dto;
    const user = await this.authRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

    const code = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 300000;

    await this.transporter.sendMail({
      from: "behzod2366@gmail.com",
      to: email,
      subject: "Yangi tasdiqlash kodi",
      html: `<h1>${code}</h1>`,
    });

    user.otpCode = String(code);
    user.otpExpires = otpExpires;
    return await this.authRepository.save(user);
  }

// 5. forgot password
  async forgotPassword(dto: ForgotPasswordDto) {
    const {email} = dto
    const user = await this.authRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException("Email topilmadi");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = code;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    
    await this.authRepository.save(user);

    try {
      await this.transporter.sendMail({
      from: "behzod2366@gmail.com",
      to: email,
      subject: "Yangi tasdiqlash kodi",
      html: `<h1>${code}</h1>`,
    });
    } catch (error) {
      throw new InternalServerErrorException("Email yuborishda xatolik yuz berdi");
    }

    return user;
  }

  // 5. RESET PASSWORD 
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.authRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

    const currentTime = Date.now();
    const expiryTime = Number(user.otpExpires);

    if (user.otpCode !== dto.otpCode || currentTime > expiryTime) {
      throw new BadRequestException("Kod noto'g'ri yoki muddati o'tgan");
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.otpCode = "";
    user.otpExpires = null;
    return await this.authRepository.save(user);
  }

 // 7. change password
  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.authRepository.findOne({ where: { id } }); 
    
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException("Eski parol noto'g'ri");

    user.password = await bcrypt.hash(dto.newPassword, 10);
    return await this.authRepository.save(user);
  }
}
