/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { JoiObject } from "joi"
import * as Joi from "joi"
import * as uuid from "uuid"
import { EnvironmentConfig } from "./project"
import { ConfigurationError } from "../exceptions"
import chalk from "chalk"

export type Primitive = string | number | boolean

export interface PrimitiveMap { [key: string]: Primitive }
export interface DeepPrimitiveMap { [key: string]: Primitive | DeepPrimitiveMap }

export const joiPrimitive = () => Joi.alternatives().try(Joi.number(), Joi.string(), Joi.boolean())

export const identifierRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
export const envVarRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/

export const joiIdentifier = () => Joi
  .string().regex(identifierRegex)
  .description(
    "may contain lowercase letters, numbers and dashes, must start with a letter, " +
    "cannot contain consecutive dashes and cannot end with a dash",
)

export const joiIdentifierMap = (valueSchema: JoiObject) => Joi.object().pattern(identifierRegex, valueSchema)

export const joiVariables = () => Joi
  .object().pattern(/[\w\d]+/i, joiPrimitive())
  .default(() => ({}), "{}")

export const joiEnvVarName = () => Joi
  .string().regex(envVarRegex)
  .description("may contain letters and numbers, cannot start with a number")

export const joiEnvVars = () => Joi
  .object().pattern(envVarRegex, joiPrimitive())
  .default(() => ({}), "{}")

export interface Environment {
  name: string
  namespace: string
  config: EnvironmentConfig,
}

export function isPrimitive(value: any) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
}

const joiPathPlaceholder = uuid.v4()
const joiPathPlaceholderRegex = new RegExp(joiPathPlaceholder, "g")
const joiOptions = {
  abortEarly: false,
  language: {
    key: `key ${joiPathPlaceholder} `,
    object: {
      allowUnknown: `!!key "{{!child}}" is not allowed at path ${joiPathPlaceholder}`,
      child: "!!\"{{!child}}\": {{reason}}",
      xor: `!!object at ${joiPathPlaceholder} only allows one of {{peersWithLabels}}`,
    },
  },
}

export function validate<T>(value: T, schema: Joi.Schema, context?: string): T {
  const result = schema.validate(value, joiOptions)
  const error = result.error

  if (error) {
    const description = schema.describe()

    const errorDetails = error.details.map((e) => {
      // render the key path in a much nicer way
      let renderedPath = "."

      if (e.path.length) {
        renderedPath = ""
        let d = description

        for (const part of e.path) {
          if (d.children && d.children[part]) {
            renderedPath += "." + part
            d = d.children[part]
          } else if (d.patterns) {
            for (const p of d.patterns) {
              if (part.match(new RegExp(p.regex.slice(1, -1)))) {
                renderedPath += `[${part}]`
                d = p.rule
                break
              }
            }
          } else {
            renderedPath += `[${part}]`
          }
        }
      }

      // a little hack to always use full key paths instead of just the label
      e.message = e.message.replace(joiPathPlaceholderRegex, chalk.underline(renderedPath || "."))

      return e
    })

    const msgPrefix = context ? `Error validating ${context}` : "Validation error"
    const errorDescription = errorDetails.map(e => e.message).join(", ")

    throw new ConfigurationError(`${msgPrefix}: ${errorDescription}`, {
      value,
      context,
      errorDescription,
      errorDetails,
    })
  }

  return result.value
}
