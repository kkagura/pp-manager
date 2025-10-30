import path from "node:path";
import log from "electron-log/main";
log.initialize();
log.transports.console.format = "{h}:{i}:{s} {text}";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

export { log };
