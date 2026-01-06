import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { DateHelper } from '../utils/date-helper';
import { Utils } from '../utils/utils';

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

    public getCrmCsvData() {
        return {
            'first Name': Utils.getEmtpyIfNullish(this.firstName),
            'last Name': Utils.getEmtpyIfNullish(this.lastName),
            'client Id': Utils.getEmtpyIfNullish(this.clientId),
            'Contact Email Id': Utils.getEmtpyIfNullish(this.contactEmailId),
            'Contact Mobile No': Utils.getEmtpyIfNullish(this.contactMobileNo),
            'prob Category': Utils.getEmtpyIfNullish(this.probCategory),
            'prob Type': Utils.getEmtpyIfNullish(this.probType),
            'prob Summary': Utils.getEmtpyIfNullish(this.probSummary),
            'source': Utils.getEmtpyIfNullish(this.source),
            'ticketId': Utils.getEmtpyIfNullish(this.ticketId),
            'createdAt': this.createdAt
                ? DateHelper.getISTDateTime(this.createdAt)
                : '',
            'updatedAt': this.updatedAt
                ? DateHelper.getISTDateTime(this.updatedAt)
                : '',
        };
    }

}
