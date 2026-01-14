import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_trail' })
export class AuditTrail {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100, nullable: true })
    mobile?: string;

    @Column({ length: 100, nullable: true })
    uid?: string;

    @Column({ length: 100, nullable: true })
    category?: string;

    @Column({ length: 100, nullable: true })
    remark?: string;

    @Column({ name: 'created_at', type: 'datetime' })
    created_at!: Date;

    @Column({ name: 'updated_at', type: 'datetime', nullable: true })
    updated_at?: Date;

    // ===== Admin / API response =====
    public getAdminAuditTrailData() {
        return {
            id: this.id,
            mobile: this.mobile,
            uid: this.uid,
            category: this.category,
            remark: this.remark,
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }

    // ===== CSV export =====
    public getAuditTrailCsvData() {
        return {
            id: this.id ?? '',
            mobile: this.mobile ?? '',
            uid: this.uid ?? '',
            category: this.category ?? '',
            remark: this.remark ?? '',
            created_at: this.created_at ?? '',
            updated_at: this.updated_at ?? '',
        };
    }
}
