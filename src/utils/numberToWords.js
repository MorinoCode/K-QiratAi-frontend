export const numberToWords = (amount) => {
    const words = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertChunk = (num) => {
        if (num === 0) return "";
        if (num < 20) return words[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + words[num % 10] : "");
        if (num < 1000) return words[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " and " + convertChunk(num % 100) : "");
        return "";
    };

    if (amount === 0) return "Zero Dinar";

    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 1000); // 3 decimal places for KD

    let result = "";

    if (integerPart > 0) {
        if (integerPart >= 1000) {
            result += convertChunk(Math.floor(integerPart / 1000)) + " Thousand ";
            result += convertChunk(integerPart % 1000);
        } else {
            result += convertChunk(integerPart);
        }
        result += " Dinar";
    }

    if (decimalPart > 0) {
        if (result !== "") result += " and ";
        result += convertChunk(decimalPart) + " Fils";
    }

    return result;
};