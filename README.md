# Contentful Fragment 

Contentful Fragment is a [Contentful UI Extension](https://www.contentful.com/developers/docs/concepts/uiextensions/) that allows content
modellers to add a "mini" model fragment inside of their content types.
It's intended for small, repeatable pieces of content that don't necessarily 
warrant their own model.

## Installation on Contentful Space

1. Navigate to your Contentful Space
2. Select the "Settings" dropdown, and click "Extensions"
3. Click the "Add Extension" button, and select "Install from Github"
4. To get auto-updates on the master channel, enter `https://github.com/sanctuarycomputer/contentful-fragment/blob/master/dist/extension.json`

Finally, click "Install".

Now, when you're adding fields to your Content Model, you'll be able to
use Contentful Fragment with any `JSON object` field type. Just navigate
to the "Appearance" settings for your field, and select "Contentful Fragment"!

## Using a predefined schema for all instances

In order to strictly dictate the schema for a Contentful Fragment so that
your content editor can not change it (and potentially break the site), you'll
need to use a predefined schema.

A predefined schema is simply a string, formatted like so:
```
[Schema Key]:[Schema Type],[Schema Key]:[Schema Type]
```

For example:
```
Event Name:Symbol,Event Date:Date,Company Logo:Blob
```

To configure that schema, as a Content Modeller, navigate to the "Appearance" 
tab of your Contentful field, and under "Predefined Schema", enter your schema 
string.

This will disable the schema editor from the Fragment UI, and preload that 
schema for your fragments to use in each instance of that model.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd contentful-fragment`
* `npm install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
