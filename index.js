const app = require("./route");
const PORT = process.env.PORT || 8080;

var server = app.listen(PORT, "0.0.0.0", function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("site: http://%s:%s", host, port);
});
