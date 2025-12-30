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
}