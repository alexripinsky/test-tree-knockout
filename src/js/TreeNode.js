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