import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { DateHelper } from "../utils/date-helper";
import { Utils } from "../utils/utils";

@Entity({ name: 'payment_details' })
export class TransactionData {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100, nullable: true })
    customerId!: string;

    @Column({ length: 100, nullable: true })
    mobile!: string;

    @Column({ length: 100, nullable: true })
    orderId!: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    amount!: string;

    @Column({ length: 50, nullable: true })
    responseCode!: string;

    @Column({ length: 255, nullable: true })
    responseMsg!: string;

    @Column({ length: 50, nullable: true })
    responseStatus!: string;

    @Column({ length: 50, nullable: true })
    mode!: string;

    @Column({ length: 100, nullable: true })
    txnId!: string;

    @Column({ length: 100, nullable: true })
    loanAccountNumber!: string;

    @Column({ name: 'createdAt', type: 'timestamp', nullable: true })
    createdAt!: Date;

    @Column({ name: 'updatedAt', type: 'timestamp', nullable: true })
    update_at?: Date;
    updatedAt!: Date;

    public getAdminTransactionData() {
        return {
            id: this.id,
            customerId: this.customerId,
            mobile: this.mobile,
            orderId: this.orderId,
            amount: this.amount,
            responseCode: this.responseCode,
            responseMsg: this.responseMsg,
            responseStatus: this.responseStatus,
            mode: this.mode,
            txnId: this.txnId,
            loanAccountNumber: this.loanAccountNumber,
            createdAt: DateHelper.getISTDateTime(this.createdAt),
            updatedAt: DateHelper.getISTDateTime(this.updatedAt)
        };
    }

    public getTransactionCsvData() {
        return {
            customerId: Utils.getEmtpyIfNullish(this.customerId),
            mobile: Utils.getEmtpyIfNullish(this.mobile),
            orderId: Utils.getEmtpyIfNullish(this.orderId),
            amount: Utils.getEmtpyIfNullish(this.amount),
            responseCode: Utils.getEmtpyIfNullish(this.responseCode),
            responseMsg: Utils.getEmtpyIfNullish(this.responseMsg),
            responseStatus: Utils.getEmtpyIfNullish(this.responseStatus),
            mode: Utils.getEmtpyIfNullish(this.mode),
            txnId: Utils.getEmtpyIfNullish(this.txnId),
            loanAccountNumber: Utils.getEmtpyIfNullish(this.loanAccountNumber),
            createdAt: this.createdAt
                ? DateHelper.getISTDateTime(this.createdAt) : '',
            updatedAt: this.updatedAt
                ? DateHelper.getISTDateTime(this.updatedAt) : ''
        };
    }
}
