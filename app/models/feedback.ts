import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'feedback' })
export class Feedback {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100, nullable: true })
    user_id?: string;

    @Column({ length: 100, nullable: true })
    mobile?: string;

    @Column({ type: 'int', nullable: true })
    rating?: number;

    @Column({ type: 'longtext', nullable: true })
    comment?: string;

    @Column({ name: 'created_at', type: 'datetime' })
    created_at!: Date;

    @Column({ name: 'updated_at', type: 'datetime', nullable: true })
    updated_at?: Date;

    // ===== Admin / API response =====
    public getAdminFeedbackData() {
        return {
            id: this.id,
            user_id: this.user_id,
            mobile: this.mobile,
            rating: this.rating,
            comment: this.comment,
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }

    // ===== CSV export =====
    public getFeedbackCsvData() {
        return {
            id: this.id ?? '',
            user_id: this.user_id ?? '',
            mobile: this.mobile ?? '',
            rating: this.rating ?? '',
            comment: this.comment ?? '',
            created_at: this.created_at ?? '',
            updated_at: this.updated_at ?? '',
        };
    }
}
