/* The Logger class provides methods for logging messages with a specified prefix. */
class Logger {
    constructor(prefix) {
        this.prefix = prefix;
    }

    build_string = (string) => `${this.prefix}: ${string}`;
    error = (string) => console.error(this.build_string(string));
    log = (string) => console.log(this.build_string(string));
    warn = (string) => console.warn(this.build_string(string));
}