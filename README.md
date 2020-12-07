# gatsby-config
This plugin adds intellisense and autocompletion to `gatsby-config.js` for plugins in the plugins array! It makes Gatsby plugin API's discoverable :)
 
Watch this video for a demo https://youtu.be/sGLlEcleumg

![Gatsby Plugin resolve intellisense dropdown](https://github.com/TylerBarnes/gatsby-config/blob/main/assets/resolve-intellisense.png)

![Gatsby Plugin options intellisense dropdown](https://github.com/TylerBarnes/gatsby-config/blob/main/assets/options-intellisense.png)

## Setting it up

In `gatsby-config.js` add the following:

```js
const gatsbyConfig = require(`gatsby-config`)

module.exports = gatsbyConfig({
    plugins: [
        `gatsby-config`,
        // add any other plugins here
    ]
})
```

Now when you run `gatsby develop`, typescript types will be generated for any Gatsby plugins you have installed that implement the `pluginOptionsSchema` Node API (see https://www.gatsbyjs.com/docs/node-apis/#pluginOptionsSchema for more info). Those types will be added to the `gatsbyConfig` helper seen in the example above and that will enable intellisense and autocompletion for those plugins.

If you're using an IDE which automatically uses TypeScript types for intellisense (like VSCode), you'll be able to use autocompletion and the intellisense dropdown to discover plugin options and read their descriptions and the expected types of values.

