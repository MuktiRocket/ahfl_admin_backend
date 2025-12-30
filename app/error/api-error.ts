import { ErrorType, ErrorTypes } from "./error-type";

export class ApiError extends Error {
    public readonly type: string;
    public readonly httpStatus: number;
    public readonly message: string;
    private readonly additionalInfo: Record<string, unknown> | undefined;

    constructor(errorType: ErrorType, additionalInfo: Record<string, unknown> | undefined = undefined) {
        super(errorType.type);

        this.type = errorType.type;
        this.httpStatus = errorType.httpStatus;
        this.message = errorType.message;
        this.additionalInfo = additionalInfo;
    }

    public getBody(): Record<string, unknown> {
        return {
            type: this.type,
            httpStatus: this.httpStatus,
            message: this.message,
            additionalInfo: this.additionalInfo
        };
    }
}

// Error Collection
export const errorTypes: ErrorTypes = {
    internalServerError: {
        type: 'internalServerError',
        httpStatus: 500,
        message: 'An internal error happened. Check the server logs.'
    },
    invalidParameters: {
        type: 'invalidParameters',
        httpStatus: 400,
        message: 'You need to supply the correct parameters as specified in the API docs, please check `additionalInfo` for more details'
    },
    invalidToken: {
        type: 'invalidToken',
        httpStatus: 401,
        message: 'Invalid token or wrong configuration.'
    },
    noAuthToken: {
        type: 'noAuthToken',
        httpStatus: 401,
        message: 'You have to supply an idToken as a bearer token in the Authorization header.'
    },
    invalidHash: {
        type: 'invalidHash',
        httpStatus: 401,
        message: 'The password hash is tempered.'
    },
    userDoesNotExist: {
        type: 'userDoesNotExist',
        httpStatus: 404,
        message: 'This user does not exist in the database. Make sure you are signed up.'
    },
    emailNotRegistered: {
        type: "emailNotRegistered",
        httpStatus: 404,
        message: "This email is not registered with the user"
    },
    userAlreadySignedUp: {
        type: 'userAlreadySignedUp',
        httpStatus: 403,
        message: 'the user has already been signed up.'
    },
    expiredToken: {
        type: 'expiredToken',
        httpStatus: 401,
        message: 'The token you supplied is expired. Please acquire a new one.'
    },
    unknownAuthError: {
        type: 'unknownAuthError',
        httpStatus: 401,
        message: 'An unknown error happened during authentication. Please try again.'
    },
    invalidCredentials: {
        type: 'invalidCredentials',
        httpStatus: 401,
        message: 'Invaild credentials, kindly verify your credentials'
    },
    emailTaken: {
        type: 'emailTaken',
        httpStatus: 403,
        message: 'This email is already in use inside our system. Please choose another one.'
    },
    invalidOtpOrExpired: {
        type: 'invalidOtpOrExpired',
        httpStatus: 403,
        message: 'Invalid mobile number, OTP or the OTP expired.'
    },
    tooManyRequests: {
        type: 'tooManyRequests',
        httpStatus: 429,
        message: 'You have exceeded the allowed request limit. Please try again later.'
    },
    databaseError: {
        type: 'databaseError',
        httpStatus: 500,
        message: 'An unexpected database error occurred. Please contact support if this issue persists.'
    },
    generateOtpRequestNotFound: {
        type: 'generateOtpRequestNotFound',
        httpStatus: 400,
        message: 'Kindly first generate an OTP request.'
    },
    noLoanFound: {
        type: 'noLoanFound',
        httpStatus: 404,
        message: 'No loan found for the user.'
    },
    customPaymentTypeRequiresAmount: {
        type: 'customPaymentTypeRequiresAmount',
        httpStatus: 400,
        message: 'There must be an amount for a custom type payment'
    },
    loanDoesNotExists: {
        type: 'loanDoesNotExists',
        httpStatus: 404,
        message: 'Loan does not exists or deactivated, Kindly contact with support'
    },
    paymentNotFound: {
        type: 'paymentNotFound',
        httpStatus: 400,
        message: 'Payment not found please check the payment Id'
    },
    reportDoesNotExist: {
        type: 'reportDoesNotExist',
        httpStatus: 404,
        message: 'This report does not exist in the database.'
    },
    reqiredBothFromDateAndToDate: {
        type: 'reqiredBothFromDateAndToDate',
        httpStatus: 400,
        message: 'Required both fromDate and toDate'
    },
    lmsError: {
        type: 'lmsError',
        httpStatus: 400,
        message: 'An error occurred while fetching data from LMS'
    },
    emiAlreadyProcessed: {
        type: 'emiAlreadyProcessed',
        httpStatus: 409,
        message: 'EMI for this month has already been paid'
    },
    notFound: {
        type: 'notFound',
        httpStatus: 404,
        message: 'The server can not find the requested resource.'
    }
};