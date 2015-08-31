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