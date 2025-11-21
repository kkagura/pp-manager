import { app } from "electron";
import path from "node:path";

// 生产环境使用的自定义协议（安装后的应用）
export const PROTOCOL = "pp-manager";
// 开发环境调试时使用的自定义协议
export const DEV_PROTOCOL = "pp-manager-dev";

/**
 * 获取当前环境使用的协议名
 */
export function getScheme() {
  return app.isPackaged ? PROTOCOL : DEV_PROTOCOL;
}

/**
 * 注册自定义协议，确保可以通过浏览器唤起应用
 * - Windows 下 electron-builder 安装后会在注册表里写入协议
 * - 这里调用 app.setAsDefaultProtocolClient 让当前可执行文件成为协议处理程序
 */
export function setupProtocol() {
  const scheme = getScheme();

  // 开发环境下（使用 electron-vite / electron .bin 启动）需要传递额外参数
  if (process.defaultApp && process.argv.length >= 2) {
    // process.argv[1] 通常是主进程入口文件
    app.setAsDefaultProtocolClient(
      scheme,
      process.execPath,
      [path.resolve(process.argv[1])]
    );
  } else {
    // 打包后的应用，直接把当前可执行文件注册为协议处理程序
    app.setAsDefaultProtocolClient(scheme);
  }
}
