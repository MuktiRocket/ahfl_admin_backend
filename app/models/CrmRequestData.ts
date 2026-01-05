import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { DateHelper } from '../utils/date-helper';

@Entity({ name: 'crm_request_data' })
export class CrmRequestData {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    firstName!: string;

    @Column({ length: 100 })
    lastName!: string;

    @Column({ length: 100 })
    clientId!: string;

    @Column({ length: 100 })
    contactEmailId!: string;

    @Column({ length: 100 })
    probCategory!: string;

    @Column({ length: 100 })
    contactMobileNo!: string;

    @Column({ length: 100 })
    description!: string;

    @Column({ length: 100 })
    source!: string;

    @Column({ length: 100 })
    type!: string;

    @Column({ length: 100 })
    probType!: string;

    @Column({ length: 100 })
    probSummary!: string;

    @Column({ length: 100 })
    source_AppId!: string;

    @Column({ length: 100 })
    probItem!: string;

    @Column({ length: 100 })
    changedMobile!: string;

    @Column({ length: 100 })
    ticketId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;


    public getAdminCrmRequest() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            clientId: this.clientId,
            contactEmailId: this.contactEmailId,
            contactMobileNo: this.contactMobileNo,
            probCategory: this.probCategory,
            probType: this.probType,
            probSummary: this.probSummary,
            source: this.source,
            ticketId: this.ticketId,
            createdAt: DateHelper.getISTDateTime(this.createdAt),
            updatedAt: DateHelper.getISTDateTime(this.updatedAt),
        };
    }

}
