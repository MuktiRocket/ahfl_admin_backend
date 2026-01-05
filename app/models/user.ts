import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    NONE = 'none'
}

export enum UserRole {
    SUPER_ADMIN = 'super-admin',
}

export interface CreateAdminLoginParams {
    username: string;
    password: string;
}

export interface CreateOtpParams {
    mobile: string;
    otpCode?: string;
    otpExpiry?: Date;
    totpSecret?: string;
}

export interface UpdateOtpParams {
    otpCode?: string;
    otpExpiry?: Date;
    totpSecret?: string | null;
}

export interface UpdateUserParams {
    name?: string;
    email?: string;
    password?: string;
    tempPassword?: string;
    tempPasswordExpiry?: Date;
}

export interface CreateUserParams {
    name?: string;
    email?: string;
    password?: string;
}

@Entity({ name: 'admin_user' })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: false })
    name?: string;

    @Column({ nullable: true, unique: true })
    email?: string;

    @Column({ nullable: true })
    password?: string;

    // relation with token
    // @OneToMany(() => Token, token => token.user)
    // tokens!: Token[];

    // @Column({ type: "varchar", length: 10, nullable: true })
    // otpCode?: string;

    // @Column({ type: "datetime", nullable: true })
    // otpExpiry?: Date;

    // @Column({ type: "varchar", nullable: true })
    // totpSecret?: string | null;

    @Column({ type: "varchar", length: 10, nullable: true })
    tempPassword?: string | null;

    @Column({ type: "datetime", nullable: true })
    tempPasswordExpiry?: Date;

    // @Column({ type: "boolean", nullable: true, default: false })
    // isTncConsent?: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    constructor(params?: CreateUserParams) {
        super();
        if (!params)
            return;

        this.name = params.name;
        this.email = params.email;
        this.password = params.password;
    }

    public update(updates: Partial<UpdateUserParams>): [boolean, QueryDeepPartialEntity<User>] {
        return User.updateFields<User, UpdateUserParams>(this, updates);
    }

    private static updateFields<T extends object, U extends Partial<T>>(target: T, source: U): [boolean, U] {
        let somethingChanged = false;
        const changes: U = {} as U;

        for (const key of Object.keys(source) as (keyof U)[]) {
            if (source[key] !== undefined && source[key] !== target[key as keyof T]) {
                // eslint-disable-next-line
                (target as any)[key] = source[key];
                changes[key] = source[key];
                somethingChanged = true;
            }
        }

        return [somethingChanged, changes];
    }
    public mobileUser() {
        return {
            name: this.name,
            email: this.email,
        };
    }
    public adminUser() {
        return {
            ...this.mobileUser()
        };
    }
}