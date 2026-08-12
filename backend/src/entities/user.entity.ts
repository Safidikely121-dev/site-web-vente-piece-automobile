import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type UserRole =
  | 'vendeur'
  | 'acheteur'
  | 'admin_technique'
  | 'admin_commercial';

export const ADMIN_ROLES: UserRole[] = ['admin_technique', 'admin_commercial'];

export function isAdminRole(role?: string): boolean {
  return ADMIN_ROLES.includes(role as UserRole);
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  pseudo?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ nullable: true })
  adresse?: string;

  @Column({
    type: 'varchar',
    default: 'acheteur',
  })
  role: UserRole;

  @Column({ default: false })
  blocked: boolean;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
