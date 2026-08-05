import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

/**
 * LoggerService - Hardened Production Winston Logging & Daily Rotation Service
 * 
 * Features:
 * 1. Daily Log Rotation via winston-daily-rotate-file in logs/ directory
 * 2. Structured JSON & Colorized Console Transports
 * 3. Dedicated methods for submission lifecycle tracking:
 *    - Submission received
 *    - Execution started
 *    - Compilation finished
 *    - Verdict generated
 *    - Execution time & Memory metrics
 *    - System Errors & Exception tracebacks
 */
export class LoggerService {
  constructor(options = {}) {
    const logsDir = options.logsDir || path.resolve(process.cwd(), "logs");

    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Custom Log Format
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
      })
    );

    // 1. Daily Rotate Transport for General Logs (logs/combined-%DATE%.log)
    const dailyCombinedRotate = new DailyRotateFile({
      dirname: logsDir,
      filename: "application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "info"
    });

    // 2. Daily Rotate Transport for Error Logs (logs/error-%DATE%.log)
    const dailyErrorRotate = new DailyRotateFile({
      dirname: logsDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "error"
    });

    // 3. Daily Rotate Transport for Submission Lifecycle Logs (logs/submissions-%DATE%.log)
    const dailySubmissionsRotate = new DailyRotateFile({
      dirname: logsDir,
      filename: "submissions-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "info"
    });

    // 4. Colorized Console Transport
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
      )
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: customFormat,
      transports: [
        dailyCombinedRotate,
        dailyErrorRotate,
        consoleTransport
      ]
    });

    this.submissionLogger = winston.createLogger({
      level: "info",
      format: customFormat,
      transports: [dailySubmissionsRotate]
    });

    this.logsDir = logsDir;
  }

  /**
   * Log 1: Submission Received
   * @param {Object} params
   * @param {string} params.submissionId
   * @param {string} params.problemId
   * @param {string} params.userId
   * @param {string} params.language
   */
  logSubmissionReceived({ submissionId, problemId, userId, language }) {
    const msg = `[SUBMISSION_RECEIVED] Submission '${submissionId}' for problem '${problemId}' in '${language}' received from user '${userId}'`;
    this.logger.info(msg);
    this.submissionLogger.info(msg, { submissionId, problemId, userId, language, event: "SUBMISSION_RECEIVED" });
  }

  /**
   * Log 2: Execution Started
   * @param {Object} params
   * @param {string} params.submissionId
   * @param {string} params.language
   * @param {string} [params.workingDir]
   */
  logExecutionStarted({ submissionId, language, workingDir = "" }) {
    const msg = `[EXECUTION_STARTED] Sandboxed execution started for submission '${submissionId}' (${language})` + (workingDir ? ` in '${workingDir}'` : "");
    this.logger.info(msg);
    this.submissionLogger.info(msg, { submissionId, language, workingDir, event: "EXECUTION_STARTED" });
  }

  /**
   * Log 3: Compilation Finished
   * @param {Object} params
   * @param {string} params.submissionId
   * @param {string} params.language
   * @param {boolean} params.success
   * @param {number} [params.durationMs]
   * @param {string} [params.error]
   */
  logCompilationFinished({ submissionId, language, success, durationMs = 0, error = "" }) {
    const status = success ? "SUCCESS" : "FAILED";
    const msg = `[COMPILATION_FINISHED] Compilation ${status} for submission '${submissionId}' (${language}) in ${durationMs}ms` + (error ? ` -> Error: ${error}` : "");
    this.logger.info(msg);
    this.submissionLogger.info(msg, { submissionId, language, success, durationMs, error, event: "COMPILATION_FINISHED" });
  }

  /**
   * Log 4: Verdict Generated
   * @param {Object} params
   * @param {string} params.submissionId
   * @param {string} params.verdict
   * @param {string} [params.statusText]
   * @param {number} [params.passCount]
   * @param {number} [params.totalCount]
   */
  logVerdict({ submissionId, verdict, statusText = "", passCount = 0, totalCount = 0 }) {
    const msg = `[VERDICT_GENERATED] Submission '${submissionId}' verdict -> ${verdict}` + (statusText ? ` (${statusText})` : "") + ` [Passed ${passCount}/${totalCount}]`;
    this.logger.info(msg);
    this.submissionLogger.info(msg, { submissionId, verdict, statusText, passCount, totalCount, event: "VERDICT_GENERATED" });
  }

  /**
   * Log 5 & 6: Execution Time & Memory Metrics
   * @param {Object} params
   * @param {string} params.submissionId
   * @param {number} params.executionTimeMs
   * @param {number} params.memoryMb
   */
  logExecutionMetrics({ submissionId, executionTimeMs, memoryMb }) {
    const msg = `[EXECUTION_METRICS] Submission '${submissionId}' metrics -> Execution Time: ${executionTimeMs}ms, Memory: ${memoryMb}MB`;
    this.logger.info(msg);
    this.submissionLogger.info(msg, { submissionId, executionTimeMs, memoryMb, event: "EXECUTION_METRICS" });
  }

  /**
   * Log 7: Errors & Exceptions
   * @param {Object} params
   * @param {string} [params.submissionId]
   * @param {string} params.context
   * @param {Error|string} params.error
   */
  logError({ submissionId = "", context = "System", error }) {
    const errMsg = error?.message || String(error);
    const msg = `[EXECUTION_ERROR] Error in '${context}'` + (submissionId ? ` for submission '${submissionId}'` : "") + `: ${errMsg}`;
    this.logger.error(msg, { submissionId, context, stack: error?.stack });
  }

  // Generic logging methods
  info(message, meta) { this.logger.info(message, meta); }
  warn(message, meta) { this.logger.warn(message, meta); }
  error(message, meta) { this.logger.error(message, meta); }
  debug(message, meta) { this.logger.debug(message, meta); }
}

// Export singleton instance
export const loggerService = new LoggerService();

// Default export for import flexibility
export default loggerService;
