import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DateHelper } from "../utils/date-helper";
import { Utils } from "../utils/utils";

@Entity({ name: 'payment_details' })
export class TransactionData {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    customerId!: string;

    @Column({ length: 100 })
    mobile!: string;

    @Column({ length: 100 })
    orderId!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount!: string;

    @Column({ length: 50 })
    responseCode!: string;

    @Column({ length: 255 })
    responseMsg!: string;

    @Column({ length: 50 })
    responseStatus!: string;

    @Column({ length: 50 })
    mode!: string;

    @Column({ length: 100 })
    txnId!: string;

    @Column({ length: 100 })
    loanAccountNumber!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
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
