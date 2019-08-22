class HotKeys {
	constructor() {
		this.CONST_CUSTOM_DEFINITIONS = '_LIFERAY_HOTKEY_CUSTOM_DEFINITIONS_';

		this.customDefinitions = [];

		this.definitions = [];

		this.mousetrap = Mousetrap;

		this.deleteCustomDefinition = this.deleteCustomDefinition.bind(this);
		this.initCustomDefinitions = this.initCustomDefinitions.bind(this);
		this.init = this.init.bind(this);
		this.register = this.register.bind(this);
		this.registerCustomDefinition = this.registerCustomDefinition.bind(this);
		this.registerClick = this.registerClick.bind(this);
		this.registerURL = this.registerURL.bind(this);
		this.setCustomDefinition = this.setCustomDefinition.bind(this);
		this.showAddHotKeyModal = this.showAddHotKeyModal.bind(this);
		this.showAvailableHotKeys = this.showAvailableHotKeys.bind(this);

		this.initCustomDefinitions();
	}

	deleteCustomDefinition(i) {
		var i = i - this.definitions.length;

		this.mousetrap.unbind(this.customDefinitions[i].keys);

		var newCustomDefinitions = this.customDefinitions.filter(
			(value, index, arr) => {
				return index !== i;
			}
		);

		this.customDefinitions = newCustomDefinitions;

		Liferay.Store(this.CONST_CUSTOM_DEFINITIONS, newCustomDefinitions);

		// this.showAvailableHotKeys();

		// modal.modal('hide');
	}

	initCustomDefinitions() {
		console.log('initCustomDefinitions');
		if (themeDisplay.isSignedIn()) {
			Liferay.Store.get(
				this.CONST_CUSTOM_DEFINITIONS,
				definitions => {
					definitions = Array.isArray(definitions) ? definitions : [];

					this.customDefinitions = definitions;

					console.log('initCustomDefinitions:', definitions);

					definitions.forEach(
						definition => {
							this.registerCustomDefinition(definition);
						}
					);

					console.log('initCustomDefinitions after registering definitions', definitions);
				}
			);
		}
	}

	init() {
		this.registerClick(
			'`',
			'#_com_liferay_product_navigation_product_menu_web_portlet_ProductMenuPortlet_sidenavToggleId',
			'Toggle control panel.'
		);

		var search = $('.portlet-search-bar .search-bar-keywords-input').first();

		this.register(
			'/',
			function(e) {
				e.preventDefault();

				search.focus();
			},
			'Focus header search.',
			search.length
		);

		this.register(
			'a k',
			this.showAddHotKeyModal,
			'Add a custom hot key.',
			themeDisplay.isSignedIn()
		);

		this.registerClick(
			's s',
			'#_com_liferay_product_navigation_product_menu_web_portlet_ProductMenuPortlet_manageSitesLink',
			'Show the site menu.'
		);

		this.register(
			'?',
			this.showAvailableHotKeys,
			'Show available hot keys.',
			true
		);
	}

	register(keys, action, definition, active, custom) {
		if (active) {
			this.mousetrap.bind(keys, action);
		}

		var defObj = {
			active,
			custom,
			definition,
			keys
		};

		if (!custom) {
			this.definitions.push(defObj);
		}
	}

	registerClick(keys, selector, definition, custom) {
		var node = $(selector);

		this.register(
			keys,
			() => {
				$(selector).trigger('click');
			},
			definition,
			node.length,
			custom
		);
	}

	registerCustomDefinition(definition) {
		var type = definition.type;

		if (type === 'url') {
			this.registerURL(definition.keys, definition.action, definition.definition, true);
		}
		else if (type === 'click') {
			this.registerClick(definition.keys, definition.action, definition.definition, true);
		}
	}

	registerURL(keys, url, definition, custom) {
		this.register(
			keys,
			() => {
				window.location.href = url;
			},
			definition,
			true,
			custom
		);
	}

	renderAction(label, placeholder) {
		return '<div class="form-group" id="action">' +
			'<label for="actionInput">' + label + '</label>' +
			'<input class="form-control" id="actionInput" placeholder="' + placeholder + '" type="text">' +
		'</div>';
	}

	renderDefinition(definition, i) {
		var keys = definition.keys.split(' ');

		var deleteLink = definition.custom ? ' <a class="btn btn-sm delete-definition text-right" data-index="' + i + '" href="javascript:;"><span class="icon-remove icon"></span></a>' : '';

		return '<div class="definition mb-3">' +
			keys.map(
				key => (
					'<kbd>' + key + '</kbd>'
				)
			).join(' + ') + 
			' : ' + definition.definition +
			deleteLink +
		'</div>';
	}

	renderDefinitions(definitions) {
		return definitions.map(
			(definition, i) => (
				this.renderDefinition(definition, i)
			)
		).join('')
	}

	renderModal(title, body) {
		return '<div aria-labelledby="clayDefaultModalLabel" class="fade modal" id="hotKeyModal" role="dialog" style="display: none;" tabindex="-1">' +
			'<div class="modal-dialog modal-dialog-sm position-relative">' +
				'<div class="modal-content">' + 
					'<div class="modal-header">' +
						'<div class="modal-title" id="clayDefaultModalLabel">' +
							title +
						'</div>' +

						'<button aria-labelledby="Close" class="close" data-dismiss="modal" role="button" type="button">' +
							'<span class="icon-remove icon icon-large"></span>' +
						'</button>' +
					'</div>' +
					'<div class="modal-body">' +
						body +
					'</div>' +
					'<div class="modal-footer">' +
						'<div class="modal-item-last">' +
							'<div class="btn-group">' +
								'<div class="btn-group-item">' +
									'<button class="btn btn-secondary" data-dismiss="modal" type="button">Close</button>' +
								'</div>'
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>';
	}

	setCustomDefinition(definition) {
		console.log('setCustomDefinition', definition);

		this.registerCustomDefinition(definition);

		var customDefinitions = [...this.customDefinitions];

		customDefinitions.push(definition);

		this.customDefinitions = customDefinitions

		Liferay.Store(this.CONST_CUSTOM_DEFINITIONS, customDefinitions);
	}

	showAddHotKeyModal() {
		console.log('showAddHotKeyModal');
		var modal = $(
			this.renderModal(
				'Add New Hot Key',
				'<form>' +
					'<div class="form-group">' +
						'<label for="keysInput">Shortcut Keys</label>' +
						'<input class="form-control" id="keysInput" placeholder="g h" type="text">' +
					'</div>' +
					'<div class="form-group">' +
						'<label for="typeOfActionInput">Type of Action</label>' +
						'<select class="form-control" id="typeOfActionInput">' +
							'<option value="url">URL Navigation</option>' +
							'<option value="click">Simulate Click</option>' +
						'</select>' +
					'</div>' +
					this.renderAction('URL', '/group/intranet') +
					'<div class="form-group">' +
						'<label for="definitionInput">Definition</label>' +
						'<input class="form-control" id="definitionInput" placeholder="Navigate to /group/intranet." type="text">' +
					'</div>' +
					'<div class="form-group">' +
						'<div class="btn-group">' +
							'<div class="btn-group-item">' +
								'<button class="btn btn-primary" type="submit">Save</button>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</form>'
			)
		);

		this.showModal(modal);

		var select = modal.find('#typeOfActionInput')

		select.on(
			'change',
			e => {
				console.log(e);

				var actionContainer = modal.find('#action');

				if (e.currentTarget.value === 'url') {
					actionContainer.replaceWith($(this.renderAction('URL', '/group/intranet')));
				}
				else {
					actionContainer.replaceWith($(this.renderAction('Selector', '#myButton')));
				}
			}
		);

		var form = modal.find('form');

		form.on(
			'submit',
			e => {
				e.preventDefault();

				console.log(e);

				var target = e.target;

				var keys = target[0].value.trim();

				var type = target[1].value;

				var action = target[2].value;

				var definition = target[3].value;

				this.setCustomDefinition(
					{
						action,
						custom: true,
						definition,
						keys,
						type
					}
				);

				console.log('modal:', modal);

				modal.modal('hide');
			}
		);
	}

	showAvailableHotKeys() {
		var modal = $(
			this.renderModal(
				'Liferay Hot Keys',
				this.renderDefinitions([...this.definitions, ...this.customDefinitions])
			)
		);

		this.showModal(modal);

		modal.on(
			'click',
			'.delete-definition',
			e => {
				console.log('delete', $(e.target).attr('data-index'));

				this.deleteCustomDefinition($(e.target).attr('data-index'), modal);

				var modalBody = modal.find('.modal-body').first();

				modalBody.html(this.renderDefinitions([...this.definitions, ...this.customDefinitions]));
			}
		);
	}

	showModal(modal) {
		var oldModal = $('#hotKeyModal');

		if (oldModal.length) {
			oldModal.replaceWith(modal);
		}
		else {
			var body = $('body');

			body.append(modal);
		}

		console.log('modal:', modal);

		modal.modal();
	}
}

AUI().ready(
	'liferay-store',
 	function() {
 		var hotKeys = new HotKeys();

 		hotKeys.init();
 	}
 );