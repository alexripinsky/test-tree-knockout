QUnit.test( "Alert class test", function( assert ) {
    var storage = ko.observableArray();
    
    var alert1 = new Alert({header:"test1",text:'test'},storage);
    assert.equal( 'test1', alert1.header, "Set time" );
    
    var alert2 = new Alert({header:"test1",text:'test5'},storage);
    assert.equal( 'test5', alert2.text, "Set time" );
    
    var alert3 = new Alert({header:"test",text:'test'},storage, 500);
    assert.equal( 500, alert3.time, "Set time" );
    
    var alert4 = new Alert({header:"test",text:'test', class: "testclass"},storage);
    assert.equal( "testclass", alert4.class, "Set class" );
    
    var alert5 = new Alert({header:"test",text:'test'},storage, 1000);
    setTimeout(function() {
        assert.ok( storage.indexOf(alert5) !== -1, "Delete Alert" );
    },1000);
    
    var alert6 = new Alert({header:"test",text:'test'},storage, 1000);
    assert.ok(alert6 instanceof Alert, "Check object");
    
});

QUnit.test( "TreeNodeView->TreeNode class test", function( assert ) {
    var parent = ko.observableArray();
    var node = new TreeNode({name:"1"}, parent);
    
    assert.equal( "1", node.data.name(), "Data:name" );
    assert.ok(node instanceof TreeNode, "Check Object" );
    assert.equal( 0, node.depth, "Root depth" );
    
    var node1 = node.add({name:"2"});
    
    assert.ok(node1 instanceof TreeNode, "Check Object child add" );
    assert.equal( 1, node1.depth, "Child lvl 1 depth" );
    assert.equal( node, node1.parent, "Check parent link");
    assert.equal( 1, node.children().length, "Check children");
    assert.equal( 0, node1.children().length, "Check children");
    
    var node2 = node1.add({name:"3"});
    
    assert.ok(node2 instanceof TreeNode, "Check Object sub child add" );
    assert.equal( 2, node2.depth, "sub Child lvl 2 depth" );
    assert.equal( false, node2.isSelected(), "Check prop from TreeNodeView 1" );
    assert.equal( true, node2.isShow(), "Check prop from TreeNodeView 2" );
    assert.equal( true, node2.showChildren(), "Check prop from TreeNodeView 3" );
    assert.equal( true, node2.toggleSelection(), "Check toggleSelection 1" );
    assert.equal( false, node2.toggleSelection(), "Check toggleSelection 2" );
    assert.equal( false, node1.toggleChildren(), "Check toggleChildren 1" );
    assert.equal( false, node2.isShow(), "Check toggleChildren 2" );
    assert.equal( true, node1.isShow(), "Check toggleChildren 3" );
});

QUnit.test( "TreeView class test", function( assert ) {
    var parent = ko.observableArray();
    var list = ko.observableArray();
    var treeView = new TreeView(parent, list, ko.observable('0'), "MyTreeStorage");
    onBeforeUnloadCallStack = [];
    
    assert.equal( 'MyTreeStorage', treeView.localStorageKey, "Check prop 1" );
    assert.equal( '0', treeView.renderType, "Check prop 2" );
    
    var node = new TreeNode({name:"1"}, parent)
    treeView.tree.push(node);
    
    assert.ok(parent.indexOf(node) !== -1, "Check tree link" );
    assert.notOk(list.indexOf(node) !== -1, "Check render 1" );
    
    treeView.render();
    
    assert.ok(list.indexOf(node) !== -1, "Check render 2" );
    
    var str = treeView.serializeTree();
    
    assert.equal( 'string', typeof str, "Check serialyze" );
    
    var testTree = ko.observableArray();
    ko.utils.arrayPushAll(testTree, parent);
    treeView.saveToLocalStorage();
    
    assert.equal( str, window.localStorage.getItem("MyTreeStorage"), "Check set to storage and serialyze" );
    
    treeView.loadFromLocalStorage();
    
    assert.strictEqual( str, treeView.serializeTree(), "Check load from storage" );
});

QUnit.test( "VM class test", function( assert ) {
    vm.settings.inputs.newNode("test123");
    var node = vm.settings.buttons.AddRootNode();
    assert.ok(vm.treeList.indexOf(node) !== -1, "Add root check 1" );
    
    vm.settings.inputs.newNode("");
    var node1 = vm.settings.buttons.AddRootNode();
    assert.notOk(vm.treeList.indexOf(node1) !== -1, "Add root check 2" );
    
    vm.settings.inputs.newNode("tesasdf");
    node.toggleSelection();
    var node2 = vm.settings.buttons.AddChildNode();
    assert.ok(vm.treeList.indexOf(node2) !== -1, "Add child check 1" );
    
    vm.settings.inputs.newNode("");
    var node3 = vm.settings.buttons.AddChildNode();
    assert.notOk(vm.treeList.indexOf(node3) !== -1, "Add child check 2" );
    
    node2.toggleSelection();
    vm.settings.buttons.RemoveNode();
    assert.notOk(vm.treeList.indexOf(node2) !== -1, "Remove check 1" );
    
    assert.notOk(vm.settings.buttons.RemoveNode(), "Remove check 2" );
    
})