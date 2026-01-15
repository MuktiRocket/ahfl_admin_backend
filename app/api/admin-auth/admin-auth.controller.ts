import { Request, Response } from 'express';
import { ApiError, errorTypes } from '../../error/api-error';
import { AdminUser } from '../../models/adminUser';
import { TokenService } from '../../services/token-service';
import { Env } from '../../utils/env';
import { Jwt } from '../../utils/jwt';
import { logger } from '../../utils/logger';
import { Controller } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminAuthService } from './admin-auth-service';

interface ValidateLoginParams {
    email: string;
    password: string;
}

interface ForgetPasswordParams {
    email: string
}

interface VerifyResetCodeParams {
    email: string;
    resetCode: string;
}

interface ChangePasswordParams {
    password: string;
}

const REQUEST_INTERVAL_MS = 1000 * 30; // 30 sec

export class AdminAuthController extends Controller {
    protected name: string = "auth";
    protected createRoutes(): void {
        this.publicRoute(RequestMethod.POST, `/login`, this.login.bind(this));
        this.publicRoute(RequestMethod.POST, `/forget-password`, this.forgetPassword.bind(this));
        this.publicRoute(RequestMethod.POST, '/verify-reset-code', this.verifyResetCode.bind(this));
        this.authenticatedUserRoute(RequestMethod.POST, '/change-password', this.changePassword.bind(this));
    }

    private async login(req: Request, res: Response): Promise<void> {
        const { email, password }: ValidateLoginParams = req.body;
        const user = await AdminAuthService.getUser("email", email);
        if (!user)
            throw new ApiError(errorTypes.userDoesNotExist);
        // const decryptPassword = CryptoHelper.decryptTextAES(password);
        // if (!decryptPassword)
        //     throw new ApiError(errorTypes.invalidCredentials);

        const isPasswordValid = await AdminAuthService.validatePassword(password, user.password!);
        if (!isPasswordValid)
            throw new ApiError(errorTypes.invalidCredentials);

        const accesstoken = Jwt.signAccessToken({ userId: user.id });
        const refreshToken = Jwt.signRefreshToken(user.id);
        await TokenService.addRefreshToken({ refreshToken, user });
        res.json({ token: accesstoken, refreshToken, user: user.adminUser() });
    }

    private async forgetPassword(req: Request, res: Response): Promise<void> {
        const { email }: ForgetPasswordParams = req.body;
        const user = await AdminAuthService.getUser("email", email);
        if (!user)
            throw new ApiError(errorTypes.userDoesNotExist);

        if (!user.email)
            logger.error(`User is not associated with any email`, user);

        const isMultipleRequest = Date.now() - user.updatedAt.getTime() < REQUEST_INTERVAL_MS;
        if (isMultipleRequest)
            throw new ApiError(errorTypes.tooManyRequests, { message: 'Multiple forget password requests received within very short interval of time', retryAfter: `${REQUEST_INTERVAL_MS / 1000} seconds` });

        const isEmailService = Env.EMAIL_SERVICE == "true";
        await AdminAuthService.sendTempPassword(user, isEmailService);

        res.json({ success: true, message: `A password reset code has been sent in mail.${!isEmailService ? " Email Bypassed 😉" : ""}` });
    }

    private async verifyResetCode(req: Request, res: Response): Promise<void> {
        const { email, resetCode }: VerifyResetCodeParams = req.body;

        const user = await AdminAuthService.getUser("email", email);
        if (!user)
            throw new ApiError(errorTypes.userDoesNotExist);

        if (!user.email)
            throw new ApiError(errorTypes.emailNotRegistered);

        const isValid = await AdminAuthService.verifyResetCode(user, resetCode);
        if (!isValid)
            throw new ApiError(errorTypes.invalidCredentials);

        const accesstoken = Jwt.signAccessToken({ userId: user.id });
        res.json({ token: accesstoken });
    }

    private async changePassword(req: Request, res: Response): Promise<void> {
        const user: AdminUser = res.locals.user;
        const { password }: ChangePasswordParams = req.body;
        const isEmailService = Env.EMAIL_SERVICE == "true";
        await AdminAuthService.changePassword(user, password, isEmailService);
        res.json({ success: true, message: 'Password changed successfully. Kindly re-login' });
    }
}