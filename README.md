# 打包注意事项

## 1. 修改 node_modules/sqlite3/package.json 中的 binary.napi_versions 字段值为[3] (这是为了避免 sqlite3 二进制文件下载地址错误)

## 2. 关闭 fastgithub.exe，避免证书验证失败

## 3. 以管理员身份执行打包命令
