/* eslint-disable no-console */
import 'colors';

class Methods {
  constructor(protected readonly logContext: any) {}

  private getLogContext() {
    return JSON.stringify({
      ...this.logContext,
      timestamp: new Date().toISOString(),
    });
  }

  info(...args: any[]) {
    console.log(
      'info: '.green,
      ...args.map(arg => JSON.stringify(arg)),
      this.getLogContext(),
    );
  }

  error(...arg: any[]) {
    console.error('error: '.red, ...arg, this.getLogContext());
  }

  debug(...arg: any[]) {
    console.debug('debug: '.yellow, ...arg, this.getLogContext());
  }
}

export class Logger extends Methods {
  constructor(logContext: Record<string, unknown>) {
    super(logContext);
  }

  context(context: Record<string, unknown>): Methods {
    return new Methods({ ...this.logContext, ...context });
  }

  child(context: Record<string, unknown>): Logger {
    return new Logger(context);
  }
}
