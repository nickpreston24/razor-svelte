(function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	function create_slot(definition, ctx, $$scope, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
			return definition[0](slot_ctx);
		}
	}

	function get_slot_context(definition, ctx, $$scope, fn) {
		return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
	}

	function get_slot_changes(definition, $$scope, dirty, fn) {
		if (definition[2] && fn) {
			const lets = definition[2](fn(dirty));
			if ($$scope.dirty === undefined) {
				return lets;
			}
			if (typeof lets === 'object') {
				const merged = [];
				const len = Math.max($$scope.dirty.length, lets.length);
				for (let i = 0; i < len; i += 1) {
					merged[i] = $$scope.dirty[i] | lets[i];
				}
				return merged;
			}
			return $$scope.dirty | lets;
		}
		return $$scope.dirty;
	}

	/** @returns {void} */
	function update_slot_base(
		slot,
		slot_definition,
		ctx,
		$$scope,
		slot_changes,
		get_slot_context_fn
	) {
		if (slot_changes) {
			const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
			slot.p(slot_context, slot_changes);
		}
	}

	/** @returns {any[] | -1} */
	function get_all_dirty_from_scope($$scope) {
		if ($$scope.ctx.length > 32) {
			const dirty = [];
			const length = $$scope.ctx.length / 32;
			for (let i = 0; i < length; i++) {
				dirty[i] = -1;
			}
			return dirty;
		}
		return -1;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {string} style_sheet_id
	 * @param {string} styles
	 * @returns {void}
	 */
	function append_styles(target, style_sheet_id, styles) {
		const append_styles_to = get_root_for_style(target);
		if (!append_styles_to.getElementById(style_sheet_id)) {
			const style = element('style');
			style.id = style_sheet_id;
			style.textContent = styles;
			append_stylesheet(append_styles_to, style);
		}
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data(text, data) {
		data = '' + data;
		if (text.data === data) return;
		text.data = /** @type {string} */ (data);
	}

	/**
	 * @param {HTMLElement} element
	 * @returns {{}}
	 */
	function get_custom_elements_slots(element) {
		const result = {};
		element.childNodes.forEach(
			/** @param {Element} node */ (node) => {
				result[node.slot || 'default'] = true;
			}
		);
		return result;
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	let SvelteElement;

	if (typeof HTMLElement === 'function') {
		SvelteElement = class extends HTMLElement {
			/** The Svelte component constructor */
			$$ctor;
			/** Slots */
			$$s;
			/** The Svelte component instance */
			$$c;
			/** Whether or not the custom element is connected */
			$$cn = false;
			/** Component props data */
			$$d = {};
			/** `true` if currently in the process of reflecting component props back to attributes */
			$$r = false;
			/** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
			$$p_d = {};
			/** @type {Record<string, Function[]>} Event listeners */
			$$l = {};
			/** @type {Map<Function, Function>} Event listener unsubscribe functions */
			$$l_u = new Map();

			constructor($$componentCtor, $$slots, use_shadow_dom) {
				super();
				this.$$ctor = $$componentCtor;
				this.$$s = $$slots;
				if (use_shadow_dom) {
					this.attachShadow({ mode: 'open' });
				}
			}

			addEventListener(type, listener, options) {
				// We can't determine upfront if the event is a custom event or not, so we have to
				// listen to both. If someone uses a custom event with the same name as a regular
				// browser event, this fires twice - we can't avoid that.
				this.$$l[type] = this.$$l[type] || [];
				this.$$l[type].push(listener);
				if (this.$$c) {
					const unsub = this.$$c.$on(type, listener);
					this.$$l_u.set(listener, unsub);
				}
				super.addEventListener(type, listener, options);
			}

			removeEventListener(type, listener, options) {
				super.removeEventListener(type, listener, options);
				if (this.$$c) {
					const unsub = this.$$l_u.get(listener);
					if (unsub) {
						unsub();
						this.$$l_u.delete(listener);
					}
				}
			}

			async connectedCallback() {
				this.$$cn = true;
				if (!this.$$c) {
					// We wait one tick to let possible child slot elements be created/mounted
					await Promise.resolve();
					if (!this.$$cn || this.$$c) {
						return;
					}
					function create_slot(name) {
						return () => {
							let node;
							const obj = {
								c: function create() {
									node = element('slot');
									if (name !== 'default') {
										attr(node, 'name', name);
									}
								},
								/**
								 * @param {HTMLElement} target
								 * @param {HTMLElement} [anchor]
								 */
								m: function mount(target, anchor) {
									insert(target, node, anchor);
								},
								d: function destroy(detaching) {
									if (detaching) {
										detach(node);
									}
								}
							};
							return obj;
						};
					}
					const $$slots = {};
					const existing_slots = get_custom_elements_slots(this);
					for (const name of this.$$s) {
						if (name in existing_slots) {
							$$slots[name] = [create_slot(name)];
						}
					}
					for (const attribute of this.attributes) {
						// this.$$data takes precedence over this.attributes
						const name = this.$$g_p(attribute.name);
						if (!(name in this.$$d)) {
							this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, 'toProp');
						}
					}
					// Port over props that were set programmatically before ce was initialized
					for (const key in this.$$p_d) {
						if (!(key in this.$$d) && this[key] !== undefined) {
							this.$$d[key] = this[key]; // don't transform, these were set through JavaScript
							delete this[key]; // remove the property that shadows the getter/setter
						}
					}
					this.$$c = new this.$$ctor({
						target: this.shadowRoot || this,
						props: {
							...this.$$d,
							$$slots,
							$$scope: {
								ctx: []
							}
						}
					});

					// Reflect component props as attributes
					const reflect_attributes = () => {
						this.$$r = true;
						for (const key in this.$$p_d) {
							this.$$d[key] = this.$$c.$$.ctx[this.$$c.$$.props[key]];
							if (this.$$p_d[key].reflect) {
								const attribute_value = get_custom_element_value(
									key,
									this.$$d[key],
									this.$$p_d,
									'toAttribute'
								);
								if (attribute_value == null) {
									this.removeAttribute(this.$$p_d[key].attribute || key);
								} else {
									this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
								}
							}
						}
						this.$$r = false;
					};
					this.$$c.$$.after_update.push(reflect_attributes);
					reflect_attributes(); // once initially because after_update is added too late for first render

					for (const type in this.$$l) {
						for (const listener of this.$$l[type]) {
							const unsub = this.$$c.$on(type, listener);
							this.$$l_u.set(listener, unsub);
						}
					}
					this.$$l = {};
				}
			}

			// We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
			// and setting attributes through setAttribute etc, this is helpful
			attributeChangedCallback(attr, _oldValue, newValue) {
				if (this.$$r) return;
				attr = this.$$g_p(attr);
				this.$$d[attr] = get_custom_element_value(attr, newValue, this.$$p_d, 'toProp');
				this.$$c?.$set({ [attr]: this.$$d[attr] });
			}

			disconnectedCallback() {
				this.$$cn = false;
				// In a microtask, because this could be a move within the DOM
				Promise.resolve().then(() => {
					if (!this.$$cn) {
						this.$$c.$destroy();
						this.$$c = undefined;
					}
				});
			}

			$$g_p(attribute_name) {
				return (
					Object.keys(this.$$p_d).find(
						(key) =>
							this.$$p_d[key].attribute === attribute_name ||
							(!this.$$p_d[key].attribute && key.toLowerCase() === attribute_name)
					) || attribute_name
				);
			}
		};
	}

	/**
	 * @param {string} prop
	 * @param {any} value
	 * @param {Record<string, CustomElementPropDefinition>} props_definition
	 * @param {'toAttribute' | 'toProp'} [transform]
	 */
	function get_custom_element_value(prop, value, props_definition, transform) {
		const type = props_definition[prop]?.type;
		value = type === 'Boolean' && typeof value !== 'boolean' ? value != null : value;
		if (!transform || !props_definition[prop]) {
			return value;
		} else if (transform === 'toAttribute') {
			switch (type) {
				case 'Object':
				case 'Array':
					return value == null ? null : JSON.stringify(value);
				case 'Boolean':
					return value ? '' : null;
				case 'Number':
					return value == null ? null : value;
				default:
					return value;
			}
		} else {
			switch (type) {
				case 'Object':
				case 'Array':
					return value && JSON.parse(value);
				case 'Boolean':
					return value; // conversion already handled above
				case 'Number':
					return value != null ? +value : value;
				default:
					return value;
			}
		}
	}

	/**
	 * @internal
	 *
	 * Turn a Svelte component into a custom element.
	 * @param {import('./public.js').ComponentType} Component  A Svelte component constructor
	 * @param {Record<string, CustomElementPropDefinition>} props_definition  The props to observe
	 * @param {string[]} slots  The slots to create
	 * @param {string[]} accessors  Other accessors besides the ones for props the component has
	 * @param {boolean} use_shadow_dom  Whether to use shadow DOM
	 * @param {(ce: new () => HTMLElement) => new () => HTMLElement} [extend]
	 */
	function create_custom_element(
		Component,
		props_definition,
		slots,
		accessors,
		use_shadow_dom,
		extend
	) {
		let Class = class extends SvelteElement {
			constructor() {
				super(Component, slots, use_shadow_dom);
				this.$$p_d = props_definition;
			}
			static get observedAttributes() {
				return Object.keys(props_definition).map((key) =>
					(props_definition[key].attribute || key).toLowerCase()
				);
			}
		};
		Object.keys(props_definition).forEach((prop) => {
			Object.defineProperty(Class.prototype, prop, {
				get() {
					return this.$$c && prop in this.$$c ? this.$$c[prop] : this.$$d[prop];
				},
				set(value) {
					value = get_custom_element_value(prop, value, props_definition);
					this.$$d[prop] = value;
					this.$$c?.$set({ [prop]: value });
				}
			});
		});
		accessors.forEach((accessor) => {
			Object.defineProperty(Class.prototype, accessor, {
				get() {
					return this.$$c?.[accessor];
				}
			});
		});
		if (extend) {
			// @ts-expect-error - assigning here is fine
			Class = extend(Class);
		}
		Component.element = /** @type {any} */ (Class);
		return Class;
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	const PUBLIC_VERSION = '4';

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/* wwwroot/js/BigHeader.svelte generated by Svelte v4.2.11 */

	function add_css$3(target) {
		append_styles(target, "svelte-mmdfh9", "h1.svelte-mmdfh9{font-size:5em}");
	}

	function create_fragment$4(ctx) {
		let main;
		let h1;
		let t;

		return {
			c() {
				main = element("main");
				h1 = element("h1");
				t = text(/*message*/ ctx[0]);
				attr(h1, "id", /*id*/ ctx[1]);
				attr(h1, "class", "svelte-mmdfh9");
			},
			m(target, anchor) {
				insert(target, main, anchor);
				append(main, h1);
				append(h1, t);
			},
			p(ctx, [dirty]) {
				if (dirty & /*message*/ 1) set_data(t, /*message*/ ctx[0]);

				if (dirty & /*id*/ 2) {
					attr(h1, "id", /*id*/ ctx[1]);
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(main);
				}
			}
		};
	}

	function instance$4($$self, $$props, $$invalidate) {
		let { message = 'Your message here' } = $$props;
		let { id } = $$props;

		$$self.$$set = $$props => {
			if ('message' in $$props) $$invalidate(0, message = $$props.message);
			if ('id' in $$props) $$invalidate(1, id = $$props.id);
		};

		return [message, id];
	}

	class BigHeader extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$4, create_fragment$4, safe_not_equal, { message: 0, id: 1 }, add_css$3);
		}

		get message() {
			return this.$$.ctx[0];
		}

		set message(message) {
			this.$$set({ message });
			flush();
		}

		get id() {
			return this.$$.ctx[1];
		}

		set id(id) {
			this.$$set({ id });
			flush();
		}
	}

	customElements.define("big-header", create_custom_element(BigHeader, {"message":{},"id":{}}, [], [], true));

	/* wwwroot/js/Clock.svelte generated by Svelte v4.2.11 */

	function add_css$2(target) {
		append_styles(target, "svelte-1p5wnm2", "svg.svelte-1p5wnm2{width:100%;height:100%}.clock-face.svelte-1p5wnm2{stroke:#333;fill:white}.minor.svelte-1p5wnm2{stroke:#999;stroke-width:0.5}.major.svelte-1p5wnm2{stroke:#333;stroke-width:1}.hour.svelte-1p5wnm2{stroke:#333}.minute.svelte-1p5wnm2{stroke:#666}.second.svelte-1p5wnm2,.second-counterweight.svelte-1p5wnm2{stroke:rgb(180,0,0)}.second-counterweight.svelte-1p5wnm2{stroke-width:3}");
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[4] = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		return child_ctx;
	}

	// (74:8) {#each [1, 2, 3, 4] as offset}
	function create_each_block_1(ctx) {
		let line;

		return {
			c() {
				line = svg_element("line");
				attr(line, "class", "minor svelte-1p5wnm2");
				attr(line, "y1", "42");
				attr(line, "y2", "45");
				attr(line, "transform", "rotate(" + 6 * (/*minute*/ ctx[4] + /*offset*/ ctx[7]) + ")");
			},
			m(target, anchor) {
				insert(target, line, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(line);
				}
			}
		};
	}

	// (66:4) {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
	function create_each_block$1(ctx) {
		let line;
		let each_1_anchor;
		let each_value_1 = ensure_array_like([1, 2, 3, 4]);
		let each_blocks = [];

		for (let i = 0; i < 4; i += 1) {
			each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c() {
				line = svg_element("line");

				for (let i = 0; i < 4; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
				attr(line, "class", "major svelte-1p5wnm2");
				attr(line, "y1", "35");
				attr(line, "y2", "45");
				attr(line, "transform", "rotate(" + 30 * /*minute*/ ctx[4] + ")");
			},
			m(target, anchor) {
				insert(target, line, anchor);

				for (let i = 0; i < 4; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each_1_anchor, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(line);
					detach(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};
	}

	function create_fragment$3(ctx) {
		let svg;
		let circle;
		let line0;
		let line0_transform_value;
		let line1;
		let line1_transform_value;
		let g;
		let line2;
		let line3;
		let g_transform_value;
		let each_value = ensure_array_like([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
		let each_blocks = [];

		for (let i = 0; i < 12; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		return {
			c() {
				svg = svg_element("svg");
				circle = svg_element("circle");

				for (let i = 0; i < 12; i += 1) {
					each_blocks[i].c();
				}

				line0 = svg_element("line");
				line1 = svg_element("line");
				g = svg_element("g");
				line2 = svg_element("line");
				line3 = svg_element("line");
				attr(circle, "class", "clock-face svelte-1p5wnm2");
				attr(circle, "r", "48");
				attr(line0, "class", "hour svelte-1p5wnm2");
				attr(line0, "y1", "2");
				attr(line0, "y2", "-20");
				attr(line0, "transform", line0_transform_value = "rotate(" + (30 * /*hours*/ ctx[2] + /*minutes*/ ctx[1] / 2) + ")");
				attr(line1, "class", "minute svelte-1p5wnm2");
				attr(line1, "y1", "4");
				attr(line1, "y2", "-30");
				attr(line1, "transform", line1_transform_value = "rotate(" + (6 * /*minutes*/ ctx[1] + /*seconds*/ ctx[0] / 10) + ")");
				attr(line2, "class", "second svelte-1p5wnm2");
				attr(line2, "y1", "10");
				attr(line2, "y2", "-38");
				attr(line3, "class", "second-counterweight svelte-1p5wnm2");
				attr(line3, "y1", "10");
				attr(line3, "y2", "2");
				attr(g, "transform", g_transform_value = "rotate(" + 6 * /*seconds*/ ctx[0] + ")");
				attr(svg, "viewBox", "-50 -50 100 100");
				attr(svg, "class", "svelte-1p5wnm2");
			},
			m(target, anchor) {
				insert(target, svg, anchor);
				append(svg, circle);

				for (let i = 0; i < 12; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(svg, null);
					}
				}

				append(svg, line0);
				append(svg, line1);
				append(svg, g);
				append(g, line2);
				append(g, line3);
			},
			p(ctx, [dirty]) {
				if (dirty & /*hours, minutes*/ 6 && line0_transform_value !== (line0_transform_value = "rotate(" + (30 * /*hours*/ ctx[2] + /*minutes*/ ctx[1] / 2) + ")")) {
					attr(line0, "transform", line0_transform_value);
				}

				if (dirty & /*minutes, seconds*/ 3 && line1_transform_value !== (line1_transform_value = "rotate(" + (6 * /*minutes*/ ctx[1] + /*seconds*/ ctx[0] / 10) + ")")) {
					attr(line1, "transform", line1_transform_value);
				}

				if (dirty & /*seconds*/ 1 && g_transform_value !== (g_transform_value = "rotate(" + 6 * /*seconds*/ ctx[0] + ")")) {
					attr(g, "transform", g_transform_value);
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(svg);
				}

				destroy_each(each_blocks, detaching);
			}
		};
	}

	function instance$3($$self, $$props, $$invalidate) {
		let hours;
		let minutes;
		let seconds;
		let time = new Date();

		onMount(() => {
			const interval = setInterval(
				() => {
					$$invalidate(3, time = new Date());
				},
				1000
			);

			return () => {
				clearInterval(interval);
			};
		});

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*time*/ 8) {
				// these automatically update when `time`
				// changes, because of the `$:` prefix
				$$invalidate(2, hours = time.getHours());
			}

			if ($$self.$$.dirty & /*time*/ 8) {
				$$invalidate(1, minutes = time.getMinutes());
			}

			if ($$self.$$.dirty & /*time*/ 8) {
				$$invalidate(0, seconds = time.getSeconds());
			}
		};

		return [seconds, minutes, hours, time];
	}

	class Clock extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$3, create_fragment$3, safe_not_equal, {}, add_css$2);
		}
	}

	customElements.define("svg-clock", create_custom_element(Clock, {}, [], [], true));

	/* wwwroot/js/Counter.svelte generated by Svelte v4.2.11 */

	function create_fragment$2(ctx) {
		let div;
		let span;
		let t0;
		let t1;
		let button;
		let t2;
		let t3;
		let t4;
		let t5_value = (/*count*/ ctx[0] === 1 ? "time" : "times") + "";
		let t5;
		let mounted;
		let dispose;

		return {
			c() {
				div = element("div");
				span = element("span");
				t0 = text(/*name*/ ctx[1]);
				t1 = space();
				button = element("button");
				t2 = text("Clicked ");
				t3 = text(/*count*/ ctx[0]);
				t4 = space();
				t5 = text(t5_value);
				attr(button, "class", "btn btn-accent");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				append(span, t0);
				append(div, t1);
				append(div, button);
				append(button, t2);
				append(button, t3);
				append(button, t4);
				append(button, t5);

				if (!mounted) {
					dispose = listen(button, "click", /*handleClick*/ ctx[2]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*name*/ 2) set_data(t0, /*name*/ ctx[1]);
				if (dirty & /*count*/ 1) set_data(t3, /*count*/ ctx[0]);
				if (dirty & /*count*/ 1 && t5_value !== (t5_value = (/*count*/ ctx[0] === 1 ? "time" : "times") + "")) set_data(t5, t5_value);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				mounted = false;
				dispose();
			}
		};
	}

	function instance$2($$self, $$props, $$invalidate) {
		let { count = 0 } = $$props;
		let { name = 'counter' } = $$props;

		// console.log("count :>> ", typeof count);
		function handleClick() {
			// console.log("count :>> ", typeof count);
			$$invalidate(0, count += 1);
		}

		$$self.$$set = $$props => {
			if ('count' in $$props) $$invalidate(0, count = $$props.count);
			if ('name' in $$props) $$invalidate(1, name = $$props.name);
		};

		return [count, name, handleClick];
	}

	class Counter extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$2, create_fragment$2, safe_not_equal, { count: 0, name: 1 });
		}

		get count() {
			return this.$$.ctx[0];
		}

		set count(count) {
			this.$$set({ count });
			flush();
		}

		get name() {
			return this.$$.ctx[1];
		}

		set name(name) {
			this.$$set({ name });
			flush();
		}
	}

	customElements.define("custom-counter", create_custom_element(Counter, {"count":{},"name":{}}, [], [], true));

	/* wwwroot/js/TidyNavbar.svelte generated by Svelte v4.2.11 */

	function add_css$1(target) {
		append_styles(target, "svelte-1p5vttp", ".navbar.svelte-1p5vttp{background:#6f42c1;display:inline}");
	}

	// (9:10) ...
	function fallback_block(ctx) {
		let t;

		return {
			c() {
				t = text("...");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	function create_fragment$1(ctx) {
		let div1;
		let div0;
		let current;
		const default_slot_template = /*#slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
		const default_slot_or_fallback = default_slot || fallback_block();

		return {
			c() {
				div1 = element("div");
				div0 = element("div");
				if (default_slot_or_fallback) default_slot_or_fallback.c();
				attr(div0, "class", "navbar-start");
				attr(div1, "class", "navbar bg-base-100 svelte-1p5vttp");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);

				if (default_slot_or_fallback) {
					default_slot_or_fallback.m(div0, null);
				}

				current = true;
			},
			p(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[0],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
							null
						);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot_or_fallback, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot_or_fallback, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div1);
				}

				if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
			}
		};
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;

		$$self.$$set = $$props => {
			if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
		};

		return [$$scope, slots];
	}

	class TidyNavbar extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, add_css$1);
		}
	}

	customElements.define("tidy-navbar", create_custom_element(TidyNavbar, {}, ["default"], [], true));

	/* wwwroot/js/OptionsPanel.svelte generated by Svelte v4.2.11 */

	function add_css(target) {
		append_styles(target, "svelte-1uhtp3i", "h1.svelte-1uhtp3i{font-size:1.5em}.panel.svelte-1uhtp3i{background:#6f42c1;opacity:30%}");
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[5] = list[i][0];
		child_ctx[6] = list[i][1];
		child_ctx[8] = i;
		return child_ctx;
	}

	// (28:12) {#each Object.entries(options) as [key, value], i}
	function create_each_block(ctx) {
		let h3;
		let t0_value = /*key*/ ctx[5] + "";
		let t0;
		let t1;
		let input;
		let input_value_value;

		return {
			c() {
				h3 = element("h3");
				t0 = text(t0_value);
				t1 = space();
				input = element("input");
				attr(input, "key", /*i*/ ctx[8]);
				input.value = input_value_value = /*value*/ ctx[6];
				attr(input, "type", "checkbox");
				attr(input, "class", "form-control toggle toggle-accent");
			},
			m(target, anchor) {
				insert(target, h3, anchor);
				append(h3, t0);
				insert(target, t1, anchor);
				insert(target, input, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*options*/ 2 && t0_value !== (t0_value = /*key*/ ctx[5] + "")) set_data(t0, t0_value);

				if (dirty & /*options*/ 2 && input_value_value !== (input_value_value = /*value*/ ctx[6])) {
					input.value = input_value_value;
				}
			},
			d(detaching) {
				if (detaching) {
					detach(h3);
					detach(t1);
					detach(input);
				}
			}
		};
	}

	function create_fragment(ctx) {
		let main;
		let div;
		let h1;
		let t0;
		let t1;
		let button;
		let t3;
		let ul;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(Object.entries(/*options*/ ctx[1]));
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		return {
			c() {
				main = element("main");
				div = element("div");
				h1 = element("h1");
				t0 = text(/*name*/ ctx[0]);
				t1 = space();
				button = element("button");
				button.textContent = "Get";
				t3 = space();
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(h1, "class", "text-primary svelte-1uhtp3i");
				attr(h1, "id", /*id*/ ctx[2]);
				attr(button, "class", "btn btn-primary");
				attr(div, "class", "panel svelte-1uhtp3i");
			},
			m(target, anchor) {
				insert(target, main, anchor);
				append(main, div);
				append(div, h1);
				append(h1, t0);
				append(div, t1);
				append(div, button);
				append(div, t3);
				append(div, ul);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}

				if (!mounted) {
					dispose = listen(button, "click", /*blah*/ ctx[3]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*name*/ 1) set_data(t0, /*name*/ ctx[0]);

				if (dirty & /*id*/ 4) {
					attr(h1, "id", /*id*/ ctx[2]);
				}

				if (dirty & /*Object, options*/ 2) {
					each_value = ensure_array_like(Object.entries(/*options*/ ctx[1]));
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(main);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance($$self, $$props, $$invalidate) {
		let { name = 'Options Panel' } = $$props;
		let { xdata = 'options: {show: false}' } = $$props;
		let { options = { foo: true } } = $$props;
		let { id } = $$props;

		function blah() {
			console.log("xdata :>> ", xdata);
		}

		$$self.$$set = $$props => {
			if ('name' in $$props) $$invalidate(0, name = $$props.name);
			if ('xdata' in $$props) $$invalidate(4, xdata = $$props.xdata);
			if ('options' in $$props) $$invalidate(1, options = $$props.options);
			if ('id' in $$props) $$invalidate(2, id = $$props.id);
		};

		return [name, options, id, blah, xdata];
	}

	class OptionsPanel extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance, create_fragment, safe_not_equal, { name: 0, xdata: 4, options: 1, id: 2 }, add_css);
		}

		get name() {
			return this.$$.ctx[0];
		}

		set name(name) {
			this.$$set({ name });
			flush();
		}

		get xdata() {
			return this.$$.ctx[4];
		}

		set xdata(xdata) {
			this.$$set({ xdata });
			flush();
		}

		get options() {
			return this.$$.ctx[1];
		}

		set options(options) {
			this.$$set({ options });
			flush();
		}

		get id() {
			return this.$$.ctx[2];
		}

		set id(id) {
			this.$$set({ id });
			flush();
		}
	}

	customElements.define("options-panel", create_custom_element(OptionsPanel, {"name":{},"xdata":{},"options":{},"id":{}}, [], [], true));

})();
