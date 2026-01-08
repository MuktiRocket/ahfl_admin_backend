import {
    Column,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';
import { DateHelper } from '../utils/date-helper';
import { Utils } from '../utils/utils';

@Entity({ name: 'crm_request_data' })
export class CrmRequestData {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100, nullable: true })
    firstName!: string;

    @Column({ length: 100, nullable: true })
    lastName!: string;

    @Column({ length: 100, nullable: true })
    clientId!: string;

    @Column({ length: 100, nullable: true })
    contactEmailId!: string;

    @Column({ length: 100, nullable: true })
    probCategory!: string;

    @Column({ length: 100, nullable: true })
    contactMobileNo!: string;

    @Column({ length: 100, nullable: true })
    description!: string;

    @Column({ length: 100, nullable: true })
    source!: string;

    @Column({ length: 100, nullable: true })
    type!: string;

    @Column({ length: 100, nullable: true })
    probType!: string;

    @Column({ length: 100, nullable: true })
    probSummary!: string;

    @Column({ length: 100, nullable: true })
    source_AppId!: string;

    @Column({ length: 100, nullable: true })
    probItem!: string;

    @Column({ length: 100, nullable: true })
    changedMobile!: string;

    @Column({ length: 100, nullable: true })
    ticketId!: string;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true })
    createdAt!: Date;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
    update_at?: Date;
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
