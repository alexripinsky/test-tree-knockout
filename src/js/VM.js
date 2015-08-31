var vm = {
    treeList: ko.observableArray(),
    tree: ko.observableArray(),
    alerts: ko.observableArray(),
    settings: {
        renderType: ko.observable('0'),
        selectedNode: ko.observable({}),
        inputs: {
            newNode: ko.observable(''),
            changeNode: ko.observable('')
        },
        buttons: {
            AddRootNode: function() {
                var node = null;
                if (vm.settings.inputs.newNode() !== '') {
                    node = new TreeNode({name: vm.settings.inputs.newNode()}, vm.tree);
                    vm.tree.push(node);
                    vm.treeView.render();
                } else {
                    vm.alerts.push(new Alert({header:'Warning',text:'Enter Node Name'}, vm.alerts));
                }
                return node;
            },
            AddChildNode: function() {
                var node = null;
                if (vm.settings.selectedNode() instanceof TreeNode) {
                    if (vm.settings.inputs.newNode() !== '') {
                        node = vm.settings.selectedNode().add({name: vm.settings.inputs.newNode()});
                        vm.treeView.render();
                    } else {
                        vm.alerts.push(new Alert({header:'Warning',text:'Enter Node Name'}, vm.alerts));
                    }
                } else {
                    vm.alerts.push(new Alert({header:'Warning',text:'Select Node'}, vm.alerts));
                }
                return node;
            },
            RemoveNode: function() {
                var node = vm.settings.selectedNode();
                var result = false;
                if (vm.settings.selectedNode() instanceof TreeNode) {
                    vm.settings.selectedNode({});
                    if (node.parent instanceof TreeNode)
                        node.parent.children.remove(node);
                    else
                        node.parent.remove(node);
                    vm.treeView.render();
                    result = true;
                }
                return result;
            }
        }
    }
};