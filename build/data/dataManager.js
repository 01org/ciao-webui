(function () {

    var defaultOnLoadData = function () {
        console.log("Warning: consider registering an event for loading data");
    };

    var DataManager = function () {
        this.data = {};
        this.sources = {};
        this.events = { onLoadData: defaultOnLoadData, sources: {} };
    };

    DataManager.prototype.addEvent = function (listener, callback) {
        this.events[listener] = callback;
    };

    DataManager.prototype.clearEvent = function (listener) {
        if (listener != "sources") delete this.events[listener];
    };

    //events
    DataManager.prototype.trigger = function (event) {

        if (event) if (this.events[event]) {
            this.events[event]();
        }
    };

    DataManager.prototype.setActiveTenant = function (activeTenant) {
        console.log('Setting active tenant to', activeTenant);
        this.data.activeTenant = activeTenant;
    };

    // This function loads data, this triggers "onLoadData"
    DataManager.prototype.loadData = function (newData) {
        this.data = newData;
        this.trigger('onLoadData');
    };

    DataManager.prototype.equals = function (a, b) {
        // TODO: find a more elegant comparison algorythm
        var result;
        try {
            result = JSON.stringify(a) == JSON.stringify(b);
        } catch (err) {
            result = false;
        }
        return result;
    };

    DataManager.prototype.setDataSource = function (identifier, source) {
        if (this.events.sources[identifier]) {
            //validate if data is different, if it is then trigger update
            if (this.equals(this.sources[identifier], source) == false) {
                //trigger registered callback
                this.sources[identifier] = source;
                this.events.sources[identifier](source);
            } else {
                console.log("Warning: new data does not differ form current.");
            }
        }
    };

    DataManager.prototype.deleteDataSource = function (identifier) {
        delete this.data.sources[identifier];
    };

    DataManager.prototype.onDataSourceSet = function (identifier, callback) {
        this.events.sources[identifier] = callback;
    };

    window.datamanager = new DataManager();
})();