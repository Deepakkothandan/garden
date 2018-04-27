/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import chalk from "chalk"
import { PluginContext } from "../../plugin-context"
import { BuildTask } from "../../tasks/build"
import { RunResult } from "../../types/plugin"
import { BooleanParameter, Command, ParameterValues, StringParameter } from "../base"
import { printRuntimeContext } from "./index"

export const runArgs = {
  service: new StringParameter({
    help: "The command to run in the module",
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

export class RunServiceCommand extends Command<typeof runArgs, typeof runOpts> {
  name = "service"
  alias = "s"
  help = "Run an ad-hoc instance of the specified service"

  arguments = runArgs
  options = runOpts

  async action(ctx: PluginContext, args: Args, opts: Opts): Promise<RunResult> {
    const name = args.service
    const service = await ctx.getService(name)
    const module = service.module

    ctx.log.header({
      emoji: "runner",
      command: `Running service ${chalk.cyan(name)} in module ${chalk.cyan(module.name)}`,
    })

    await ctx.configureEnvironment()

    const buildTask = new BuildTask(ctx, module, opts["force-build"])
    await ctx.addTask(buildTask)
    await ctx.processTasks()

    const command = service.config.command
    const runtimeContext = await module.prepareRuntimeContext(service.config.dependencies)

    printRuntimeContext(ctx, runtimeContext)

    return ctx.runModule(module, command, runtimeContext, opts.interactive)
  }
}
