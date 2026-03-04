import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthEntity } from './entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity]),
TypeOrmModule.forFeature([AuthEntity]),
    (JwtModule.register({
      global: true,
      secret: String(process.env.SECRET),
      signOptions: { expiresIn: "1d" },
    }))],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
