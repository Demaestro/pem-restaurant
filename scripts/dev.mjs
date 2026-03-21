import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const childProcesses = [];

function startProcess(label, command) {
  const child = spawn(command, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown(code);
    }
  });

  child.on("error", (error) => {
    console.error(`${label} failed to start:`, error.message);
    shutdown(1);
  });

  childProcesses.push(child);
}

function shutdown(exitCode = 0) {
  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startProcess("web", isWindows ? "npm.cmd run dev:web" : "npm run dev:web");
startProcess("api", isWindows ? "npm.cmd run dev:api" : "npm run dev:api");
