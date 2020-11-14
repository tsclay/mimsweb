
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
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
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
        flushing = false;
        seen_callbacks.clear();
    }
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.25.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/NavBar.svelte generated by Svelte v3.25.0 */

    const file = "src/components/NavBar.svelte";

    // (208:2) {:else}
    function create_else_block(ctx) {
    	let button;
    	let svg;
    	let g;
    	let rect0;
    	let rect1;
    	let rect2;
    	let t;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*toggleModal*/ ctx[0] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(rect0, "class", "burger-bars svelte-1iop4e0");
    			attr_dev(rect0, "ry", "15.501632");
    			attr_dev(rect0, "y", "86.060791");
    			attr_dev(rect0, "x", "35.279579");
    			attr_dev(rect0, "height", "18.003263");
    			attr_dev(rect0, "width", "134.70384");
    			attr_dev(rect0, "id", "rect833");
    			set_style(rect0, "fill-opacity", "1");
    			add_location(rect0, file, 217, 10, 7130);
    			attr_dev(rect1, "class", "burger-bars svelte-1iop4e0");
    			set_style(rect1, "fill-opacity", "1");
    			attr_dev(rect1, "id", "rect835");
    			attr_dev(rect1, "width", "134.70384");
    			attr_dev(rect1, "height", "18.003263");
    			attr_dev(rect1, "x", "35.279579");
    			attr_dev(rect1, "y", "128.39412");
    			attr_dev(rect1, "ry", "15.501632");
    			add_location(rect1, file, 226, 10, 7382);
    			attr_dev(rect2, "class", "burger-bars svelte-1iop4e0");
    			attr_dev(rect2, "ry", "15.501632");
    			attr_dev(rect2, "y", "170.72749");
    			attr_dev(rect2, "x", "35.279579");
    			attr_dev(rect2, "height", "18.003263");
    			attr_dev(rect2, "width", "134.70384");
    			attr_dev(rect2, "id", "rect837");
    			set_style(rect2, "fill-opacity", "1");
    			add_location(rect2, file, 235, 10, 7634);
    			attr_dev(g, "class", "burger-wrapper");
    			attr_dev(g, "transform", "matrix(0.99618808,0,0,0.99997149,-34.076739,-84.989974)");
    			add_location(g, file, 214, 8, 7005);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 135.46666 116.94583");
    			attr_dev(svg, "class", "svelte-1iop4e0");
    			add_location(svg, file, 209, 6, 6863);
    			attr_dev(button, "id", "modal-toggler");
    			attr_dev(button, "class", "svelte-1iop4e0");
    			add_location(button, file, 208, 4, 6785);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, g);
    			append_dev(g, rect0);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					stop_propagation(function () {
    						if (is_function(/*toggleNavButtons*/ ctx[2])) /*toggleNavButtons*/ ctx[2].apply(this, arguments);
    					}),
    					false,
    					false,
    					true
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*toggleModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(208:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (192:2) {#if width > 600}
    function create_if_block(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "About";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Gallery";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Testimonials";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "Contact";
    			attr_dev(button0, "class", "active-flash svelte-1iop4e0");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file, 193, 6, 6344);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "svelte-1iop4e0");
    			add_location(button1, file, 197, 6, 6458);
    			attr_dev(button2, "class", "active-flash svelte-1iop4e0");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file, 198, 6, 6529);
    			attr_dev(button3, "class", "active-flash svelte-1iop4e0");
    			attr_dev(button3, "type", "button");
    			add_location(button3, file, 202, 6, 6650);
    			attr_dev(div, "class", "button-group svelte-1iop4e0");
    			add_location(div, file, 192, 4, 6311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(div, t3);
    			append_dev(div, button2);
    			append_dev(div, t5);
    			append_dev(div, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*scrollToTarget*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*scrollToTarget*/ ctx[5], false, false, false),
    					listen_dev(button2, "click", /*scrollToTarget*/ ctx[5], false, false, false),
    					listen_dev(button3, "click", /*scrollToTarget*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(192:2) {#if width > 600}",
    		ctx
    	});

    	return block;
    }

    // (248:4) {#if toggleModal}
    function create_if_block_1(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "About";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Gallery";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Testimonials";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "Contact";
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "svelte-1iop4e0");
    			add_location(button0, file, 249, 8, 7975);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "svelte-1iop4e0");
    			add_location(button1, file, 250, 8, 8046);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "svelte-1iop4e0");
    			add_location(button2, file, 251, 8, 8119);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "svelte-1iop4e0");
    			add_location(button3, file, 252, 8, 8197);
    			attr_dev(div, "class", "sm-modal svelte-1iop4e0");
    			add_location(div, file, 248, 6, 7944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(div, t3);
    			append_dev(div, button2);
    			append_dev(div, t5);
    			append_dev(div, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*scrollToTarget*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*scrollToTarget*/ ctx[5], false, false, false),
    					listen_dev(button2, "click", /*scrollToTarget*/ ctx[5], false, false, false),
    					listen_dev(button3, "click", /*scrollToTarget*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(248:4) {#if toggleModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let svg;
    	let g0;
    	let path0;
    	let path1;
    	let g3;
    	let path2;
    	let g2;
    	let g1;
    	let text0;
    	let tspan0;
    	let t0;
    	let t1;
    	let text1;
    	let tspan1;
    	let t2;
    	let t3;
    	let text2;
    	let tspan2;
    	let t4;
    	let t5;
    	let text3;
    	let tspan3;
    	let t6;
    	let t7;
    	let text4;
    	let tspan4;
    	let t8;
    	let div_style_value;

    	function select_block_type(ctx, dirty) {
    		if (/*width*/ ctx[1] > 600) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g3 = svg_element("g");
    			path2 = svg_element("path");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			text0 = svg_element("text");
    			tspan0 = svg_element("tspan");
    			t0 = text("M F P");
    			t1 = space();
    			text1 = svg_element("text");
    			tspan1 = svg_element("tspan");
    			t2 = text("F P");
    			t3 = space();
    			text2 = svg_element("text");
    			tspan2 = svg_element("tspan");
    			t4 = text("I");
    			t5 = space();
    			text3 = svg_element("text");
    			tspan3 = svg_element("tspan");
    			t6 = text("I");
    			t7 = space();
    			text4 = svg_element("text");
    			tspan4 = svg_element("tspan");
    			t8 = space();
    			if_block.c();
    			attr_dev(path0, "id", "path837");
    			attr_dev(path0, "d", "M 0.16378259,0.16366121 0.164,52.818597 H 105.73553 V 0.16323121 Z");
    			set_style(path0, "fill", "#000000");
    			set_style(path0, "fill-opacity", "1");
    			set_style(path0, "stroke", "#000000");
    			set_style(path0, "stroke-width", "0.26128px");
    			set_style(path0, "stroke-linecap", "butt");
    			set_style(path0, "stroke-linejoin", "miter");
    			set_style(path0, "stroke-opacity", "1");
    			add_location(path0, file, 102, 6, 1967);
    			set_style(path1, "fill", "none");
    			set_style(path1, "stroke", "#000000");
    			set_style(path1, "stroke-width", "0.241924px");
    			set_style(path1, "stroke-linecap", "butt");
    			set_style(path1, "stroke-linejoin", "miter");
    			set_style(path1, "stroke-opacity", "1");
    			attr_dev(path1, "d", "M 2.7998996,2.7336213 2.8,50.2486 H 103.09936 V 2.7332313 Z");
    			attr_dev(path1, "id", "path865");
    			add_location(path1, file, 106, 6, 2223);
    			set_style(g0, "opacity", "1");
    			attr_dev(g0, "id", "layer1");
    			add_location(g0, file, 101, 4, 1927);
    			attr_dev(path2, "id", "path870");
    			attr_dev(path2, "d", "m 2.9150973,3.010641 c 0,0 33.6820487,6.0784662 50.7027287,6.0476187 C 70.136622,9.0283218 102.8039,3.010641 102.8039,3.010641 c 0,0 -5.119173,15.960044 -5.0919,23.902181 0.02727,7.942137 5.0919,22.985618 5.0919,22.985618 0,0 -32.671092,-5.923648 -49.186074,-5.953125 -17.016979,-0.03037 -50.7027287,5.953125 -50.7027287,5.953125 0,0 5.0532242,-14.906543 5.092001,-22.985618 C 8.0458751,18.833747 2.9150973,3.010641 2.9150973,3.010641 Z");
    			set_style(path2, "opacity", "1");
    			set_style(path2, "fill", "#8d8d8d");
    			set_style(path2, "fill-opacity", "1");
    			set_style(path2, "stroke", "#ffffff");
    			set_style(path2, "stroke-width", "0.38562");
    			set_style(path2, "stroke-miterlimit", "4");
    			set_style(path2, "stroke-dasharray", "none");
    			set_style(path2, "stroke-opacity", "1");
    			add_location(path2, file, 112, 6, 2484);
    			attr_dev(tspan0, "id", "tspan972");
    			attr_dev(tspan0, "x", "-0.22678363");
    			attr_dev(tspan0, "y", "-61.685715");
    			set_style(tspan0, "font-style", "normal");
    			set_style(tspan0, "font-variant", "normal");
    			set_style(tspan0, "font-weight", "300");
    			set_style(tspan0, "font-stretch", "normal");
    			set_style(tspan0, "font-size", "35.2778px");
    			set_style(tspan0, "font-family", "'Open Sans'");
    			set_style(tspan0, "-inkscape-font-specification", "'Open Sans Light'");
    			set_style(tspan0, "stroke-width", "0.264583");
    			add_location(tspan0, file, 124, 12, 3539);
    			attr_dev(text0, "xml:space", "preserve");
    			set_style(text0, "font-size", "10.5833px");
    			set_style(text0, "line-height", "1.25");
    			set_style(text0, "font-family", "'Source Sans Pro'");
    			set_style(text0, "-inkscape-font-specification", "'Source Sans Pro'");
    			set_style(text0, "stroke-width", "0.264583");
    			attr_dev(text0, "x", "-0.22678363");
    			attr_dev(text0, "y", "-61.685715");
    			attr_dev(text0, "id", "text974");
    			add_location(text0, file, 118, 10, 3251);
    			set_style(tspan1, "font-style", "normal");
    			set_style(tspan1, "font-variant", "normal");
    			set_style(tspan1, "font-weight", "300");
    			set_style(tspan1, "font-stretch", "normal");
    			set_style(tspan1, "font-size", "35.2778px");
    			set_style(tspan1, "font-family", "'Open Sans'");
    			set_style(tspan1, "-inkscape-font-specification", "'Open Sans Light'");
    			set_style(tspan1, "stroke-width", "0.264583");
    			attr_dev(tspan1, "y", "-61.685715");
    			attr_dev(tspan1, "x", "36.814888");
    			attr_dev(tspan1, "id", "tspan976");
    			add_location(tspan1, file, 138, 12, 4198);
    			attr_dev(text1, "id", "text978");
    			attr_dev(text1, "y", "-61.685715");
    			attr_dev(text1, "x", "36.814888");
    			set_style(text1, "font-size", "10.5833px");
    			set_style(text1, "line-height", "1.25");
    			set_style(text1, "font-family", "'Source Sans Pro'");
    			set_style(text1, "-inkscape-font-specification", "'Source Sans Pro'");
    			set_style(text1, "stroke-width", "0.264583");
    			attr_dev(text1, "xml:space", "preserve");
    			add_location(text1, file, 132, 10, 3912);
    			set_style(tspan2, "font-style", "normal");
    			set_style(tspan2, "font-variant", "normal");
    			set_style(tspan2, "font-weight", "300");
    			set_style(tspan2, "font-stretch", "normal");
    			set_style(tspan2, "font-size", "35.2778px");
    			set_style(tspan2, "font-family", "'Open Sans'");
    			set_style(tspan2, "-inkscape-font-specification", "'Open Sans Light'");
    			set_style(tspan2, "stroke-width", "0.264583");
    			attr_dev(tspan2, "y", "-61.680336");
    			attr_dev(tspan2, "x", "-2.6721652");
    			attr_dev(tspan2, "id", "tspan986");
    			add_location(tspan2, file, 152, 12, 4854);
    			attr_dev(text2, "id", "text988");
    			attr_dev(text2, "y", "-61.680336");
    			attr_dev(text2, "x", "-2.6721652");
    			set_style(text2, "font-size", "10.5833px");
    			set_style(text2, "line-height", "1.25");
    			set_style(text2, "font-family", "'Source Sans Pro'");
    			set_style(text2, "-inkscape-font-specification", "'Source Sans Pro'");
    			set_style(text2, "stroke-width", "0.264583");
    			attr_dev(text2, "xml:space", "preserve");
    			add_location(text2, file, 146, 10, 4567);
    			attr_dev(tspan3, "id", "tspan990");
    			attr_dev(tspan3, "x", "23.786171");
    			attr_dev(tspan3, "y", "-61.680336");
    			set_style(tspan3, "font-style", "normal");
    			set_style(tspan3, "font-variant", "normal");
    			set_style(tspan3, "font-weight", "300");
    			set_style(tspan3, "font-stretch", "normal");
    			set_style(tspan3, "font-size", "35.2778px");
    			set_style(tspan3, "font-family", "'Open Sans'");
    			set_style(tspan3, "-inkscape-font-specification", "'Open Sans Light'");
    			set_style(tspan3, "stroke-width", "0.264583");
    			add_location(tspan3, file, 166, 12, 5508);
    			attr_dev(text3, "xml:space", "preserve");
    			set_style(text3, "font-size", "10.5833px");
    			set_style(text3, "line-height", "1.25");
    			set_style(text3, "font-family", "'Source Sans Pro'");
    			set_style(text3, "-inkscape-font-specification", "'Source Sans Pro'");
    			set_style(text3, "stroke-width", "0.264583");
    			attr_dev(text3, "x", "23.786171");
    			attr_dev(text3, "y", "-61.680336");
    			attr_dev(text3, "id", "text992");
    			add_location(text3, file, 160, 10, 5222);
    			attr_dev(g1, "transform", "translate(6.8439438,53.107067)");
    			attr_dev(g1, "id", "g984");
    			add_location(g1, file, 117, 8, 3184);
    			attr_dev(g2, "id", "g1003");
    			attr_dev(g2, "transform", "translate(3.0747742,47.622316)");
    			add_location(g2, file, 116, 6, 3118);
    			attr_dev(g3, "id", "layer2");
    			add_location(g3, file, 111, 4, 2462);
    			attr_dev(tspan4, "id", "tspan844");
    			attr_dev(tspan4, "x", "154.74907");
    			attr_dev(tspan4, "y", "232.79176");
    			set_style(tspan4, "stroke-width", "0.264583");
    			add_location(tspan4, file, 183, 6, 6151);
    			attr_dev(text4, "xml:space", "preserve");
    			set_style(text4, "font-size", "10.5833px");
    			set_style(text4, "line-height", "1.25");
    			set_style(text4, "font-family", "'Source Sans Pro'");
    			set_style(text4, "-inkscape-font-specification", "'Source Sans Pro'");
    			set_style(text4, "stroke-width", "0.264583");
    			attr_dev(text4, "x", "154.74907");
    			attr_dev(text4, "y", "232.79176");
    			attr_dev(text4, "id", "text846");
    			add_location(text4, file, 177, 4, 5902);
    			attr_dev(svg, "xmlns:dc", "http://purl.org/dc/elements/1.1/");
    			attr_dev(svg, "xmlns:cc", "http://creativecommons.org/ns#");
    			attr_dev(svg, "xmlns:rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    			attr_dev(svg, "xmlns:svg", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "id", "svg8");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 105.83333 52.916668");
    			attr_dev(svg, "height", "90%");
    			attr_dev(svg, "width", "100");
    			attr_dev(svg, "class", "svelte-1iop4e0");
    			add_location(svg, file, 90, 2, 1578);
    			attr_dev(div, "id", "my-nav-bar");
    			attr_dev(div, "style", div_style_value = /*navIsSticky*/ ctx[3] ? /*stickyNav*/ ctx[4] : null);
    			attr_dev(div, "class", "svelte-1iop4e0");
    			add_location(div, file, 89, 0, 1515);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(svg, g3);
    			append_dev(g3, path2);
    			append_dev(g3, g2);
    			append_dev(g2, g1);
    			append_dev(g1, text0);
    			append_dev(text0, tspan0);
    			append_dev(tspan0, t0);
    			append_dev(text0, t1);
    			append_dev(g1, text1);
    			append_dev(text1, tspan1);
    			append_dev(tspan1, t2);
    			append_dev(text1, t3);
    			append_dev(g1, text2);
    			append_dev(text2, tspan2);
    			append_dev(tspan2, t4);
    			append_dev(text2, t5);
    			append_dev(g1, text3);
    			append_dev(text3, tspan3);
    			append_dev(tspan3, t6);
    			append_dev(text3, t7);
    			append_dev(svg, text4);
    			append_dev(text4, tspan4);
    			append_dev(div, t8);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*navIsSticky, stickyNav*/ 24 && div_style_value !== (div_style_value = /*navIsSticky*/ ctx[3] ? /*stickyNav*/ ctx[4] : null)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavBar", slots, []);
    	let { toggleModal } = $$props;
    	let { width } = $$props;
    	let { toggleNavButtons } = $$props;
    	let { navIsSticky } = $$props;
    	let { stickyNav } = $$props;

    	const scrollToTarget = e => {
    		const target = document.querySelector(`#${e.target.innerText.toLowerCase()}`).offsetTop;

    		window.scrollTo({
    			left: 0,
    			top: target - 100,
    			behavior: "smooth"
    		});
    	};

    	const writable_props = ["toggleModal", "width", "toggleNavButtons", "navIsSticky", "stickyNav"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("toggleModal" in $$props) $$invalidate(0, toggleModal = $$props.toggleModal);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("toggleNavButtons" in $$props) $$invalidate(2, toggleNavButtons = $$props.toggleNavButtons);
    		if ("navIsSticky" in $$props) $$invalidate(3, navIsSticky = $$props.navIsSticky);
    		if ("stickyNav" in $$props) $$invalidate(4, stickyNav = $$props.stickyNav);
    	};

    	$$self.$capture_state = () => ({
    		toggleModal,
    		width,
    		toggleNavButtons,
    		navIsSticky,
    		stickyNav,
    		scrollToTarget
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggleModal" in $$props) $$invalidate(0, toggleModal = $$props.toggleModal);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("toggleNavButtons" in $$props) $$invalidate(2, toggleNavButtons = $$props.toggleNavButtons);
    		if ("navIsSticky" in $$props) $$invalidate(3, navIsSticky = $$props.navIsSticky);
    		if ("stickyNav" in $$props) $$invalidate(4, stickyNav = $$props.stickyNav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toggleModal, width, toggleNavButtons, navIsSticky, stickyNav, scrollToTarget];
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			toggleModal: 0,
    			width: 1,
    			toggleNavButtons: 2,
    			navIsSticky: 3,
    			stickyNav: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleModal*/ ctx[0] === undefined && !("toggleModal" in props)) {
    			console.warn("<NavBar> was created without expected prop 'toggleModal'");
    		}

    		if (/*width*/ ctx[1] === undefined && !("width" in props)) {
    			console.warn("<NavBar> was created without expected prop 'width'");
    		}

    		if (/*toggleNavButtons*/ ctx[2] === undefined && !("toggleNavButtons" in props)) {
    			console.warn("<NavBar> was created without expected prop 'toggleNavButtons'");
    		}

    		if (/*navIsSticky*/ ctx[3] === undefined && !("navIsSticky" in props)) {
    			console.warn("<NavBar> was created without expected prop 'navIsSticky'");
    		}

    		if (/*stickyNav*/ ctx[4] === undefined && !("stickyNav" in props)) {
    			console.warn("<NavBar> was created without expected prop 'stickyNav'");
    		}
    	}

    	get toggleModal() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleModal(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggleNavButtons() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleNavButtons(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get navIsSticky() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navIsSticky(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stickyNav() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stickyNav(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/ContactForm.svelte generated by Svelte v3.25.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/ContactForm.svelte";

    // (209:8) {#if errors.hasOwnProperty('InvalidEmail')}
    function create_if_block_4(ctx) {
    	let div;
    	let span;
    	let t0_value = /*errors*/ ctx[1]["InvalidEmail"] + "";
    	let t0;
    	let t1;
    	let button;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "X";
    			add_location(span, file$1, 213, 12, 4969);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-13c7d71");
    			add_location(button, file$1, 214, 12, 5019);
    			attr_dev(div, "class", "error-containers svelte-13c7d71");
    			add_location(div, file$1, 209, 10, 4826);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*errors*/ 2) && t0_value !== (t0_value = /*errors*/ ctx[1]["InvalidEmail"] + "")) set_data_dev(t0, t0_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fade, { duration: 100 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: -60, duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(209:8) {#if errors.hasOwnProperty('InvalidEmail')}",
    		ctx
    	});

    	return block;
    }

    // (231:8) {#if errors.hasOwnProperty('InvalidPhone')}
    function create_if_block_3(ctx) {
    	let div;
    	let span;
    	let t0_value = /*errors*/ ctx[1]["InvalidPhone"] + "";
    	let t0;
    	let t1;
    	let button;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "X";
    			add_location(span, file$1, 235, 12, 5667);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-13c7d71");
    			add_location(button, file$1, 236, 12, 5717);
    			attr_dev(div, "class", "error-containers svelte-13c7d71");
    			add_location(div, file$1, 231, 10, 5524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*errors*/ 2) && t0_value !== (t0_value = /*errors*/ ctx[1]["InvalidPhone"] + "")) set_data_dev(t0, t0_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fade, { duration: 100 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: -60, duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(231:8) {#if errors.hasOwnProperty('InvalidPhone')}",
    		ctx
    	});

    	return block;
    }

    // (288:10) {#if showOptions}
    function create_if_block_2(ctx) {
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Email";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Phone";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Both";
    			attr_dev(div0, "value", "email");
    			attr_dev(div0, "class", "svelte-13c7d71");
    			add_location(div0, file$1, 289, 14, 7537);
    			attr_dev(div1, "value", "phone");
    			attr_dev(div1, "class", "svelte-13c7d71");
    			add_location(div1, file$1, 290, 14, 7611);
    			attr_dev(div2, "value", "both");
    			attr_dev(div2, "class", "svelte-13c7d71");
    			add_location(div2, file$1, 291, 14, 7685);
    			attr_dev(div3, "class", "dropdown-menu svelte-13c7d71");
    			add_location(div3, file$1, 288, 12, 7495);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*handleContactPref*/ ctx[7], false, false, false),
    					listen_dev(div1, "click", /*handleContactPref*/ ctx[7], false, false, false),
    					listen_dev(div2, "click", /*handleContactPref*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(288:10) {#if showOptions}",
    		ctx
    	});

    	return block;
    }

    // (298:8) {#if errors.hasOwnProperty('EmptyFields')}
    function create_if_block_1$1(ctx) {
    	let div;
    	let span;
    	let t0_value = /*errors*/ ctx[1]["EmptyFields"] + "";
    	let t0;
    	let t1;
    	let button;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "X";
    			add_location(span, file$1, 302, 12, 8044);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-13c7d71");
    			add_location(button, file$1, 303, 12, 8093);
    			attr_dev(div, "class", "error-containers svelte-13c7d71");
    			add_location(div, file$1, 298, 10, 7901);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_5*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*errors*/ 2) && t0_value !== (t0_value = /*errors*/ ctx[1]["EmptyFields"] + "")) set_data_dev(t0, t0_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fade, { duration: 150 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: -60, duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(298:8) {#if errors.hasOwnProperty('EmptyFields')}",
    		ctx
    	});

    	return block;
    }

    // (316:2) {#if example}
    function create_if_block$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*example*/ ctx[0]);
    			add_location(p, file$1, 316, 4, 8395);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*example*/ 1) set_data_dev(t, /*example*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(316:2) {#if example}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t0;
    	let div7;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let div6;
    	let form;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let label1;
    	let t9;
    	let input1;
    	let t10;
    	let div0;
    	let show_if_2 = /*errors*/ ctx[1].hasOwnProperty("InvalidEmail");
    	let t11;
    	let label2;
    	let t13;
    	let input2;
    	let t14;
    	let div1;
    	let show_if_1 = /*errors*/ ctx[1].hasOwnProperty("InvalidPhone");
    	let t15;
    	let label3;
    	let t17;
    	let textarea;
    	let t18;
    	let div4;
    	let span;
    	let t20;
    	let div3;
    	let div2;
    	let button0;
    	let svg;
    	let g;
    	let path;
    	let path_class_value;
    	let t21;
    	let t22;
    	let t23;
    	let t24;
    	let div5;
    	let show_if = /*errors*/ ctx[1].hasOwnProperty("EmptyFields");
    	let t25;
    	let button1;
    	let t27;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = show_if_2 && create_if_block_4(ctx);
    	let if_block1 = show_if_1 && create_if_block_3(ctx);
    	let if_block2 = /*showOptions*/ ctx[3] && create_if_block_2(ctx);
    	let if_block3 = show_if && create_if_block_1$1(ctx);
    	let if_block4 = /*example*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div7 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Contact us";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Estimates are provided quickly and at no cost. Painting one door, painting\n    an entire house; you name it, we'll quote it.";
    			t4 = space();
    			div6 = element("div");
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "Email Address";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t11 = space();
    			label2 = element("label");
    			label2.textContent = "Phone Number";
    			t13 = space();
    			input2 = element("input");
    			t14 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t15 = space();
    			label3 = element("label");
    			label3.textContent = "Message";
    			t17 = space();
    			textarea = element("textarea");
    			t18 = space();
    			div4 = element("div");
    			span = element("span");
    			span.textContent = "Preferred Contact Method";
    			t20 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button0 = element("button");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			t21 = space();
    			t22 = text(/*selected*/ ctx[2]);
    			t23 = space();
    			if (if_block2) if_block2.c();
    			t24 = space();
    			div5 = element("div");
    			if (if_block3) if_block3.c();
    			t25 = space();
    			button1 = element("button");
    			button1.textContent = "Send";
    			t27 = space();
    			if (if_block4) if_block4.c();
    			add_location(h1, file$1, 187, 2, 4116);
    			add_location(p, file$1, 188, 2, 4138);
    			attr_dev(label0, "for", "clientName");
    			add_location(label0, file$1, 194, 6, 4361);
    			attr_dev(input0, "name", "clientName");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Name");
    			attr_dev(input0, "class", "svelte-13c7d71");
    			add_location(input0, file$1, 195, 6, 4404);
    			attr_dev(label1, "for", "email");
    			add_location(label1, file$1, 200, 6, 4531);
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Email");
    			attr_dev(input1, "class", "svelte-13c7d71");
    			add_location(input1, file$1, 201, 6, 4578);
    			attr_dev(div0, "class", "error-wrapper svelte-13c7d71");
    			add_location(div0, file$1, 207, 6, 4736);
    			attr_dev(label2, "for", "phone");
    			add_location(label2, file$1, 223, 6, 5245);
    			attr_dev(input2, "type", "tel");
    			attr_dev(input2, "placeholder", "123-456-7890");
    			attr_dev(input2, "class", "svelte-13c7d71");
    			add_location(input2, file$1, 224, 6, 5291);
    			attr_dev(div1, "class", "error-wrapper svelte-13c7d71");
    			add_location(div1, file$1, 229, 6, 5434);
    			attr_dev(label3, "for", "message");
    			add_location(label3, file$1, 245, 6, 5943);
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "id", "message-field");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "class", "svelte-13c7d71");
    			add_location(textarea, file$1, 246, 6, 5986);
    			add_location(span, file$1, 253, 8, 6166);
    			attr_dev(path, "d", "M 155.46289,78.494058 42.636336,144.00382 42.636333,13.648303 Z");
    			set_style(path, "fill", "white");
    			set_style(path, "stroke", "#000000");
    			set_style(path, "stroke-width", "0.634805");
    			set_style(path, "stroke-opacity", "1");
    			attr_dev(path, "class", path_class_value = "" + (null_to_empty(/*showOptions*/ ctx[3] ? "active" : "rest") + " svelte-13c7d71"));
    			add_location(path, file$1, 278, 18, 7101);
    			attr_dev(g, "class", "drop-group");
    			add_location(g, file$1, 277, 16, 7060);
    			attr_dev(svg, "xmlns:dc", "http://purl.org/dc/elements/1.1/");
    			attr_dev(svg, "xmlns:cc", "http://creativecommons.org/ns#");
    			attr_dev(svg, "xmlns:rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    			attr_dev(svg, "xmlns:svg", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "100");
    			attr_dev(svg, "height", "15");
    			attr_dev(svg, "viewBox", "0 0 158.75 158.75");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "class", "dropArrow");
    			add_location(svg, file$1, 266, 14, 6578);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "svg-wrapper svelte-13c7d71");
    			add_location(button0, file$1, 260, 12, 6383);
    			attr_dev(div2, "class", "sel-text svelte-13c7d71");
    			add_location(div2, file$1, 255, 10, 6248);
    			attr_dev(div3, "class", "sel-options svelte-13c7d71");
    			add_location(div3, file$1, 254, 8, 6212);
    			attr_dev(div4, "name", "pref-contact");
    			attr_dev(div4, "class", "svelte-13c7d71");
    			add_location(div4, file$1, 252, 6, 6132);
    			attr_dev(div5, "class", "error-wrapper svelte-13c7d71");
    			add_location(div5, file$1, 296, 6, 7812);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "svelte-13c7d71");
    			add_location(button1, file$1, 312, 6, 8318);
    			attr_dev(form, "class", "svelte-13c7d71");
    			add_location(form, file$1, 193, 4, 4308);
    			attr_dev(div6, "id", "form-wrapper");
    			attr_dev(div6, "class", "svelte-13c7d71");
    			add_location(div6, file$1, 192, 2, 4280);
    			attr_dev(div7, "class", "component");
    			attr_dev(div7, "id", "contact");
    			add_location(div7, file$1, 186, 0, 4077);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, h1);
    			append_dev(div7, t2);
    			append_dev(div7, p);
    			append_dev(div7, t4);
    			append_dev(div7, div6);
    			append_dev(div6, form);
    			append_dev(form, label0);
    			append_dev(form, t6);
    			append_dev(form, input0);
    			set_input_value(input0, /*messageData*/ ctx[4].name);
    			append_dev(form, t7);
    			append_dev(form, label1);
    			append_dev(form, t9);
    			append_dev(form, input1);
    			set_input_value(input1, /*messageData*/ ctx[4].email);
    			append_dev(form, t10);
    			append_dev(form, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(form, t11);
    			append_dev(form, label2);
    			append_dev(form, t13);
    			append_dev(form, input2);
    			set_input_value(input2, /*messageData*/ ctx[4].phone);
    			append_dev(form, t14);
    			append_dev(form, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(form, t15);
    			append_dev(form, label3);
    			append_dev(form, t17);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*messageData*/ ctx[4].message);
    			append_dev(form, t18);
    			append_dev(form, div4);
    			append_dev(div4, span);
    			append_dev(div4, t20);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(button0, svg);
    			append_dev(svg, g);
    			append_dev(g, path);
    			append_dev(div2, t21);
    			append_dev(div2, t22);
    			append_dev(div3, t23);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(form, t24);
    			append_dev(form, div5);
    			if (if_block3) if_block3.m(div5, null);
    			append_dev(form, t25);
    			append_dev(form, button1);
    			append_dev(div7, t27);
    			if (if_block4) if_block4.m(div7, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen_dev(input1, "change", /*validateEmail*/ ctx[5], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(input2, "change", /*validatePhone*/ ctx[6], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[15]),
    					listen_dev(button0, "click", stop_propagation(/*click_handler_3*/ ctx[16]), false, false, true),
    					listen_dev(div2, "click", /*click_handler_4*/ ctx[17], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*messageData*/ 16 && input0.value !== /*messageData*/ ctx[4].name) {
    				set_input_value(input0, /*messageData*/ ctx[4].name);
    			}

    			if (dirty & /*messageData*/ 16 && input1.value !== /*messageData*/ ctx[4].email) {
    				set_input_value(input1, /*messageData*/ ctx[4].email);
    			}

    			if (dirty & /*errors*/ 2) show_if_2 = /*errors*/ ctx[1].hasOwnProperty("InvalidEmail");

    			if (show_if_2) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*errors*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*messageData*/ 16) {
    				set_input_value(input2, /*messageData*/ ctx[4].phone);
    			}

    			if (dirty & /*errors*/ 2) show_if_1 = /*errors*/ ctx[1].hasOwnProperty("InvalidPhone");

    			if (show_if_1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*errors*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*messageData*/ 16) {
    				set_input_value(textarea, /*messageData*/ ctx[4].message);
    			}

    			if (!current || dirty & /*showOptions*/ 8 && path_class_value !== (path_class_value = "" + (null_to_empty(/*showOptions*/ ctx[3] ? "active" : "rest") + " svelte-13c7d71"))) {
    				attr_dev(path, "class", path_class_value);
    			}

    			if (!current || dirty & /*selected*/ 4) set_data_dev(t22, /*selected*/ ctx[2]);

    			if (/*showOptions*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(div3, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*errors*/ 2) show_if = /*errors*/ ctx[1].hasOwnProperty("EmptyFields");

    			if (show_if) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*errors*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div5, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*example*/ ctx[0]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block$1(ctx);
    					if_block4.c();
    					if_block4.m(div7, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div7);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactForm", slots, []);
    	let example;
    	let errors = {};
    	let selected = "Both";
    	let showOptions = false;

    	let messageData = {
    		name: null,
    		email: null,
    		message: null,
    		phone: null,
    		preferredContact: "both"
    	};

    	const validateEmail = e => {
    		const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    		if (!e.target.value && errors.hasOwnProperty("InvalidEmail")) {
    			delete errors["InvalidEmail"];
    			$$invalidate(1, errors);
    			return;
    		}

    		if (!e.target.value) return;

    		if (!emailRegEx.test(e.target.value)) {
    			$$invalidate(1, errors["InvalidEmail"] = "Please enter a valid email address.", errors);
    		} else if (errors.hasOwnProperty("InvalidEmail")) {
    			delete errors["InvalidEmail"];
    			$$invalidate(1, errors);
    		}
    	};

    	const validatePhone = e => {
    		const digitsWithDashes = /[0-9]{3}-[0-9]{3}-[0-9]{4}/;
    		const digitsOnly = /[0-9]{10}/;

    		if (!e.target.value && errors.hasOwnProperty("InvalidPhone")) {
    			delete errors["InvalidPhone"];
    			$$invalidate(1, errors);
    			return;
    		}

    		if (!e.target.value) return;

    		if (!digitsWithDashes.test(e.target.value) && !digitsOnly.test(e.target.value)) {
    			$$invalidate(1, errors["InvalidPhone"] = "Please enter a valid phone number.", errors);
    		} else if (errors.hasOwnProperty("InvalidPhone")) {
    			delete errors["InvalidPhone"];
    			$$invalidate(1, errors);
    		}
    	};

    	const handleContactPref = e => {
    		$$invalidate(2, selected = e.target.innerText);
    		$$invalidate(4, messageData.preferredContact = selected.toLowerCase(), messageData);
    		$$invalidate(3, showOptions = false);
    	};

    	const handleSubmit = async e => {
    		const { name, email, message } = messageData;

    		if (!name || !email || !message) {
    			$$invalidate(1, errors["EmptyFields"] = "Please fill all fields.", errors);
    			return;
    		}

    		$$invalidate(4, messageData.preferredContact = selected, messageData);
    		const response = await JSON.stringify(messageData);
    		$$invalidate(0, example = response);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ContactForm> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => {
    		if (e.target.classList[0] === "sel-text") {
    			console.log(e.target.classList);
    			return;
    		} else {
    			$$invalidate(3, showOptions = false);
    		}
    	};

    	function input0_input_handler() {
    		messageData.name = this.value;
    		$$invalidate(4, messageData);
    	}

    	function input1_input_handler() {
    		messageData.email = this.value;
    		$$invalidate(4, messageData);
    	}

    	const click_handler_1 = () => {
    		delete errors["InvalidEmail"];
    		$$invalidate(1, errors);
    	};

    	function input2_input_handler() {
    		messageData.phone = this.value;
    		$$invalidate(4, messageData);
    	}

    	const click_handler_2 = () => {
    		delete errors["InvalidPhone"];
    		$$invalidate(1, errors);
    	};

    	function textarea_input_handler() {
    		messageData.message = this.value;
    		$$invalidate(4, messageData);
    	}

    	const click_handler_3 = e => {
    		$$invalidate(3, showOptions = !showOptions);
    	};

    	const click_handler_4 = e => {
    		$$invalidate(3, showOptions = !showOptions);
    	};

    	const click_handler_5 = () => {
    		delete errors["EmptyFields"];
    		$$invalidate(1, errors);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		fade,
    		example,
    		errors,
    		selected,
    		showOptions,
    		messageData,
    		validateEmail,
    		validatePhone,
    		handleContactPref,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("example" in $$props) $$invalidate(0, example = $$props.example);
    		if ("errors" in $$props) $$invalidate(1, errors = $$props.errors);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("showOptions" in $$props) $$invalidate(3, showOptions = $$props.showOptions);
    		if ("messageData" in $$props) $$invalidate(4, messageData = $$props.messageData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		example,
    		errors,
    		selected,
    		showOptions,
    		messageData,
    		validateEmail,
    		validatePhone,
    		handleContactPref,
    		handleSubmit,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler_1,
    		input2_input_handler,
    		click_handler_2,
    		textarea_input_handler,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class ContactForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactForm",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Banner.svelte generated by Svelte v3.25.0 */

    const file$2 = "src/components/Banner.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t;
    	let div1;
    	let div0;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			img0 = element("img");
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			img1 = element("img");
    			attr_dev(img0, "class", "banner-bkgd svelte-1luh1eu");
    			if (img0.src !== (img0_src_value = "../assets/img/1925new.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Mims Family Painting");
    			add_location(img0, file$2, 38, 2, 605);
    			if (img1.src !== (img1_src_value = "../assets/img/NEWNEWLOGO.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "logo");
    			attr_dev(img1, "class", "svelte-1luh1eu");
    			add_location(img1, file$2, 44, 6, 777);
    			attr_dev(div0, "class", "logo-wrapper svelte-1luh1eu");
    			add_location(div0, file$2, 43, 4, 744);
    			attr_dev(div1, "class", "banner-text-wrapper svelte-1luh1eu");
    			add_location(div1, file$2, 42, 2, 706);
    			attr_dev(div2, "id", "banner");
    			attr_dev(div2, "class", "svelte-1luh1eu");
    			add_location(div2, file$2, 37, 0, 585);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Banner", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Banner> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/VisibilityGuard.svelte generated by Svelte v3.25.0 */
    const file$3 = "src/components/VisibilityGuard.svelte";

    const get_default_slot_changes = dirty => ({
    	visible: dirty & /*visible*/ 8,
    	hasBeenVisible: dirty & /*hasBeenVisible*/ 16
    });

    const get_default_slot_context = ctx => ({
    	visible: /*visible*/ ctx[3],
    	hasBeenVisible: /*hasBeenVisible*/ ctx[4]
    });

    function create_fragment$3(ctx) {
    	let div;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();

    			attr_dev(div, "style", div_style_value = "position: relative; " + (/*gridArea*/ ctx[0]
    			? `grid-area: ${/*gridArea*/ ctx[0]}`
    			: "") + " " + (/*styleOverride*/ ctx[1] ? /*styleOverride*/ ctx[1] : ""));

    			add_location(div, file$3, 32, 0, 612);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[7](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, visible, hasBeenVisible*/ 56) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}

    			if (!current || dirty & /*gridArea, styleOverride*/ 3 && div_style_value !== (div_style_value = "position: relative; " + (/*gridArea*/ ctx[0]
    			? `grid-area: ${/*gridArea*/ ctx[0]}`
    			: "") + " " + (/*styleOverride*/ ctx[1] ? /*styleOverride*/ ctx[1] : ""))) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VisibilityGuard", slots, ['default']);
    	let { gridArea } = $$props, { styleOverride } = $$props;
    	let el = null;
    	let visible = false;
    	let hasBeenVisible = false;
    	let observer = null;

    	onMount(() => {
    		$$invalidate(8, observer = new IntersectionObserver(entries => {
    				$$invalidate(3, visible = entries[0].isIntersecting);
    				$$invalidate(4, hasBeenVisible = hasBeenVisible || visible);
    			},
    		{ rootMargin: "0px 0px 50px 0px" }));

    		observer.observe(el);

    		return () => {
    			if (!hasBeenVisible) {
    				observer.unobserve(el);
    			}
    		};
    	});

    	const writable_props = ["gridArea", "styleOverride"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VisibilityGuard> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(2, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("gridArea" in $$props) $$invalidate(0, gridArea = $$props.gridArea);
    		if ("styleOverride" in $$props) $$invalidate(1, styleOverride = $$props.styleOverride);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		gridArea,
    		styleOverride,
    		el,
    		visible,
    		hasBeenVisible,
    		observer
    	});

    	$$self.$inject_state = $$props => {
    		if ("gridArea" in $$props) $$invalidate(0, gridArea = $$props.gridArea);
    		if ("styleOverride" in $$props) $$invalidate(1, styleOverride = $$props.styleOverride);
    		if ("el" in $$props) $$invalidate(2, el = $$props.el);
    		if ("visible" in $$props) $$invalidate(3, visible = $$props.visible);
    		if ("hasBeenVisible" in $$props) $$invalidate(4, hasBeenVisible = $$props.hasBeenVisible);
    		if ("observer" in $$props) $$invalidate(8, observer = $$props.observer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*hasBeenVisible, observer, el*/ 276) {
    			 if (hasBeenVisible) {
    				observer.unobserve(el);
    			}
    		}
    	};

    	return [
    		gridArea,
    		styleOverride,
    		el,
    		visible,
    		hasBeenVisible,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class VisibilityGuard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { gridArea: 0, styleOverride: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VisibilityGuard",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*gridArea*/ ctx[0] === undefined && !("gridArea" in props)) {
    			console.warn("<VisibilityGuard> was created without expected prop 'gridArea'");
    		}

    		if (/*styleOverride*/ ctx[1] === undefined && !("styleOverride" in props)) {
    			console.warn("<VisibilityGuard> was created without expected prop 'styleOverride'");
    		}
    	}

    	get gridArea() {
    		throw new Error("<VisibilityGuard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridArea(value) {
    		throw new Error("<VisibilityGuard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleOverride() {
    		throw new Error("<VisibilityGuard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleOverride(value) {
    		throw new Error("<VisibilityGuard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Image.svelte generated by Svelte v3.25.0 */
    const file$4 = "src/components/Image.svelte";

    // (102:2) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;
    	let img_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*imgSrcTiny*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imgAlt*/ ctx[2]);
    			attr_dev(img, "class", "svelte-gh3y1j");
    			toggle_class(img, "isGallery", /*isGallery*/ ctx[5]);
    			add_location(img, file$4, 102, 4, 2094);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "outrostart", /*setPosToAbsolute*/ ctx[9], false, false, false),
    					listen_dev(img, "outroend", /*setPosToStatic*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*imgSrcTiny*/ 2 && img.src !== (img_src_value = /*imgSrcTiny*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*imgAlt*/ 4) {
    				attr_dev(img, "alt", /*imgAlt*/ ctx[2]);
    			}

    			if (dirty & /*isGallery*/ 32) {
    				toggle_class(img, "isGallery", /*isGallery*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (img_outro) img_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			img_outro = create_out_transition(img, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching && img_outro) img_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(102:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:2) {#if hasBeenVisible}
    function create_if_block$2(ctx) {
    	let div;
    	let t;
    	let img;
    	let img_src_value;
    	let img_intro;
    	let mounted;
    	let dispose;
    	let if_block = !/*hideBtn*/ ctx[6] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			img = element("img");
    			if (img.src !== (img_src_value = /*imgSrc*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imgAlt*/ ctx[2]);
    			attr_dev(img, "class", "svelte-gh3y1j");
    			toggle_class(img, "isAbsolute", /*isAbsolute*/ ctx[7]);
    			toggle_class(img, "isStatic", /*isStatic*/ ctx[8]);
    			toggle_class(img, "isGallery", /*isGallery*/ ctx[5]);
    			add_location(img, file$4, 93, 6, 1931);
    			attr_dev(div, "class", "img-wrapper svelte-gh3y1j");
    			add_location(div, file$4, 77, 4, 1393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*forwardImgClick*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*hideBtn*/ ctx[6]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*imgSrc*/ 1 && img.src !== (img_src_value = /*imgSrc*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*imgAlt*/ 4) {
    				attr_dev(img, "alt", /*imgAlt*/ ctx[2]);
    			}

    			if (dirty & /*isAbsolute*/ 128) {
    				toggle_class(img, "isAbsolute", /*isAbsolute*/ ctx[7]);
    			}

    			if (dirty & /*isStatic*/ 256) {
    				toggle_class(img, "isStatic", /*isStatic*/ ctx[8]);
    			}

    			if (dirty & /*isGallery*/ 32) {
    				toggle_class(img, "isGallery", /*isGallery*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, fade, {});
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(77:2) {#if hasBeenVisible}",
    		ctx
    	});

    	return block;
    }

    // (79:6) {#if !hideBtn}
    function create_if_block_1$2(ctx) {
    	let button;
    	let svg;
    	let g;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "m63.775 0.037775-3.2233 49.618-46.394-46.394z");
    			add_location(path0, file$4, 87, 14, 1731);
    			attr_dev(path1, "d", "m3.4778 9.6112 46.394 46.395-49.618 3.2232z");
    			add_location(path1, file$4, 88, 14, 1804);
    			attr_dev(g, "fill", "var(--white)");
    			add_location(g, file$4, 86, 12, 1693);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 64.029 59.267");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$4, 80, 10, 1511);
    			attr_dev(button, "class", "maximize svelte-gh3y1j");
    			add_location(button, file$4, 79, 8, 1475);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(79:6) {#if !hideBtn}",
    		ctx
    	});

    	return block;
    }

    // (76:0) <VisibilityGuard let:hasBeenVisible {gridArea} {styleOverride}>
    function create_default_slot(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasBeenVisible*/ ctx[13]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(76:0) <VisibilityGuard let:hasBeenVisible {gridArea} {styleOverride}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let visibilityguard;
    	let current;

    	visibilityguard = new VisibilityGuard({
    			props: {
    				gridArea: /*gridArea*/ ctx[3],
    				styleOverride: /*styleOverride*/ ctx[4],
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ hasBeenVisible }) => ({ 13: hasBeenVisible }),
    						({ hasBeenVisible }) => hasBeenVisible ? 8192 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(visibilityguard.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(visibilityguard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const visibilityguard_changes = {};
    			if (dirty & /*gridArea*/ 8) visibilityguard_changes.gridArea = /*gridArea*/ ctx[3];
    			if (dirty & /*styleOverride*/ 16) visibilityguard_changes.styleOverride = /*styleOverride*/ ctx[4];

    			if (dirty & /*$$scope, imgSrc, imgAlt, isAbsolute, isStatic, isGallery, hideBtn, hasBeenVisible, imgSrcTiny*/ 25063) {
    				visibilityguard_changes.$$scope = { dirty, ctx };
    			}

    			visibilityguard.$set(visibilityguard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(visibilityguard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(visibilityguard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(visibilityguard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Image", slots, []);
    	let { imgSrc = "#" } = $$props;
    	let { imgSrcTiny = imgSrc } = $$props;
    	let { imgAlt = "Image" } = $$props;
    	let { gridArea } = $$props, { styleOverride } = $$props, { isGallery } = $$props;
    	let { hideBtn } = $$props;
    	let isAbsolute = false;
    	let isStatic = false;
    	const dispatch = createEventDispatcher();

    	function setPosToAbsolute() {
    		$$invalidate(7, isAbsolute = true);
    		$$invalidate(8, isStatic = false);
    	}

    	function setPosToStatic() {
    		$$invalidate(7, isAbsolute = false);
    		$$invalidate(8, isStatic = true);
    	}

    	function forwardImgClick(e) {
    		dispatch("openImg", { imgSrc });
    	}

    	const writable_props = [
    		"imgSrc",
    		"imgSrcTiny",
    		"imgAlt",
    		"gridArea",
    		"styleOverride",
    		"isGallery",
    		"hideBtn"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("imgSrc" in $$props) $$invalidate(0, imgSrc = $$props.imgSrc);
    		if ("imgSrcTiny" in $$props) $$invalidate(1, imgSrcTiny = $$props.imgSrcTiny);
    		if ("imgAlt" in $$props) $$invalidate(2, imgAlt = $$props.imgAlt);
    		if ("gridArea" in $$props) $$invalidate(3, gridArea = $$props.gridArea);
    		if ("styleOverride" in $$props) $$invalidate(4, styleOverride = $$props.styleOverride);
    		if ("isGallery" in $$props) $$invalidate(5, isGallery = $$props.isGallery);
    		if ("hideBtn" in $$props) $$invalidate(6, hideBtn = $$props.hideBtn);
    	};

    	$$self.$capture_state = () => ({
    		VisibilityGuard,
    		fade,
    		createEventDispatcher,
    		imgSrc,
    		imgSrcTiny,
    		imgAlt,
    		gridArea,
    		styleOverride,
    		isGallery,
    		hideBtn,
    		isAbsolute,
    		isStatic,
    		dispatch,
    		setPosToAbsolute,
    		setPosToStatic,
    		forwardImgClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("imgSrc" in $$props) $$invalidate(0, imgSrc = $$props.imgSrc);
    		if ("imgSrcTiny" in $$props) $$invalidate(1, imgSrcTiny = $$props.imgSrcTiny);
    		if ("imgAlt" in $$props) $$invalidate(2, imgAlt = $$props.imgAlt);
    		if ("gridArea" in $$props) $$invalidate(3, gridArea = $$props.gridArea);
    		if ("styleOverride" in $$props) $$invalidate(4, styleOverride = $$props.styleOverride);
    		if ("isGallery" in $$props) $$invalidate(5, isGallery = $$props.isGallery);
    		if ("hideBtn" in $$props) $$invalidate(6, hideBtn = $$props.hideBtn);
    		if ("isAbsolute" in $$props) $$invalidate(7, isAbsolute = $$props.isAbsolute);
    		if ("isStatic" in $$props) $$invalidate(8, isStatic = $$props.isStatic);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		imgSrc,
    		imgSrcTiny,
    		imgAlt,
    		gridArea,
    		styleOverride,
    		isGallery,
    		hideBtn,
    		isAbsolute,
    		isStatic,
    		setPosToAbsolute,
    		setPosToStatic,
    		forwardImgClick
    	];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			imgSrc: 0,
    			imgSrcTiny: 1,
    			imgAlt: 2,
    			gridArea: 3,
    			styleOverride: 4,
    			isGallery: 5,
    			hideBtn: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*gridArea*/ ctx[3] === undefined && !("gridArea" in props)) {
    			console.warn("<Image> was created without expected prop 'gridArea'");
    		}

    		if (/*styleOverride*/ ctx[4] === undefined && !("styleOverride" in props)) {
    			console.warn("<Image> was created without expected prop 'styleOverride'");
    		}

    		if (/*isGallery*/ ctx[5] === undefined && !("isGallery" in props)) {
    			console.warn("<Image> was created without expected prop 'isGallery'");
    		}

    		if (/*hideBtn*/ ctx[6] === undefined && !("hideBtn" in props)) {
    			console.warn("<Image> was created without expected prop 'hideBtn'");
    		}
    	}

    	get imgSrc() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgSrc(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgSrcTiny() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgSrcTiny(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgAlt() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgAlt(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gridArea() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridArea(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleOverride() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleOverride(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isGallery() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGallery(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideBtn() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideBtn(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/About.svelte generated by Svelte v3.25.0 */
    const file$5 = "src/components/About.svelte";

    // (64:2) {#if width > 600}
    function create_if_block$3(ctx) {
    	let div;
    	let svg;
    	let g2;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let g5;
    	let g3;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let path21;
    	let path22;
    	let path23;
    	let path24;
    	let path25;
    	let path26;
    	let path27;
    	let path28;
    	let path29;
    	let path30;
    	let path31;
    	let path32;
    	let path33;
    	let path34;
    	let path35;
    	let path36;
    	let path37;
    	let path38;
    	let g4;
    	let path39;
    	let path40;
    	let path41;
    	let path42;
    	let path43;
    	let path44;
    	let path45;
    	let path46;
    	let path47;
    	let path48;
    	let path49;
    	let path50;
    	let path51;
    	let path52;
    	let path53;
    	let path54;
    	let path55;
    	let path56;
    	let path57;
    	let path58;
    	let path59;
    	let path60;
    	let path61;
    	let path62;
    	let path63;
    	let path64;
    	let path65;
    	let path66;
    	let path67;
    	let path68;
    	let path69;
    	let path70;
    	let path71;
    	let path72;
    	let g8;
    	let g7;
    	let g6;
    	let path73;
    	let path74;
    	let path75;
    	let path76;
    	let path77;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			g5 = svg_element("g");
    			g3 = svg_element("g");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			path27 = svg_element("path");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			path30 = svg_element("path");
    			path31 = svg_element("path");
    			path32 = svg_element("path");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			path36 = svg_element("path");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			g4 = svg_element("g");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			path43 = svg_element("path");
    			path44 = svg_element("path");
    			path45 = svg_element("path");
    			path46 = svg_element("path");
    			path47 = svg_element("path");
    			path48 = svg_element("path");
    			path49 = svg_element("path");
    			path50 = svg_element("path");
    			path51 = svg_element("path");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			path54 = svg_element("path");
    			path55 = svg_element("path");
    			path56 = svg_element("path");
    			path57 = svg_element("path");
    			path58 = svg_element("path");
    			path59 = svg_element("path");
    			path60 = svg_element("path");
    			path61 = svg_element("path");
    			path62 = svg_element("path");
    			path63 = svg_element("path");
    			path64 = svg_element("path");
    			path65 = svg_element("path");
    			path66 = svg_element("path");
    			path67 = svg_element("path");
    			path68 = svg_element("path");
    			path69 = svg_element("path");
    			path70 = svg_element("path");
    			path71 = svg_element("path");
    			path72 = svg_element("path");
    			g8 = svg_element("g");
    			g7 = svg_element("g");
    			g6 = svg_element("g");
    			path73 = svg_element("path");
    			path74 = svg_element("path");
    			path75 = svg_element("path");
    			path76 = svg_element("path");
    			path77 = svg_element("path");
    			set_style(path0, "fill", "none");
    			set_style(path0, "fill-opacity", "1");
    			set_style(path0, "stroke", "none");
    			set_style(path0, "stroke-width", "0.15");
    			set_style(path0, "stroke-linecap", "butt");
    			set_style(path0, "stroke-linejoin", "miter");
    			set_style(path0, "stroke-miterlimit", "4");
    			set_style(path0, "stroke-dasharray", "none");
    			set_style(path0, "stroke-opacity", "1");
    			attr_dev(path0, "d", "m 77.182741,47.805505 4.28e-4,135.512945");
    			attr_dev(path0, "id", "path837");
    			add_location(path0, file$5, 82, 14, 1797);
    			attr_dev(path1, "id", "path839");
    			attr_dev(path1, "d", "m 80.88691,47.805505 4.25e-4,135.512945");
    			set_style(path1, "fill", "none");
    			set_style(path1, "fill-opacity", "1");
    			set_style(path1, "stroke", "none");
    			set_style(path1, "stroke-width", "0.15");
    			set_style(path1, "stroke-linecap", "butt");
    			set_style(path1, "stroke-linejoin", "miter");
    			set_style(path1, "stroke-miterlimit", "4");
    			set_style(path1, "stroke-dasharray", "none");
    			set_style(path1, "stroke-opacity", "1");
    			add_location(path1, file$5, 86, 14, 2090);
    			attr_dev(path2, "id", "path843");
    			attr_dev(path2, "d", "M 77.182741,47.805505 H 80.88691");
    			set_style(path2, "fill", "none");
    			set_style(path2, "fill-opacity", "1");
    			set_style(path2, "stroke", "none");
    			set_style(path2, "stroke-width", "0.15");
    			set_style(path2, "stroke-linecap", "butt");
    			set_style(path2, "stroke-linejoin", "miter");
    			set_style(path2, "stroke-miterlimit", "4");
    			set_style(path2, "stroke-dasharray", "none");
    			set_style(path2, "stroke-opacity", "1");
    			add_location(path2, file$5, 90, 14, 2382);
    			attr_dev(path3, "id", "path847");
    			attr_dev(path3, "d", "m 77.183169,183.31845 h 3.704163");
    			set_style(path3, "fill", "none");
    			set_style(path3, "fill-opacity", "1");
    			set_style(path3, "stroke", "none");
    			set_style(path3, "stroke-width", "0.15");
    			set_style(path3, "stroke-linecap", "butt");
    			set_style(path3, "stroke-linejoin", "miter");
    			set_style(path3, "stroke-miterlimit", "4");
    			set_style(path3, "stroke-dasharray", "none");
    			set_style(path3, "stroke-opacity", "1");
    			add_location(path3, file$5, 94, 14, 2667);
    			attr_dev(g0, "id", "g929");
    			attr_dev(g0, "transform", "matrix(0.3713163,0,2.9794632e-4,1.5586369,-25.091205,-74.399707)");
    			set_style(g0, "fill", "none");
    			set_style(g0, "fill-opacity", "1");
    			set_style(g0, "stroke", "none");
    			set_style(g0, "stroke-width", "0.15");
    			set_style(g0, "stroke-miterlimit", "4");
    			set_style(g0, "stroke-dasharray", "none");
    			set_style(g0, "stroke-opacity", "1");
    			add_location(g0, file$5, 78, 12, 1528);
    			set_style(path4, "fill", "#803300");
    			set_style(path4, "stroke", "#803300");
    			set_style(path4, "stroke-width", "0.055877");
    			set_style(path4, "stroke-miterlimit", "4");
    			set_style(path4, "stroke-dasharray", "none");
    			set_style(path4, "stroke-dashoffset", "0");
    			set_style(path4, "stroke-opacity", "1");
    			attr_dev(path4, "d", "M 3.7381293,210.44816 C 3.7161186,209.4625 3.6874412,0.61945495 3.7093317,0.4441325 3.7216808,0.34510848 3.9847659,0.32749683 4.2939329,0.4049574 l 0.562117,0.1408683 0.023245,104.6163943 c 0.012786,57.53904 0.015931,104.8785 0.00698,105.19887 -0.020683,0.73934 -1.1316769,0.82364 -1.1481555,0.0872 z");
    			attr_dev(path4, "id", "path1042");
    			add_location(path4, file$5, 99, 12, 2967);
    			attr_dev(g1, "transform", "matrix(1,0,0,2.0042723,0,-0.11219441)");
    			attr_dev(g1, "id", "layer2");
    			set_style(g1, "display", "inline");
    			set_style(g1, "mix-blend-mode", "normal");
    			add_location(g1, file$5, 74, 10, 1369);
    			attr_dev(g2, "id", "layer6");
    			add_location(g2, file$5, 73, 8, 1343);
    			set_style(path5, "fill", "#ffe680");
    			set_style(path5, "stroke", "#2b2200");
    			set_style(path5, "stroke-width", "0.00764437");
    			set_style(path5, "stroke-miterlimit", "4");
    			set_style(path5, "stroke-dasharray", "none");
    			set_style(path5, "stroke-dashoffset", "0");
    			attr_dev(path5, "d", "m 0.93276919,5.6391072 0.26335531,-0.813191 0.066668,-0.03884 c 0.036665,-0.02134 0.7880515,-0.1885077 1.669754,-0.3714647 1.8554529,-0.384998 1.6908347,-0.446386 1.3796866,0.5144847 -0.1382883,0.427074 -0.1984662,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315691,0.162919 -1.6041635,0.45384 -0.8479738,0.179735 -1.59830432,0.337748 -1.66740612,0.351153 l -0.12565862,0.02441 z");
    			attr_dev(path5, "id", "path1034");
    			add_location(path5, file$5, 107, 12, 3619);
    			attr_dev(path6, "id", "path1172");
    			attr_dev(path6, "d", "m 0.84374418,11.748592 0.26335772,-0.813191 0.066665,-0.03884 c 0.036671,-0.02134 0.7880514,-0.188508 1.6697553,-0.371465 1.8554553,-0.384998 1.690834,-0.446386 1.3796852,0.514485 -0.1382882,0.427074 -0.1984661,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315689,0.162919 -1.6041635,0.45384 -0.8479732,0.179735 -1.59830433,0.337748 -1.66740613,0.351153 l -0.12565561,0.02441 z");
    			set_style(path6, "fill", "#ffe680");
    			set_style(path6, "stroke", "#2b2200");
    			set_style(path6, "stroke-width", "0.00764437");
    			set_style(path6, "stroke-miterlimit", "4");
    			set_style(path6, "stroke-dasharray", "none");
    			set_style(path6, "stroke-dashoffset", "0");
    			add_location(path6, file$5, 111, 12, 4209);
    			set_style(path7, "fill", "#ffe680");
    			set_style(path7, "stroke", "#2b2200");
    			set_style(path7, "stroke-width", "0.00764437");
    			set_style(path7, "stroke-miterlimit", "4");
    			set_style(path7, "stroke-dasharray", "none");
    			set_style(path7, "stroke-dashoffset", "0");
    			attr_dev(path7, "d", "M 0.75471857,17.858078 1.018074,17.044887 1.084739,17.006047 c 0.036671,-0.02134 0.788049,-0.188508 1.6697553,-0.371465 1.8554553,-0.384998 1.6908382,-0.446386 1.3796852,0.514485 -0.1382882,0.427074 -0.1984662,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315647,0.162919 -1.6041635,0.45384 -0.8479697,0.179735 -1.59830433,0.337748 -1.66740844,0.351153 l -0.12565271,0.02441 z");
    			attr_dev(path7, "id", "path1174");
    			add_location(path7, file$5, 115, 12, 4796);
    			attr_dev(path8, "id", "path1176");
    			attr_dev(path8, "d", "m 0.84715268,23.967569 0.26335302,-0.813191 0.066664,-0.03884 c 0.036677,-0.02134 0.788052,-0.188508 1.669758,-0.371465 1.8554526,-0.384998 1.6908312,-0.446386 1.379683,0.514485 -0.1382881,0.427074 -0.1984661,0.596913 -0.2456009,0.692824 -0.055565,0.113125 -0.2315689,0.162919 -1.6041628,0.45384 -0.8479739,0.179735 -1.59830443,0.337748 -1.66740683,0.351153 l -0.12565441,0.02441 z");
    			set_style(path8, "fill", "#ffe680");
    			set_style(path8, "stroke", "#2b2200");
    			set_style(path8, "stroke-width", "0.00764437");
    			set_style(path8, "stroke-miterlimit", "4");
    			set_style(path8, "stroke-dasharray", "none");
    			set_style(path8, "stroke-dashoffset", "0");
    			add_location(path8, file$5, 119, 12, 5382);
    			set_style(path9, "fill", "#ffe680");
    			set_style(path9, "stroke", "#2b2200");
    			set_style(path9, "stroke-width", "0.00764437");
    			set_style(path9, "stroke-miterlimit", "4");
    			set_style(path9, "stroke-dasharray", "none");
    			set_style(path9, "stroke-dashoffset", "0");
    			attr_dev(path9, "d", "M 0.82129538,30.077051 1.0846508,29.26386 1.1513158,29.22502 c 0.036677,-0.02134 0.7880532,-0.188508 1.6697552,-0.371465 1.8554555,-0.384998 1.6908382,-0.446386 1.3796894,0.514485 -0.1382881,0.427074 -0.1984661,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315689,0.162919 -1.6041634,0.45384 -0.8479739,0.179735 -1.59830443,0.337748 -1.66740853,0.351153 l -0.12565682,0.02441 z");
    			attr_dev(path9, "id", "path1178");
    			add_location(path9, file$5, 123, 12, 5967);
    			attr_dev(path10, "id", "path1180");
    			attr_dev(path10, "d", "M 0.95465899,36.186541 1.2180143,35.37335 1.2846793,35.33451 c 0.036671,-0.02134 0.7880532,-0.188508 1.6697551,-0.371465 1.8554548,-0.384998 1.6908378,-0.446386 1.3796896,0.514485 -0.1382883,0.427074 -0.1984664,0.596913 -0.2456047,0.692824 -0.055565,0.113125 -0.2315647,0.162919 -1.6041584,0.45384 -0.8479739,0.179735 -1.59830862,0.337748 -1.66740862,0.351153 l -0.12565681,0.02441 z");
    			set_style(path10, "fill", "#ffe680");
    			set_style(path10, "stroke", "#2b2200");
    			set_style(path10, "stroke-width", "0.00764437");
    			set_style(path10, "stroke-miterlimit", "4");
    			set_style(path10, "stroke-dasharray", "none");
    			set_style(path10, "stroke-dashoffset", "0");
    			add_location(path10, file$5, 127, 12, 6554);
    			set_style(path11, "fill", "#ffe680");
    			set_style(path11, "stroke", "#2b2200");
    			set_style(path11, "stroke-width", "0.00764437");
    			set_style(path11, "stroke-miterlimit", "4");
    			set_style(path11, "stroke-dasharray", "none");
    			set_style(path11, "stroke-dashoffset", "0");
    			attr_dev(path11, "d", "m 0.95813929,42.296024 0.26335291,-0.813191 0.066667,-0.03884 c 0.036671,-0.02134 0.788049,-0.188508 1.669755,-0.371465 1.8554555,-0.384998 1.6908343,-0.446386 1.3796855,0.514485 -0.1382884,0.427074 -0.1984664,0.596913 -0.2456029,0.692824 -0.055565,0.113125 -0.2315666,0.162919 -1.6041611,0.45384 -0.8479736,0.179735 -1.59830422,0.337748 -1.66740832,0.351153 l -0.12565271,0.02441 z");
    			attr_dev(path11, "id", "path1182");
    			add_location(path11, file$5, 131, 12, 7141);
    			attr_dev(path12, "id", "path1184");
    			attr_dev(path12, "d", "M 0.86911358,48.405514 1.132469,47.592323 1.199134,47.553483 c 0.036671,-0.02134 0.7880491,-0.188508 1.6697551,-0.371465 1.8554549,-0.384998 1.6908336,-0.446386 1.3796855,0.514485 -0.1382884,0.427074 -0.1984663,0.596913 -0.2456009,0.692824 -0.055565,0.113125 -0.2315691,0.162919 -1.6041629,0.45384 -0.8479738,0.179735 -1.59830432,0.337748 -1.66740853,0.351153 l -0.12565681,0.02441 z");
    			set_style(path12, "fill", "#ffe680");
    			set_style(path12, "stroke", "#2b2200");
    			set_style(path12, "stroke-width", "0.00764437");
    			set_style(path12, "stroke-miterlimit", "4");
    			set_style(path12, "stroke-dasharray", "none");
    			set_style(path12, "stroke-dashoffset", "0");
    			add_location(path12, file$5, 135, 12, 7727);
    			set_style(path13, "fill", "#ffe680");
    			set_style(path13, "stroke", "#2b2200");
    			set_style(path13, "stroke-width", "0.00764437");
    			set_style(path13, "stroke-miterlimit", "4");
    			set_style(path13, "stroke-dasharray", "none");
    			set_style(path13, "stroke-dashoffset", "0");
    			attr_dev(path13, "d", "m 0.91708189,54.514958 0.26335181,-0.81319 0.066652,-0.0388 c 0.036629,-0.0213 0.7880491,-0.18851 1.6697551,-0.37147 1.8554548,-0.38499 1.6908377,-0.44638 1.3796854,0.51449 -0.1382872,0.42707 -0.1984664,0.59691 -0.2456028,0.69282 -0.055565,0.11313 -0.2315672,0.16293 -1.6041616,0.45385 -0.8479732,0.17973 -1.59830852,0.33775 -1.66740853,0.35115 l -0.12565141,0.0244 z");
    			attr_dev(path13, "id", "path1186");
    			add_location(path13, file$5, 139, 12, 8314);
    			attr_dev(path14, "id", "path1188");
    			attr_dev(path14, "d", "m 0.87253408,60.624445 0.26335542,-0.81319 0.066643,-0.0388 c 0.036629,-0.0213 0.7880532,-0.18851 1.6697592,-0.37147 1.855453,-0.385 1.690836,-0.44639 1.3796812,0.51449 -0.1382871,0.42707 -0.1984627,0.59691 -0.2455991,0.69282 -0.055565,0.11313 -0.2315714,0.16293 -1.6041658,0.45385 -0.847969,0.17973 -1.59830442,0.33775 -1.66740853,0.35115 l -0.12564731,0.0244 z");
    			set_style(path14, "fill", "#ffe680");
    			set_style(path14, "stroke", "#2b2200");
    			set_style(path14, "stroke-width", "0.00764437");
    			set_style(path14, "stroke-miterlimit", "4");
    			set_style(path14, "stroke-dasharray", "none");
    			set_style(path14, "stroke-dashoffset", "0");
    			add_location(path14, file$5, 143, 12, 8885);
    			set_style(path15, "fill", "#ffe680");
    			set_style(path15, "stroke", "#2b2200");
    			set_style(path15, "stroke-width", "0.00764437");
    			set_style(path15, "stroke-miterlimit", "4");
    			set_style(path15, "stroke-dasharray", "none");
    			set_style(path15, "stroke-dashoffset", "0");
    			attr_dev(path15, "d", "m 1.0094437,66.733932 0.2633553,-0.81319 0.066643,-0.0388 c 0.03663,-0.0213 0.7880532,-0.18851 1.6697593,-0.37147 1.855453,-0.385 1.6908358,-0.44639 1.3796852,0.51449 -0.1382905,0.42707 -0.1984661,0.59691 -0.2456027,0.69282 -0.055565,0.11313 -0.2315712,0.16293 -1.6041658,0.45385 -0.8479688,0.17973 -1.59830421,0.33775 -1.66740832,0.35115 l -0.12564741,0.0244 z");
    			attr_dev(path15, "id", "path1190");
    			add_location(path15, file$5, 147, 12, 9451);
    			attr_dev(path16, "id", "path1192");
    			attr_dev(path16, "d", "m 1.0230603,72.880789 0.2633494,-0.81319 0.066646,-0.0388 c 0.03663,-0.0213 0.7880514,-0.18851 1.6697551,-0.37147 1.8554596,-0.385 1.6908382,-0.44639 1.3796876,0.51449 -0.1382869,0.42707 -0.1984685,0.59691 -0.2456027,0.69282 -0.055565,0.11313 -0.2315694,0.16293 -1.604164,0.45385 -0.8479689,0.179727 -1.59830181,0.337747 -1.66740532,0.351147 l -0.12565041,0.0244 z");
    			set_style(path16, "fill", "#ffe680");
    			set_style(path16, "stroke", "#2b2200");
    			set_style(path16, "stroke-width", "0.00764437");
    			set_style(path16, "stroke-miterlimit", "4");
    			set_style(path16, "stroke-dasharray", "none");
    			set_style(path16, "stroke-dashoffset", "0");
    			add_location(path16, file$5, 151, 12, 10016);
    			attr_dev(path17, "id", "path866");
    			attr_dev(path17, "d", "m 0.79947748,78.974999 0.26335532,-0.813191 0.066668,-0.03884 c 0.036666,-0.02134 0.7880512,-0.188508 1.6697537,-0.371465 1.855453,-0.384998 1.6908347,-0.446386 1.3796866,0.514485 -0.1382884,0.427074 -0.1984662,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315691,0.162919 -1.6041635,0.45384 -0.8479738,0.179735 -1.59830433,0.337748 -1.66740614,0.351153 l -0.12565861,0.02441 z");
    			set_style(path17, "fill", "#ffe680");
    			set_style(path17, "stroke", "#2b2200");
    			set_style(path17, "stroke-width", "0.00764437");
    			set_style(path17, "stroke-miterlimit", "4");
    			set_style(path17, "stroke-dasharray", "none");
    			set_style(path17, "stroke-dashoffset", "0");
    			add_location(path17, file$5, 155, 12, 10584);
    			set_style(path18, "fill", "#ffe680");
    			set_style(path18, "stroke", "#2b2200");
    			set_style(path18, "stroke-width", "0.00764437");
    			set_style(path18, "stroke-miterlimit", "4");
    			set_style(path18, "stroke-dasharray", "none");
    			set_style(path18, "stroke-dashoffset", "0");
    			attr_dev(path18, "d", "m 0.71045247,85.084485 0.26335772,-0.813191 0.066665,-0.03884 c 0.036671,-0.02134 0.7880514,-0.188508 1.6697553,-0.371465 1.8554553,-0.384998 1.690834,-0.446386 1.3796852,0.514485 -0.1382882,0.427074 -0.1984662,0.596913 -0.2456004,0.692824 -0.055565,0.113125 -0.2315688,0.162919 -1.6041634,0.45384 -0.8479733,0.179735 -1.59830437,0.337748 -1.66740618,0.351153 l -0.12565559,0.02441 z");
    			attr_dev(path18, "id", "path868");
    			add_location(path18, file$5, 159, 12, 11170);
    			attr_dev(path19, "id", "path870");
    			attr_dev(path19, "d", "m 0.62142686,91.193971 0.26335532,-0.813191 0.066665,-0.03884 c 0.036672,-0.02134 0.78804902,-0.188508 1.66975522,-0.371465 1.8554555,-0.384998 1.6908383,-0.446386 1.3796853,0.514485 -0.1382882,0.427074 -0.1984662,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315648,0.162919 -1.6041634,0.45384 -0.8479698,0.179735 -1.59830447,0.337748 -1.66740857,0.351153 l -0.12565272,0.02441 z");
    			set_style(path19, "fill", "#ffe680");
    			set_style(path19, "stroke", "#2b2200");
    			set_style(path19, "stroke-width", "0.00764437");
    			set_style(path19, "stroke-miterlimit", "4");
    			set_style(path19, "stroke-dasharray", "none");
    			set_style(path19, "stroke-dashoffset", "0");
    			add_location(path19, file$5, 163, 12, 11756);
    			set_style(path20, "fill", "#ffe680");
    			set_style(path20, "stroke", "#2b2200");
    			set_style(path20, "stroke-width", "0.00764437");
    			set_style(path20, "stroke-miterlimit", "4");
    			set_style(path20, "stroke-dasharray", "none");
    			set_style(path20, "stroke-dashoffset", "0");
    			attr_dev(path20, "d", "m 0.71386097,97.303462 0.26335302,-0.813191 0.066664,-0.03884 c 0.036677,-0.02134 0.7880521,-0.188508 1.6697581,-0.371465 1.8554526,-0.384998 1.6908312,-0.446386 1.379683,0.514485 -0.1382881,0.427074 -0.198466,0.596913 -0.2456008,0.692824 -0.055565,0.113125 -0.2315688,0.162919 -1.6041628,0.45384 -0.8479739,0.179735 -1.59830447,0.337748 -1.66740688,0.351153 l -0.12565436,0.02441 z");
    			attr_dev(path20, "id", "path872");
    			add_location(path20, file$5, 167, 12, 12345);
    			attr_dev(path21, "id", "path874");
    			attr_dev(path21, "d", "m 0.68800367,103.41294 0.26335542,-0.81319 0.066665,-0.0388 c 0.036677,-0.0213 0.7880532,-0.18851 1.6697553,-0.37147 1.8554553,-0.385 1.6908381,-0.44638 1.3796893,0.51449 -0.138288,0.42707 -0.1984661,0.59691 -0.2456003,0.69282 -0.055565,0.11313 -0.2315688,0.16292 -1.6041634,0.45384 -0.8479738,0.17974 -1.59830447,0.33775 -1.66740848,0.35115 l -0.12565687,0.0244 z");
    			set_style(path21, "fill", "#ffe680");
    			set_style(path21, "stroke", "#2b2200");
    			set_style(path21, "stroke-width", "0.00764437");
    			set_style(path21, "stroke-miterlimit", "4");
    			set_style(path21, "stroke-dasharray", "none");
    			set_style(path21, "stroke-dashoffset", "0");
    			add_location(path21, file$5, 171, 12, 12930);
    			set_style(path22, "fill", "#ffe680");
    			set_style(path22, "stroke", "#2b2200");
    			set_style(path22, "stroke-width", "0.00764437");
    			set_style(path22, "stroke-miterlimit", "4");
    			set_style(path22, "stroke-dasharray", "none");
    			set_style(path22, "stroke-dashoffset", "0");
    			attr_dev(path22, "d", "m 0.82136728,109.52243 0.26335532,-0.81319 0.066665,-0.0388 c 0.036671,-0.0213 0.7880533,-0.18851 1.6697552,-0.37147 1.8554547,-0.38499 1.6908377,-0.44638 1.3796895,0.51449 -0.1382883,0.42707 -0.1984663,0.59691 -0.2456046,0.69282 -0.055565,0.11313 -0.2315647,0.16292 -1.6041586,0.45385 -0.8479738,0.17973 -1.59830853,0.33774 -1.66740843,0.35115 l -0.12565692,0.0244 z");
    			attr_dev(path22, "id", "path876");
    			add_location(path22, file$5, 175, 12, 13497);
    			attr_dev(path23, "id", "path878");
    			attr_dev(path23, "d", "m 0.82484748,115.63192 0.26335302,-0.81319 0.066667,-0.0388 c 0.036671,-0.0213 0.788049,-0.18851 1.6697551,-0.37147 1.8554553,-0.385 1.6908342,-0.44639 1.3796854,0.51449 -0.1382883,0.42707 -0.1984663,0.59691 -0.2456029,0.69282 -0.055565,0.11313 -0.2315665,0.16292 -1.6041611,0.45384 -0.8479736,0.17974 -1.59830423,0.33775 -1.66740833,0.35116 l -0.12565272,0.0244 z");
    			set_style(path23, "fill", "#ffe680");
    			set_style(path23, "stroke", "#2b2200");
    			set_style(path23, "stroke-width", "0.00764437");
    			set_style(path23, "stroke-miterlimit", "4");
    			set_style(path23, "stroke-dasharray", "none");
    			set_style(path23, "stroke-dashoffset", "0");
    			add_location(path23, file$5, 179, 12, 14067);
    			set_style(path24, "fill", "#ffe680");
    			set_style(path24, "stroke", "#2b2200");
    			set_style(path24, "stroke-width", "0.00764437");
    			set_style(path24, "stroke-miterlimit", "4");
    			set_style(path24, "stroke-dasharray", "none");
    			set_style(path24, "stroke-dashoffset", "0");
    			attr_dev(path24, "d", "m 0.73582187,121.74141 0.26335532,-0.81319 0.066665,-0.0388 c 0.036672,-0.0213 0.7880492,-0.18851 1.6697551,-0.37146 1.8554548,-0.385 1.6908337,-0.44639 1.3796855,0.51448 -0.1382883,0.42708 -0.1984664,0.59691 -0.2456009,0.69283 -0.055565,0.11312 -0.2315691,0.16291 -1.6041629,0.45384 -0.8479738,0.17973 -1.59830437,0.33774 -1.66740857,0.35115 l -0.12565691,0.0244 z");
    			attr_dev(path24, "id", "path880");
    			add_location(path24, file$5, 183, 12, 14634);
    			attr_dev(path25, "id", "path882");
    			attr_dev(path25, "d", "m 0.78379017,127.85086 0.26335183,-0.81319 0.066652,-0.0388 c 0.03663,-0.0213 0.7880491,-0.18851 1.6697552,-0.37147 1.8554547,-0.38499 1.6908377,-0.44638 1.3796854,0.51449 -0.1382872,0.42707 -0.1984663,0.59691 -0.2456029,0.69282 -0.055565,0.11313 -0.2315671,0.16293 -1.6041615,0.45385 -0.8479732,0.17973 -1.59830853,0.33775 -1.66740854,0.35115 l -0.12565151,0.0244 z");
    			set_style(path25, "fill", "#ffe680");
    			set_style(path25, "stroke", "#2b2200");
    			set_style(path25, "stroke-width", "0.00764437");
    			set_style(path25, "stroke-miterlimit", "4");
    			set_style(path25, "stroke-dasharray", "none");
    			set_style(path25, "stroke-dashoffset", "0");
    			add_location(path25, file$5, 187, 12, 15202);
    			set_style(path26, "fill", "#ffe680");
    			set_style(path26, "stroke", "#2b2200");
    			set_style(path26, "stroke-width", "0.00764437");
    			set_style(path26, "stroke-miterlimit", "4");
    			set_style(path26, "stroke-dasharray", "none");
    			set_style(path26, "stroke-dashoffset", "0");
    			attr_dev(path26, "d", "m 0.73924237,133.96035 0.26335543,-0.81319 0.066643,-0.0388 c 0.03663,-0.0213 0.7880533,-0.18851 1.6697594,-0.37147 1.8554529,-0.385 1.6908359,-0.44639 1.3796812,0.51449 -0.1382872,0.42707 -0.1984628,0.59691 -0.2455992,0.69282 -0.055565,0.11313 -0.2315715,0.16293 -1.6041659,0.45385 -0.847969,0.17973 -1.59830434,0.33775 -1.66740844,0.35115 l -0.12564731,0.0244 z");
    			attr_dev(path26, "id", "path884");
    			add_location(path26, file$5, 191, 12, 15771);
    			attr_dev(path27, "id", "path886");
    			attr_dev(path27, "d", "m 0.87615198,140.06984 0.26335542,-0.81319 0.066643,-0.0388 c 0.03663,-0.0213 0.7880533,-0.18851 1.6697593,-0.37147 1.855453,-0.385 1.6908358,-0.44639 1.3796852,0.51449 -0.1382905,0.42707 -0.1984661,0.59691 -0.2456027,0.69282 -0.055565,0.11313 -0.2315713,0.16293 -1.6041659,0.45385 -0.8479688,0.17973 -1.59830412,0.33775 -1.66740823,0.35115 l -0.12564741,0.0244 z");
    			set_style(path27, "fill", "#ffe680");
    			set_style(path27, "stroke", "#2b2200");
    			set_style(path27, "stroke-width", "0.00764437");
    			set_style(path27, "stroke-miterlimit", "4");
    			set_style(path27, "stroke-dasharray", "none");
    			set_style(path27, "stroke-dashoffset", "0");
    			add_location(path27, file$5, 195, 12, 16337);
    			set_style(path28, "fill", "#ffe680");
    			set_style(path28, "stroke", "#2b2200");
    			set_style(path28, "stroke-width", "0.00764437");
    			set_style(path28, "stroke-miterlimit", "4");
    			set_style(path28, "stroke-dasharray", "none");
    			set_style(path28, "stroke-dashoffset", "0");
    			attr_dev(path28, "d", "m 0.88976848,146.2167 0.26334942,-0.81319 0.066646,-0.0388 c 0.03663,-0.0213 0.7880515,-0.18851 1.6697552,-0.37147 1.8554598,-0.385 1.690838,-0.44639 1.3796876,0.51449 -0.138287,0.42707 -0.1984685,0.59691 -0.2456027,0.69282 -0.055565,0.11313 -0.2315695,0.16293 -1.6041641,0.45385 -0.8479688,0.17973 -1.59830172,0.33775 -1.66740533,0.35115 l -0.12565031,0.0244 z");
    			attr_dev(path28, "id", "path888");
    			add_location(path28, file$5, 199, 12, 16903);
    			set_style(path29, "fill", "#ffe680");
    			set_style(path29, "stroke", "#2b2200");
    			set_style(path29, "stroke-width", "0.00764437");
    			set_style(path29, "stroke-miterlimit", "4");
    			set_style(path29, "stroke-dasharray", "none");
    			set_style(path29, "stroke-dashoffset", "0");
    			attr_dev(path29, "d", "m 0.66578896,152.5292 0.26335543,-0.8132 0.066668,-0.0388 c 0.036665,-0.0213 0.78805151,-0.18851 1.66975391,-0.37146 1.8554528,-0.385 1.6908348,-0.44639 1.3796866,0.51448 -0.1382883,0.42708 -0.1984661,0.59692 -0.2456003,0.69283 -0.055565,0.11312 -0.231569,0.16292 -1.6041634,0.45384 -0.8479739,0.17973 -1.59830444,0.33775 -1.66740625,0.35115 l -0.12565858,0.0244 z");
    			attr_dev(path29, "id", "path890");
    			add_location(path29, file$5, 203, 12, 17467);
    			attr_dev(path30, "id", "path892");
    			attr_dev(path30, "d", "m 0.57676395,158.63868 0.26335773,-0.81319 0.066665,-0.0388 c 0.036672,-0.0213 0.78805142,-0.18851 1.66975532,-0.37146 1.8554556,-0.385 1.6908338,-0.44639 1.3796852,0.51448 -0.1382882,0.42708 -0.1984661,0.59692 -0.2456003,0.69283 -0.055565,0.11312 -0.2315689,0.16292 -1.6041635,0.45384 -0.8479731,0.17973 -1.59830437,0.33775 -1.66740617,0.35115 l -0.12565559,0.0244 z");
    			set_style(path30, "fill", "#ffe680");
    			set_style(path30, "stroke", "#2b2200");
    			set_style(path30, "stroke-width", "0.00764437");
    			set_style(path30, "stroke-miterlimit", "4");
    			set_style(path30, "stroke-dasharray", "none");
    			set_style(path30, "stroke-dashoffset", "0");
    			add_location(path30, file$5, 207, 12, 18034);
    			set_style(path31, "fill", "#ffe680");
    			set_style(path31, "stroke", "#2b2200");
    			set_style(path31, "stroke-width", "0.00764437");
    			set_style(path31, "stroke-miterlimit", "4");
    			set_style(path31, "stroke-dasharray", "none");
    			set_style(path31, "stroke-dashoffset", "0");
    			attr_dev(path31, "d", "m 0.48773835,164.74817 0.26335532,-0.81319 0.066665,-0.0388 c 0.036671,-0.0213 0.78804913,-0.18851 1.66975533,-0.37146 1.8554555,-0.385 1.6908379,-0.44639 1.3796852,0.51448 -0.1382881,0.42708 -0.1984661,0.59692 -0.2456003,0.69283 -0.055566,0.11312 -0.2315647,0.16292 -1.6041634,0.45384 -0.8479697,0.17973 -1.59830444,0.33774 -1.66740849,0.35115 l -0.12565273,0.0244 z");
    			attr_dev(path31, "id", "path894");
    			add_location(path31, file$5, 211, 12, 18604);
    			attr_dev(path32, "id", "path896");
    			attr_dev(path32, "d", "m 0.58017246,170.85767 0.26335302,-0.81319 0.066664,-0.0388 c 0.036677,-0.0213 0.78805212,-0.18851 1.66975812,-0.37147 1.8554527,-0.385 1.6908313,-0.44638 1.3796832,0.51449 -0.1382883,0.42707 -0.1984662,0.59691 -0.2456011,0.69282 -0.055565,0.11313 -0.2315688,0.16292 -1.6041628,0.45384 -0.8479738,0.17974 -1.59830447,0.33775 -1.66740677,0.35115 l -0.1256544,0.0244 z");
    			set_style(path32, "fill", "#ffe680");
    			set_style(path32, "stroke", "#2b2200");
    			set_style(path32, "stroke-width", "0.00764437");
    			set_style(path32, "stroke-miterlimit", "4");
    			set_style(path32, "stroke-dasharray", "none");
    			set_style(path32, "stroke-dashoffset", "0");
    			add_location(path32, file$5, 215, 12, 19174);
    			set_style(path33, "fill", "#ffe680");
    			set_style(path33, "stroke", "#2b2200");
    			set_style(path33, "stroke-width", "0.00764437");
    			set_style(path33, "stroke-miterlimit", "4");
    			set_style(path33, "stroke-dasharray", "none");
    			set_style(path33, "stroke-dashoffset", "0");
    			attr_dev(path33, "d", "m 0.55431515,176.96715 0.26335543,-0.81319 0.066665,-0.0388 c 0.036677,-0.0213 0.78805342,-0.18851 1.66975542,-0.37147 1.8554557,-0.385 1.6908384,-0.44638 1.3796891,0.51449 -0.1382879,0.42707 -0.1984661,0.59691 -0.2456,0.69282 -0.055565,0.11313 -0.2315689,0.16292 -1.6041635,0.45384 -0.8479739,0.17974 -1.59830445,0.33775 -1.66740852,0.35115 l -0.12565681,0.0244 z");
    			attr_dev(path33, "id", "path898");
    			add_location(path33, file$5, 219, 12, 19743);
    			attr_dev(path34, "id", "path900");
    			attr_dev(path34, "d", "m 0.68767877,183.07664 0.26335532,-0.81319 0.066665,-0.0388 c 0.036672,-0.0213 0.7880533,-0.18851 1.6697552,-0.37147 1.8554548,-0.38499 1.6908379,-0.44638 1.3796898,0.51449 -0.1382885,0.42707 -0.1984667,0.59691 -0.2456048,0.69282 -0.055565,0.11313 -0.231565,0.16292 -1.6041587,0.45385 -0.8479738,0.17973 -1.59830857,0.33774 -1.66740858,0.35115 l -0.1256568,0.0244 z");
    			set_style(path34, "fill", "#ffe680");
    			set_style(path34, "stroke", "#2b2200");
    			set_style(path34, "stroke-width", "0.00764437");
    			set_style(path34, "stroke-miterlimit", "4");
    			set_style(path34, "stroke-dasharray", "none");
    			set_style(path34, "stroke-dashoffset", "0");
    			add_location(path34, file$5, 223, 12, 20310);
    			set_style(path35, "fill", "#ffe680");
    			set_style(path35, "stroke", "#2b2200");
    			set_style(path35, "stroke-width", "0.00764437");
    			set_style(path35, "stroke-miterlimit", "4");
    			set_style(path35, "stroke-dasharray", "none");
    			set_style(path35, "stroke-dashoffset", "0");
    			attr_dev(path35, "d", "m 0.69115897,189.18613 0.26335302,-0.81319 0.066667,-0.0388 c 0.036671,-0.0213 0.7880492,-0.18851 1.6697552,-0.37147 1.8554551,-0.385 1.690834,-0.44639 1.3796856,0.51449 -0.1382885,0.42707 -0.1984667,0.59691 -0.245603,0.69282 -0.055564,0.11313 -0.2315668,0.16292 -1.6041612,0.45384 -0.8479736,0.17974 -1.59830427,0.33775 -1.66740838,0.35116 l -0.12565269,0.0244 z");
    			attr_dev(path35, "id", "path902");
    			add_location(path35, file$5, 227, 12, 20878);
    			attr_dev(path36, "id", "path904");
    			attr_dev(path36, "d", "m 0.60213336,195.29562 0.26335542,-0.81319 0.066665,-0.0388 c 0.036671,-0.0213 0.78804912,-0.18851 1.66975512,-0.37146 1.8554548,-0.385 1.6908338,-0.44639 1.3796857,0.51448 -0.1382888,0.42708 -0.1984668,0.59691 -0.2456009,0.69283 -0.055565,0.11312 -0.2315695,0.16291 -1.6041631,0.45384 -0.8479738,0.17973 -1.59830437,0.33774 -1.66740858,0.35115 l -0.12565684,0.0244 z");
    			set_style(path36, "fill", "#ffe680");
    			set_style(path36, "stroke", "#2b2200");
    			set_style(path36, "stroke-width", "0.00764437");
    			set_style(path36, "stroke-miterlimit", "4");
    			set_style(path36, "stroke-dasharray", "none");
    			set_style(path36, "stroke-dashoffset", "0");
    			add_location(path36, file$5, 231, 12, 21444);
    			set_style(path37, "fill", "#ffe680");
    			set_style(path37, "stroke", "#2b2200");
    			set_style(path37, "stroke-width", "0.00764437");
    			set_style(path37, "stroke-miterlimit", "4");
    			set_style(path37, "stroke-dasharray", "none");
    			set_style(path37, "stroke-dashoffset", "0");
    			attr_dev(path37, "d", "m 0.65010156,201.40507 0.26335193,-0.81319 0.066652,-0.0388 c 0.03663,-0.0213 0.78804911,-0.18851 1.66975521,-0.37147 1.8554545,-0.38499 1.6908375,-0.44638 1.3796853,0.51449 -0.1382873,0.42707 -0.198466,0.59691 -0.2456029,0.69282 -0.055565,0.11313 -0.2315672,0.16293 -1.6041614,0.45385 -0.8479732,0.17973 -1.59830864,0.33775 -1.66740845,0.35115 l -0.12565158,0.0244 z");
    			attr_dev(path37, "id", "path906");
    			add_location(path37, file$5, 235, 12, 22014);
    			attr_dev(path38, "id", "path908");
    			attr_dev(path38, "d", "m 0.60555386,207.51456 0.26335542,-0.81319 0.066643,-0.0388 c 0.03663,-0.0213 0.78805322,-0.18851 1.66975932,-0.37147 1.855453,-0.385 1.690836,-0.44639 1.3796811,0.51449 -0.1382872,0.42707 -0.1984625,0.59691 -0.2455988,0.69282 -0.055565,0.11313 -0.2315718,0.16293 -1.604166,0.45385 -0.8479691,0.17973 -1.59830447,0.33775 -1.66740857,0.35115 l -0.12564738,0.0244 z");
    			set_style(path38, "fill", "#ffe680");
    			set_style(path38, "stroke", "#2b2200");
    			set_style(path38, "stroke-width", "0.00764437");
    			set_style(path38, "stroke-miterlimit", "4");
    			set_style(path38, "stroke-dasharray", "none");
    			set_style(path38, "stroke-dashoffset", "0");
    			add_location(path38, file$5, 239, 12, 22584);
    			attr_dev(g3, "id", "layer3");
    			set_style(g3, "display", "inline");
    			set_style(g3, "opacity", "1");
    			set_style(g3, "mix-blend-mode", "normal");
    			add_location(g3, file$5, 106, 10, 3536);
    			attr_dev(path39, "id", "path887");
    			attr_dev(path39, "d", "m 0.93276919,5.6391072 0.26335531,-0.813191 0.066668,-0.03884 c 0.036665,-0.02134 0.7880515,-0.1885077 1.669754,-0.3714647 1.8554529,-0.384998 1.6908347,-0.446386 1.3796866,0.5144847 -0.1382883,0.427074 -0.1984662,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315691,0.162919 -1.6041635,0.45384 -0.8479738,0.179735 -1.59830432,0.337748 -1.66740612,0.351153 l -0.12565862,0.02441 z");
    			set_style(path39, "fill", "#ffe680");
    			set_style(path39, "stroke", "#2b2200");
    			set_style(path39, "stroke-width", "0.00764437");
    			set_style(path39, "stroke-miterlimit", "4");
    			set_style(path39, "stroke-dasharray", "none");
    			set_style(path39, "stroke-dashoffset", "0");
    			add_location(path39, file$5, 248, 12, 23315);
    			set_style(path40, "fill", "#ffe680");
    			set_style(path40, "stroke", "#2b2200");
    			set_style(path40, "stroke-width", "0.00764437");
    			set_style(path40, "stroke-miterlimit", "4");
    			set_style(path40, "stroke-dasharray", "none");
    			set_style(path40, "stroke-dashoffset", "0");
    			attr_dev(path40, "d", "m 0.84374418,11.748592 0.26335772,-0.813191 0.066665,-0.03884 c 0.036671,-0.02134 0.7880514,-0.188508 1.6697553,-0.371465 1.8554553,-0.384998 1.690834,-0.446386 1.3796852,0.514485 -0.1382882,0.427074 -0.1984661,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315689,0.162919 -1.6041635,0.45384 -0.8479732,0.179735 -1.59830433,0.337748 -1.66740613,0.351153 l -0.12565561,0.02441 z");
    			attr_dev(path40, "id", "path889");
    			add_location(path40, file$5, 252, 12, 23904);
    			attr_dev(path41, "id", "path891");
    			attr_dev(path41, "d", "M 0.75471857,17.858078 1.018074,17.044887 1.084739,17.006047 c 0.036671,-0.02134 0.788049,-0.188508 1.6697553,-0.371465 1.8554553,-0.384998 1.6908382,-0.446386 1.3796852,0.514485 -0.1382882,0.427074 -0.1984662,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315647,0.162919 -1.6041635,0.45384 -0.8479697,0.179735 -1.59830433,0.337748 -1.66740844,0.351153 l -0.12565271,0.02441 z");
    			set_style(path41, "fill", "#ffe680");
    			set_style(path41, "stroke", "#2b2200");
    			set_style(path41, "stroke-width", "0.00764437");
    			set_style(path41, "stroke-miterlimit", "4");
    			set_style(path41, "stroke-dasharray", "none");
    			set_style(path41, "stroke-dashoffset", "0");
    			add_location(path41, file$5, 256, 12, 24490);
    			set_style(path42, "fill", "#ffe680");
    			set_style(path42, "stroke", "#2b2200");
    			set_style(path42, "stroke-width", "0.00764437");
    			set_style(path42, "stroke-miterlimit", "4");
    			set_style(path42, "stroke-dasharray", "none");
    			set_style(path42, "stroke-dashoffset", "0");
    			attr_dev(path42, "d", "m 0.84715268,23.967569 0.26335302,-0.813191 0.066664,-0.03884 c 0.036677,-0.02134 0.788052,-0.188508 1.669758,-0.371465 1.8554526,-0.384998 1.6908312,-0.446386 1.379683,0.514485 -0.1382881,0.427074 -0.1984661,0.596913 -0.2456009,0.692824 -0.055565,0.113125 -0.2315689,0.162919 -1.6041628,0.45384 -0.8479739,0.179735 -1.59830443,0.337748 -1.66740683,0.351153 l -0.12565441,0.02441 z");
    			attr_dev(path42, "id", "path893");
    			add_location(path42, file$5, 260, 12, 25075);
    			attr_dev(path43, "id", "path895");
    			attr_dev(path43, "d", "M 0.82129538,30.077051 1.0846508,29.26386 1.1513158,29.22502 c 0.036677,-0.02134 0.7880532,-0.188508 1.6697552,-0.371465 1.8554555,-0.384998 1.6908382,-0.446386 1.3796894,0.514485 -0.1382881,0.427074 -0.1984661,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315689,0.162919 -1.6041634,0.45384 -0.8479739,0.179735 -1.59830443,0.337748 -1.66740853,0.351153 l -0.12565682,0.02441 z");
    			set_style(path43, "fill", "#ffe680");
    			set_style(path43, "stroke", "#2b2200");
    			set_style(path43, "stroke-width", "0.00764437");
    			set_style(path43, "stroke-miterlimit", "4");
    			set_style(path43, "stroke-dasharray", "none");
    			set_style(path43, "stroke-dashoffset", "0");
    			add_location(path43, file$5, 264, 12, 25659);
    			set_style(path44, "fill", "#ffe680");
    			set_style(path44, "stroke", "#2b2200");
    			set_style(path44, "stroke-width", "0.00764437");
    			set_style(path44, "stroke-miterlimit", "4");
    			set_style(path44, "stroke-dasharray", "none");
    			set_style(path44, "stroke-dashoffset", "0");
    			attr_dev(path44, "d", "M 0.95465899,36.186541 1.2180143,35.37335 1.2846793,35.33451 c 0.036671,-0.02134 0.7880532,-0.188508 1.6697551,-0.371465 1.8554548,-0.384998 1.6908378,-0.446386 1.3796896,0.514485 -0.1382883,0.427074 -0.1984664,0.596913 -0.2456047,0.692824 -0.055565,0.113125 -0.2315647,0.162919 -1.6041584,0.45384 -0.8479739,0.179735 -1.59830862,0.337748 -1.66740862,0.351153 l -0.12565681,0.02441 z");
    			attr_dev(path44, "id", "path897");
    			add_location(path44, file$5, 268, 12, 26245);
    			attr_dev(path45, "id", "path899");
    			attr_dev(path45, "d", "m 0.95813929,42.296024 0.26335291,-0.813191 0.066667,-0.03884 c 0.036671,-0.02134 0.788049,-0.188508 1.669755,-0.371465 1.8554555,-0.384998 1.6908343,-0.446386 1.3796855,0.514485 -0.1382884,0.427074 -0.1984664,0.596913 -0.2456029,0.692824 -0.055565,0.113125 -0.2315666,0.162919 -1.6041611,0.45384 -0.8479736,0.179735 -1.59830422,0.337748 -1.66740832,0.351153 l -0.12565271,0.02441 z");
    			set_style(path45, "fill", "#ffe680");
    			set_style(path45, "stroke", "#2b2200");
    			set_style(path45, "stroke-width", "0.00764437");
    			set_style(path45, "stroke-miterlimit", "4");
    			set_style(path45, "stroke-dasharray", "none");
    			set_style(path45, "stroke-dashoffset", "0");
    			add_location(path45, file$5, 272, 12, 26831);
    			set_style(path46, "fill", "#ffe680");
    			set_style(path46, "stroke", "#2b2200");
    			set_style(path46, "stroke-width", "0.00764437");
    			set_style(path46, "stroke-miterlimit", "4");
    			set_style(path46, "stroke-dasharray", "none");
    			set_style(path46, "stroke-dashoffset", "0");
    			attr_dev(path46, "d", "M 0.86911358,48.405514 1.132469,47.592323 1.199134,47.553483 c 0.036671,-0.02134 0.7880491,-0.188508 1.6697551,-0.371465 1.8554549,-0.384998 1.6908336,-0.446386 1.3796855,0.514485 -0.1382884,0.427074 -0.1984663,0.596913 -0.2456009,0.692824 -0.055565,0.113125 -0.2315691,0.162919 -1.6041629,0.45384 -0.8479738,0.179735 -1.59830432,0.337748 -1.66740853,0.351153 l -0.12565681,0.02441 z");
    			attr_dev(path46, "id", "path901");
    			add_location(path46, file$5, 276, 12, 27416);
    			attr_dev(path47, "id", "path903");
    			attr_dev(path47, "d", "m 0.91708189,54.514958 0.26335181,-0.81319 0.066652,-0.0388 c 0.036629,-0.0213 0.7880491,-0.18851 1.6697551,-0.37147 1.8554548,-0.38499 1.6908377,-0.44638 1.3796854,0.51449 -0.1382872,0.42707 -0.1984664,0.59691 -0.2456028,0.69282 -0.055565,0.11313 -0.2315672,0.16293 -1.6041616,0.45385 -0.8479732,0.17973 -1.59830852,0.33775 -1.66740853,0.35115 l -0.12565141,0.0244 z");
    			set_style(path47, "fill", "#ffe680");
    			set_style(path47, "stroke", "#2b2200");
    			set_style(path47, "stroke-width", "0.00764437");
    			set_style(path47, "stroke-miterlimit", "4");
    			set_style(path47, "stroke-dasharray", "none");
    			set_style(path47, "stroke-dashoffset", "0");
    			add_location(path47, file$5, 280, 12, 28002);
    			set_style(path48, "fill", "#ffe680");
    			set_style(path48, "stroke", "#2b2200");
    			set_style(path48, "stroke-width", "0.00764437");
    			set_style(path48, "stroke-miterlimit", "4");
    			set_style(path48, "stroke-dasharray", "none");
    			set_style(path48, "stroke-dashoffset", "0");
    			attr_dev(path48, "d", "m 0.87253408,60.624445 0.26335542,-0.81319 0.066643,-0.0388 c 0.036629,-0.0213 0.7880532,-0.18851 1.6697592,-0.37147 1.855453,-0.385 1.690836,-0.44639 1.3796812,0.51449 -0.1382871,0.42707 -0.1984627,0.59691 -0.2455991,0.69282 -0.055565,0.11313 -0.2315714,0.16293 -1.6041658,0.45385 -0.847969,0.17973 -1.59830442,0.33775 -1.66740853,0.35115 l -0.12564731,0.0244 z");
    			attr_dev(path48, "id", "path905");
    			add_location(path48, file$5, 284, 12, 28572);
    			attr_dev(path49, "id", "path907");
    			attr_dev(path49, "d", "m 1.0094437,66.733932 0.2633553,-0.81319 0.066643,-0.0388 c 0.03663,-0.0213 0.7880532,-0.18851 1.6697593,-0.37147 1.855453,-0.385 1.6908358,-0.44639 1.3796852,0.51449 -0.1382905,0.42707 -0.1984661,0.59691 -0.2456027,0.69282 -0.055565,0.11313 -0.2315712,0.16293 -1.6041658,0.45385 -0.8479688,0.17973 -1.59830421,0.33775 -1.66740832,0.35115 l -0.12564741,0.0244 z");
    			set_style(path49, "fill", "#ffe680");
    			set_style(path49, "stroke", "#2b2200");
    			set_style(path49, "stroke-width", "0.00764437");
    			set_style(path49, "stroke-miterlimit", "4");
    			set_style(path49, "stroke-dasharray", "none");
    			set_style(path49, "stroke-dashoffset", "0");
    			add_location(path49, file$5, 288, 12, 29137);
    			set_style(path50, "fill", "#ffe680");
    			set_style(path50, "stroke", "#2b2200");
    			set_style(path50, "stroke-width", "0.00764437");
    			set_style(path50, "stroke-miterlimit", "4");
    			set_style(path50, "stroke-dasharray", "none");
    			set_style(path50, "stroke-dashoffset", "0");
    			attr_dev(path50, "d", "m 1.0230603,72.880789 0.2633494,-0.81319 0.066646,-0.0388 c 0.03663,-0.0213 0.7880514,-0.18851 1.6697551,-0.37147 1.8554596,-0.385 1.6908382,-0.44639 1.3796876,0.51449 -0.1382869,0.42707 -0.1984685,0.59691 -0.2456027,0.69282 -0.055565,0.11313 -0.2315694,0.16293 -1.604164,0.45385 -0.8479689,0.179727 -1.59830181,0.337747 -1.66740532,0.351147 l -0.12565041,0.0244 z");
    			attr_dev(path50, "id", "path909");
    			add_location(path50, file$5, 292, 12, 29701);
    			set_style(path51, "fill", "#ffe680");
    			set_style(path51, "stroke", "#2b2200");
    			set_style(path51, "stroke-width", "0.00764437");
    			set_style(path51, "stroke-miterlimit", "4");
    			set_style(path51, "stroke-dasharray", "none");
    			set_style(path51, "stroke-dashoffset", "0");
    			attr_dev(path51, "d", "m 0.79947748,78.974999 0.26335532,-0.813191 0.066668,-0.03884 c 0.036666,-0.02134 0.7880512,-0.188508 1.6697537,-0.371465 1.855453,-0.384998 1.6908347,-0.446386 1.3796866,0.514485 -0.1382884,0.427074 -0.1984662,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315691,0.162919 -1.6041635,0.45384 -0.8479738,0.179735 -1.59830433,0.337748 -1.66740614,0.351153 l -0.12565861,0.02441 z");
    			attr_dev(path51, "id", "path911");
    			add_location(path51, file$5, 296, 12, 30268);
    			attr_dev(path52, "id", "path913");
    			attr_dev(path52, "d", "m 0.71045247,85.084485 0.26335772,-0.813191 0.066665,-0.03884 c 0.036671,-0.02134 0.7880514,-0.188508 1.6697553,-0.371465 1.8554553,-0.384998 1.690834,-0.446386 1.3796852,0.514485 -0.1382882,0.427074 -0.1984662,0.596913 -0.2456004,0.692824 -0.055565,0.113125 -0.2315688,0.162919 -1.6041634,0.45384 -0.8479733,0.179735 -1.59830498,0.337748 -1.66740679,0.351153 L 0.44709,85.897701 Z");
    			set_style(path52, "fill", "#ffe680");
    			set_style(path52, "stroke", "#2b2200");
    			set_style(path52, "stroke-width", "0.00764437");
    			set_style(path52, "stroke-miterlimit", "4");
    			set_style(path52, "stroke-dasharray", "none");
    			set_style(path52, "stroke-dashoffset", "0");
    			add_location(path52, file$5, 300, 12, 30854);
    			set_style(path53, "fill", "#ffe680");
    			set_style(path53, "stroke", "#2b2200");
    			set_style(path53, "stroke-width", "0.00764437");
    			set_style(path53, "stroke-miterlimit", "4");
    			set_style(path53, "stroke-dasharray", "none");
    			set_style(path53, "stroke-dashoffset", "0");
    			attr_dev(path53, "d", "m 0.62142686,91.193971 0.26335532,-0.813191 0.066665,-0.03884 c 0.036672,-0.02134 0.78804902,-0.188508 1.66975522,-0.371465 1.8554555,-0.384998 1.6908383,-0.446386 1.3796853,0.514485 -0.1382882,0.427074 -0.1984662,0.596913 -0.2456003,0.692824 -0.055565,0.113125 -0.2315648,0.162919 -1.6041634,0.45384 -0.8479698,0.179735 -1.59830447,0.337748 -1.66740857,0.351153 l -0.12565272,0.02441 z");
    			attr_dev(path53, "id", "path915");
    			add_location(path53, file$5, 304, 12, 31438);
    			attr_dev(path54, "id", "path917");
    			attr_dev(path54, "d", "m 0.71386097,97.303462 0.26335302,-0.813191 0.066664,-0.03884 c 0.036677,-0.02134 0.7880521,-0.188508 1.6697581,-0.371465 1.8554526,-0.384998 1.6908312,-0.446386 1.379683,0.514485 -0.1382881,0.427074 -0.198466,0.596913 -0.2456008,0.692824 -0.055565,0.113125 -0.2315688,0.162919 -1.6041628,0.45384 -0.8479739,0.179735 -1.59830508,0.337748 -1.66740749,0.351153 l -0.1256543,0.02441 z");
    			set_style(path54, "fill", "#ffe680");
    			set_style(path54, "stroke", "#2b2200");
    			set_style(path54, "stroke-width", "0.00764437");
    			set_style(path54, "stroke-miterlimit", "4");
    			set_style(path54, "stroke-dasharray", "none");
    			set_style(path54, "stroke-dashoffset", "0");
    			add_location(path54, file$5, 308, 12, 32027);
    			set_style(path55, "fill", "#ffe680");
    			set_style(path55, "stroke", "#2b2200");
    			set_style(path55, "stroke-width", "0.00764437");
    			set_style(path55, "stroke-miterlimit", "4");
    			set_style(path55, "stroke-dasharray", "none");
    			set_style(path55, "stroke-dashoffset", "0");
    			attr_dev(path55, "d", "m 0.68800367,103.41294 0.26335542,-0.81319 0.066665,-0.0388 c 0.036677,-0.0213 0.7880532,-0.18851 1.6697553,-0.37147 1.8554553,-0.385 1.6908381,-0.44638 1.3796893,0.51449 -0.138288,0.42707 -0.1984661,0.59691 -0.2456003,0.69282 -0.055565,0.11313 -0.2315688,0.16292 -1.6041634,0.45384 -0.8479738,0.17974 -1.59830508,0.33775 -1.66740909,0.35115 l -0.12565687,0.0244 z");
    			attr_dev(path55, "id", "path919");
    			add_location(path55, file$5, 312, 12, 32611);
    			attr_dev(path56, "id", "path921");
    			attr_dev(path56, "d", "m 0.82136728,109.52243 0.26335532,-0.81319 0.066665,-0.0388 c 0.036671,-0.0213 0.7880533,-0.18851 1.6697552,-0.37147 1.8554547,-0.38499 1.6908377,-0.44638 1.3796895,0.51449 -0.1382883,0.42707 -0.1984663,0.59691 -0.2456046,0.69282 -0.055565,0.11313 -0.2315647,0.16292 -1.6041586,0.45385 -0.8479738,0.17973 -1.59830853,0.33774 -1.66740843,0.35115 l -0.12565692,0.0244 z");
    			set_style(path56, "fill", "#ffe680");
    			set_style(path56, "stroke", "#2b2200");
    			set_style(path56, "stroke-width", "0.00764437");
    			set_style(path56, "stroke-miterlimit", "4");
    			set_style(path56, "stroke-dasharray", "none");
    			set_style(path56, "stroke-dashoffset", "0");
    			add_location(path56, file$5, 316, 12, 33178);
    			set_style(path57, "fill", "#ffe680");
    			set_style(path57, "stroke", "#2b2200");
    			set_style(path57, "stroke-width", "0.00764437");
    			set_style(path57, "stroke-miterlimit", "4");
    			set_style(path57, "stroke-dasharray", "none");
    			set_style(path57, "stroke-dashoffset", "0");
    			attr_dev(path57, "d", "m 0.82484748,115.63192 0.26335302,-0.81319 0.066667,-0.0388 c 0.036671,-0.0213 0.788049,-0.18851 1.6697551,-0.37147 1.8554553,-0.385 1.6908342,-0.44639 1.3796854,0.51449 -0.1382883,0.42707 -0.1984663,0.59691 -0.2456029,0.69282 -0.055565,0.11313 -0.2315665,0.16292 -1.6041611,0.45384 -0.8479736,0.17974 -1.59830423,0.33775 -1.66740833,0.35116 l -0.12565272,0.0244 z");
    			attr_dev(path57, "id", "path923");
    			add_location(path57, file$5, 320, 12, 33748);
    			attr_dev(path58, "id", "path925");
    			attr_dev(path58, "d", "m 0.73582187,121.74141 0.26335532,-0.81319 0.066665,-0.0388 c 0.036672,-0.0213 0.7880492,-0.18851 1.6697551,-0.37146 1.8554548,-0.385 1.6908337,-0.44639 1.3796855,0.51448 -0.1382883,0.42708 -0.1984664,0.59691 -0.2456009,0.69283 -0.055565,0.11312 -0.2315691,0.16291 -1.6041629,0.45384 -0.8479738,0.17973 -1.59830498,0.33774 -1.66740918,0.35115 l -0.12565691,0.0244 z");
    			set_style(path58, "fill", "#ffe680");
    			set_style(path58, "stroke", "#2b2200");
    			set_style(path58, "stroke-width", "0.00764437");
    			set_style(path58, "stroke-miterlimit", "4");
    			set_style(path58, "stroke-dasharray", "none");
    			set_style(path58, "stroke-dashoffset", "0");
    			add_location(path58, file$5, 324, 12, 34315);
    			set_style(path59, "fill", "#ffe680");
    			set_style(path59, "stroke", "#2b2200");
    			set_style(path59, "stroke-width", "0.00764437");
    			set_style(path59, "stroke-miterlimit", "4");
    			set_style(path59, "stroke-dasharray", "none");
    			set_style(path59, "stroke-dashoffset", "0");
    			attr_dev(path59, "d", "m 0.78379017,127.85086 0.26335183,-0.81319 0.066652,-0.0388 c 0.03663,-0.0213 0.7880491,-0.18851 1.6697552,-0.37147 1.8554547,-0.38499 1.6908377,-0.44638 1.3796854,0.51449 -0.1382872,0.42707 -0.1984663,0.59691 -0.2456029,0.69282 -0.055565,0.11313 -0.2315671,0.16293 -1.6041615,0.45385 -0.8479732,0.17973 -1.59830853,0.33775 -1.66740854,0.35115 l -0.12565151,0.0244 z");
    			attr_dev(path59, "id", "path927");
    			add_location(path59, file$5, 328, 12, 34883);
    			attr_dev(path60, "id", "path929");
    			attr_dev(path60, "d", "m 0.73924237,133.96035 0.26335543,-0.81319 0.066643,-0.0388 c 0.03663,-0.0213 0.7880533,-0.18851 1.6697594,-0.37147 1.8554529,-0.385 1.6908359,-0.44639 1.3796812,0.51449 -0.1382872,0.42707 -0.1984628,0.59691 -0.2455992,0.69282 -0.055565,0.11313 -0.2315715,0.16293 -1.6041659,0.45385 -0.847969,0.17973 -1.59830434,0.33775 -1.66740844,0.35115 l -0.12564731,0.0244 z");
    			set_style(path60, "fill", "#ffe680");
    			set_style(path60, "stroke", "#2b2200");
    			set_style(path60, "stroke-width", "0.00764437");
    			set_style(path60, "stroke-miterlimit", "4");
    			set_style(path60, "stroke-dasharray", "none");
    			set_style(path60, "stroke-dashoffset", "0");
    			add_location(path60, file$5, 332, 12, 35452);
    			set_style(path61, "fill", "#ffe680");
    			set_style(path61, "stroke", "#2b2200");
    			set_style(path61, "stroke-width", "0.00764437");
    			set_style(path61, "stroke-miterlimit", "4");
    			set_style(path61, "stroke-dasharray", "none");
    			set_style(path61, "stroke-dashoffset", "0");
    			attr_dev(path61, "d", "m 0.87615198,140.06984 0.26335542,-0.81319 0.066643,-0.0388 c 0.03663,-0.0213 0.7880533,-0.18851 1.6697593,-0.37147 1.855453,-0.385 1.6908358,-0.44639 1.3796852,0.51449 -0.1382905,0.42707 -0.1984661,0.59691 -0.2456027,0.69282 -0.055565,0.11313 -0.2315713,0.16293 -1.6041659,0.45385 -0.8479688,0.17973 -1.59830412,0.33775 -1.66740823,0.35115 l -0.12564741,0.0244 z");
    			attr_dev(path61, "id", "path931");
    			add_location(path61, file$5, 336, 12, 36018);
    			attr_dev(path62, "id", "path933");
    			attr_dev(path62, "d", "m 0.88976848,146.2167 0.26334942,-0.81319 0.066646,-0.0388 c 0.03663,-0.0213 0.7880515,-0.18851 1.6697552,-0.37147 1.8554598,-0.385 1.690838,-0.44639 1.3796876,0.51449 -0.138287,0.42707 -0.1984685,0.59691 -0.2456027,0.69282 -0.055565,0.11313 -0.2315695,0.16293 -1.6041641,0.45385 -0.8479688,0.17973 -1.59830172,0.33775 -1.66740533,0.35115 l -0.12565031,0.0244 z");
    			set_style(path62, "fill", "#ffe680");
    			set_style(path62, "stroke", "#2b2200");
    			set_style(path62, "stroke-width", "0.00764437");
    			set_style(path62, "stroke-miterlimit", "4");
    			set_style(path62, "stroke-dasharray", "none");
    			set_style(path62, "stroke-dashoffset", "0");
    			add_location(path62, file$5, 340, 12, 36584);
    			attr_dev(path63, "id", "path935");
    			attr_dev(path63, "d", "m 0.66578896,152.5292 0.26335543,-0.8132 0.066668,-0.0388 c 0.036665,-0.0213 0.78805151,-0.18851 1.66975391,-0.37146 1.8554528,-0.385 1.6908348,-0.44639 1.3796866,0.51448 -0.1382883,0.42708 -0.1984661,0.59692 -0.2456003,0.69283 -0.055565,0.11312 -0.231569,0.16292 -1.6041634,0.45384 -0.8479739,0.17973 -1.59830444,0.33775 -1.66740625,0.35115 l -0.12565858,0.0244 z");
    			set_style(path63, "fill", "#ffe680");
    			set_style(path63, "stroke", "#2b2200");
    			set_style(path63, "stroke-width", "0.00764437");
    			set_style(path63, "stroke-miterlimit", "4");
    			set_style(path63, "stroke-dasharray", "none");
    			set_style(path63, "stroke-dashoffset", "0");
    			add_location(path63, file$5, 344, 12, 37148);
    			set_style(path64, "fill", "#ffe680");
    			set_style(path64, "stroke", "#2b2200");
    			set_style(path64, "stroke-width", "0.00764437");
    			set_style(path64, "stroke-miterlimit", "4");
    			set_style(path64, "stroke-dasharray", "none");
    			set_style(path64, "stroke-dashoffset", "0");
    			attr_dev(path64, "d", "m 0.57676395,158.63868 0.26335773,-0.81319 0.066665,-0.0388 c 0.036672,-0.0213 0.78805142,-0.18851 1.66975532,-0.37146 1.8554556,-0.385 1.6908338,-0.44639 1.3796852,0.51448 -0.1382882,0.42708 -0.1984661,0.59692 -0.2456003,0.69283 -0.055565,0.11312 -0.2315689,0.16292 -1.6041635,0.45384 -0.8479731,0.17973 -1.59830437,0.33775 -1.66740617,0.35115 l -0.12565559,0.0244 z");
    			attr_dev(path64, "id", "path937");
    			add_location(path64, file$5, 348, 12, 37715);
    			attr_dev(path65, "id", "path939");
    			attr_dev(path65, "d", "m 0.48773835,164.74817 0.26335532,-0.81319 0.066665,-0.0388 c 0.036671,-0.0213 0.78804913,-0.18851 1.66975533,-0.37146 1.8554555,-0.385 1.6908379,-0.44639 1.3796852,0.51448 -0.1382881,0.42708 -0.1984661,0.59692 -0.2456003,0.69283 -0.055566,0.11312 -0.2315647,0.16292 -1.6041634,0.45384 -0.8479697,0.17973 -1.59830444,0.33774 -1.66740849,0.35115 l -0.12565273,0.0244 z");
    			set_style(path65, "fill", "#ffe680");
    			set_style(path65, "stroke", "#2b2200");
    			set_style(path65, "stroke-width", "0.00764437");
    			set_style(path65, "stroke-miterlimit", "4");
    			set_style(path65, "stroke-dasharray", "none");
    			set_style(path65, "stroke-dashoffset", "0");
    			add_location(path65, file$5, 352, 12, 38285);
    			set_style(path66, "fill", "#ffe680");
    			set_style(path66, "stroke", "#2b2200");
    			set_style(path66, "stroke-width", "0.00764437");
    			set_style(path66, "stroke-miterlimit", "4");
    			set_style(path66, "stroke-dasharray", "none");
    			set_style(path66, "stroke-dashoffset", "0");
    			attr_dev(path66, "d", "m 0.58017246,170.85767 0.26335302,-0.81319 0.066664,-0.0388 c 0.036677,-0.0213 0.78805212,-0.18851 1.66975812,-0.37147 1.8554527,-0.385 1.6908313,-0.44638 1.3796832,0.51449 -0.1382883,0.42707 -0.1984662,0.59691 -0.2456011,0.69282 -0.055565,0.11313 -0.2315688,0.16292 -1.6041628,0.45384 -0.8479738,0.17974 -1.59830447,0.33775 -1.66740677,0.35115 l -0.1256544,0.0244 z");
    			attr_dev(path66, "id", "path941");
    			add_location(path66, file$5, 356, 12, 38855);
    			attr_dev(path67, "id", "path943");
    			attr_dev(path67, "d", "m 0.55431515,176.96715 0.26335543,-0.81319 0.066665,-0.0388 c 0.036677,-0.0213 0.78805342,-0.18851 1.66975542,-0.37147 1.8554557,-0.385 1.6908384,-0.44638 1.3796891,0.51449 -0.1382879,0.42707 -0.1984661,0.59691 -0.2456,0.69282 -0.055565,0.11313 -0.2315689,0.16292 -1.6041635,0.45384 -0.8479739,0.17974 -1.59830445,0.33775 -1.66740852,0.35115 l -0.12565681,0.0244 z");
    			set_style(path67, "fill", "#ffe680");
    			set_style(path67, "stroke", "#2b2200");
    			set_style(path67, "stroke-width", "0.00764437");
    			set_style(path67, "stroke-miterlimit", "4");
    			set_style(path67, "stroke-dasharray", "none");
    			set_style(path67, "stroke-dashoffset", "0");
    			add_location(path67, file$5, 360, 12, 39424);
    			set_style(path68, "fill", "#ffe680");
    			set_style(path68, "stroke", "#2b2200");
    			set_style(path68, "stroke-width", "0.00764437");
    			set_style(path68, "stroke-miterlimit", "4");
    			set_style(path68, "stroke-dasharray", "none");
    			set_style(path68, "stroke-dashoffset", "0");
    			attr_dev(path68, "d", "m 0.68767877,183.07664 0.26335532,-0.81319 0.066665,-0.0388 c 0.036672,-0.0213 0.7880533,-0.18851 1.6697552,-0.37147 1.8554548,-0.38499 1.6908379,-0.44638 1.3796898,0.51449 -0.1382885,0.42707 -0.1984667,0.59691 -0.2456048,0.69282 -0.055565,0.11313 -0.231565,0.16292 -1.6041587,0.45385 -0.8479738,0.17973 -1.59830918,0.33774 -1.66740919,0.35115 l -0.1256568,0.0244 z");
    			attr_dev(path68, "id", "path945");
    			add_location(path68, file$5, 364, 12, 39991);
    			attr_dev(path69, "id", "path947");
    			attr_dev(path69, "d", "m 0.69115897,189.18613 0.26335302,-0.81319 0.066667,-0.0388 c 0.036671,-0.0213 0.7880492,-0.18851 1.6697552,-0.37147 1.8554551,-0.385 1.690834,-0.44639 1.3796856,0.51449 -0.1382885,0.42707 -0.1984667,0.59691 -0.245603,0.69282 -0.055564,0.11313 -0.2315668,0.16292 -1.6041612,0.45384 -0.8479736,0.17974 -1.59830488,0.33775 -1.66740899,0.35116 l -0.12565269,0.0244 z");
    			set_style(path69, "fill", "#ffe680");
    			set_style(path69, "stroke", "#2b2200");
    			set_style(path69, "stroke-width", "0.00764437");
    			set_style(path69, "stroke-miterlimit", "4");
    			set_style(path69, "stroke-dasharray", "none");
    			set_style(path69, "stroke-dashoffset", "0");
    			add_location(path69, file$5, 368, 12, 40559);
    			set_style(path70, "fill", "#ffe680");
    			set_style(path70, "stroke", "#2b2200");
    			set_style(path70, "stroke-width", "0.00764437");
    			set_style(path70, "stroke-miterlimit", "4");
    			set_style(path70, "stroke-dasharray", "none");
    			set_style(path70, "stroke-dashoffset", "0");
    			attr_dev(path70, "d", "m 0.60213336,195.29562 0.26335542,-0.81319 0.066665,-0.0388 c 0.036671,-0.0213 0.78804912,-0.18851 1.66975512,-0.37146 1.8554548,-0.385 1.6908338,-0.44639 1.3796857,0.51448 -0.1382888,0.42708 -0.1984668,0.59691 -0.2456009,0.69283 -0.055565,0.11312 -0.2315695,0.16291 -1.6041631,0.45384 -0.8479738,0.17973 -1.59830437,0.33774 -1.66740858,0.35115 l -0.12565684,0.0244 z");
    			attr_dev(path70, "id", "path949");
    			add_location(path70, file$5, 372, 12, 41125);
    			attr_dev(path71, "id", "path951");
    			attr_dev(path71, "d", "m 0.65010156,201.40507 0.26335193,-0.81319 0.066652,-0.0388 c 0.03663,-0.0213 0.78804911,-0.18851 1.66975521,-0.37147 1.8554545,-0.38499 1.6908375,-0.44638 1.3796853,0.51449 -0.1382873,0.42707 -0.198466,0.59691 -0.2456029,0.69282 -0.055565,0.11313 -0.2315672,0.16293 -1.6041614,0.45385 -0.8479732,0.17973 -1.59830864,0.33775 -1.66740845,0.35115 l -0.12565158,0.0244 z");
    			set_style(path71, "fill", "#ffe680");
    			set_style(path71, "stroke", "#2b2200");
    			set_style(path71, "stroke-width", "0.00764437");
    			set_style(path71, "stroke-miterlimit", "4");
    			set_style(path71, "stroke-dasharray", "none");
    			set_style(path71, "stroke-dashoffset", "0");
    			add_location(path71, file$5, 376, 12, 41695);
    			set_style(path72, "fill", "#ffe680");
    			set_style(path72, "stroke", "#2b2200");
    			set_style(path72, "stroke-width", "0.00764437");
    			set_style(path72, "stroke-miterlimit", "4");
    			set_style(path72, "stroke-dasharray", "none");
    			set_style(path72, "stroke-dashoffset", "0");
    			attr_dev(path72, "d", "m 0.60555386,207.51456 0.26335542,-0.81319 0.066643,-0.0388 c 0.03663,-0.0213 0.78805322,-0.18851 1.66975932,-0.37147 1.855453,-0.385 1.690836,-0.44639 1.3796811,0.51449 -0.1382872,0.42707 -0.1984625,0.59691 -0.2455988,0.69282 -0.055565,0.11313 -0.2315718,0.16293 -1.604166,0.45385 -0.8479691,0.17973 -1.59830447,0.33775 -1.66740857,0.35115 l -0.12564738,0.0244 z");
    			attr_dev(path72, "id", "path953");
    			add_location(path72, file$5, 380, 12, 42265);
    			attr_dev(g4, "transform", "translate(0,208.19115)");
    			set_style(g4, "display", "inline");
    			set_style(g4, "opacity", "1");
    			set_style(g4, "mix-blend-mode", "normal");
    			attr_dev(g4, "id", "g955");
    			add_location(g4, file$5, 244, 10, 23163);
    			attr_dev(g5, "id", "layer5");
    			add_location(g5, file$5, 105, 8, 3510);
    			attr_dev(path73, "id", "path833");
    			attr_dev(path73, "d", "M 54.428572,47.805505 54.429,183.31845");
    			set_style(path73, "fill", "none");
    			set_style(path73, "fill-opacity", "1");
    			set_style(path73, "stroke", "none");
    			set_style(path73, "stroke-width", "1");
    			set_style(path73, "stroke-linecap", "butt");
    			set_style(path73, "stroke-linejoin", "miter");
    			set_style(path73, "stroke-miterlimit", "4");
    			set_style(path73, "stroke-dasharray", "none");
    			set_style(path73, "stroke-opacity", "1");
    			add_location(path73, file$5, 395, 14, 43306);
    			set_style(path74, "fill", "none");
    			set_style(path74, "fill-opacity", "1");
    			set_style(path74, "stroke", "none");
    			set_style(path74, "stroke-width", "1");
    			set_style(path74, "stroke-linecap", "butt");
    			set_style(path74, "stroke-linejoin", "miter");
    			set_style(path74, "stroke-miterlimit", "4");
    			set_style(path74, "stroke-dasharray", "none");
    			set_style(path74, "stroke-opacity", "1");
    			attr_dev(path74, "d", "m 58.132741,47.805506 4.27e-4,135.512944");
    			attr_dev(path74, "id", "path835");
    			add_location(path74, file$5, 399, 14, 43594);
    			attr_dev(path75, "id", "path841");
    			attr_dev(path75, "d", "m 54.428572,47.805505 3.704169,1e-6");
    			set_style(path75, "fill", "none");
    			set_style(path75, "fill-opacity", "1");
    			set_style(path75, "stroke", "none");
    			set_style(path75, "stroke-width", "1");
    			set_style(path75, "stroke-linecap", "butt");
    			set_style(path75, "stroke-linejoin", "miter");
    			set_style(path75, "stroke-miterlimit", "4");
    			set_style(path75, "stroke-dasharray", "none");
    			set_style(path75, "stroke-opacity", "1");
    			add_location(path75, file$5, 403, 14, 43884);
    			attr_dev(path76, "id", "path845");
    			attr_dev(path76, "d", "m 54.429001,183.31845 h 3.704165");
    			set_style(path76, "fill", "none");
    			set_style(path76, "fill-opacity", "1");
    			set_style(path76, "stroke", "none");
    			set_style(path76, "stroke-width", "1");
    			set_style(path76, "stroke-linecap", "butt");
    			set_style(path76, "stroke-linejoin", "miter");
    			set_style(path76, "stroke-miterlimit", "4");
    			set_style(path76, "stroke-dasharray", "none");
    			set_style(path76, "stroke-opacity", "1");
    			add_location(path76, file$5, 407, 14, 44169);
    			attr_dev(g6, "id", "g935");
    			attr_dev(g6, "transform", "matrix(0.3713163,0,2.9794632e-4,1.5586369,-20.178996,-74.399707)");
    			set_style(g6, "fill", "none");
    			set_style(g6, "fill-opacity", "1");
    			set_style(g6, "stroke", "none");
    			set_style(g6, "stroke-width", "1");
    			set_style(g6, "stroke-miterlimit", "4");
    			set_style(g6, "stroke-dasharray", "none");
    			set_style(g6, "stroke-opacity", "1");
    			add_location(g6, file$5, 391, 12, 43040);
    			set_style(path77, "fill", "#803300");
    			set_style(path77, "stroke", "#803300");
    			set_style(path77, "stroke-width", "0.055877");
    			set_style(path77, "stroke-miterlimit", "4");
    			set_style(path77, "stroke-dasharray", "none");
    			set_style(path77, "stroke-dashoffset", "0");
    			set_style(path77, "stroke-opacity", "1");
    			attr_dev(path77, "d", "M 0.19691962,106.28585 C 0.18515567,48.724086 0.18274055,1.4370092 0.19154897,1.2034605 0.2003283,0.96990115 0.4511181,0.7788196 0.74878937,0.7788196 H 1.2900099 L 1.3131578,105.46857 c 0.012738,57.57936 0.01775,104.86643 0.011136,105.08238 -0.0066,0.21588 -0.2581648,0.39262 -0.55900493,0.39262 H 0.21830719 Z");
    			attr_dev(path77, "id", "path1044");
    			add_location(path77, file$5, 412, 12, 44466);
    			attr_dev(g7, "transform", "matrix(1,0,0,2.0042723,0,-0.11219441)");
    			attr_dev(g7, "id", "layer1");
    			set_style(g7, "display", "inline");
    			set_style(g7, "mix-blend-mode", "normal");
    			add_location(g7, file$5, 387, 10, 42881);
    			attr_dev(g8, "id", "layer4");
    			add_location(g8, file$5, 386, 8, 42855);
    			attr_dev(svg, "xmlns:dc", "http://purl.org/dc/elements/1.1/");
    			attr_dev(svg, "xmlns:cc", "http://creativecommons.org/ns#");
    			attr_dev(svg, "xmlns:rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    			attr_dev(svg, "xmlns:svg", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 5.0270832 423.33334");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "class", "svelte-1rtj6ne");
    			add_location(svg, file$5, 65, 6, 1009);
    			attr_dev(div, "class", "ladder-wrapper svelte-1rtj6ne");
    			add_location(div, file$5, 64, 4, 974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g1, path4);
    			append_dev(svg, g5);
    			append_dev(g5, g3);
    			append_dev(g3, path5);
    			append_dev(g3, path6);
    			append_dev(g3, path7);
    			append_dev(g3, path8);
    			append_dev(g3, path9);
    			append_dev(g3, path10);
    			append_dev(g3, path11);
    			append_dev(g3, path12);
    			append_dev(g3, path13);
    			append_dev(g3, path14);
    			append_dev(g3, path15);
    			append_dev(g3, path16);
    			append_dev(g3, path17);
    			append_dev(g3, path18);
    			append_dev(g3, path19);
    			append_dev(g3, path20);
    			append_dev(g3, path21);
    			append_dev(g3, path22);
    			append_dev(g3, path23);
    			append_dev(g3, path24);
    			append_dev(g3, path25);
    			append_dev(g3, path26);
    			append_dev(g3, path27);
    			append_dev(g3, path28);
    			append_dev(g3, path29);
    			append_dev(g3, path30);
    			append_dev(g3, path31);
    			append_dev(g3, path32);
    			append_dev(g3, path33);
    			append_dev(g3, path34);
    			append_dev(g3, path35);
    			append_dev(g3, path36);
    			append_dev(g3, path37);
    			append_dev(g3, path38);
    			append_dev(g5, g4);
    			append_dev(g4, path39);
    			append_dev(g4, path40);
    			append_dev(g4, path41);
    			append_dev(g4, path42);
    			append_dev(g4, path43);
    			append_dev(g4, path44);
    			append_dev(g4, path45);
    			append_dev(g4, path46);
    			append_dev(g4, path47);
    			append_dev(g4, path48);
    			append_dev(g4, path49);
    			append_dev(g4, path50);
    			append_dev(g4, path51);
    			append_dev(g4, path52);
    			append_dev(g4, path53);
    			append_dev(g4, path54);
    			append_dev(g4, path55);
    			append_dev(g4, path56);
    			append_dev(g4, path57);
    			append_dev(g4, path58);
    			append_dev(g4, path59);
    			append_dev(g4, path60);
    			append_dev(g4, path61);
    			append_dev(g4, path62);
    			append_dev(g4, path63);
    			append_dev(g4, path64);
    			append_dev(g4, path65);
    			append_dev(g4, path66);
    			append_dev(g4, path67);
    			append_dev(g4, path68);
    			append_dev(g4, path69);
    			append_dev(g4, path70);
    			append_dev(g4, path71);
    			append_dev(g4, path72);
    			append_dev(svg, g8);
    			append_dev(g8, g7);
    			append_dev(g7, g6);
    			append_dev(g6, path73);
    			append_dev(g6, path74);
    			append_dev(g6, path75);
    			append_dev(g6, path76);
    			append_dev(g7, path77);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(64:2) {#if width > 600}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div4;
    	let t0;
    	let image0;
    	let t1;
    	let div0;
    	let h10;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let div1;
    	let h11;
    	let t9;
    	let p2;
    	let t11;
    	let p3;
    	let t13;
    	let image1;
    	let t14;
    	let image2;
    	let t15;
    	let div2;
    	let h12;
    	let t17;
    	let p4;
    	let t19;
    	let p5;
    	let t21;
    	let div3;
    	let h13;
    	let t23;
    	let p6;
    	let t25;
    	let image3;
    	let current;
    	let if_block = /*width*/ ctx[0] > 600 && create_if_block$3(ctx);

    	image0 = new Image({
    			props: {
    				gridArea: /*width*/ ctx[0] > 600 ? "1/1/1/1" : "2/1/2/1",
    				imgSrc: "./assets/img/tinified/inside.jpg",
    				imgSrcTiny: "./assets/img-blurry/1925blurred.jpg",
    				imgAlt: "Mims Painting, 1925",
    				hideBtn: true
    			},
    			$$inline: true
    		});

    	image1 = new Image({
    			props: {
    				gridArea: /*width*/ ctx[0] > 600 ? "2/3/2/3" : "4/1/4/1",
    				imgSrc: "./assets/img/tinified/rebarnes3.jpg",
    				imgSrcTiny: "./assets/img-blurry/rebarnes3blurred.jpg",
    				imgAlt: "Paint work on non-conventional canvases",
    				hideBtn: true
    			},
    			$$inline: true
    		});

    	image2 = new Image({
    			props: {
    				gridArea: /*width*/ ctx[0] > 600 ? "3/1/3/1" : "6/1/6/1",
    				imgSrc: "./assets/img/tinified/parrish2.jpg",
    				imgSrcTiny: "./assets/img-blurry/parrish2blurred.jpg",
    				imgAlt: "Blah",
    				hideBtn: true
    			},
    			$$inline: true
    		});

    	image3 = new Image({
    			props: {
    				gridArea: /*width*/ ctx[0] > 600 ? "4/3/4/3" : "8/1/8/1",
    				imgSrc: "./assets/img/tinified/rekean3.jpg",
    				imgSrcTiny: "./assets/img-blurry/rekean3blurred.jpg",
    				imgAlt: "Blah",
    				hideBtn: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(image0.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Six generations of excellence";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "We are built on six generations of highly-skilled workmanship, outstanding\n      customer relations, and exceptional service in the painting industry.";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "We serve Nassau and Suffolk Counties on Long Island, Westchester County,\n      and New York City, and we're proud to be one of the largest\n      long-established high-quality painting companies in New York.";
    			t7 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Fully licensed, insured, bonded, and certified";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "More than 75 well-trained, experienced painters will be at your disposal,\n      24 hours a day, 365 days a year. Same day emergency service is available,\n      as needed.";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "Our company works closely with builders, architects, designers, and\n      homeowners to ensure they will get a well run, quality paint job.";
    			t13 = space();
    			create_component(image1.$$.fragment);
    			t14 = space();
    			create_component(image2.$$.fragment);
    			t15 = space();
    			div2 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Serving Residential & Commercial";
    			t17 = space();
    			p4 = element("p");
    			p4.textContent = "Our residential repaint work caters to a wide spectrum of homes, from\n      mansions to cottages. All projects undertaken are family run with utmost\n      efficiency, and care is taken to accommodate any given environment.";
    			t19 = space();
    			p5 = element("p");
    			p5.textContent = "Our commercial work experience includes banks, office buildings,\n      restaurants, nursing homes, lighthouses and retail stores.";
    			t21 = space();
    			div3 = element("div");
    			h13 = element("h1");
    			h13.textContent = "Competitive, flexible pricing";
    			t23 = space();
    			p6 = element("p");
    			p6.textContent = "Our pricing is competitive with other quality contractors but we will work\n      with you on budget limitations as needed. We offer a variety of payment\n      options to accommodate your budget, as well as zero interest payment\n      plans.";
    			t25 = space();
    			create_component(image3.$$.fragment);
    			attr_dev(h10, "class", "svelte-1rtj6ne");
    			add_location(h10, file$5, 429, 4, 45292);
    			add_location(p0, file$5, 430, 4, 45335);
    			add_location(p1, file$5, 434, 4, 45509);
    			attr_dev(div0, "class", "about-text1 svelte-1rtj6ne");
    			add_location(div0, file$5, 428, 2, 45262);
    			attr_dev(h11, "class", "svelte-1rtj6ne");
    			add_location(h11, file$5, 442, 4, 45777);
    			add_location(p2, file$5, 443, 4, 45837);
    			add_location(p3, file$5, 448, 4, 46031);
    			attr_dev(div1, "class", "about-text2 svelte-1rtj6ne");
    			add_location(div1, file$5, 441, 2, 45747);
    			attr_dev(h12, "class", "svelte-1rtj6ne");
    			add_location(h12, file$5, 469, 4, 46685);
    			add_location(p4, file$5, 470, 4, 46731);
    			add_location(p5, file$5, 475, 4, 46977);
    			attr_dev(div2, "class", "about-text3 svelte-1rtj6ne");
    			add_location(div2, file$5, 468, 2, 46655);
    			attr_dev(h13, "class", "svelte-1rtj6ne");
    			add_location(h13, file$5, 489, 4, 47468);
    			add_location(p6, file$5, 490, 4, 47511);
    			attr_dev(div3, "class", "about-text4 svelte-1rtj6ne");
    			add_location(div3, file$5, 488, 2, 47438);
    			attr_dev(div4, "class", "component svelte-1rtj6ne");
    			attr_dev(div4, "id", "about");
    			add_location(div4, file$5, 62, 0, 915);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			if (if_block) if_block.m(div4, null);
    			append_dev(div4, t0);
    			mount_component(image0, div4, null);
    			append_dev(div4, t1);
    			append_dev(div4, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(div4, t7);
    			append_dev(div4, div1);
    			append_dev(div1, h11);
    			append_dev(div1, t9);
    			append_dev(div1, p2);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(div4, t13);
    			mount_component(image1, div4, null);
    			append_dev(div4, t14);
    			mount_component(image2, div4, null);
    			append_dev(div4, t15);
    			append_dev(div4, div2);
    			append_dev(div2, h12);
    			append_dev(div2, t17);
    			append_dev(div2, p4);
    			append_dev(div2, t19);
    			append_dev(div2, p5);
    			append_dev(div4, t21);
    			append_dev(div4, div3);
    			append_dev(div3, h13);
    			append_dev(div3, t23);
    			append_dev(div3, p6);
    			append_dev(div4, t25);
    			mount_component(image3, div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*width*/ ctx[0] > 600) {
    				if (if_block) ; else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div4, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const image0_changes = {};
    			if (dirty & /*width*/ 1) image0_changes.gridArea = /*width*/ ctx[0] > 600 ? "1/1/1/1" : "2/1/2/1";
    			image0.$set(image0_changes);
    			const image1_changes = {};
    			if (dirty & /*width*/ 1) image1_changes.gridArea = /*width*/ ctx[0] > 600 ? "2/3/2/3" : "4/1/4/1";
    			image1.$set(image1_changes);
    			const image2_changes = {};
    			if (dirty & /*width*/ 1) image2_changes.gridArea = /*width*/ ctx[0] > 600 ? "3/1/3/1" : "6/1/6/1";
    			image2.$set(image2_changes);
    			const image3_changes = {};
    			if (dirty & /*width*/ 1) image3_changes.gridArea = /*width*/ ctx[0] > 600 ? "4/3/4/3" : "8/1/8/1";
    			image3.$set(image3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image0.$$.fragment, local);
    			transition_in(image1.$$.fragment, local);
    			transition_in(image2.$$.fragment, local);
    			transition_in(image3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image0.$$.fragment, local);
    			transition_out(image1.$$.fragment, local);
    			transition_out(image2.$$.fragment, local);
    			transition_out(image3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			destroy_component(image0);
    			destroy_component(image1);
    			destroy_component(image2);
    			destroy_component(image3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	let { width } = $$props;
    	const writable_props = ["width"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({ Image, width });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<About> was created without expected prop 'width'");
    		}
    	}

    	get width() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Testimonials.svelte generated by Svelte v3.25.0 */
    const file$6 = "src/components/Testimonials.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (100:6) {#each images as image, i}
    function create_each_block(ctx) {
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				styleOverride: "margin-right: 1rem; width: 200px; height: 200px; flex-shrink: 0;",
    				imgSrc: /*image*/ ctx[4],
    				imgSrcTiny: "./assets/img-blurry/1925blurred.jpg",
    				imgAlt: "Testimonial-" + /*i*/ ctx[6]
    			},
    			$$inline: true
    		});

    	image.$on("openImg", /*openImgModal*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(image.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(image, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(image, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(100:6) {#each images as image, i}",
    		ctx
    	});

    	return block;
    }

    // (109:4) {#if modalImgSrc}
    function create_if_block$4(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Close";
    			if (img.src !== (img_src_value = /*modalImgSrc*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Whoops");
    			attr_dev(img, "class", "svelte-1reainz");
    			add_location(img, file$6, 111, 10, 3567);
    			attr_dev(button, "class", "svelte-1reainz");
    			add_location(button, file$6, 112, 10, 3616);
    			attr_dev(div0, "class", "img-modal-container svelte-1reainz");
    			add_location(div0, file$6, 110, 8, 3523);
    			attr_dev(div1, "class", "img-modal-wrapper svelte-1reainz");
    			add_location(div1, file$6, 109, 6, 3483);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalImgSrc*/ 1 && img.src !== (img_src_value = /*modalImgSrc*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(109:4) {#if modalImgSrc}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let div0;
    	let t4;
    	let current;
    	let each_value = /*images*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*modalImgSrc*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Recognized in the community";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Many of our clients and collaborators have expressed their gratitude for our\n    hard work. Check them out below!";
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block) if_block.c();
    			add_location(h1, file$6, 92, 2, 2893);
    			add_location(p, file$6, 93, 2, 2932);
    			attr_dev(div0, "class", "carousel-container svelte-1reainz");
    			add_location(div0, file$6, 98, 4, 3098);
    			attr_dev(div1, "class", "carousel-wrapper svelte-1reainz");
    			add_location(div1, file$6, 97, 2, 3063);
    			attr_dev(div2, "class", "component");
    			attr_dev(div2, "id", "testimonials");
    			add_location(div2, file$6, 91, 0, 2849);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, p);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t4);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*images, openImgModal*/ 6) {
    				each_value = /*images*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*modalImgSrc*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Testimonials", slots, []);

    	let images = [
    		"../assets/testimonials/testimonial2014-02-27-at-9-14-30-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-16-21-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-18-24-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-19-30-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-20-49-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-21-54-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-22-55-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-24-01-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-26-25-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-27-30-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-28-45-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-29-43-am.png",
    		"../assets/testimonials/testimonial2014-02-27-at-9-31-08-am.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-43-00-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-44-51-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-45-19-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-46-33-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-46-50-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-47-01-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-49-50-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-50-17-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-50-58-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-51-30-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-51-52-pm.png",
    		"../assets/testimonials/testimonial2014-03-04-at-12-55-08-pm.png"
    	];

    	let modalImgSrc;

    	const openImgModal = e => {
    		$$invalidate(0, modalImgSrc = e.detail.imgSrc);
    		return modalImgSrc;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testimonials> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, modalImgSrc = null);
    	$$self.$capture_state = () => ({ Image, images, modalImgSrc, openImgModal });

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    		if ("modalImgSrc" in $$props) $$invalidate(0, modalImgSrc = $$props.modalImgSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modalImgSrc, images, openImgModal, click_handler];
    }

    class Testimonials extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testimonials",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Gallery.svelte generated by Svelte v3.25.0 */
    const file$7 = "src/components/Gallery.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (80:6) {#each images as image, i}
    function create_each_block$1(ctx) {
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				isGallery: true,
    				styleOverride: "margin-right: 1rem; width: 200px; height: 200px; flex-shrink: 0;",
    				imgSrc: /*image*/ ctx[4],
    				imgSrcTiny: "./assets/img-blurry/1925blurred.jpg",
    				imgAlt: "Gallery-" + /*i*/ ctx[6]
    			},
    			$$inline: true
    		});

    	image.$on("openImg", /*openImgModal*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(image.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(image, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(image, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(80:6) {#each images as image, i}",
    		ctx
    	});

    	return block;
    }

    // (91:2) {#if modalImgSrc}
    function create_if_block$5(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Close";
    			if (img.src !== (img_src_value = /*modalImgSrc*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Whoops");
    			attr_dev(img, "class", "svelte-1dk2pm9");
    			add_location(img, file$7, 93, 8, 2028);
    			attr_dev(button, "class", "svelte-1dk2pm9");
    			add_location(button, file$7, 94, 8, 2075);
    			attr_dev(div0, "class", "img-modal-container svelte-1dk2pm9");
    			add_location(div0, file$7, 92, 6, 1986);
    			attr_dev(div1, "class", "img-modal-wrapper svelte-1dk2pm9");
    			add_location(div1, file$7, 91, 4, 1948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalImgSrc*/ 1 && img.src !== (img_src_value = /*modalImgSrc*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(91:2) {#if modalImgSrc}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div2;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let div0;
    	let t4;
    	let current;
    	let each_value = /*images*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*modalImgSrc*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "See our work";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Check out our gallery below!";
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block) if_block.c();
    			add_location(h1, file$7, 75, 2, 1445);
    			add_location(p, file$7, 76, 2, 1469);
    			attr_dev(div0, "class", "carousel-container svelte-1dk2pm9");
    			add_location(div0, file$7, 78, 4, 1542);
    			attr_dev(div1, "class", "carousel-wrapper svelte-1dk2pm9");
    			add_location(div1, file$7, 77, 2, 1507);
    			attr_dev(div2, "id", "gallery");
    			attr_dev(div2, "class", "component");
    			add_location(div2, file$7, 74, 0, 1406);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, p);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t4);
    			if (if_block) if_block.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*images, openImgModal*/ 6) {
    				each_value = /*images*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*modalImgSrc*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", slots, []);
    	let modalImgSrc;

    	let images = [
    		"../assets/img/barnes3.jpg",
    		"../assets/img/inside.jpg",
    		"../assets/img/parrish2.jpg",
    		"../assets/img/rebarnes.jpg",
    		"../assets/img/rebarnes1.jpg",
    		"../assets/img/rebarnes3.jpg",
    		"../assets/img/rekean1.jpg",
    		"../assets/img/rekean2.jpg",
    		"../assets/img/rekean3.jpg",
    		"../assets/img/reparish1.jpg"
    	];

    	const openImgModal = e => {
    		$$invalidate(0, modalImgSrc = e.detail.imgSrc);
    		return modalImgSrc;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, modalImgSrc = null);
    	$$self.$capture_state = () => ({ Image, modalImgSrc, images, openImgModal });

    	$$self.$inject_state = $$props => {
    		if ("modalImgSrc" in $$props) $$invalidate(0, modalImgSrc = $$props.modalImgSrc);
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modalImgSrc, images, openImgModal, click_handler];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.25.0 */

    const file$8 = "src/components/Footer.svelte";

    function create_fragment$8(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let p0;
    	let t2;
    	let p1;
    	let a0;
    	let t4;
    	let a1;
    	let t6;
    	let p2;
    	let t10;
    	let p3;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Mims Family Painting";
    			t2 = space();
    			p1 = element("p");
    			a0 = element("a");
    			a0.textContent = "631-281-5815";
    			t4 = text("\n        |\n        ");
    			a1 = element("a");
    			a1.textContent = "mims@mimspainting.com";
    			t6 = space();
    			p2 = element("p");

    			p2.textContent = `Copyright © 1868-${/*currentYear*/ ctx[0]}
    Mims Family Painting All Rights Reserved.`;

    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "Website designed by Tim Clay.";
    			if (img.src !== (img_src_value = "../assets/img/NEWNEWLOGO.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Mims Family Painting");
    			attr_dev(img, "class", "svelte-kgwxs7");
    			add_location(img, file$8, 45, 6, 771);
    			attr_dev(div0, "class", "footer-logo svelte-kgwxs7");
    			add_location(div0, file$8, 44, 4, 739);
    			attr_dev(p0, "class", "svelte-kgwxs7");
    			add_location(p0, file$8, 48, 6, 892);
    			attr_dev(a0, "href", "tel:+16312815815");
    			add_location(a0, file$8, 50, 8, 938);
    			attr_dev(a1, "href", "mailto:mims@mimspainting.com");
    			add_location(a1, file$8, 52, 8, 1000);
    			attr_dev(p1, "class", "svelte-kgwxs7");
    			add_location(p1, file$8, 49, 6, 926);
    			attr_dev(div1, "class", "company-contact svelte-kgwxs7");
    			add_location(div1, file$8, 47, 4, 856);
    			attr_dev(div2, "class", "logo-contact-wrapper svelte-kgwxs7");
    			add_location(div2, file$8, 43, 2, 700);
    			attr_dev(p2, "class", "svelte-kgwxs7");
    			add_location(p2, file$8, 56, 2, 1098);
    			attr_dev(p3, "class", "svelte-kgwxs7");
    			add_location(p3, file$8, 60, 2, 1192);
    			attr_dev(div3, "id", "footer");
    			attr_dev(div3, "class", "svelte-kgwxs7");
    			add_location(div3, file$8, 42, 0, 680);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t2);
    			append_dev(div1, p1);
    			append_dev(p1, a0);
    			append_dev(p1, t4);
    			append_dev(p1, a1);
    			append_dev(div3, t6);
    			append_dev(div3, p2);
    			append_dev(div3, t10);
    			append_dev(div3, p3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const currentYear = new Date().getUTCFullYear();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ currentYear });
    	return [currentYear];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const windowWidth = writable(window.innerWidth);
    const needModal = writable(false);

    /* src/App.svelte generated by Svelte v3.25.0 */

    const { document: document_1, window: window_1 } = globals;
    const file$9 = "src/App.svelte";

    function create_fragment$9(ctx) {
    	let t0;
    	let div;
    	let banner;
    	let t1;
    	let navbar;
    	let t2;
    	let main;
    	let about;
    	let t3;
    	let gallery;
    	let t4;
    	let testimonials;
    	let t5;
    	let contactform;
    	let t6;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	banner = new Banner({ $$inline: true });

    	navbar = new NavBar({
    			props: {
    				width: /*width*/ ctx[1],
    				toggleModal: /*toggleModal*/ ctx[0],
    				toggleNavButtons: /*toggleNavButtons*/ ctx[4],
    				navIsSticky: /*navIsSticky*/ ctx[2],
    				stickyNav: /*stickyNav*/ ctx[3]
    			},
    			$$inline: true
    		});

    	about = new About({
    			props: { width: /*width*/ ctx[1] },
    			$$inline: true
    		});

    	gallery = new Gallery({ $$inline: true });
    	testimonials = new Testimonials({ $$inline: true });

    	contactform = new ContactForm({
    			props: { width: /*width*/ ctx[1] },
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(navbar.$$.fragment);
    			t2 = space();
    			main = element("main");
    			create_component(about.$$.fragment);
    			t3 = space();
    			create_component(gallery.$$.fragment);
    			t4 = space();
    			create_component(testimonials.$$.fragment);
    			t5 = space();
    			create_component(contactform.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1wj684x");
    			add_location(main, file$9, 71, 2, 1839);
    			add_location(div, file$9, 68, 0, 1738);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(banner, div, null);
    			append_dev(div, t1);
    			mount_component(navbar, div, null);
    			append_dev(div, t2);
    			append_dev(div, main);
    			mount_component(about, main, null);
    			append_dev(main, t3);
    			mount_component(gallery, main, null);
    			append_dev(main, t4);
    			mount_component(testimonials, main, null);
    			append_dev(main, t5);
    			mount_component(contactform, main, null);
    			append_dev(div, t6);
    			mount_component(footer, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "resize", /*resize_handler*/ ctx[5], false, false, false),
    					listen_dev(document_1.body, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};
    			if (dirty & /*width*/ 2) navbar_changes.width = /*width*/ ctx[1];
    			if (dirty & /*toggleModal*/ 1) navbar_changes.toggleModal = /*toggleModal*/ ctx[0];
    			if (dirty & /*navIsSticky*/ 4) navbar_changes.navIsSticky = /*navIsSticky*/ ctx[2];
    			navbar.$set(navbar_changes);
    			const about_changes = {};
    			if (dirty & /*width*/ 2) about_changes.width = /*width*/ ctx[1];
    			about.$set(about_changes);
    			const contactform_changes = {};
    			if (dirty & /*width*/ 2) contactform_changes.width = /*width*/ ctx[1];
    			contactform.$set(contactform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);
    			transition_in(navbar.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(gallery.$$.fragment, local);
    			transition_in(testimonials.$$.fragment, local);
    			transition_in(contactform.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(banner.$$.fragment, local);
    			transition_out(navbar.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(gallery.$$.fragment, local);
    			transition_out(testimonials.$$.fragment, local);
    			transition_out(contactform.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(banner);
    			destroy_component(navbar);
    			destroy_component(about);
    			destroy_component(gallery);
    			destroy_component(testimonials);
    			destroy_component(contactform);
    			destroy_component(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { toggleModal } = $$props;
    	let { width } = $$props;
    	let lowerBound = 400;
    	let navIsSticky = false;

    	const stickyNav = `position: sticky;
    position: -webkit-sticky;
    z-index: 99;
    top: 0;
    left: 0;`;

    	const getStickyNavTrigger = () => {
    		const banner = document.getElementById("banner");
    		const bannerDims = banner.getBoundingClientRect();
    		const bannerLowerBound = bannerDims.bottom;
    		$$invalidate(7, lowerBound = bannerLowerBound);
    	};

    	// onMount(() => {
    	//   getStickyNavTrigger();
    	// });
    	const unsubscribeWidth = windowWidth.subscribe(value => $$invalidate(1, width = value));

    	const unsubscribeModal = needModal.subscribe(value => {
    		$$invalidate(0, toggleModal = value);
    	});

    	const toggleNavButtons = () => {
    		needModal.set(!toggleModal);
    	};

    	const toggleStickyNav = () => {
    		// if (navIsSticky) return;
    		window.scrollY >= lowerBound
    		? $$invalidate(2, navIsSticky = true)
    		: $$invalidate(2, navIsSticky = false);
    	};

    	const writable_props = ["toggleModal", "width"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const resize_handler = () => {
    		windowWidth.set(window.innerWidth);
    	};

    	const click_handler = e => {
    		if (e.target.id !== "modal-toggler") {
    			needModal.set(false);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ("toggleModal" in $$props) $$invalidate(0, toggleModal = $$props.toggleModal);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({
    		NavBar,
    		ContactForm,
    		Banner,
    		About,
    		Testimonials,
    		Gallery,
    		Footer,
    		windowWidth,
    		needModal,
    		toggleModal,
    		width,
    		lowerBound,
    		navIsSticky,
    		stickyNav,
    		getStickyNavTrigger,
    		unsubscribeWidth,
    		unsubscribeModal,
    		toggleNavButtons,
    		toggleStickyNav
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggleModal" in $$props) $$invalidate(0, toggleModal = $$props.toggleModal);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("lowerBound" in $$props) $$invalidate(7, lowerBound = $$props.lowerBound);
    		if ("navIsSticky" in $$props) $$invalidate(2, navIsSticky = $$props.navIsSticky);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*lowerBound*/ 128) ;
    	};

    	return [
    		toggleModal,
    		width,
    		navIsSticky,
    		stickyNav,
    		toggleNavButtons,
    		resize_handler,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { toggleModal: 0, width: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleModal*/ ctx[0] === undefined && !("toggleModal" in props)) {
    			console.warn("<App> was created without expected prop 'toggleModal'");
    		}

    		if (/*width*/ ctx[1] === undefined && !("width" in props)) {
    			console.warn("<App> was created without expected prop 'width'");
    		}
    	}

    	get toggleModal() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleModal(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
        toggleModal: null,
        width: null,
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
