import { ObjectType, Field, Int, HideField } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
@ObjectType()
export class AuthEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ unique: true, type: 'varchar' })
  @Field()
  username: string;

  @Column({ unique: true, type: 'varchar' })
  @Field()
  email: string;
  
  @Column({ type: 'varchar' })
  @HideField()
  password: string;

  @Column({ default: false })
  @Field()
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  otpCode?: string;

  @Column({ type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  otpExpires?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  updatedAt: Date;
}