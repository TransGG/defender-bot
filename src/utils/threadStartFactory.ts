import childProcess from "child_process";

interface wrapper {
  fn: () => Promise<void>;
  thread?: childProcess.ChildProcess;
  crashIter: number;
  maxCrashIter: number;
  path: string;
  name: string;
}

export default function startFnFactory(opts: { name: string; path: string; maxCrashesPerHour: number }) {
  async function startThread(this: typeof wrapper) {
    this.crashIter = (this.crashIter ?? -1) + 1;

    if (this.crashIter >= this.maxCrashIter) {
      throw `### FATAL ERROR ### - ${this.name} crashed too many times!`;
    }

    console.log(`Starting ${this.name}.`);

    let thread = childProcess.fork(this.path);

    let t = this;

    thread.on("exit", async (code) => {
      if (!code) {
        console.warn(`${t.name} exited without a code!`);
        return await t.fn();
      }

      if (code == 0) {
        console.info(`${t.name} exited gracefully. (exit code ${code})`);
        return;
      }

      console.warn(`${this.name} exited with code: ${code}!`);
      return await t.fn();
    });
  }

  let wrapper = {
    crashIter: 0,
    name: opts.name,
    path: opts.path,
    maxCrashIter: opts.maxCrashesPerHour,
  } as wrapper;

  let startFn = startThread.bind(wrapper);

  wrapper.fn = startFn;

  return startFn;
}
