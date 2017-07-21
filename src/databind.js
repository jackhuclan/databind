$.fn.extend({
	databind: function (vm, prop, htmlAttr) {
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
						node[node.targetAttr] = vm[node.sourceAttr];
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
			node.sourceAttr = prop;
			node.targetAttr = htmlAttr;
			if (htmlAttr == "innerText" || htmlAttr == "innerHTML") {
				$(this).empty();
			};

			if (node.nodeType === 1) {
				if (node.tagName.toUpperCase() == "INPUT") {
					var elementType = node.type.toUpperCase();
					if (elementType == "TEXT" || elementType == "PASSWORD") {
						node.addEventListener('input', function (e) {
							vm[prop] = e.target[e.target.targetAttr];
						});
					}

					if (elementType == "CHECKBOX" || elementType == "RADIO") {
						node.addEventListener('change', function (e) {
							vm[prop] = e.target[e.target.targetAttr];
						});
					}
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