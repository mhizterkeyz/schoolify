/* eslint-disable no-console */
import 'colors';

class Methods {
  constructor(private readonly logContext: any) {}

  info(...args: any[]) {
    console.log(
      'info: '.green,
      ...args.map(arg => JSON.stringify(arg)),
      JSON.stringify(this.logContext),
    );
  }

  error(...arg: any[]) {
    console.error('error: '.red, ...arg, JSON.stringify(this.logContext));
  }

  debug(...arg: any[]) {
    console.debug('debug: '.yellow, ...arg, JSON.stringify(this.logContext));
  }
}

export class Logger extends Methods {
  constructor(logContext: Record<string, unknown>) {
    super(logContext);
  }

  context(context: Record<string, unknown>): Methods {
    return new Methods(context);
  }

  child(context: Record<string, unknown>): Logger {
    return new Logger(context);
  }
}
