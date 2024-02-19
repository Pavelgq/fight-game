export class Logger {
  constructor() {}

  static info(message: string) {
    console.log(message);
  }

  static warn(message: string) {
    console.warn(message);
  }

  static error(message: string) {
    console.error(message);
  }
}
