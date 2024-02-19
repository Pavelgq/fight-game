export const getRandom = (minValue: number, maxValue: number) => {
    return Math.floor((Math.random() * maxValue) - minValue)
}