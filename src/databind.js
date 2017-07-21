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
                    node.onVmChange.call(node, vm);
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
            var node = this;
            node.vmProp = prop;
            node.elAttr = elAttr;
            node.onElementChange = function (el, model) {
                model[el.vmProp] = el[el.elAttr];
            };
            node.onVmChange = function (el, model) {
                el[el.elAttr] = model[el.vmProp];
            };

            if (elAttr == "innerText" || elAttr == "innerHTML") {
                $(this).empty();
            };

            if (node.nodeType === 1) {
                if (node.tagName.toUpperCase() == "INPUT") {
                    var elementType = node.type.toUpperCase();
                    if (elementType == "TEXT" || elementType == "PASSWORD") {
                        node.addEventListener('input', function (e) {
                            node.onElementChange.call(el, vm);
                        });
                    }

                    if (elementType == "CHECKBOX" || elementType == "RADIO") {
                        node.addEventListener('change', function (e) {
                            node.onElementChange.call(el, vm);
                        });
                    }
                }

                if (node.tagName.toUpperCase() == "SELECT"){
                    //todo: check datasource is object and must has data property
                    //todo: reassign onElementChange, onVmChange
                    node.addEventListener('change', function (e) {
                        node.onElementChange.call(el, vm);
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