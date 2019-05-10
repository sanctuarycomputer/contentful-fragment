'use strict';



;define('contentful-fragment/app', ['exports', 'contentful-fragment/resolver', 'ember-load-initializers', 'contentful-fragment/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
;define('contentful-fragment/components/file-dropzone', ['exports', 'ember-file-upload/components/file-dropzone/component'], function (exports, _component) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _component.default;
    }
  });
});
;define('contentful-fragment/components/file-upload', ['exports', 'ember-file-upload/components/file-upload/component'], function (exports, _component) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _component.default;
    }
  });
});
;define('contentful-fragment/components/muuri-grid-component', ['exports', 'muuri'], function (exports, _muuri) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['muuri-grid-component'],
    didInsertElement() {
      this._super(...arguments);
      this.grid = new _muuri.default(this.element, {
        dragEnabled: true,
        dragSortInterval: 100,
        dragReleaseDuration: 300,
        dragReleaseEasing: 'ease',
        dragStartPredicate: {
          handle: '.cf-card-icon'
        }
      });
      this.grid.on('layoutEnd', items => {
        const newOrder = items.map(item => item.getElement().dataset.id);
        return Ember.get(this, 'updateSort')(newOrder);
      });
    },
    didUpdate() {
      const grid = Ember.get(this, 'grid');
      const prevItems = Ember.get(this, 'grid._items');
      const prevItemIds = prevItems.map(item => item._element.getAttribute('data-id'));

      const currentItemIds = [];
      const currentGridElements = document.getElementsByClassName('muuri-item-component');

      for (var i = 0; i < currentGridElements.length; i++) {
        const itemEl = currentGridElements[i];
        const uuid = itemEl.getAttribute('data-id');
        if (!prevItemIds.includes(uuid)) {
          grid.add(itemEl);
        }
        currentItemIds.push(uuid);
      }

      prevItems.forEach(item => {
        const itemEl = item._element;
        if (!currentItemIds.includes(itemEl.getAttribute('data-id'))) {
          grid.remove(itemEl);
        }
      });

      grid.refreshItems();
    },
    willRemoveElement() {
      delete this.grid;
    }
  });
});
;define('contentful-fragment/components/muuri-item-component', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['muuri-item-component', 'mb1'],
    classNameBindings: ['isEditing:muuri-item-component--editing'],
    attributeBindings: ['uuid:data-id'],
    modelId: Ember.computed('uuid', function () {
      return this.get('uuid');
    })
  });
});
;define('contentful-fragment/components/pikaday-input', ['exports', 'ember-pikaday/components/pikaday-input'], function (exports, _pikadayInput) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pikadayInput.default;
});
;define('contentful-fragment/components/pikaday-inputless', ['exports', 'ember-pikaday/components/pikaday-inputless'], function (exports, _pikadayInputless) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pikadayInputless.default;
    }
  });
});
;define('contentful-fragment/controllers/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    extension: Ember.inject.service(),
    fileQueue: Ember.inject.service(),

    editingUUID: "",
    showPreview: false,

    actions: {
      addFragment() {
        const newFragment = Ember.get(this, 'extension').addFragment();
        if (!newFragment) return;
        const uuid = Ember.get(newFragment.findBy('key', 'uuid'), 'value');
        // TODO: re-enable this after muuri rerender on "iEditing"
        // bug is fixed
        // set(this, 'editingUUID', uuid);
        return uuid;
      },

      editFragment(uuid) {
        Ember.set(this, 'editingUUID', uuid);
      },

      cancelEditing() {
        Ember.set(this, 'editingUUID', "");
      },

      removeFragment(fragment) {
        Ember.get(this, 'extension').removeFragment(fragment);
        Ember.set(this, 'editingUUID', "");
      },

      // Savers
      save() {
        Ember.get(this, 'extension').persist();
      },

      saveDate(fragmentField, date) {
        if (date) {
          Ember.set(fragmentField, 'value', date.toISOString());
          Ember.get(this, 'extension').persist();
        }
      },

      saveBlob(fragmentField, file) {
        if (!file) return;

        const { name, size, type } = file;
        return file.readAsDataURL().then(data => {
          Ember.set(fragmentField, 'value', {
            data, name, size, type
          });
          return Ember.get(this, 'extension').persist();
        }).finally(() => {
          const queue = Ember.get(this, 'fileQueue.queues').find(queue => Ember.get(queue, 'files').includes(file));
          if (queue) queue.remove(file);
        });
      },

      showPreview() {
        Ember.set(this, 'showPreview', true);
      },

      hidePreview() {
        Ember.set(this, 'showPreview', false);
      },

      updateSort(order) {
        Ember.get(this, 'extension').updateSort(order);
      }
    }
  });
});
;define('contentful-fragment/controllers/schema', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    extension: Ember.inject.service(),

    deletingUUID: "",

    actions: {
      stageFieldDeletion(field) {
        Ember.set(this, 'deletingUUID', field.uuid);
      },
      unstageFieldDeletion() {
        Ember.set(this, 'deletingUUID', "");
      },
      addEmptySchemaField() {
        Ember.get(this, 'extension').addSchemaField();
      },
      keyDidChange() {
        Ember.get(this, 'extension').validateSchema();
      },
      setFieldType(value) {
        const [uuid, type] = value.split('-');
        const field = Ember.get(this, 'extension.data._schema').findBy('uuid', uuid);
        Ember.set(field, 'type', type);
        Ember.get(this, 'extension').validateSchema();
      },
      cancel() {
        this.transitionToRoute('index');
      },
      save() {
        Ember.get(this, 'extension').persist().then(() => {
          Ember.get(this, 'extension').syncFragmentsToSchema();
          this.transitionToRoute('index');
        });
      },
      removeFragmentField(field) {
        Ember.get(this, 'extension').removeSchemaField(field);
      }
    }

  });
});
;define('contentful-fragment/helpers/and', ['exports', 'ember-truth-helpers/helpers/and'], function (exports, _and) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _and.default;
    }
  });
  Object.defineProperty(exports, 'and', {
    enumerable: true,
    get: function () {
      return _and.and;
    }
  });
});
;define('contentful-fragment/helpers/app-version', ['exports', 'contentful-fragment/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version;
    // e.g. 1.0.0-alpha.1+4jds75hf

    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility
    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;

    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      }
      // Fallback to just version
      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
;define('contentful-fragment/helpers/append', ['exports', 'ember-composable-helpers/helpers/append'], function (exports, _append) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _append.default;
    }
  });
  Object.defineProperty(exports, 'append', {
    enumerable: true,
    get: function () {
      return _append.append;
    }
  });
});
;define('contentful-fragment/helpers/array', ['exports', 'ember-composable-helpers/helpers/array'], function (exports, _array) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _array.default;
    }
  });
  Object.defineProperty(exports, 'array', {
    enumerable: true,
    get: function () {
      return _array.array;
    }
  });
});
;define('contentful-fragment/helpers/chunk', ['exports', 'ember-composable-helpers/helpers/chunk'], function (exports, _chunk) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _chunk.default;
    }
  });
  Object.defineProperty(exports, 'chunk', {
    enumerable: true,
    get: function () {
      return _chunk.chunk;
    }
  });
});
;define('contentful-fragment/helpers/compact', ['exports', 'ember-composable-helpers/helpers/compact'], function (exports, _compact) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _compact.default;
    }
  });
});
;define('contentful-fragment/helpers/compute', ['exports', 'ember-composable-helpers/helpers/compute'], function (exports, _compute) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _compute.default;
    }
  });
  Object.defineProperty(exports, 'compute', {
    enumerable: true,
    get: function () {
      return _compute.compute;
    }
  });
});
;define('contentful-fragment/helpers/contains', ['exports', 'ember-composable-helpers/helpers/contains'], function (exports, _contains) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _contains.default;
    }
  });
  Object.defineProperty(exports, 'contains', {
    enumerable: true,
    get: function () {
      return _contains.contains;
    }
  });
});
;define('contentful-fragment/helpers/dec', ['exports', 'ember-composable-helpers/helpers/dec'], function (exports, _dec) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dec.default;
    }
  });
  Object.defineProperty(exports, 'dec', {
    enumerable: true,
    get: function () {
      return _dec.dec;
    }
  });
});
;define('contentful-fragment/helpers/drop', ['exports', 'ember-composable-helpers/helpers/drop'], function (exports, _drop) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _drop.default;
    }
  });
});
;define('contentful-fragment/helpers/eq', ['exports', 'ember-truth-helpers/helpers/equal'], function (exports, _equal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _equal.default;
    }
  });
  Object.defineProperty(exports, 'equal', {
    enumerable: true,
    get: function () {
      return _equal.equal;
    }
  });
});
;define('contentful-fragment/helpers/file-queue', ['exports', 'ember-file-upload/helpers/file-queue'], function (exports, _fileQueue) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _fileQueue.default;
    }
  });
});
;define('contentful-fragment/helpers/filter-by', ['exports', 'ember-composable-helpers/helpers/filter-by'], function (exports, _filterBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _filterBy.default;
    }
  });
});
;define('contentful-fragment/helpers/filter', ['exports', 'ember-composable-helpers/helpers/filter'], function (exports, _filter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _filter.default;
    }
  });
});
;define('contentful-fragment/helpers/find-by', ['exports', 'ember-composable-helpers/helpers/find-by'], function (exports, _findBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _findBy.default;
    }
  });
});
;define('contentful-fragment/helpers/flatten', ['exports', 'ember-composable-helpers/helpers/flatten'], function (exports, _flatten) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _flatten.default;
    }
  });
  Object.defineProperty(exports, 'flatten', {
    enumerable: true,
    get: function () {
      return _flatten.flatten;
    }
  });
});
;define('contentful-fragment/helpers/group-by', ['exports', 'ember-composable-helpers/helpers/group-by'], function (exports, _groupBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _groupBy.default;
    }
  });
});
;define('contentful-fragment/helpers/gt', ['exports', 'ember-truth-helpers/helpers/gt'], function (exports, _gt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _gt.default;
    }
  });
  Object.defineProperty(exports, 'gt', {
    enumerable: true,
    get: function () {
      return _gt.gt;
    }
  });
});
;define('contentful-fragment/helpers/gte', ['exports', 'ember-truth-helpers/helpers/gte'], function (exports, _gte) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _gte.default;
    }
  });
  Object.defineProperty(exports, 'gte', {
    enumerable: true,
    get: function () {
      return _gte.gte;
    }
  });
});
;define('contentful-fragment/helpers/has-next', ['exports', 'ember-composable-helpers/helpers/has-next'], function (exports, _hasNext) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _hasNext.default;
    }
  });
  Object.defineProperty(exports, 'hasNext', {
    enumerable: true,
    get: function () {
      return _hasNext.hasNext;
    }
  });
});
;define('contentful-fragment/helpers/has-previous', ['exports', 'ember-composable-helpers/helpers/has-previous'], function (exports, _hasPrevious) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _hasPrevious.default;
    }
  });
  Object.defineProperty(exports, 'hasPrevious', {
    enumerable: true,
    get: function () {
      return _hasPrevious.hasPrevious;
    }
  });
});
;define('contentful-fragment/helpers/inc', ['exports', 'ember-composable-helpers/helpers/inc'], function (exports, _inc) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _inc.default;
    }
  });
  Object.defineProperty(exports, 'inc', {
    enumerable: true,
    get: function () {
      return _inc.inc;
    }
  });
});
;define('contentful-fragment/helpers/intersect', ['exports', 'ember-composable-helpers/helpers/intersect'], function (exports, _intersect) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _intersect.default;
    }
  });
});
;define('contentful-fragment/helpers/invoke', ['exports', 'ember-composable-helpers/helpers/invoke'], function (exports, _invoke) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _invoke.default;
    }
  });
  Object.defineProperty(exports, 'invoke', {
    enumerable: true,
    get: function () {
      return _invoke.invoke;
    }
  });
});
;define('contentful-fragment/helpers/is-after', ['exports', 'ember-moment/helpers/is-after'], function (exports, _isAfter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isAfter.default;
    }
  });
});
;define('contentful-fragment/helpers/is-array', ['exports', 'ember-truth-helpers/helpers/is-array'], function (exports, _isArray) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isArray.default;
    }
  });
  Object.defineProperty(exports, 'isArray', {
    enumerable: true,
    get: function () {
      return _isArray.isArray;
    }
  });
});
;define('contentful-fragment/helpers/is-before', ['exports', 'ember-moment/helpers/is-before'], function (exports, _isBefore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isBefore.default;
    }
  });
});
;define('contentful-fragment/helpers/is-between', ['exports', 'ember-moment/helpers/is-between'], function (exports, _isBetween) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isBetween.default;
    }
  });
});
;define('contentful-fragment/helpers/is-empty', ['exports', 'ember-truth-helpers/helpers/is-empty'], function (exports, _isEmpty) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isEmpty.default;
    }
  });
});
;define('contentful-fragment/helpers/is-equal', ['exports', 'ember-truth-helpers/helpers/is-equal'], function (exports, _isEqual) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
  Object.defineProperty(exports, 'isEqual', {
    enumerable: true,
    get: function () {
      return _isEqual.isEqual;
    }
  });
});
;define('contentful-fragment/helpers/is-image-type', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.imageType = imageType;
  function imageType(params /*, hash*/) {
    const type = params[0] || "";
    return type.startsWith('image/');
  }

  exports.default = Ember.Helper.helper(imageType);
});
;define('contentful-fragment/helpers/is-same-or-after', ['exports', 'ember-moment/helpers/is-same-or-after'], function (exports, _isSameOrAfter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSameOrAfter.default;
    }
  });
});
;define('contentful-fragment/helpers/is-same-or-before', ['exports', 'ember-moment/helpers/is-same-or-before'], function (exports, _isSameOrBefore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSameOrBefore.default;
    }
  });
});
;define('contentful-fragment/helpers/is-same', ['exports', 'ember-moment/helpers/is-same'], function (exports, _isSame) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSame.default;
    }
  });
});
;define('contentful-fragment/helpers/join', ['exports', 'ember-composable-helpers/helpers/join'], function (exports, _join) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _join.default;
    }
  });
});
;define('contentful-fragment/helpers/lt', ['exports', 'ember-truth-helpers/helpers/lt'], function (exports, _lt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lt.default;
    }
  });
  Object.defineProperty(exports, 'lt', {
    enumerable: true,
    get: function () {
      return _lt.lt;
    }
  });
});
;define('contentful-fragment/helpers/lte', ['exports', 'ember-truth-helpers/helpers/lte'], function (exports, _lte) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lte.default;
    }
  });
  Object.defineProperty(exports, 'lte', {
    enumerable: true,
    get: function () {
      return _lte.lte;
    }
  });
});
;define('contentful-fragment/helpers/map-by', ['exports', 'ember-composable-helpers/helpers/map-by'], function (exports, _mapBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _mapBy.default;
    }
  });
});
;define('contentful-fragment/helpers/map', ['exports', 'ember-composable-helpers/helpers/map'], function (exports, _map) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _map.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-add', ['exports', 'ember-moment/helpers/moment-add'], function (exports, _momentAdd) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentAdd.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-calendar', ['exports', 'ember-moment/helpers/moment-calendar'], function (exports, _momentCalendar) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentCalendar.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-diff', ['exports', 'ember-moment/helpers/moment-diff'], function (exports, _momentDiff) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentDiff.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-duration', ['exports', 'ember-moment/helpers/moment-duration'], function (exports, _momentDuration) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentDuration.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-format', ['exports', 'ember-moment/helpers/moment-format'], function (exports, _momentFormat) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFormat.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-from-now', ['exports', 'ember-moment/helpers/moment-from-now'], function (exports, _momentFromNow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFromNow.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-from', ['exports', 'ember-moment/helpers/moment-from'], function (exports, _momentFrom) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFrom.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-subtract', ['exports', 'ember-moment/helpers/moment-subtract'], function (exports, _momentSubtract) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentSubtract.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-to-date', ['exports', 'ember-moment/helpers/moment-to-date'], function (exports, _momentToDate) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentToDate.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-to-now', ['exports', 'ember-moment/helpers/moment-to-now'], function (exports, _momentToNow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentToNow.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-to', ['exports', 'ember-moment/helpers/moment-to'], function (exports, _momentTo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentTo.default;
    }
  });
});
;define('contentful-fragment/helpers/moment-unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _unix) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
});
;define('contentful-fragment/helpers/moment', ['exports', 'ember-moment/helpers/moment'], function (exports, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _moment.default;
    }
  });
});
;define('contentful-fragment/helpers/next', ['exports', 'ember-composable-helpers/helpers/next'], function (exports, _next) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _next.default;
    }
  });
  Object.defineProperty(exports, 'next', {
    enumerable: true,
    get: function () {
      return _next.next;
    }
  });
});
;define('contentful-fragment/helpers/not-eq', ['exports', 'ember-truth-helpers/helpers/not-equal'], function (exports, _notEqual) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _notEqual.default;
    }
  });
  Object.defineProperty(exports, 'notEq', {
    enumerable: true,
    get: function () {
      return _notEqual.notEq;
    }
  });
});
;define('contentful-fragment/helpers/not', ['exports', 'ember-truth-helpers/helpers/not'], function (exports, _not) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _not.default;
    }
  });
  Object.defineProperty(exports, 'not', {
    enumerable: true,
    get: function () {
      return _not.not;
    }
  });
});
;define('contentful-fragment/helpers/now', ['exports', 'ember-moment/helpers/now'], function (exports, _now) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _now.default;
    }
  });
});
;define('contentful-fragment/helpers/object-at', ['exports', 'ember-composable-helpers/helpers/object-at'], function (exports, _objectAt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _objectAt.default;
    }
  });
  Object.defineProperty(exports, 'objectAt', {
    enumerable: true,
    get: function () {
      return _objectAt.objectAt;
    }
  });
});
;define('contentful-fragment/helpers/optional', ['exports', 'ember-composable-helpers/helpers/optional'], function (exports, _optional) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _optional.default;
    }
  });
  Object.defineProperty(exports, 'optional', {
    enumerable: true,
    get: function () {
      return _optional.optional;
    }
  });
});
;define('contentful-fragment/helpers/or', ['exports', 'ember-truth-helpers/helpers/or'], function (exports, _or) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _or.default;
    }
  });
  Object.defineProperty(exports, 'or', {
    enumerable: true,
    get: function () {
      return _or.or;
    }
  });
});
;define('contentful-fragment/helpers/pipe-action', ['exports', 'ember-composable-helpers/helpers/pipe-action'], function (exports, _pipeAction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pipeAction.default;
    }
  });
});
;define('contentful-fragment/helpers/pipe', ['exports', 'ember-composable-helpers/helpers/pipe'], function (exports, _pipe) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pipe.default;
    }
  });
  Object.defineProperty(exports, 'pipe', {
    enumerable: true,
    get: function () {
      return _pipe.pipe;
    }
  });
});
;define('contentful-fragment/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
;define('contentful-fragment/helpers/previous', ['exports', 'ember-composable-helpers/helpers/previous'], function (exports, _previous) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _previous.default;
    }
  });
  Object.defineProperty(exports, 'previous', {
    enumerable: true,
    get: function () {
      return _previous.previous;
    }
  });
});
;define('contentful-fragment/helpers/queue', ['exports', 'ember-composable-helpers/helpers/queue'], function (exports, _queue) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _queue.default;
    }
  });
  Object.defineProperty(exports, 'queue', {
    enumerable: true,
    get: function () {
      return _queue.queue;
    }
  });
});
;define('contentful-fragment/helpers/range', ['exports', 'ember-composable-helpers/helpers/range'], function (exports, _range) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _range.default;
    }
  });
  Object.defineProperty(exports, 'range', {
    enumerable: true,
    get: function () {
      return _range.range;
    }
  });
});
;define('contentful-fragment/helpers/reduce', ['exports', 'ember-composable-helpers/helpers/reduce'], function (exports, _reduce) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _reduce.default;
    }
  });
});
;define('contentful-fragment/helpers/reject-by', ['exports', 'ember-composable-helpers/helpers/reject-by'], function (exports, _rejectBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _rejectBy.default;
    }
  });
});
;define('contentful-fragment/helpers/repeat', ['exports', 'ember-composable-helpers/helpers/repeat'], function (exports, _repeat) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _repeat.default;
    }
  });
  Object.defineProperty(exports, 'repeat', {
    enumerable: true,
    get: function () {
      return _repeat.repeat;
    }
  });
});
;define('contentful-fragment/helpers/reverse', ['exports', 'ember-composable-helpers/helpers/reverse'], function (exports, _reverse) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _reverse.default;
    }
  });
});
;define('contentful-fragment/helpers/shuffle', ['exports', 'ember-composable-helpers/helpers/shuffle'], function (exports, _shuffle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _shuffle.default;
    }
  });
  Object.defineProperty(exports, 'shuffle', {
    enumerable: true,
    get: function () {
      return _shuffle.shuffle;
    }
  });
});
;define('contentful-fragment/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
;define('contentful-fragment/helpers/slice', ['exports', 'ember-composable-helpers/helpers/slice'], function (exports, _slice) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _slice.default;
    }
  });
});
;define('contentful-fragment/helpers/sort-by', ['exports', 'ember-composable-helpers/helpers/sort-by'], function (exports, _sortBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _sortBy.default;
    }
  });
});
;define('contentful-fragment/helpers/take', ['exports', 'ember-composable-helpers/helpers/take'], function (exports, _take) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _take.default;
    }
  });
});
;define('contentful-fragment/helpers/toggle-action', ['exports', 'ember-composable-helpers/helpers/toggle-action'], function (exports, _toggleAction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _toggleAction.default;
    }
  });
});
;define('contentful-fragment/helpers/toggle', ['exports', 'ember-composable-helpers/helpers/toggle'], function (exports, _toggle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _toggle.default;
    }
  });
  Object.defineProperty(exports, 'toggle', {
    enumerable: true,
    get: function () {
      return _toggle.toggle;
    }
  });
});
;define('contentful-fragment/helpers/union', ['exports', 'ember-composable-helpers/helpers/union'], function (exports, _union) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _union.default;
    }
  });
});
;define('contentful-fragment/helpers/unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _unix) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
});
;define('contentful-fragment/helpers/utc', ['exports', 'ember-moment/helpers/utc'], function (exports, _utc) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _utc.default;
    }
  });
  Object.defineProperty(exports, 'utc', {
    enumerable: true,
    get: function () {
      return _utc.utc;
    }
  });
});
;define('contentful-fragment/helpers/without', ['exports', 'ember-composable-helpers/helpers/without'], function (exports, _without) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _without.default;
    }
  });
  Object.defineProperty(exports, 'without', {
    enumerable: true,
    get: function () {
      return _without.without;
    }
  });
});
;define('contentful-fragment/helpers/xor', ['exports', 'ember-truth-helpers/helpers/xor'], function (exports, _xor) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _xor.default;
    }
  });
  Object.defineProperty(exports, 'xor', {
    enumerable: true,
    get: function () {
      return _xor.xor;
    }
  });
});
;define('contentful-fragment/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'contentful-fragment/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  let name, version;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
;define('contentful-fragment/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
;define('contentful-fragment/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
;define('contentful-fragment/initializers/export-application-global', ['exports', 'contentful-fragment/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
;define("contentful-fragment/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
;define('contentful-fragment/lib/generateUUID', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = generateUUID;
  function generateUUID() {
    let d = new Date().getTime();
    if (window.performance && typeof window.performance.now === 'function') {
      d += performance.now(); // use high-precision timer if available
    }
    const uuid = 'xxxxxx'.replace(/[xy]/g, c => {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
  }
});
;define('contentful-fragment/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
;define('contentful-fragment/router', ['exports', 'contentful-fragment/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootRouterURL
  });

  Router.map(function () {
    this.route('schema');
  });

  exports.default = Router;
});
;define('contentful-fragment/routes/application', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  const DUMMY_DATA = {
    "_schema": [{
      "key": "Event Location",
      "type": "Symbol",
      "uuid": "6a92b9"
    }, {
      "key": "Event Url",
      "type": "Symbol",
      "uuid": "6a27d9"
    }, {
      "key": "Event Date",
      "type": "Date",
      "uuid": "a592h9"
    }, {
      "key": "Logo",
      "type": "Blob",
      "uuid": "a592f3"
    }],
    "fragments": [[{
      "key": "uuid",
      "value": "c36d6d"
    }, {
      "key": "Event Location",
      "value": "Sanctuary Computer Inc",
      "type": "Symbol",
      "_schemaRef": "6a92b9"
    }, {
      "key": "Event Url",
      "value": "https://www.google.com/maps/place/Sanctuary+Computer/@40.71811,-73.997507,17z/data=!3m1!4b1!4m5!3m4!1s0x89c259880e5637e3:0xcdc06390643521f5!8m2!3d40.71811!4d-73.995313",
      "type": "Symbol",
      "_schemaRef": "6a27d9"
    }, {
      "key": "Event Date",
      "value": new Date().setDate(new Date().getDate() + 1),
      "type": "Date",
      "_schemaRef": "a592h9"
    }, {
      "key": "Logo",
      "value": {
        "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABHCAYAAABPjLqRAAAAAXNSR0IArs4c6QAABv1JREFUeAHdW02MFEUUrlfTvQtKVgFNBELwb1HjxZ8QREOMMSYCLgwLB90dVjQRPKBevLlZcYM3L+pFMVGEWcIBlmFXwESMMUaRkOjJiOAfEn4SBZSg7G73dPleubPpnelhq3q6uqfsZDLV1e/ne19Xd1W9qgb2PzvEvp57fVHOs4AtFSDmgWBzKUQB7AwIOM04+8KBXAlWbf9WN3TQVWhWeb/UvTYQbAsT4g4ljAA/cGC9Tn5gt5I8CllPlhhad4vvBzsFEw+oBh2WAwZfOw7vgpU7fgnXR5WtJssbXPcwg2CPEGJ2VHCqdQBwngm+xu3c8fnVdKwlSxLFgk+wRblXC1D1GrYwjzH+2NUIs5Is+eiVg6ONtqhqIqmFOTm+qN4jyasVbDiX76gGH72oOIl8sh11jeqsI4t6vbgv83okhOvJNvkI11XK1pElhwcV9Ib+6/mwiiwacCqPoxohEsdq0leVDavIkiPzqgBMnUb5soosmsKYIqfGboQvq8iiuV5NUIYqonxZRVZlUmyIn0lmo3xZRdakaEyfANJVdVhFFqVZqvAbO8Xx1tlq41aRJfNR1REYOo/yZRVZlLgzxE2t2QhfVpFFGc7aqMzURPmyLuswtrf7mPFRPGZRW1YP3Fl9G6xqWQSeUsHVQSR9Xs+HdS2LiPEGuw+byjxQmtntHFgSdQOcqErdOvFxYY53heWZCBahs7tQfz5m99vwcbmGAfzDBLuEdacwwO8Z8KPudFaCx4s1XbOqX8qZ++aSf131cMRuWWJ/1wJ/lK/BRaZOBuJBIdQXPwCQPgFf4XrJoOPy3dCx/bd6AOvVW5FWFgeeubE8NtYvAvEcDnFz9YJRrce7VQYO7+VaWvpg+Qe/q+qRXNMuWIgDL7T6IxdfxFbUi+nXNp2gVGQx/30JW9sWZ9rMt2D526MqOiTTdEthYrBnoQflIeNdNkWP3bbruB3Qse0EnaoeTbHI6pUKS1kQlPCRm6UKvFE5fDQvMM7zbr6oPWLPbPne31foFuXgfSSqpVECdPWRsDHI8WedVcUBXV1T8nV7Q3+w++mAiW2mHKva5QzWO50DH6rKm5SLJEsMF+7zPfEl9u/TTDpXsY3jthHHhYego/iNirxJmZrpjhjecIPnicFmIIoCJxwSD+IySYSK7Ulk4ZAAfP/vXQhxgYpyejJiAeEifOn5rPU0iaxyad2TCOjRWrHsawgX4csSyQRZ4rPNTiCC17IEM5Vvwkc4p5IzdX2CrPJfP65HJ+2mHCVkt30cZ0Lm9MzIdwBNZbzR8yfwbTpfTz0DaWCn3NbZ7TpToqRQypZVHr24zAqiKGq8oRJvUgxo2JFkBYw9oaGTuWhWeDl1xyDEiswZ0ABAeLMYRnBvqOd+HPjdpIE1c1HCS7jTBsIhEMvSdpqEvyxwc7xLdycBPm0bWeDGF7xYmHagyfhLHzfHNf05yYBP10oWuKllzUg3zKS8pY+bxlnTk4Kfsp3UcRNZV1IOMil3qeNGsuByUujTtZM+bgc3mp7F+ZZVg1K6KRJ3g3dHDPfM88vlDbiavhIzCrdKu4z9jCvmQ04utxVXyk+HXVDLOh6usKfcGO6xUmGj7/nHcGW9D9dD78HpUxv9ZBnr6BrJhPnA3TXwXbjClnIjuL29Xb24FvoOLvHVHQnIaygjZcdJ4YLDQVsICuOMixvXQilp0B+2NUW5f1wHdy7QIsXewhmbJtPYqs45q4tzcX8ENgD1g1LS3p/HKcl5s7oWSgL71b1+YTsnh5ik2a+lnLEw4dUliiCXL/20VpsoUkRySRdf8PKjw4/o35YDQcfCGwRBR9wYSVeSlWudeRCb2qm4hlLVQ5wSbyynYnEsNakkFkuyKPnPgffHN5SeJuGMu1iB77rY40nSlWRRqLnrbt+Gf1p7okgv5ePEOM6U3f7nboIseGSzj3ft1UxQKDolfIRTUbxGDHv8czWVihWkO0EW6eTyO3ZhL/Opon6qYjgFOUT4GnMKR+Lrw5FJZFF37DjX4n4COBnfqAlNOOk4M56KM1wIo+GcD4fPdcqkO4ksUoaOrX+4LnTiC21Ex5gpWcIh8SCuRn3k2m7bTQNMbTuoQ7o1ZJEh2jiGs/DntY0aUMBt3xuT2sgm38ucb5L78BWxkiy2qk1St54ObU3kOV5A0sbqyZisJ7/k38kXtyfpB/eo0mylT8Nm37gONsopDtt2K08RzsRlSr9AELxRL/OAxFzGJvVyS774bkVpSrJI0IZ98JWAdP51k39KZEnC6AuL0QsvYfkVmSTTQaUgiz0dfQz1utM66824I3QFNw2JKJNV8dJM3+5UMKX1r01WBdjEV2Eg6MuwJdpfhTE4jIn0PU5rsAdW7DxZsdvM/7HJCgeV9veGYd9plv8FUfnd3bPHXo0AAAAASUVORK5CYII=",
        "name": "default image.png",
        "size": 1859,
        "type": "image/png"
      },
      "type": "Blob",
      "_schemaRef": "a592f3"
    }], [{
      "key": "uuid",
      "value": "0e4b5a"
    }, {
      "key": "Event Location",
      "value": "Human NYC",
      "type": "Symbol",
      "_schemaRef": "6a92b9"
    }, {
      "key": "Event Date",
      "value": null,
      "type": "Date",
      "_schemaRef": "a592h9"
    }, {
      "key": "Logo",
      "value": null,
      "type": "Blob",
      "_schemaRef": "a592f3"
    }]]
  };

  const DummyExtension = {
    parameters: {
      instance: {
        schemaShorthand: "Event Location:Symbol,Event Url: Symbol,Event Date:Date,Logo:Blob"
      }
    },
    field: {
      _value: DUMMY_DATA,
      getValue: function () {
        return _extends({}, DummyExtension.field._value);
      },
      setValue: function (newValue) {
        DummyExtension.field._value = newValue;
        window.newValue = newValue;
        return new Promise(resolve => resolve(newValue));
      }
    }
  };

  exports.default = Ember.Route.extend({
    extension: Ember.inject.service(),

    model() {
      const isDummy = ['localhost', 'contentful-fragment.now.sh'].includes(window.location.hostname);
      if (isDummy) return DummyExtension;

      return new Promise(window.contentfulFragment.getExtension, DummyExtension);
    },

    afterModel(contentfulExtension) {
      Ember.get(this, 'extension').setup(contentfulExtension);
    }
  });
});
;define('contentful-fragment/routes/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('contentful-fragment/routes/schema', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('contentful-fragment/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
;define('contentful-fragment/services/extension', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  const TYPES = ['Symbol', 'Date', 'Blob'];

  const emptyForType = () => /*type*/{
    // TODO
    return null;
  };

  const coerce = (type, value) => {
    if (!value) return emptyForType(type);
    return value;
  };

  const generateUUID = () => {
    let d = new Date().getTime();
    if (window.performance && typeof window.performance.now === 'function') {
      d += performance.now(); // use high-precision timer if available
    }
    const uuid = 'xxxxxx'.replace(/[xy]/g, c => {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
  };

  const validateSchemaField = field => {
    let validation = '';
    if (!field.key || field.key.length === 0) validation += 'Enter a key for this field';
    if (!field.type) {
      if (validation.length) validation += ', ';
      validation += 'Select a field type';
    }
    return validation;
  };

  const newFragmentFromSchema = schema => {
    return schema.reduce((acc, field) => {
      return [...acc, {
        key: field.key,
        value: emptyForType(field.type),
        type: field.type,
        _schemaRef: field.uuid
      }];
    }, [{
      key: 'uuid',
      value: generateUUID()
    }]);
  };

  exports.default = Ember.Service.extend({
    data: null,
    extension: null,
    preview: null,

    setup(extension) {
      Ember.set(this, 'data', extension.field.getValue() || {});
      Ember.set(this, 'extension', extension);
      this.loadSchemaFromShorthand();
      this.syncFragmentsToSchema();
      this.makeSimpleFragments();
    },

    setSetting(key, value) {
      Ember.set(this, 'data._settings', Ember.get(this, 'data._settings') || {});
      Ember.set(this, `data._settings.${key}`, value);
    },

    loadSchemaFromShorthand() {
      const shorthand = Ember.get(this, 'extension.parameters.instance.schemaShorthand') || "";
      if (!shorthand.length) return;

      const parsedSchemaFields = shorthand.split(",").map(tuple => tuple.split(":").map(t => t.trim()));
      const existingSchema = Ember.get(this, 'data._schema') || [];

      const loadedSchema = parsedSchemaFields.reduce((acc, fieldTuple) => {
        const [key, type] = fieldTuple;
        if (key.length === 0) {
          // eslint-disable-next-line
          console.warn(`Contentful Fragment: Your Predefined Schema included a blank schema key! Please refer to the documentation.`);
          return acc;
        }
        if (!TYPES.includes(type)) {
          // eslint-disable-next-line
          console.warn(`Contentful Fragment: Your Predefined Schema included unknown type: ${type}. Must be one of <${TYPES.join(' ')}>`);
          return acc;
        }
        const match = existingSchema.findBy('key', fieldTuple[0]);
        return [...acc, {
          uuid: match ? match.uuid : generateUUID(), key, type
        }];
      }, []).filter(schemaField => {
        return parsedSchemaFields.find(schemaTuple => schemaTuple[0] === schemaField.key);
      });

      this.setSetting('usesPredefinedSchema', true);
      Ember.set(this, 'data._schema', loadedSchema);
    },

    /* Main Editor */
    addFragment() {
      if (Ember.get(this, 'data._schema')) {
        Ember.set(this, 'data.fragments', Ember.get(this, 'data.fragments') || []);
        const newFragment = newFragmentFromSchema(Ember.get(this, 'data._schema'));
        Ember.get(this, 'data.fragments').pushObject(newFragment);
        this.persist();
        return newFragment;
      }
    },

    removeFragment(fragment) {
      if (Ember.get(this, 'data.fragments')) {
        const uuid = Ember.get(fragment.findBy('key', 'uuid'), 'value');
        const newFragments = this.data.fragments.reject(fragment => {
          return Ember.get(fragment.findBy('key', 'uuid'), 'value') === uuid;
        });
        Ember.set(this, 'data.fragments', newFragments);
        this.persist();
      }
    },

    /* Schema Editor */
    validateSchema() {
      Ember.get(this, 'data._schema').forEach(schemaField => {
        Ember.set(schemaField, 'validation', validateSchemaField(schemaField));
      });
    },

    syncFragmentsToSchema() {
      const { fragments, _schema = [] } = Ember.get(this, 'data');
      const syncedFragments = (fragments || []).map(fragment => {
        const syncedFragment = _schema.map(schemaField => {
          const dataForSchemaField = fragment.findBy('_schemaRef', schemaField.uuid);
          return {
            key: schemaField.key,
            type: schemaField.type,
            value: coerce(schemaField.type, dataForSchemaField ? dataForSchemaField.value : null),
            _schemaRef: schemaField.uuid
          };
        });
        return [fragment.findBy('key', 'uuid'), ...syncedFragment];
      });

      Ember.set(this, 'data.fragments', syncedFragments);
      this.persist();
    },

    addSchemaField() {
      const newField = { key: '', type: null, uuid: generateUUID(), validation: '' };
      Ember.set(newField, 'validation', validateSchemaField(newField));
      if (Ember.get(this, 'data._schema')) {
        Ember.get(this, 'data._schema').pushObject(newField);
      } else {
        Ember.set(this, 'data._schema', [newField]);
      }

      return newField;
    },

    removeSchemaField(field) {
      const newFields = Ember.get(this, 'data._schema').reject(existingField => {
        return existingField.uuid === field.uuid;
      });
      Ember.set(this, 'data._schema', newFields);
    },

    makeSimpleFragments() {
      const simpleFragments = (Ember.get(this, 'data.fragments') || []).reduce((simpleFragments, fragment, index) => {
        const uuid = Ember.get(fragment.findBy('key', 'uuid'), 'value');

        simpleFragments[uuid] = fragment.reduce((simpleFragment, fragmentField) => {
          if (fragmentField.key === "uuid") return simpleFragment;
          if (fragmentField.key) {
            simpleFragment[fragmentField.key.camelize()] = fragmentField.value;
          }

          return _extends({
            index,
            uuid
          }, simpleFragment);
        }, {});

        return simpleFragments;
      }, {});

      Ember.set(this, 'data.simpleFragments', simpleFragments);
    },

    generateJSONPreview() {
      try {
        const jsonPreview = JSON.stringify(this.data, null, 2);
        Ember.set(this, 'preview', jsonPreview);
      } catch (e) {
        Ember.set(this, 'preview', 'Could not generate preview');
      }
    },

    updateSort(order) {
      const fragments = Ember.get(this, 'data.fragments');
      const resorted = order.map(uuid => fragments.find(fragment => {
        const fragmentUuid = Ember.get(fragment.findBy('key', 'uuid'), 'value');
        return uuid === fragmentUuid;
      }));

      Ember.set(this, 'data.fragments', resorted);
      this.persist();
    },

    persist() {
      this.makeSimpleFragments();
      this.generateJSONPreview();
      return this.extension.field.setValue(Ember.get(this, 'data'));
    }
  });
});
;define('contentful-fragment/services/file-queue', ['exports', 'ember-file-upload/services/file-queue'], function (exports, _fileQueue) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _fileQueue.default;
    }
  });
});
;define('contentful-fragment/services/moment', ['exports', 'ember-moment/services/moment', 'contentful-fragment/config/environment'], function (exports, _moment, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const { get } = Ember;

  exports.default = _moment.default.extend({
    defaultFormat: get(_environment.default, 'moment.outputFormat')
  });
});
;define("contentful-fragment/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "RY3kDoHu", "block": "{\"symbols\":[],\"statements\":[[1,[21,\"outlet\"],false],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"mt4\"],[9],[0,\"\\n  \"],[7,\"p\"],[9],[0,\"\\n    \"],[7,\"a\"],[11,\"target\",\"_blank\"],[11,\"href\",\"https://www.contentful-fragment.io\"],[9],[0,\"Contentful Fragment\"],[10],[0,\" was built by \"],[7,\"a\"],[11,\"target\",\"_blank\"],[11,\"href\",\"http://www.sanctuary.computer/\"],[9],[0,\"Sanctuary Computer\"],[10],[0,\" in NYC.\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "contentful-fragment/templates/application.hbs" } });
});
;define("contentful-fragment/templates/components/muuri-grid-component", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "eTdlMKJP", "block": "{\"symbols\":[\"&default\"],\"statements\":[[14,1]],\"hasEval\":false}", "meta": { "moduleName": "contentful-fragment/templates/components/muuri-grid-component.hbs" } });
});
;define("contentful-fragment/templates/components/muuri-item-component", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "uJSHFjZL", "block": "{\"symbols\":[\"&default\"],\"statements\":[[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"item-content\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"cf-card\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"cf-card-icon\"],[9],[0,\"\\n      \"],[7,\"img\"],[11,\"src\",\"draggable.svg\"],[9],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"cf-card-inner\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"clearfix\"],[9],[0,\"\\n        \"],[14,1],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "contentful-fragment/templates/components/muuri-item-component.hbs" } });
});
;define("contentful-fragment/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Qj6PZxLz", "block": "{\"symbols\":[\"fragment\",\"index\",\"uuid\",\"fragmentField\",\"queue\"],\"statements\":[[4,\"if\",[[23,[\"extension\",\"data\",\"_schema\"]]],null,{\"statements\":[[4,\"muuri-grid-component\",null,[[\"updateSort\",\"editingUUID\"],[[27,\"action\",[[22,0,[]],\"updateSort\"],null],[23,[\"editingUUID\"]]]],{\"statements\":[[4,\"each\",[[23,[\"extension\",\"data\",\"fragments\"]]],null,{\"statements\":[[4,\"with\",[[27,\"get\",[[27,\"find-by\",[\"key\",\"uuid\",[22,1,[]]],null],\"value\"],null]],null,{\"statements\":[[4,\"muuri-item-component\",null,[[\"uuid\",\"isEditing\"],[[22,3,[]],[27,\"eq\",[[23,[\"editingUUID\"]],[22,3,[]]],null]]],{\"statements\":[[0,\"          \"],[7,\"div\"],[11,\"class\",\"col-11 left pr1 overflow-hidden\"],[9],[0,\"\\n\"],[4,\"each\",[[22,1,[]]],null,{\"statements\":[[4,\"if\",[[27,\"not-eq\",[[22,4,[\"key\"]],\"uuid\"],null]],null,{\"statements\":[[0,\"                \"],[7,\"div\"],[11,\"class\",\"cf-form-field\"],[9],[0,\"\\n\"],[4,\"if\",[[27,\"eq\",[[23,[\"editingUUID\"]],[22,3,[]]],null]],null,{\"statements\":[[0,\"                    \"],[7,\"label\"],[9],[0,\"\\n                      \"],[1,[22,4,[\"key\"]],false],[0,\"\\n\"],[4,\"if\",[[27,\"eq\",[[22,4,[\"type\"]],\"Symbol\"],null]],null,{\"statements\":[[0,\"                        \"],[1,[27,\"input\",null,[[\"value\",\"class\",\"key-up\"],[[22,4,[\"value\"]],\"cf-form-input\",[27,\"action\",[[22,0,[]],\"save\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[27,\"eq\",[[22,4,[\"type\"]],\"Date\"],null]],null,{\"statements\":[[0,\"                        \"],[1,[27,\"pikaday-input\",null,[[\"class\",\"format\",\"useUTC\",\"value\",\"onSelection\",\"position\",\"reposition\"],[\"cf-form-input\",\"dddd, Do MMMM YYYY\",true,[22,4,[\"value\"]],[27,\"action\",[[22,0,[]],\"saveDate\",[22,4,[]]],null],\"bottom left\",false]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[27,\"eq\",[[22,4,[\"type\"]],\"Blob\"],null]],null,{\"statements\":[[4,\"file-upload\",null,[[\"name\",\"onfileadd\"],[[22,4,[\"key\"]],[27,\"action\",[[22,0,[]],\"saveBlob\",[22,4,[]]],null]]],{\"statements\":[[0,\"                          \"],[7,\"a\"],[11,\"class\",\"button\"],[9],[0,\"\\n\"],[4,\"if\",[[22,5,[\"files\",\"length\"]]],null,{\"statements\":[[0,\"                              Uploading...\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                              \"],[1,[27,\"if\",[[22,4,[\"value\"]],\"Replace File\",\"Upload File\"],null],false],[0,\"\\n\"]],\"parameters\":[]}],[0,\"                          \"],[10],[0,\"\\n\"]],\"parameters\":[5]},null],[4,\"if\",[[22,4,[\"value\"]]],null,{\"statements\":[[0,\"                        \"],[7,\"div\"],[11,\"class\",\"blob-preview cf-card my1\"],[9],[0,\"\\n                          \"],[7,\"div\"],[11,\"class\",\"cf-card-inner flex items-center\"],[9],[0,\"\\n\"],[4,\"if\",[[27,\"is-image-type\",[[22,4,[\"value\",\"type\"]]],null]],null,{\"statements\":[[0,\"                              \"],[7,\"img\"],[12,\"src\",[28,[[22,4,[\"value\",\"data\"]]]]],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                              \"],[7,\"div\"],[11,\"class\",\"blob-no-preview flex items-center p1\"],[9],[0,\"\\n                                \"],[7,\"p\"],[11,\"class\",\"cf-card-status\"],[9],[0,\"No Preview Available\"],[10],[0,\"\\n                              \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"                            \"],[7,\"div\"],[11,\"class\",\"blob-meta ml1\"],[9],[0,\"\\n                              \"],[7,\"p\"],[9],[0,\"File Name: \"],[1,[22,4,[\"value\",\"name\"]],false],[10],[0,\"\\n                              \"],[7,\"p\"],[9],[0,\"File Size: \"],[1,[22,4,[\"value\",\"size\"]],false],[10],[0,\"\\n                              \"],[7,\"p\"],[9],[0,\"File Type: \"],[1,[22,4,[\"value\",\"type\"]],false],[10],[0,\"\\n                            \"],[10],[0,\"\\n                          \"],[10],[0,\"\\n                        \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[0,\"                    \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[27,\"eq\",[[22,4,[\"type\"]],\"Symbol\"],null]],null,{\"statements\":[[0,\"                      \"],[7,\"p\"],[11,\"class\",\"my1 cf-card-field\"],[9],[0,\"\\n                        \"],[1,[22,4,[\"key\"]],false],[0,\": \"],[1,[22,4,[\"value\"]],false],[0,\"\\n                      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"if\",[[27,\"eq\",[[22,4,[\"type\"]],\"Date\"],null]],null,{\"statements\":[[0,\"                      \"],[7,\"p\"],[11,\"class\",\"my1 cf-card-field\"],[9],[0,\"\\n                        \"],[1,[22,4,[\"key\"]],false],[0,\": \"],[1,[27,\"if\",[[22,4,[\"value\"]],[27,\"moment-format\",[[27,\"utc\",[[22,4,[\"value\"]]],null],\"dddd, Do MMMM YYYY\"],null]],null],false],[0,\"\\n                      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"if\",[[27,\"eq\",[[22,4,[\"type\"]],\"Blob\"],null]],null,{\"statements\":[[0,\"                      \"],[7,\"p\"],[11,\"class\",\"my1 cf-card-field\"],[9],[0,\"\\n                        \"],[1,[22,4,[\"key\"]],false],[0,\":\\n                      \"],[10],[0,\"\\n\"],[4,\"if\",[[22,4,[\"value\"]]],null,{\"statements\":[[0,\"                        \"],[7,\"div\"],[11,\"class\",\"blob-preview cf-card mb1\"],[9],[0,\"\\n                          \"],[7,\"div\"],[11,\"class\",\"cf-card-inner flex items-center\"],[9],[0,\"\\n\"],[4,\"if\",[[27,\"is-image-type\",[[22,4,[\"value\",\"type\"]]],null]],null,{\"statements\":[[0,\"                              \"],[7,\"img\"],[12,\"src\",[28,[[22,4,[\"value\",\"data\"]]]]],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                            \"],[7,\"div\"],[11,\"class\",\"blob-no-preview flex items-center p1\"],[9],[0,\"\\n                              \"],[7,\"p\"],[11,\"class\",\"cf-card-status\"],[9],[0,\"No Preview Available\"],[10],[0,\"\\n                            \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"                            \"],[7,\"div\"],[11,\"class\",\"blob-meta ml1\"],[9],[0,\"\\n                              \"],[7,\"p\"],[9],[0,\"File Name: \"],[1,[22,4,[\"value\",\"name\"]],false],[10],[0,\"\\n                              \"],[7,\"p\"],[9],[0,\"File Size: \"],[1,[22,4,[\"value\",\"size\"]],false],[10],[0,\"\\n                              \"],[7,\"p\"],[9],[0,\"File Type: \"],[1,[22,4,[\"value\",\"type\"]],false],[10],[0,\"\\n                            \"],[10],[0,\"\\n                          \"],[10],[0,\"\\n                        \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"parameters\":[]}],[0,\"                \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[4]},null],[0,\"            \"],[7,\"a\"],[3,\"action\",[[22,0,[]],\"removeFragment\",[22,1,[]]]],[9],[0,\"\\n              \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n                \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"width\",\"12\"],[11,\"height\",\"12\"],[11,\"viewBox\",\"-1 -1 16 16\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n                  \"],[7,\"g\"],[11,\"fill\",\"currentColor\"],[9],[0,\"\\n                    \"],[7,\"path\"],[11,\"d\",\"M4.846 7l-3.77-3.77L0 2.155 2.154 0 3.23 1.077 7 4.847l3.77-3.77L11.845 0 14 2.154 12.923 3.23 9.153 7l3.77 3.77L14 11.845 11.846 14l-1.077-1.077L7 9.153l-3.77 3.77L2.155 14 0 11.846l1.077-1.077z\"],[9],[0,\"\\n                    \"],[10],[0,\"\\n                  \"],[10],[0,\"\\n                \"],[10],[0,\"\\n              \"],[10],[0,\"\\n              Delete Entry\\n            \"],[10],[0,\"\\n          \"],[10],[0,\"\\n\\n\"],[0,\"          \"],[7,\"div\"],[11,\"class\",\"col-1 left pr1 right-align\"],[9],[0,\"\\n\"],[4,\"if\",[[27,\"eq\",[[23,[\"editingUUID\"]],[22,3,[]]],null]],null,{\"statements\":[[0,\"              \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[3,\"action\",[[22,0,[]],\"cancelEditing\"]],[9],[0,\"\\n                \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"width\",\"14\"],[11,\"height\",\"14\"],[11,\"version\",\"1.1\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[11,\"viewBox\",\"0 0 442.533 442.533\"],[9],[0,\"\\n                  \"],[7,\"g\"],[11,\"fill\",\"currentColor\"],[9],[0,\"\\n                    \"],[7,\"path\"],[11,\"d\",\"M434.539,98.499l-38.828-38.828c-5.324-5.328-11.799-7.993-19.41-7.993c-7.618,0-14.093,2.665-19.417,7.993L169.59,247.248\\n                                                \\t\\tl-83.939-84.225c-5.33-5.33-11.801-7.992-19.412-7.992c-7.616,0-14.087,2.662-19.417,7.992L7.994,201.852\\n                                                \\t\\tC2.664,207.181,0,213.654,0,221.269c0,7.609,2.664,14.088,7.994,19.416l103.351,103.349l38.831,38.828\\n                                                \\t\\tc5.327,5.332,11.8,7.994,19.414,7.994c7.611,0,14.084-2.669,19.414-7.994l38.83-38.828L434.539,137.33\\n                                                \\t\\tc5.325-5.33,7.994-11.802,7.994-19.417C442.537,110.302,439.864,103.829,434.539,98.499z\"],[9],[10],[0,\"\\n                  \"],[10],[0,\"\\n                \"],[10],[0,\"\\n              \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"              \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[3,\"action\",[[22,0,[]],\"editFragment\",[22,3,[]]]],[9],[0,\"\\n                \"],[7,\"svg\"],[11,\"width\",\"17\"],[11,\"height\",\"16\"],[11,\"viewBox\",\"-1 -1 19 18\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n                  \"],[7,\"g\"],[11,\"fill\",\"currentColor\"],[9],[0,\"\\n                    \"],[7,\"path\"],[11,\"d\",\"M9.702 2.567L.964 11.306 0 16l4.776-.882 8.739-8.738-3.813-3.813zm-7.754 9.715l7.76-7.759.48.48-7.76 7.76-.48-.48zm1.841 1.853l-.48-.48 7.76-7.76.48.48-7.76 7.76zM14.37 5.526l-3.814-3.813L12.27 0l3.813 3.813z\"],[9],[0,\"\\n                    \"],[10],[0,\"\\n                  \"],[10],[0,\"\\n                \"],[10],[0,\"\\n              \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"          \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[3]},null]],\"parameters\":[1,2]},{\"statements\":[[0,\"      \"],[7,\"p\"],[11,\"class\",\"mb3\"],[9],[0,\"\\n        Hey! You haven't added any entries yet.\\n        \"],[7,\"a\"],[3,\"action\",[[22,0,[]],\"addFragment\"]],[9],[0,\"Add one now!\"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[0,\"  \"],[7,\"div\"],[12,\"class\",[28,[\"clearfix pb2 \",[27,\"if\",[[23,[\"extension\",\"data\",\"fragments\"]],\"mt2\",\"mt4\"],null]]]],[9],[0,\"\\n    \"],[7,\"a\"],[3,\"action\",[[22,0,[]],\"addFragment\"]],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n        \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"height\",\"18\"],[11,\"viewBox\",\"0 0 24 24\"],[11,\"width\",\"18\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n          \"],[7,\"path\"],[11,\"d\",\"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z\"],[9],[10],[0,\"\\n          \"],[7,\"path\"],[11,\"d\",\"M0 0h24v24H0z\"],[11,\"fill\",\"none\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n      Add Entry\\n    \"],[10],[0,\"\\n\"],[4,\"unless\",[[23,[\"extension\",\"data\",\"_settings\",\"usesPredefinedSchema\"]]],null,{\"statements\":[[4,\"link-to\",[\"schema\"],[[\"class\"],[\"ml2\"]],{\"statements\":[[0,\"        \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n          \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"height\",\"18\"],[11,\"viewBox\",\"0 0 24 24\"],[11,\"width\",\"18\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n            \"],[7,\"path\"],[11,\"d\",\"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z\"],[9],[10],[0,\"\\n            \"],[7,\"path\"],[11,\"d\",\"M0 0h24v24H0z\"],[11,\"fill\",\"none\"],[9],[10],[0,\"\\n          \"],[10],[0,\"\\n        \"],[10],[0,\"\\n        Edit Fragment\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[0,\"\\n\"],[0,\"    \"],[7,\"div\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"showPreview\"]]],null,{\"statements\":[[0,\"        \"],[7,\"a\"],[3,\"action\",[[22,0,[]],\"hidePreview\"]],[9],[0,\"[ show/hide JSON preview ]\"],[10],[7,\"br\"],[9],[10],[0,\"\\n        \"],[7,\"textarea\"],[11,\"class\",\"json-preview mt2 p2\"],[12,\"value\",[23,[\"extension\",\"preview\"]]],[11,\"disabled\",\"true\"],[9],[10],[0,\"\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[7,\"a\"],[3,\"action\",[[22,0,[]],\"showPreview\"]],[9],[0,\"[ show/hide JSON preview ]\"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"p\"],[9],[0,\"\\n    Please define your Fragment before adding content. You can do this in the UI below, or with a\\n    \"],[7,\"a\"],[11,\"href\",\"https://github.com/sanctuarycomputer/contentful-fragment\"],[11,\"target\",\"_blank\"],[9],[0,\"predefined schema.\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[4,\"link-to\",[\"schema\"],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n      \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"height\",\"18\"],[11,\"viewBox\",\"0 0 24 24\"],[11,\"width\",\"18\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n        \"],[7,\"path\"],[11,\"d\",\"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z\"],[9],[10],[0,\"\\n        \"],[7,\"path\"],[11,\"d\",\"M0 0h24v24H0z\"],[11,\"fill\",\"none\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n    Setup Fragment\\n\"]],\"parameters\":[]},null]],\"parameters\":[]}]],\"hasEval\":false}", "meta": { "moduleName": "contentful-fragment/templates/index.hbs" } });
});
;define("contentful-fragment/templates/schema", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "RFIsIsS8", "block": "{\"symbols\":[\"field\"],\"statements\":[[7,\"div\"],[11,\"class\",\"cf-card mb1\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"cf-card-inner\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n      \"],[7,\"svg\"],[11,\"class\",\"icon-small red\"],[11,\"height\",\"18\"],[11,\"width\",\"18\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[11,\"width\",\"24\"],[11,\"height\",\"24\"],[11,\"viewBox\",\"0 0 24 24\"],[9],[0,\"\\n        \"],[7,\"path\"],[11,\"d\",\"M10.872 6.831l1.695 3.904 3.654-1.561-1.79 3.426 3.333.954-3.417 1.338 2.231 4.196-4.773-2.582-2.869 2.287.413-3.004-3.792-.726 2.93-1.74-1.885-2.512 3.427.646.843-4.626zm-.786-6.831l-1.665 9.119-6.512-1.228 3.639 4.851-5.548 3.294 7.108 1.361-.834 6.076 5.742-4.577 9.438 5.104-4.288-8.064 6.834-2.677-6.661-1.907 3.25-6.22-6.98 2.982-3.523-8.114z\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n    Danger! This is a developer-only zone. Making changes here can break your website.\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\"],[4,\"each\",[[23,[\"extension\",\"data\",\"_schema\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"cf-card mb1\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"cf-card-inner\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"clearfix\"],[9],[0,\"\\n\\n\"],[4,\"if\",[[27,\"eq\",[[22,1,[\"uuid\"]],[23,[\"deletingUUID\"]]],null]],null,{\"statements\":[[0,\"          \"],[7,\"p\"],[11,\"class\",\"mt0\"],[9],[0,\"Are you sure? Deleting a field from a live fragment can break your website.\"],[10],[0,\"\\n\\n          \"],[7,\"a\"],[3,\"action\",[[22,0,[]],\"removeFragmentField\",[22,1,[]]]],[9],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n              \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"height\",\"20\"],[11,\"viewBox\",\"0 0 24 24\"],[11,\"width\",\"20\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[7,\"path\"],[11,\"d\",\"M0 0h24v24H0z\"],[11,\"fill\",\"none\"],[9],[10],[7,\"path\"],[11,\"d\",\"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z\"],[9],[10],[10],[0,\"\\n            \"],[10],[0,\"\\n            Yup, remove it!\\n          \"],[10],[0,\"\\n\\n          \"],[7,\"a\"],[11,\"class\",\"ml2\"],[3,\"action\",[[22,0,[]],\"unstageFieldDeletion\"]],[9],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n              \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"width\",\"12\"],[11,\"height\",\"12\"],[11,\"viewBox\",\"-1 -1 16 16\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n                \"],[7,\"g\"],[11,\"fill\",\"currentColor\"],[9],[0,\"\\n                  \"],[7,\"path\"],[11,\"d\",\"M4.846 7l-3.77-3.77L0 2.155 2.154 0 3.23 1.077 7 4.847l3.77-3.77L11.845 0 14 2.154 12.923 3.23 9.153 7l3.77 3.77L14 11.845 11.846 14l-1.077-1.077L7 9.153l-3.77 3.77L2.155 14 0 11.846l1.077-1.077z\"],[9],[0,\"\\n                  \"],[10],[0,\"\\n                \"],[10],[0,\"\\n              \"],[10],[0,\"\\n            \"],[10],[0,\"\\n            Nevermind!\\n          \"],[10],[0,\"\\n\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"          \"],[7,\"div\"],[11,\"class\",\"col-5 left pr1\"],[9],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"cf-form-field mb0\"],[9],[0,\"\\n              \"],[7,\"label\"],[9],[0,\"\\n                Key\\n                \"],[1,[27,\"input\",null,[[\"value\",\"class\",\"placeholder\",\"key-up\"],[[22,1,[\"key\"]],\"cf-form-input\",\"Blog Title\",[27,\"action\",[[22,0,[]],\"keyDidChange\",[22,1,[]]],null]]]],false],[0,\"\\n              \"],[10],[0,\" \\n            \"],[10],[0,\"\\n          \"],[10],[0,\"\\n\\n          \"],[7,\"div\"],[11,\"class\",\"col-5 left\"],[9],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"cf-form-field mb0\"],[9],[0,\"\\n              \"],[7,\"label\"],[9],[0,\"\\n                Type\\n                \"],[7,\"select\"],[12,\"onchange\",[27,\"action\",[[22,0,[]],\"setFieldType\"],[[\"value\"],[\"target.value\"]]]],[11,\"class\",\"cf-form-input\"],[9],[0,\"\\n                  \"],[7,\"option\"],[11,\"disabled\",\"\"],[12,\"selected\",[27,\"not\",[[22,1,[\"type\"]]],null]],[9],[0,\"Choose a Field Type\"],[10],[0,\"\\n                  \"],[7,\"option\"],[12,\"value\",[28,[[22,1,[\"uuid\"]],\"-Symbol\"]]],[12,\"selected\",[27,\"eq\",[[22,1,[\"type\"]],\"Symbol\"],null]],[9],[0,\"Short Text\"],[10],[0,\"\\n                  \"],[7,\"option\"],[12,\"value\",[28,[[22,1,[\"uuid\"]],\"-Date\"]]],[12,\"selected\",[27,\"eq\",[[22,1,[\"type\"]],\"Date\"],null]],[9],[0,\"UTC Date\"],[10],[0,\"\\n                  \"],[7,\"option\"],[12,\"value\",[28,[[22,1,[\"uuid\"]],\"-Blob\"]]],[12,\"selected\",[27,\"eq\",[[22,1,[\"type\"]],\"Blob\"],null]],[9],[0,\"Blob\"],[10],[0,\"\\n                \"],[10],[0,\"\\n              \"],[10],[0,\" \\n            \"],[10],[0,\"\\n          \"],[10],[0,\"\\n          \\n          \"],[7,\"div\"],[11,\"class\",\"col-2 left right-align\"],[9],[0,\"\\n            \"],[7,\"p\"],[12,\"class\",[28,[\"cf-card-status inline mr1 \",[27,\"if\",[[22,1,[\"validation\",\"length\"]],\"red\",\"green\"],null]]]],[9],[0,\"\\n              \"],[1,[27,\"if\",[[22,1,[\"validation\",\"length\"]],\"invalid\",\"valid\"],null],false],[0,\"\\n            \"],[10],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[3,\"action\",[[22,0,[]],\"stageFieldDeletion\",[22,1,[]]]],[9],[0,\"\\n              \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"width\",\"14\"],[11,\"height\",\"14\"],[11,\"viewBox\",\"-1 -1 16 16\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n                \"],[7,\"g\"],[11,\"fill\",\"currentColor\"],[9],[0,\"\\n                  \"],[7,\"path\"],[11,\"d\",\"M4.846 7l-3.77-3.77L0 2.155 2.154 0 3.23 1.077 7 4.847l3.77-3.77L11.845 0 14 2.154 12.923 3.23 9.153 7l3.77 3.77L14 11.845 11.846 14l-1.077-1.077L7 9.153l-3.77 3.77L2.155 14 0 11.846l1.077-1.077z\"],[9],[0,\"\\n                  \"],[10],[0,\"\\n                \"],[10],[0,\"\\n              \"],[10],[0,\"\\n            \"],[10],[0,\"\\n          \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\\n\"]],\"parameters\":[1]},{\"statements\":[[0,\"  \"],[7,\"p\"],[11,\"class\",\"my3\"],[9],[0,\"Hey! Your Fragment shape doesn't have any fields. \"],[7,\"a\"],[3,\"action\",[[22,0,[]],\"addEmptySchemaField\"]],[9],[0,\"Add one now!\"],[10],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"clearfix mt2\"],[9],[0,\"\\n  \"],[7,\"a\"],[3,\"action\",[[22,0,[]],\"addEmptySchemaField\"]],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n      \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"height\",\"18\"],[11,\"viewBox\",\"0 0 24 24\"],[11,\"width\",\"18\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n        \"],[7,\"path\"],[11,\"d\",\"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z\"],[9],[10],[7,\"path\"],[11,\"d\",\"M0 0h24v24H0z\"],[11,\"fill\",\"none\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n    Add Field\\n  \"],[10],[0,\"\\n\\n  \"],[7,\"a\"],[11,\"class\",\"ml2\"],[3,\"action\",[[22,0,[]],\"save\"]],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n      \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"height\",\"20\"],[11,\"viewBox\",\"0 0 24 24\"],[11,\"width\",\"20\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[7,\"path\"],[11,\"d\",\"M0 0h24v24H0z\"],[11,\"fill\",\"none\"],[9],[10],[7,\"path\"],[11,\"d\",\"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z\"],[9],[10],[10],[0,\"\\n    \"],[10],[0,\"\\n    Save and Return\\n  \"],[10],[0,\"\\n\\n  \"],[7,\"a\"],[11,\"class\",\"ml2\"],[3,\"action\",[[22,0,[]],\"cancel\"]],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"icon-wrapper\"],[9],[0,\"\\n      \"],[7,\"svg\"],[11,\"class\",\"icon-small\"],[11,\"width\",\"12\"],[11,\"height\",\"12\"],[11,\"viewBox\",\"-1 -1 16 16\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[9],[0,\"\\n        \"],[7,\"g\"],[11,\"fill\",\"currentColor\"],[9],[0,\"\\n          \"],[7,\"path\"],[11,\"d\",\"M4.846 7l-3.77-3.77L0 2.155 2.154 0 3.23 1.077 7 4.847l3.77-3.77L11.845 0 14 2.154 12.923 3.23 9.153 7l3.77 3.77L14 11.845 11.846 14l-1.077-1.077L7 9.153l-3.77 3.77L2.155 14 0 11.846l1.077-1.077z\"],[9],[0,\"\\n          \"],[10],[0,\"\\n        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n    Cancel\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "contentful-fragment/templates/schema.hbs" } });
});
;

;define('contentful-fragment/config/environment', [], function() {
  var prefix = 'contentful-fragment';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

;
          if (!runningTests) {
            require("contentful-fragment/app")["default"].create({"name":"contentful-fragment","version":"0.0.0+2a9e5be8"});
          }
        
//# sourceMappingURL=contentful-fragment.map
