import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'top_up_apply_loan_data' })
export class Lead {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50, nullable: true })
    leadActionFlag?: string;

    @Column({ length: 100, nullable: true })
    leadSource?: string;

    @Column({ length: 100, nullable: true })
    name?: string;

    @Column({ length: 100, nullable: true })
    lastName?: string;

    @Column({ length: 150, nullable: true })
    email_id?: string;

    @Column({ length: 20, nullable: true })
    mobile_number?: string;

    @Column({ length: 20, nullable: true })
    dob?: string;

    @Column({ length: 10, nullable: true })
    pincode?: string;

    @Column({ length: 100, nullable: true })
    state?: string;

    @Column({ length: 100, nullable: true })
    district?: string;

    @Column({ length: 100, nullable: true })
    branch?: string;

    @Column({ length: 100, nullable: true })
    product_type?: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    loan_amount?: string;

    @Column({ length: 50, nullable: true })
    period_loan_wanted?: string;

    @Column({ length: 50, nullable: true })
    preferred_language?: string;

    @Column({ length: 255, nullable: true })
    input_column_1?: string;

    @Column({ name: 'created_at', type: 'timestamp', nullable: true })
    create_at?: Date;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
    update_at?: Date;

    @Column({ length: 100, nullable: true })
    lead_id?: string;

    public getAdminLeadData() {
        return {
            id: this.id,
            leadActionFlag: this.leadActionFlag,
            leadSource: this.leadSource,
            name: this.name,
            lastName: this.lastName,
            email_id: this.email_id,
            mobile_number: this.mobile_number,
            dob: this.dob,
            pincode: this.pincode,
            state: this.state,
            district: this.district,
            branch: this.branch,
            product_type: this.product_type,
            loan_amount: this.loan_amount,
            period_loan_wanted: this.period_loan_wanted,
            preferred_language: this.preferred_language,
            input_column_1: this.input_column_1,
            create_at: this.create_at,
            update_at: this.update_at,
            lead_id: this.lead_id
        };
    }

    public getLeadCsvData() {
        return {
            id: this.id ?? '',
            leadActionFlag: this.leadActionFlag ?? '',
            leadSource: this.leadSource ?? '',
            name: this.name ?? '',
            lastName: this.lastName ?? '',
            email_id: this.email_id ?? '',
            mobile_number: this.mobile_number ?? '',
            dob: this.dob ?? '',
            pincode: this.pincode ?? '',
            state: this.state ?? '',
            district: this.district ?? '',
            branch: this.branch ?? '',
            product_type: this.product_type ?? '',
            loan_amount: this.loan_amount ?? '',
            period_loan_wanted: this.period_loan_wanted ?? '',
            preferred_language: this.preferred_language ?? '',
            input_column_1: this.input_column_1 ?? '',
            create_at: this.create_at ?? '',
            update_at: this.update_at ?? '',
            lead_id: this.lead_id ?? ''
        };
    }
}
