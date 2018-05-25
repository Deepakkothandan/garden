/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Bluebird = require("bluebird")
import * as Joi from "joi"
import {
  GARDEN_ANNOTATION_KEYS_SERVICE,
  GARDEN_ANNOTATION_KEYS_VERSION,
} from "../../constants"
import {
  joiIdentifier,
  validate,
} from "../../types/common"
import {
  Module,
  ModuleSpec,
} from "../../types/module"
import {
  ParseModuleResult,
} from "../../types/plugin/outputs"
import {
  DeployServiceParams,
  GetServiceStatusParams,
  ParseModuleParams,
} from "../../types/plugin/params"
import {
  Service,
  ServiceConfig,
  ServiceStatus,
} from "../../types/service"
import {
  TestConfig,
  TestSpec,
} from "../../types/test"
import { TreeVersion } from "../../vcs/base"
import {
  apply,
  applyMany,
} from "./kubectl"
import { getAppNamespace } from "./namespace"

export interface KubernetesSpecsModuleSpec extends ModuleSpec {
  specs: any[],
}

export interface KubernetesSpecsServiceSpec extends KubernetesSpecsModuleSpec { }

export class KubernetesSpecsModule extends Module<KubernetesSpecsModuleSpec, KubernetesSpecsServiceSpec> { }

const k8sSpecSchema = Joi.object().keys({
  apiVersion: Joi.string().required(),
  kind: Joi.string().required(),
  metadata: Joi.object().keys({
    annotations: Joi.object(),
    name: joiIdentifier().required(),
    namespace: joiIdentifier(),
    labels: Joi.object(),
  }).required().unknown(true),
}).unknown(true)

const k8sSpecsSchema = Joi.array().items(k8sSpecSchema).min(1)

export const kubernetesSpecHandlers = {
  async parseModule({ moduleConfig }: ParseModuleParams<KubernetesSpecsModule>): Promise<ParseModuleResult> {
    // TODO: check that each spec namespace is the same as on the project, if specified
    const services: ServiceConfig<KubernetesSpecsServiceSpec>[] = [{
      name: moduleConfig.name,
      dependencies: [],
      outputs: {},
      spec: {
        specs: validate(moduleConfig.spec.specs, k8sSpecsSchema, { context: `${moduleConfig.name} kubernetes specs` }),
      },
    }]

    const tests: TestConfig<TestSpec>[] = []

    return {
      module: moduleConfig,
      services,
      tests,
    }
  },

  getServiceStatus: async (
    { ctx, provider, service }: GetServiceStatusParams<KubernetesSpecsModule>,
  ): Promise<ServiceStatus> => {
    const context = provider.config.context
    const namespace = await getAppNamespace(ctx, provider)
    const currentVersion = await service.module.getVersion()
    const specs = await prepareSpecs(service, currentVersion)

    const dryRunOutputs = await Bluebird.map(
      specs,
      (spec) => apply(context, spec, { dryRun: true, namespace }),
    )

    for (const dryRunOutput of dryRunOutputs) {
      const annotations = dryRunOutput.metadata.annotations || {}
      const version: string = annotations[GARDEN_ANNOTATION_KEYS_VERSION]

      if (!version || version !== currentVersion.versionString) {
        // TODO: return more complete information. for now we just need to signal whether the deployed specs are current
        return {}
      }
    }

    return { state: "ready" }
  },

  deployService: async ({ ctx, provider, service }: DeployServiceParams<KubernetesSpecsModule>) => {
    const context = provider.config.context
    const namespace = await getAppNamespace(ctx, provider)
    const currentVersion = await service.module.getVersion()
    const specs = await prepareSpecs(service, currentVersion)

    await applyMany(context, specs, { namespace, pruneSelector: `${GARDEN_ANNOTATION_KEYS_SERVICE}=${service.name}` })

    return {}
  },
}

async function prepareSpecs(service: Service<KubernetesSpecsModule>, version: TreeVersion) {
  return service.module.spec.specs.map((rawSpec) => {
    const spec = {
      metadata: <any>{},
      ...rawSpec,
    }

    if (!spec.metadata.annotations) {
      spec.metadata.annotations = { [GARDEN_ANNOTATION_KEYS_VERSION]: version.versionString }
    } else {
      spec.metadata.annotations[GARDEN_ANNOTATION_KEYS_VERSION] = version.versionString
    }

    if (!spec.metadata.labels) {
      spec.metadata.labels = { [GARDEN_ANNOTATION_KEYS_SERVICE]: service.name }
    } else {
      spec.metadata.labels[GARDEN_ANNOTATION_KEYS_SERVICE] = service.name
    }

    return spec
  })
}
