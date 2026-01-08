export interface ErrorType {
    type: string;
    httpStatus: number;
    message: string;
}

export interface ErrorTypes {
    internalServerError: ErrorType;
    invalidParameters: ErrorType;
    invalidToken: ErrorType;
    noAuthToken: ErrorType;
    userDoesNotExist: ErrorType;
    emailNotRegistered: ErrorType;
    userAlreadySignedUp: ErrorType;
    expiredToken: ErrorType;
    unknownAuthError: ErrorType;
    emailTaken: ErrorType;
    invalidOtpOrExpired: ErrorType;
    tooManyRequests: ErrorType;
    invalidCredentials: ErrorType;
    databaseError: ErrorType;
    generateOtpRequestNotFound: ErrorType;
    noLoanFound: ErrorType;
    customPaymentTypeRequiresAmount: ErrorType;
    loanDoesNotExists: ErrorType;
    invalidHash: ErrorType;
    paymentNotFound: ErrorType;
    transactionNotFound: ErrorType;
    reportDoesNotExist: ErrorType;
    reqiredBothFromDateAndToDate: ErrorType;
    lmsError: ErrorType;
    emiAlreadyProcessed: ErrorType;
    notFound: ErrorType;
}