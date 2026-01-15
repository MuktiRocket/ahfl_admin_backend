import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'apply_loan_data' })
export class ApplyLoanData {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100, nullable: true })
    firstName?: string;

    @Column({ length: 100, nullable: true })
    lastName?: string;

    @Column({ length: 100, nullable: true })
    clientId?: string;

    @Column({ length: 100, nullable: true })
    contactEmailId?: string;

    @Column({ length: 100, nullable: true })
    probCategory?: string;

    @Column({ length: 100, nullable: true })
    contactMobileNo?: string;

    @Column({ length: 100, nullable: true })
    description?: string;

    @Column({ length: 100, nullable: true })
    source?: string;

    @Column({ length: 100, nullable: true })
    type?: string;

    @Column({ length: 100, nullable: true })
    probType?: string;

    @Column({ length: 100, nullable: true })
    probSummary?: string;

    @Column({ length: 100, nullable: true })
    probItem?: string;

    @Column({ length: 100, nullable: true })
    source_Appld?: string;

    @Column({ length: 100, nullable: true })
    lead_id?: string;

    @Column({ name: 'created_at', type: 'datetime', nullable: true })
    created_at?: Date;

    @Column({ name: 'updated_at', type: 'datetime', nullable: true })
    updated_at?: Date;

    @Column({ length: 100, nullable: true })
    category?: string;

    // ===== Admin / API response =====
    public getAdminApplyLoanData() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            clientId: this.clientId,
            contactEmailId: this.contactEmailId,
            probCategory: this.probCategory,
            contactMobileNo: this.contactMobileNo,
            description: this.description,
            source: this.source,
            type: this.type,
            probType: this.probType,
            probSummary: this.probSummary,
            probItem: this.probItem,
            source_Appld: this.source_Appld,
            lead_id: this.lead_id,
            created_at: this.created_at,
            updated_at: this.updated_at,
            category: this.category,
        };
    }

    // ===== CSV export =====
    public getApplyLoanCsvData() {
        return {
            id: this.id ?? '',
            firstName: this.firstName ?? '',
            lastName: this.lastName ?? '',
            clientId: this.clientId ?? '',
            contactEmailId: this.contactEmailId ?? '',
            probCategory: this.probCategory ?? '',
            contactMobileNo: this.contactMobileNo ?? '',
            description: this.description ?? '',
            source: this.source ?? '',
            type: this.type ?? '',
            probType: this.probType ?? '',
            probSummary: this.probSummary ?? '',
            probItem: this.probItem ?? '',
            source_Appld: this.source_Appld ?? '',
            lead_id: this.lead_id ?? '',
            created_at: this.created_at ?? '',
            updated_at: this.updated_at ?? '',
            category: this.category ?? '',
        };
    }
}
