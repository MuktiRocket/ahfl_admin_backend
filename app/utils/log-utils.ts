type LooseObject = Record<string, unknown>;

export class LogUtils {
    public static secureSensitiveFields(body: unknown): unknown {
        const isFullSecure = process.env.ENV_NAME === 'prod';

        // If body is a string (like a plain JWT token), just return it
        if (typeof body === 'string') {
            if (body.includes('token') && isFullSecure)
                return body.replace(/"token":\s*"(.*?)"/, '"token": "**************************************************"');
            if (body.includes('jwt'))
                return body.replace(/"jwt":\s*"(.*?)"/, '"jwt": "**************************************************"');
        }

        // If body is a JSON object, secure it
        if (typeof body === 'object' && body !== null) {
            return this.secureObject(body as LooseObject);
        }

        // If body is not an object or string (e.g., null or undefined), return it as is
        return body;
    }

    // If body is an object (JSON), loop over its properties and secure sensitive fields
    // eslint-disable-next-line
    private static secureObject = (obj: LooseObject): LooseObject => {
        const isFullSecure = process.env.ENV_NAME === 'prod';
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) { // Fix for hasOwnProperty
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    this.secureObject(obj[key] as LooseObject); // Recursive call for nested objects
                } else if (key === 'password') {
                    obj[key] = '*********'; // Replace password
                } else if (key === 'jwt' || key === 'aadharToken' || key === 'x-api-key') {
                    obj[key] = '**************************************************';
                } else if (isFullSecure && (key === 'authorization' || key === 'token')) {
                    obj[key] = `${(obj[key] as string).substring(0, 17)}*************************${(obj[key] as string).slice(-10)}`;
                }
            }
        }
        return obj;
    };

    public static formatResponseTime(responseTime: number): string {
        if (responseTime < 1000) {
            return `${responseTime}ms`;
        } else if (responseTime < 60000) {
            return `${(responseTime / 1000).toFixed(2)}s`;
        } else if (responseTime < 3600000) {
            return `${(responseTime / 60000).toFixed(2)}min`;
        } else {
            return `${(responseTime / 3600000).toFixed(2)}hr`;
        }
    }
}
