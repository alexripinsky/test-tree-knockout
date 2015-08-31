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