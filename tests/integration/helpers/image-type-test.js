import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | image-type', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('type', 'image/gif');
    await render(hbs`{{is-image-type type}}`);
    assert.equal(this.element.textContent.trim(), 'true');
  });
});
