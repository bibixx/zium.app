/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "child_process" {
  interface Buffer {
    toString(): string;
  }

  /**
   * The `child_process.execSync()` method is generally identical to {@link exec} with the exception that the method will not return
   * until the child process has fully closed. When a timeout has been encountered
   * and `killSignal` is sent, the method won't return until the process has
   * completely exited. If the child process intercepts and handles the `SIGTERM`signal and doesn't exit, the parent process will wait until the child process
   * has exited.
   *
   * If the process times out or has a non-zero exit code, this method will throw.
   * The `Error` object will contain the entire result from {@link spawnSync}.
   *
   * **Never pass unsanitized user input to this function. Any input containing shell**
   * **metacharacters may be used to trigger arbitrary command execution.**
   * @since v0.11.12
   * @param command The command to run.
   * @return The stdout from the command.
   */
  export function execSync(command: string): Buffer;

  interface ChildProcess {
    stdout: { pipe: (stream: any) => void };
    stderr: { pipe: (stream: any) => void };
  }

  type IOType = "overlapped" | "pipe" | "ignore" | "inherit";
  interface ProcessEnvOptions {
    uid?: number | undefined;
    gid?: number | undefined;
    cwd?: string | URL | undefined;
  }
  interface CommonOptions extends ProcessEnvOptions {
    /**
     * @default false
     */
    windowsHide?: boolean | undefined;
    /**
     * @default 0
     */
    timeout?: number | undefined;
  }
  interface ExecOptions extends CommonOptions {
    shell?: string | undefined;
    signal?: AbortSignal | undefined;
    maxBuffer?: number | undefined;
    stdio?: IOType;
  }
  interface ExecException extends Error {
    cmd?: string | undefined;
    killed?: boolean | undefined;
    code?: number | undefined;
  }
  /**
   * Spawns a shell then executes the `command` within that shell, buffering any
   * generated output. The `command` string passed to the exec function is processed
   * directly by the shell and special characters (vary based on [shell](https://en.wikipedia.org/wiki/List_of_command-line_interpreters))
   * need to be dealt with accordingly:
   *
   * ```js
   * const { exec } = require('child_process');
   *
   * exec('"/path/to/test file/test.sh" arg1 arg2');
   * // Double quotes are used so that the space in the path is not interpreted as
   * // a delimiter of multiple arguments.
   *
   * exec('echo "The \\$HOME variable is $HOME"');
   * // The $HOME variable is escaped in the first instance, but not in the second.
   * ```
   *
   * **Never pass unsanitized user input to this function. Any input containing shell**
   * **metacharacters may be used to trigger arbitrary command execution.**
   *
   * If a `callback` function is provided, it is called with the arguments`(error, stdout, stderr)`. On success, `error` will be `null`. On error,`error` will be an instance of `Error`. The
   * `error.code` property will be
   * the exit code of the process. By convention, any exit code other than `0`indicates an error. `error.signal` will be the signal that terminated the
   * process.
   *
   * The `stdout` and `stderr` arguments passed to the callback will contain the
   * stdout and stderr output of the child process. By default, Node.js will decode
   * the output as UTF-8 and pass strings to the callback. The `encoding` option
   * can be used to specify the character encoding used to decode the stdout and
   * stderr output. If `encoding` is `'buffer'`, or an unrecognized character
   * encoding, `Buffer` objects will be passed to the callback instead.
   *
   * ```js
   * const { exec } = require('child_process');
   * exec('cat *.js missing_file | wc -l', (error, stdout, stderr) => {
   *   if (error) {
   *     console.error(`exec error: ${error}`);
   *     return;
   *   }
   *   console.log(`stdout: ${stdout}`);
   *   console.error(`stderr: ${stderr}`);
   * });
   * ```
   *
   * If `timeout` is greater than `0`, the parent will send the signal
   * identified by the `killSignal` property (the default is `'SIGTERM'`) if the
   * child runs longer than `timeout` milliseconds.
   *
   * Unlike the [`exec(3)`](http://man7.org/linux/man-pages/man3/exec.3.html) POSIX system call, `child_process.exec()` does not replace
   * the existing process and uses a shell to execute the command.
   *
   * If this method is invoked as its `util.promisify()` ed version, it returns
   * a `Promise` for an `Object` with `stdout` and `stderr` properties. The returned`ChildProcess` instance is attached to the `Promise` as a `child` property. In
   * case of an error (including any error resulting in an exit code other than 0), a
   * rejected promise is returned, with the same `error` object given in the
   * callback, but with two additional properties `stdout` and `stderr`.
   *
   * ```js
   * const util = require('util');
   * const exec = util.promisify(require('child_process').exec);
   *
   * async function lsExample() {
   *   const { stdout, stderr } = await exec('ls');
   *   console.log('stdout:', stdout);
   *   console.error('stderr:', stderr);
   * }
   * lsExample();
   * ```
   *
   * If the `signal` option is enabled, calling `.abort()` on the corresponding`AbortController` is similar to calling `.kill()` on the child process except
   * the error passed to the callback will be an `AbortError`:
   *
   * ```js
   * const { exec } = require('child_process');
   * const controller = new AbortController();
   * const { signal } = controller;
   * const child = exec('grep ssh', { signal }, (error) => {
   *   console.log(error); // an AbortError
   * });
   * controller.abort();
   * ```
   * @since v0.1.90
   * @param command The command to run, with space-separated arguments.
   * @param callback called with the output when process terminates.
   */
  function exec(
    command: string,
    callback?: (error: ExecException | null, stdout: string, stderr: string) => void,
  ): ChildProcess;
  // `options` with `"buffer"` or `null` for `encoding` means stdout/stderr are definitely `Buffer`.
  function exec(
    command: string,
    options: {
      encoding: "buffer" | null;
    } & ExecOptions,
    callback?: (error: ExecException | null, stdout: Buffer, stderr: Buffer) => void,
  ): ChildProcess;
  // `options` with well known `encoding` means stdout/stderr are definitely `string`.
  function exec(
    command: string,
    options: ExecOptions,
    callback?: (error: ExecException | null, stdout: string, stderr: string) => void,
  ): ChildProcess;
  // `options` without an `encoding` means stdout/stderr are definitely `string`.
  function exec(
    command: string,
    options: ExecOptions,
    callback?: (error: ExecException | null, stdout: string, stderr: string) => void,
  ): ChildProcess;
  // fallback if nothing else matches. Worst case is always `string | Buffer`.
  function exec(
    command: string,
    options: ExecOptions | undefined | null,
    callback?: (error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) => void,
  ): ChildProcess;
}

declare module "path" {
  /**
   * The right-most parameter is considered {to}. Other parameters are considered an array of {from}.
   *
   * Starting from leftmost {from} parameter, resolves {to} to an absolute path.
   *
   * If {to} isn't already absolute, {from} arguments are prepended in right to left order,
   * until an absolute path is found. If after using all {from} paths still no absolute path is found,
   * the current working directory is used as well. The resulting path is normalized,
   * and trailing slashes are removed unless the path gets resolved to the root directory.
   *
   * @param paths A sequence of paths or path segments.
   * @throws {TypeError} if any of the arguments is not a string.
   */
  export function resolve(...paths: string[]): string;
}

declare module "process" {
  interface Process {
    env: Record<string, string | undefined>;
    stdout: any;
    stderr: any;
    cwd(): string;
  }

  global {
    const process: Process;
  }
}
