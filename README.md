# gatsby-config
 A typescript generator for `gatsby-config.js` plugins. Adds intellisense for Gatsby plugins to your IDE to make API's discoverable.

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

Now when you run `gatsby develop`, typescript types will be generated for any Gatsby plugins you have installed that implement the `pluginOptionsSchema` Node API (see https://www.gatsbyjs.com/docs/node-apis/#pluginOptionsSchema for more info).

If you're using an IDE which automatically uses TypeScript types for intellisense (like VSCode), you'll be able to use autocompletion and the intellisense dropdown to discover plugins options and read their descriptions and expected value types.

