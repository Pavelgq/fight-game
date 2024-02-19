export class Logger {
  constructor() {}

  static info(...message: (string | number)[]) {
    console.log(...message);
  }

  static warn(...message: (string | number)[]) {
    console.warn(...message);
  }

  static error(...message: (string | number)[]) {
    console.error(...message);
  }
}
