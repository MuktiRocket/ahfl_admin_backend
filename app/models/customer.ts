import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'user_data' })
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    auth_token!: string | null;

    @Column({ type: "varchar", length: 15, nullable: true })
    mobile_number!: string | null;

    @Column({ type: "varchar", length: 6, nullable: true })
    otp!: string | null;

    @Column({ type: "longtext", nullable: false })
    customer_data!: string;

    @Column({ type: "datetime", nullable: true })
    otp_expiry!: Date | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    loanAccountNumber!: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    dob!: string | null;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 255, nullable: false })
    uid!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    mpin!: string | null;

    public getAdminCustomerData() {
        const parsedCustomerData = this.customer_data
            ? JSON.parse(this.customer_data)
            : null;

        return {
            id: this.id,
            uid: this.uid,
            mobileNumber: this.mobile_number,
            loanAccountNumber: this.loanAccountNumber,
            dob: this.dob,
            customerData: parsedCustomerData
        };
    }

    public getCustomerCsvData() {
        return {
            uid: this.uid || "",
            mobileNumber: this.mobile_number || "",
            loanAccountNumber: this.loanAccountNumber || "",
            dob: this.dob || "",
            customerData: this.customer_data || ""
        };
    }

}
