## Garden CLI commands

Below is a list of Garden CLI commands and usage information.

The commands should be run in a Garden project root, and are always scoped to that project.

Note: You can get a list of commands in the CLI by running `garden -h/--help`,
and detailed help for each command using `garden <command> -h/--help`

##### Global options

The following option flags can be used with any of the CLI commands:

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--root` | `-r` | string | Override project root directory (defaults to working directory).
  | `--silent` | `-s` | boolean | Suppress log output.
  | `--env` | `-e` | string | The environment (and optionally namespace) to work against
  | `--loglevel` | `-l` | `error` `warn` `info` `verbose` `debug` `silly`  | Set logger level.
  | `--output` | `-o` | `json` `yaml`  | Output command result in specified format (note: disables progress logging).

### garden build

Build your modules..

Builds all or specified modules, taking into account build dependency order.
Optionally stays running and automatically builds modules if their source (or their dependencies&#x27; sources) change.

Examples:

    garden build            # build all modules in the project
    garden build my-module  # only build my-module
    garden build --force    # force rebuild of modules
    garden build --watch    # watch for changes to code

##### Usage

    garden build [module] [options]

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `module` | No | Specify module(s) to build. Use comma separator to specify multiple modules.

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--force` |  | boolean | Force rebuild of module(s).
  | `--watch` | `-w` | boolean | Watch for changes in module(s) and auto-build.

### garden call

Call a service endpoint..

This command resolves the deployed external endpoint for the given service and path, calls the given endpoint and
outputs the result.

Examples:

    garden call my-container
    garden call my-container/some-path

Note: Currently only supports HTTP/HTTPS endpoints.

##### Usage

    garden call <serviceAndPath> 

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `serviceAndPath` | Yes | The name of the service(s) to call followed by the endpoint path (e.g. my-container/somepath).

### garden config get

Get a configuration variable from the environment..

Returns with an error if the provided key could not be found in the configuration.

Examples:

    garden get somekey
    garden get some.nested.key

##### Usage

    garden config get <key> 

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `key` | Yes | The key of the configuration variable. Separate with dots to get a nested key (e.g. key.nested).

### garden config set

Set a configuration variable in the environment..

These configuration values can be referenced in module templates, for example as environment variables.

_Note: The value is always stored as a string._

Examples:

    garden set somekey myvalue
    garden set some.nested.key myvalue

##### Usage

    garden config set <key> <value> 

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `key` | Yes | The key of the configuration variable. Separate with dots to get a nested key (e.g. key.nested).
  | `value` | Yes | The value of the configuration variable.

### garden config delete

Delete a configuration variable from the Garden environment..

Returns with an error if the provided key could not be found in the configuration.

Examples:

    garden delete somekey
    garden delete some.nested.key

##### Usage

    garden config delete <key> 

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `key` | Yes | The key of the configuration variable. Separate with dots to get a nested key (e.g. key.nested).

### garden deploy

Deploy service(s) to your environment..


    Deploys all or specified services, taking into account service dependency order.
    Also builds modules and dependencies if needed.

    Optionally stays running and automatically re-builds and re-deploys services if their module source
    (or their dependencies&#x27; sources) change.

    Examples:

        garden deploy              # deploy all modules in the project
        garden deploy my-service   # only deploy my-service
        garden deploy --force      # force re-deploy of modules, even if they&#x27;re already deployed
        garden deploy --watch      # watch for changes to code
        garden deploy --env stage  # deploy your services to an environment called stage
  

##### Usage

    garden deploy [service] [options]

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `service` | No | The name of the service(s) to deploy (skip to deploy all services). Use comma as separator to specify multiple services.

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--force` |  | boolean | Force redeploy of service(s).
  | `--force-build` |  | boolean | Force rebuild of module(s).
  | `--watch` | `-w` | boolean | Watch for changes in module(s) and auto-deploy.

### garden dev

Starts the garden development console..


    The Garden dev console is a combination of the &#x60;build&#x60;, &#x60;deploy&#x60; and &#x60;test&#x60; commands.
    It builds, deploys and tests all your modules and services, and re-builds, re-deploys and re-tests
    as you modify the code.

    Examples:

        garden dev
  

##### Usage

    garden dev 

### garden environment configure

Configures your environment..

Generally, environments are configured automatically as part of other commands that you run.
However, this command is useful if you want to make sure the environment is ready before running
another command, or if you need to force a reconfiguration using the --force flag.

Examples:

    garden env configure
    garden env configure --force

##### Usage

    garden environment configure [options]

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--force` |  | boolean | Force reconfiguration of environment, ignoring the environment status check.

### garden environment destroy

Destroy an environment..

Generally not as dramatic as it sounds :) This will trigger providers clear up any deployments in a
Garden environment and reset it. When you then run &#x60;garden env configure&#x60; or any deployment command,
the environment will be reconfigured.

This can be useful if you find the environment to be in an inconsistent state, or need/want to free up
resources.

##### Usage

    garden environment destroy 

### garden login

Log into configured providers for this project and environment..

Executes the login flow for any provider that requires login (such as the &#x60;kubernetes&#x60; provider).

Examples:

     garden login

##### Usage

    garden login 

### garden logout

Log out of configured providers for this project and environment..

Examples:

     garden logout

##### Usage

    garden logout 

### garden logs

Retrieves the most recent logs for the specified service(s)..

Outputs logs for all or specified services, and optionally waits for news logs to come in.

Examples:

    garden logs               # prints latest logs from all services
    garden logs my-service    # prints latest logs for my-service
    garden logs -t            # keeps running and streams all incoming logs to the console

##### Usage

    garden logs [service] [options]

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `service` | No | The name of the service(s) to logs (skip to logs all services). Use comma as separator to specify multiple services.

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--tail` | `-t` | boolean | Continuously stream new logs from the service(s).

### garden push

Build and push built module(s) to remote registry..

Pushes built module artifacts for all or specified modules.
Also builds modules and dependencies if needed.

Examples:

    garden push                # push artifacts for all modules in the project
    garden push my-container   # only push my-container
    garden push --force-build  # force re-build of modules before pushing artifacts
    garden push --allow-dirty  # allow pushing dirty builds (which usually triggers error)

##### Usage

    garden push [module] [options]

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `module` | No | The name of the module(s) to push (skip to push all modules). Use comma as separator to specify multiple modules.

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--force-build` |  | boolean | Force rebuild of module(s) before pushing.
  | `--allow-dirty` |  | boolean | Allow pushing dirty builds (with untracked/uncommitted files).

### garden run module

Run an ad-hoc instance of a module..

This is useful for debugging or ad-hoc experimentation with modules.

Examples:

    garden run module my-container           # run an ad-hoc instance of a my-container container and attach to it
    garden run module my-container /bin/sh   # run an interactive shell in a new my-container container
    garden run module my-container --i&#x3D;false /some/script  # execute a script in my-container and return the output

##### Usage

    garden run module <module> [command] [options]

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `module` | Yes | The name of the module to run.
  | `command` | No | The command to run in the module.

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--interactive` |  | boolean | Set to false to skip interactive mode and just output the command result.
  | `--force-build` |  | boolean | Force rebuild of module before running.

### garden run service

Run an ad-hoc instance of the specified service.

This can be useful for debugging or ad-hoc experimentation with services.

Examples:

    garden run service my-service   # run an ad-hoc instance of a my-service and attach to it

##### Usage

    garden run service <service> [options]

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `service` | Yes | The service to run

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--force-build` |  | boolean | Force rebuild of module

### garden run test

Run the specified module test..

This can be useful for debugging tests, particularly integration/end-to-end tests.

Examples:

    garden run test my-module integ            # run the test named &#x27;integ&#x27; in my-module
    garden run test my-module integ --i&#x3D;false  # do not attach to the test run, just output results when completed

##### Usage

    garden run test <module> <test> [options]

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `module` | Yes | The name of the module to run.
  | `test` | Yes | The name of the test to run in the module.

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--interactive` |  | boolean | Set to false to skip interactive mode and just output the command result.
  | `--force-build` |  | boolean | Force rebuild of module before running.

### garden scan

Scans your project and outputs an overview of all modules..


##### Usage

    garden scan 

### garden status

Outputs the status of your environment..


##### Usage

    garden status 

### garden test

Test all or specified modules..


    Runs all or specified tests defined in the project. Also builds modules and dependencies,
    and deploy service dependencies if needed.

    Optionally stays running and automatically re-runs tests if their module source
    (or their dependencies&#x27; sources) change.

    Examples:

        garden test              # run all tests in the project
        garden test my-module    # run all tests in the my-module module
        garden test -n integ     # run all tests with the name &#x27;integ&#x27; in the project
        garden test --force      # force tests to be re-run, even if they&#x27;re already run successfully
        garden test --watch      # watch for changes to code
  

##### Usage

    garden test [module] [options]

##### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
  | `module` | No | The name of the module(s) to deploy (skip to test all modules). Use comma as separator to specify multiple modules.

##### Options

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
  | `--name` | `-n` | string | Only run tests with the specfied name (e.g. unit or integ).
  | `--force` | `-f` | boolean | Force re-test of module(s).
  | `--force-build` |  | boolean | Force rebuild of module(s).
  | `--watch` | `-w` | boolean | Watch for changes in module(s) and auto-test.

### garden validate

Check your garden configuration for errors..

Throws an error and exits with code 1 if something&#x27;s not right in your garden.yml files.

##### Usage

    garden validate 

