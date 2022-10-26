 info = [{
    "argumentos": process.argv.slice(2),
    "os": process.platform,
    "version": process.version,
    "pid": process.pid,
    "path": process.execPath,
    "rss": process.memoryUsage().rss,
    "dir_name": process.cwd(),
}]

export default info;