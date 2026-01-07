import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AdminUser } from "./adminUser";

export interface CreateTokenParams {
    refreshToken: string;
    user: AdminUser;
}

@Entity()
export class Token extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: 'varchar', length: 512, unique: true })
    refreshToken!: string;

    // relation with user
    // @ManyToOne(() => User, user => user.tokens, { nullable: false, onDelete: "CASCADE" })
    // user!: User;

    constructor(params?: CreateTokenParams) {
        super();
        if (!params)
            return;

        this.refreshToken = params.refreshToken;
        // this.user = params.user;
    }
}
