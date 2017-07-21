$.extend({
    isString: function (obj) {
        return typeof obj === 'string';
    },
    isObject: function (obj) {
        return typeof obj === 'object';
    }
});

$.fn.extend({
    databind: function (vm, prop, elAttr) {
        vm = vm || {};
        vm.observer = vm.observer || {
                subs: [],
                notify: function () {
                    for (var i = 0; i < this.subs.length; i++) {
                        var node = this.subs[i];
                        this.update(node);
                    }
                },
                update: function (node) {
                    node.onVmChange(node, vm);
                }
            };

        if (vm[prop]) {
            var val = vm[prop];
            Object.defineProperty(vm, prop, {
                get: function () {
                    return val;
                },
                set: function (newVal) {
                    if (newVal === val) return;
                    val = newVal;
                    vm.observer.notify();
                }
            });
        }

        this.each(function () {
            if (!vm.hasOwnProperty(vmProp)) {
                throw new Error(vmProp + " doesn't exist in this view model!");
            }

            var node = this;
            node.vmProp = prop;
            node.elAttr = elAttr;
            node.onElementChange = function (nd, model) {
                model[nd.vmProp] = nd[nd.elAttr];
            };
            node.onVmChange = function (nd, model) {
                nd[nd.elAttr] = model[nd.vmProp];
            };

            if (elAttr == "innerText" || elAttr == "innerHTML") {
                $(this).empty();
            }

            if (node.nodeType === 1) {
                if (node.tagName.toUpperCase() == "INPUT") {
                    var elementType = node.type.toUpperCase();
                    if (elementType == "TEXT" || elementType == "PASSWORD") {
                        node.addEventListener('input', function (e) {
                            e.target.onElementChange(e.target, vm);
                        });
                    }

                    if (elementType == "CHECKBOX" || elementType == "RADIO") {
                        node.addEventListener('change', function (e) {
                            e.target.onElementChange(e.target, vm);
                        });
                    }
                }

                if (node.tagName.toUpperCase() == "SELECT") {
                    if (!vm[vmProp].hasOwnProperty("data")) {
                        throw new Error("data doesn't exist in this view model!");
                    }
                    //todo: check datasource is object and must has data property
                    //todo: reassign onElementChange, onVmChange
                    node.addEventListener('change', function (e) {
                        e.target.onElementChange(e.target, vm);
                    });
                }

                vm.observer.subs.push(node);
            }

            if (node.nodeType === 3) {
                vm.observer.subs.push(node);
            }
            vm.observer.update(node);
        });
    }
});