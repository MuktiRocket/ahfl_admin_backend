export class Utils {
    public static randomCodeGenerator(length = 6, isAlphaNumeric = false): string {
        let characters = '1234567890'; // only numeric characters
        if (isAlphaNumeric)
            characters = `ABCDEFGHJKLMNPQRSTUVWXYZ${characters}`;

        let code = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }
        return code;
    }
    public static getCurrentISTDateTime(): Date {
        const currentDateTime = new Date();
        const utcTime = currentDateTime.getTime();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDateTime = new Date(utcTime + istOffset);
        return istDateTime;
    }
    public static normalizeDate(date?: string): string | undefined {
        if (!date) return undefined;

        // already ISO
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

        // DD-MM-YYYY → YYYY-MM-DD
        const [dd, mm, yyyy] = date.split('-');
        return `${yyyy}-${mm}-${dd}`;
    }

    public static extractPaginationParams(params: any, defaultLimit: number = 5) {
        return {
            limit: Number(params.limit) || defaultLimit,
            offset: Number(params.offset) || 0
        };
    }
}