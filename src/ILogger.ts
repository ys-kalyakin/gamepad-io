/**
 * Logger interface for gamepad-io library.
 *
 * Provides logging functionality with different severity levels.
 * Implementations can handle log messages in various ways (console, file, external service, etc.).
 */
export interface ILogger {
    /**
     * Logs a debug message.
     *
     * Optional method for detailed debugging information.
     * Typically disabled in production environments.
     *
     * @param message - The debug message to log
     */
    debug?: (message: string) => void;

    /**
     * Logs an informational message.
     *
     * Optional method for general operational messages.
     *
     * @param message - The informational message to log
     */
    info?: (message: string) => void;

    /**
     * Logs a message.
     *
     * Optional method for general logging.
     *
     * @param message - The message to log
     */
    log?: (message: string) => void;
}


