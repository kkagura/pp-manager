import log from "electron-log/renderer";
import { ElMessage } from "element-plus";

/**
 * 日志装饰器: 在控制台输出函数的参数与返回值
 */
export function logMethod() {
  return function (_: any, context: any) {
    context.addInitializer(function (this: any) {
      const target = this[context.name];
      const that = this;
      const handleError = (err: any) => {
        log.error(err);
        ElMessage.error(err.message || err);
        return Promise.reject(err);
      };
      this[context.name] = function (...args: any[]) {
        let p;
        try {
          p = target.call(that, ...args);
          log.info(`[logMethod] call ${context.name} with args:`, args);
        } catch (error) {
          return handleError(error);
        }
        return p
          .then((res: any) => {
            log.info(`[logMethod] return value of ${context.name}:`, res);
            return res;
          })
          .catch(handleError);
      };
    });
  };
}
