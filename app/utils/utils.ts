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
}