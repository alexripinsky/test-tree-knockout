function Alert(data, storage, time) {
    this.header = data.header;
    this.text = data.text;
    this.storage = storage;
    this.time = 5000;
    this.class = "alert-warning";
    
    if (data.hasOwnProperty("class"))
        this.class = data.class;
    if (time)
        this.time = time;
    
    self = this;
    
    setTimeout(function() {
        self.storage.remove(self);
    },this.time);
}
function TreeNodeView () {
    this.isSelected = ko.observable(false);
    this.isShow = ko.observable(true);
    this.showChildren = ko.observable(true);
}
TreeNodeView.prototype.toggleSelection = function () {
    if (vm.settings.selectedNode() instanceof TreeNode &&
            vm.settings.selectedNode() !== this)
        vm.settings.selectedNode().isSelected(false);

    if (this.isSelected())
        vm.settings.selectedNode({});
    else
        vm.settings.selectedNode(this);

    this.isSelected(!this.isSelected());
    return this.isSelected();
};
TreeNodeView.prototype.toggleChildren = function () {
    function setVisibilityToChildren(children, state) {
        if (children.length > 0) {
            for (var i = 0, lenI = children.length; i < lenI; i++) {
                children[i].isShow(state);
                children[i].showChildren(true);
                if (children[i].children().length >0)
                    setVisibilityToChildren(children[i].children(), state);
            }
        }
    }

    var state = !this.showChildren();
    setVisibilityToChildren(this.children(), state);

    this.showChildren(state);
    return this.showChildren();
};
function TreeNode (data, parent) {
    this.children = ko.observableArray();
    this.data = data;
    this.data.name = ko.observable(this.data.name);
    this.parent = parent;
    this.depth = 0;
    if (parent instanceof TreeNode)
        this.depth = parent.depth + 1;
    
    this.add = function (data) {
        var node = new TreeNode(data, this);
        this.children.push(node);
        return node;
    };
    
    TreeNodeView.apply(this);
}

TreeNode.prototype = Object.create(TreeNodeView.prototype);
function TreeView(tree, list, renderType, localStorageKey) {
    this.tree = tree;
    this.list = list;
    this.listSubscriptions = [];
    this.renderType = renderType();
    this.localStorageKey = localStorageKey;
    var self = this;
    
    onBeforeUnloadCallStack.push(function() {
        self.saveToLocalStorage();
    });
}

TreeView.prototype.render = function () {
    this.list.removeAll();
    switch (this.renderType) {
        case "0":
            ko.utils.arrayPushAll(this.list, this.renderRecursive(this.tree));
            break;
        default:
        case "1":
            ko.utils.arrayPushAll(this.list, this.renderIterative());
            break;
    }
    for (var i = 0, lenI = this.listSubscriptions.length; i < lenI; i++) {
        this.listSubscriptions[i].dispose();
    }
    for (var i = 0, lenI = this.list().length; i < lenI; i++) {
        this.listSubscriptions.push(this.list()[i].data.name.subscribe(function(value){
            if (value == "") {
                vm.settings.selectedNode().data.name("Node");
                 vm.alerts.push(new Alert({header:'Warning',text:'Enter Node Name'}, vm.alerts));
            }
        }));
    }
    return this.list;
};
    
TreeView.prototype.renderRecursive = function (tree) {
    var list = [];
    function renderNode(node, list) {
        list.push(node);
        if (node.children().length >0) {
            for (var i = 0, lenI = node.children().length; i < lenI; i++) {
                renderNode(node.children()[i], list);
            }
        }
    }
    for (var i = 0, lenI = tree().length; i < lenI; i++) {
        renderNode(tree()[i], list);
    }
    return list;
};
    
TreeView.prototype.renderIterative = function () {
    var stack = [];
    var list = [];
    ko.utils.arrayPushAll(stack,this.tree());
    while (stack.length > 0) {
        list.push(stack[0]);
        if (stack[0].children().length > 0) {
            for (var i = 0, lenI = stack[0].children().length; i < lenI; i++) {
                stack.push(stack[0].children()[i]);
            }
        }
        stack.splice(0,1);
    }
    return list;
};
    
TreeView.prototype.prepereToSerializeNode = function(node) {
    var temporaryNode = {};
    temporaryNode.data = {};
    for(var prop in node.data) {
        if (typeof node.data[prop] === "function") {
            temporaryNode.data[prop] = node.data[prop]();
        } else {
            temporaryNode.data[prop] = node.data[prop];
        }
    }
    temporaryNode.children = [];
    for (var i = 0, lenI = node.children().length; i < lenI; i++) {
        temporaryNode.children.push(this.prepereToSerializeNode(node.children()[i]));
    }
    return temporaryNode;
};
    
TreeView.prototype.serializeTree = function() {
    var temporary = [];
    for (var i = 0, lenI = this.tree().length; i < lenI; i++) {
        temporary.push(this.prepereToSerializeNode(this.tree()[i]));
    }
    return JSON.stringify(temporary);
};
    
TreeView.prototype.saveToLocalStorage = function() {
    return window.localStorage.setItem(this.localStorageKey, this.serializeTree());
};
    
TreeView.prototype.loadFromLocalStorage = function () {
    var temporary = window.localStorage.getItem(this.localStorageKey);
    var result = [];

    function createNode(node, parent) {
        var result = new TreeNode({name: node.data.name}, parent);
        for (var i = 0, lenI = node.children.length; i < lenI; i++) {
            result.children.push(createNode(node.children[i], result));
        }
        return result;
    }

    if (temporary !== null) {
        temporary = JSON.parse(temporary);
        for (var i = 0, lenI = temporary.length; i < lenI; i++) {
            result.push(createNode(temporary[i], this.tree));
        }
    }


    this.tree.removeAll();
    ko.utils.arrayPushAll(this.tree, result);
    return this.tree;
};
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
var onBeforeUnloadCallStack = [];
window.onbeforeunload = function () {
    for(var i = 0, lenI = window.onBeforeUnloadCallStack.length; i < lenI; i++){
        window.onBeforeUnloadCallStack[i]();
    }
}

vm.treeView = new TreeView(vm.tree, vm.treeList, vm.settings.renderType, "MyTreeStorage");

jQuery(document).ready(function(){
    ko.applyBindings(vm);
    
    vm.treeView.loadFromLocalStorage()
    vm.treeView.render();
});