/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import chalk from "chalk"
import { ParameterError } from "../../exceptions"
import { PluginContext } from "../../plugin-context"
import { BuildTask } from "../../tasks/build"
import { RunResult } from "../../types/plugin"
import { BooleanParameter, Command, ParameterValues, StringParameter } from "../base"
import { values } from "lodash"
import { printRuntimeContext } from "./index"

export const runArgs = {
  module: new StringParameter({
    help: "The name of the module to run",
    required: true,
  }),
  test: new StringParameter({
    help: "The name of the test to run in the module",
    required: true,
  }),
}

export const runOpts = {
  interactive: new BooleanParameter({
    help: "Set to false to skip interactive mode and just output the command result",
    defaultValue: true,
  }),
  "force-build": new BooleanParameter({ help: "Force rebuild of module" }),
}

export type Args = ParameterValues<typeof runArgs>
export type Opts = ParameterValues<typeof runOpts>

export class RunTestCommand extends Command<typeof runArgs, typeof runOpts> {
  name = "test"
  alias = "t"
  help = "Run the specified module test"

  arguments = runArgs
  options = runOpts

  async action(ctx: PluginContext, args: Args, opts: Opts): Promise<RunResult> {
    const moduleName = args.module
    const testName = args.test
    const module = await ctx.getModule(moduleName)
    const config = await module.getConfig()

    const testSpec = config.test[testName]

    if (!testSpec) {
      throw new ParameterError(`Could not find test "${testName}" in module ${moduleName}`, {
        moduleName,
        testName,
        availableTests: Object.keys(config.test),
      })
    }

    ctx.log.header({
      emoji: "runner",
      command: `Running test ${chalk.cyan(testName)} in module ${chalk.cyan(moduleName)}`,
    })

    await ctx.configureEnvironment()

    const buildTask = new BuildTask(ctx, module, opts["force-build"])
    await ctx.addTask(buildTask)
    await ctx.processTasks()

    const interactive = opts.interactive
    const deps = await ctx.getServices(testSpec.dependencies)
    const runtimeContext = await module.prepareRuntimeContext(values(deps))

    printRuntimeContext(ctx, runtimeContext)

    return ctx.testModule({ module, testName, testSpec, runtimeContext, interactive })
  }
}
