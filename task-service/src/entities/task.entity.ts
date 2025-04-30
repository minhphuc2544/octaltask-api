// src/task/entities/task.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from './user.entity'

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column({ nullable: true })
  description?: string

  @Column({ default: false })
  isCompleted: boolean

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user: User
  createdBy: any
}
