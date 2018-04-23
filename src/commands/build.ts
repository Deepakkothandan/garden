/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import chalk from "chalk"
import { PluginContext } from "../plugin-context"
import { BooleanParameter, Command, ParameterValues, StringParameter } from "./base"
import { BuildTask } from "../tasks/build"
import { values } from "lodash"
import { TaskResults } from "../task-graph"

export const buildArguments = {
  module: new StringParameter({
    help: "Specify module(s) to build. Use comma separator to specify multiple modules.",
  }),
}

export const buildOptions = {
  force: new BooleanParameter({ help: "Force rebuild of module(s)" }),
}

export type BuildArguments = ParameterValues<typeof buildArguments>
export type BuildOptions = ParameterValues<typeof buildOptions>

export class BuildCommand extends Command<typeof buildArguments, typeof buildOptions> {
  name = "build"
  help = "Build your modules"

  arguments = buildArguments
  options = buildOptions

  async action(ctx: PluginContext, args: BuildArguments, opts: BuildOptions): Promise<TaskResults> {
    await ctx.clearBuilds()
    const names = args.module ? args.module.split(",") : undefined
    const modules = await ctx.getModules(names)

    for (const module of values(modules)) {
      await ctx.addTask(new BuildTask(ctx, module, opts.force))
    }

    ctx.log.header({ emoji: "hammer", command: "build" })

    const result = await ctx.processTasks()

    ctx.log.info("")
    ctx.log.info({ emoji: "heavy_check_mark", msg: chalk.green("Done!\n") })

    return result
  }
}
