import { Task } from 'src/tasks/entities/task.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 255,
    type: 'varchar',
    unique: true,
  })
  email: string;

  @Column({
    length: 50,
    type: 'varchar',
  })
  username: string;

  @Column({
    type: 'char',
    length: 60, // bcrypt hash length
    select: false,
  })
  @Exclude() // Exclude password from serialization (e.g., when returning user data in API responses)
  password: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };

  @Column({
    type: 'simple-array',
  })
  roles: string[] = ['user'];

  @OneToMany(() => Task, (task) => task.user, { eager: false })
  tasks: Task[];

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;

  @Column({
    name: 'last_login',
    type: 'timestamp',
    nullable: true,
  })
  lastLogin: Date;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'refresh_token',
    type: 'text',
    nullable: true,
    select: false,
  })
  @Exclude()
  refreshToken: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
