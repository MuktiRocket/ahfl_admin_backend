export interface ErrorType {
    type: string;
    httpStatus: number;
    description: string;
}

export interface ErrorTypes {
    internalServerError: ErrorType;
    invalidParameters: ErrorType;
    invalidToken: ErrorType;
    noAuthToken: ErrorType;
    userDoesNotExist: ErrorType;
    userAlreadySignedUp: ErrorType;
    expiredToken: ErrorType;
    unknownAuthError: ErrorType;
    emailTaken: ErrorType;
}