var ciaoAdapter = require('../ciao_adapter.js');

process.on('message', function(m) {
    m = JSON.parse(m);
    var uri = m.uri;
    var token = m.token;
    var sessionWorkloads = m.workloads;
    global.PROTOCOL = m.globals.protocol;
    global.CONTROLLER_ADDR = m.globals.controller_addr;
    global.CONTROLLER_PORT = m.globals.controller_port;
    var adapter = new ciaoAdapter();
    if (uri && token && sessionWorkloads)
        var data = adapter.onSuccess(function () {
            var workloads;
            try {
                workloads = sessionWorkloads.map((w,index) => {
                    if (data.json.servers){
                        var filteredData = data.json.servers.filter(
                            function (server) {
                                return server.flavor.id == w.id;
                            });
                        // total instances and running instances
                        var ti = filteredData.length;
                        var tri = filteredData.filter((server) => {
                            return server.status == 'active';
                        }).length;
                        w.totalInstances = ti;
                        w.totalRunningInstances = tri;
                    } else {
                        w.totalInstances = 0;
                        w.totalRunningInstances = 0;
                    }
                    return w;
                });
            } catch(err) {
                workloads = sessionWorkloads;
            }
            finally {
                // send workloads back to parent
                process.send(JSON.stringify({workloads:workloads}));
                //res.send({flavors:req.session.workloads});
            }
        })
        .onError((data) => process.send({error:data.statusCode}))
        .get(uri, token);
});

process.on('disconnect', () => process.exit());

process.on('error', function (error) {
    process.send({error: error.message || error});
});
