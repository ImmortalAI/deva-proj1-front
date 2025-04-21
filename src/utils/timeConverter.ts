export default function (seconds: string) {
    const date = new Date(0);
    date.setSeconds(parseInt(seconds));
    const concatFrom = Math.ceil(date.getHours()) > 0 ? 11 : 14;
    return date.toISOString().substring(concatFrom, 19);
}