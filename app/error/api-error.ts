import { ErrorType, ErrorTypes } from "./error-type";

export class ApiError extends Error {
    public readonly type: string;
    public readonly httpStatus: number;
    public readonly description: string;
    private readonly additionalInfo: Record<string, unknown> | undefined;
   
    constructor(errorType: ErrorType, additionalInfo: Record<string, unknown> | undefined = undefined) {
        super(errorType.type);

        this.type = errorType.type;
        this.httpStatus = errorType.httpStatus;
        this.description = errorType.description;
        this.additionalInfo = additionalInfo;
    }

    public getBody(): Record<string, unknown> {
        return {
            type: this.type,
            httpStatus: this.httpStatus,
            description: this.description,
            additionalInfo: this.additionalInfo
        };
    }
}

// Error Collection
export const errorTypes: ErrorTypes = {
    internalServerError: {
        type: 'internalServerError',
        httpStatus: 500,
        description: 'An internal error happened. Check the server logs.'
    },
    invalidParameters: {
        type: 'invalidParameters',
        httpStatus: 400,
        description: 'You need to supply the correct parameters as specified in the API docs, please check `additionalInfo` for more details'
    },
    invalidToken: {
        type: 'invalidToken',
        httpStatus: 401,
        description: 'Invalid token or wrong configuration.'
    },
    noAuthToken: {
        type: 'noAuthToken',
        httpStatus: 401,
        description: 'You have to supply an idToken as a bearer token in the Authorization header.'
    },
    userDoesNotExist: {
        type: 'userDoesNotExist',
        httpStatus: 404,
        description: 'This user does not exist in the database. Make sure you are signed up.'
    },
    userAlreadySignedUp: {
        type: 'userAlreadySignedUp',
        httpStatus: 403,
        description: 'the user has already been signed up.'
    },
    expiredToken: {
        type: 'expiredToken',
        httpStatus: 401,
        description: 'The token you supplied is expired. Please acquire a new one.'
    },
    unknownAuthError: {
        type: 'unknownAuthError',
        httpStatus: 401,
        description: 'An unknown error happened during authentication. Please try again.'
    },
    emailTaken: {
        type: 'emailTaken',
        httpStatus: 403,
        description: 'This email is already in use inside our system. Please choose another one.'
    },
};