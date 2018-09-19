# contentful-fragment

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Installation on Contentful Space

1. Navigate to your Contentful Space
2. Select the "Settings" dropdown, and click "Extensions"
3. Click the "Add Extension" button, and select "Add a new extension"
4. For name, enter `Contentful Fragment`
5. For Field Types, deselect Symbol, and select `Object`
6. For hosting, select `Self-hosted (src)`
7. For Hosting, enter `https://extension.contentful-fragment.io`

Finally, click "Save".

Now, when you're adding fields to your Content Model, you'll be able to
use Contentful Fragment with any `JSON object` field type. Just navigate
to the "Appearance" settings for your field, and select "Contentful Fragment"!

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
