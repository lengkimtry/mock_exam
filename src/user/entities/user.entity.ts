
import { Role } from "src/enums/role.enum";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
    save() {
      throw new Error('Method not implemented.');
    }
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'first_name', length: 25, nullable: true })
    firstName: string;

    @Column({ name: 'last_name', length: 25, nullable: true })
    lastName: string;

    @Column({ name: 'email', length: 50, unique: true, nullable: true })
    email: string;

    @Column({ name: 'password', length: 125, nullable: true })
    password?: string;

    @Column({ type: 'varchar', length: 125, unique: true })
    username: string;

    @Column({ name: 'facebook_id', nullable: true })
    facebookId: string;

    @Column({ name: 'role', type: 'enum', enum: Role, default: Role.USER })
    role: Role[]

    @Column({ name: 'profile_pic_url', type: 'varchar', length: 255, nullable: true, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' })
    profilePicUrl: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ name: 'date_of_birth', type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ name: 'refresh_token', nullable: true }) // Store refresh token
    refreshToken?: string;

    @Column({ name: 'access_token', nullable: true })
    accessToken?: string;
    labels: any;
}