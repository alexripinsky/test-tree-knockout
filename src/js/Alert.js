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