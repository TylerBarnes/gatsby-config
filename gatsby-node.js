const Joi = require(`joi`)
const { convertSchema } = require(`joi-to-typescript`)
const pascalcase = require(`pascalcase`)
const fs = require(`fs-extra`)

exports.onPreInit = async ({ store }) => {
  if (process.env.NODE_ENV !== `development`) {
    return
  }

  const { flattenedPlugins } = store.getState()

  const flattenedPluginsNames = flattenedPlugins.reduce(
    (accumulator, current) => {
      accumulator.add(current.name)
      return accumulator
    },
    new Set()
  )

  const packageJSON = await fs.readJSON(`${process.cwd()}/package.json`)

  const packages = [
    ...Object.keys(packageJSON.dependencies || {}),
    ...Object.keys(packageJSON.devDependencies || {}),
  ]

  const pluginsNotInGatsbyConfigNames = packages.filter(
    (packageName) =>
      packageName.startsWith(`gatsby-`) &&
      !flattenedPluginsNames.has(packageName)
  )

  const pluginsNotInGatsbyConfig = pluginsNotInGatsbyConfigNames.map(
    (pluginName) => ({
      name: pluginName,
      //
      // we can't guaruntee this "resolve" path is where this plugin is on disk
      // but in the worst case scenario, this plugin will simply
      // not have types created for it until it's added to gatsby-config.js
      resolve: `${process.cwd()}/node_modules/${pluginName}`,
    })
  )

  let typeString = ``
  const pascalNames = []

  const plugins = [...flattenedPlugins, ...pluginsNotInGatsbyConfig]

  const excludedNames = [
    "dev-404-page",
    "bundle-optimisations",
    "gatsby-config",
    "default-site-plugin",
    "internal-data-bridge",
    "load-babel-config",
    "prod-404",
    "webpack-theme-component-shadowing",
  ]

  for (const pluginInfo of plugins) {
    if (excludedNames.includes(pluginInfo.name)) {
      continue
    }

    const pascalName = pascalcase(pluginInfo.name)

    let pluginWasTyped = false

    try {
      const pluginRequire = require(`${pluginInfo.resolve}/gatsby-node.js`)

      if (pluginRequire.pluginOptionsSchema) {
        const schema = pluginRequire
          .pluginOptionsSchema({ Joi })
          .label(pascalName)

        let typeContent

        try {
          const { content } = convertSchema({}, schema) || {}

          if (content) {
            typeContent = content
          }
        } catch (e) {
          if (
            e.message &&
            e.message.includes(`Cannot convert undefined or null to object`)
          ) {
            console.warn(
              `[gatsby-plugin-config] failed to generate types for ${pluginInfo.name}\nError: ${e.message}\n\n`
            )

            continue
          } else {
            throw Error(e)
          }
        }

        if (typeContent) {
          typeString += `${typeContent}\n\n`
          typeString += `interface ${pascalName}PluginObject {
    resolve: "${pluginInfo.name}"
    options: ${pascalName}
}\n\n`
          pluginWasTyped = true
        }
      }

      if (!pluginWasTyped) {
        const pluginTypeAny = `interface ${pascalName}PluginObject {
    resolve: "${pluginInfo.name}"
    options: any
}`

        typeString += `${pluginTypeAny}\n\n`
      }
    } catch (e) {
      if (e.message && !e.message.includes(`Cannot find module`)) {
        console.error(
          `[gatsby-plugin-config] Error occurred while getting types for ${pluginInfo.name}:\n${e.message}`
        )
      }

      continue
    }

    // we add this at the end because at this point
    // if we made it here without continuing, the
    // type for this plugin was generated properly
    // we don't want to add type names that don't exist
    // or it will break intellisense
    pascalNames.push(pascalName)
  }

  typeString += `type Plugin = ${plugins
    .filter(({ name }) => !excludedNames.includes(name))
    .map(({ name }) => `"${name}"`)
    .join(` | `)} | ${pascalNames
    .map((name) => `${name}PluginObject`)
    .join(` | `)}

  interface GatsbyConfigObject {
      plugins: Plugin[]
  }
  
  declare const gatsbyConfigObject: (config: GatsbyConfigObject) => GatsbyConfigObject
  
  export = gatsbyConfigObject;`

  await fs.writeFile(`${__dirname}/index.d.ts`, typeString)
}
