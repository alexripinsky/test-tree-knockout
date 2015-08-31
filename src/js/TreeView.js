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