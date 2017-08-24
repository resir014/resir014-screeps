import * as Config from '../../config/config'
import * as Inscribe from '../../lib/Inscribe'
import { LogLevel } from './logLevel'

export class Logger {
  public static error(message: (() => string) | string) {
    write(LogLevel.ERROR, message)
  }

  public static warn(message: (() => string) | string) {
    write(LogLevel.WARNING, message)
  }

  public static info(message: (() => string) | string) {
    write(LogLevel.INFO, message)
  }

  public static debug(message: (() => string) | string) {
    write(LogLevel.DEBUG, message)
  }
}

function write(level: LogLevel, message: (() => string) | string): void {
  const out: string[] = []
  switch (level) {
    case LogLevel.DEBUG: {
      out.push(Inscribe.color(_.padRight('DEBUG', 8, ' '), 'gray'))
      break
    }
    case LogLevel.INFO: {
      out.push(Inscribe.color(_.padRight('INFO', 8, ' '), 'lime'))
      break
    }
    case LogLevel.WARNING: {
      out.push(Inscribe.color(_.padRight('WARNING', 8, ' '), 'yellow'))
      break
    }
    case LogLevel.ERROR: {
      out.push(Inscribe.color(_.padRight('ERROR', 8, ' '), 'red'))
      break
    }
    default: {
      break
    }
  }
  if (Config.LOG_PRINT_TICK) {
    out.push(Inscribe.time())
  }

  console.log(out.join(' '), message)
}
