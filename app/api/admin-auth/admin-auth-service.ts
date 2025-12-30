import { Database } from "../../database";
import { User } from "../../models/user";
import { UserQueries } from "../../queries/user-queries";
// import { EmailService } from "../../services/email-service";
import { Env } from "../../utils/env";
import { Utils } from "../../utils/utils";
import bcrypt from "bcrypt";

const FIXED_CODE = "777555";
const TEMP_PASSWORD_EXPIRY_MS = 1000 * 60 * 10; // 10 min

export class AdminAuthService extends UserQueries {
    public static async sendTempPassword(user: User, isEmailService: boolean): Promise<void> {
        const currentTime = Utils.getCurrentISTDateTime();
        const tempPasswordExpiry = new Date(currentTime.getTime() + TEMP_PASSWORD_EXPIRY_MS);

        const code = !isEmailService ? FIXED_CODE : Utils.randomCodeGenerator();
        await this.updateUser(user, { tempPassword: code, tempPasswordExpiry });
        console.log("code===>", code);
        console.log("tempPasswordExpiry===>", tempPasswordExpiry);
        // if (isEmailService)
        //     await EmailService.sendEmail(user.email!, "forgetPassword", { fullName: `${user.firstName} ${user.lastName}`, code: code });
    }

    public static async verifyResetCode(user: User, resetCode: string): Promise<boolean> {
        const queryBuilder = Database.manager.createQueryBuilder(User, 'user')
            .where('id = :id', { id: user.id })
            .andWhere('tempPassword = :tempPassword', { tempPassword: resetCode })
            .andWhere('tempPasswordExpiry > NOW()');
        return await queryBuilder.getCount() > 0;
    }

    public static async changePassword(user: User, password: string, isEmailService: boolean) {
        const hash = await bcrypt.hash(password, Env.DEFAULT_PASSWORD_SALT);
        await this.updateUser(user, { password: hash });
        const changeDate = new Date();
        // if (isEmailService)
        //     await EmailService.sendEmail(user.email!, "changePassword", { userName: `${user.firstName} ${user.lastName}`, timestamp: Utils.formatDateWithWeekday(changeDate) });
    }

    public static async validatePassword(inputPassword: string, storedPassword: string): Promise<boolean> {
        return await bcrypt.compare(inputPassword, storedPassword);
    }
}