/*
The MIT License (MIT)

Copyright (c) 2017 sebakrau

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function(RED) {

  const BraviaRemoteControl = require('sony-bravia-tv-remote');


  /* ---------------------------------------------------------------------------
   * CONFIG node
   * -------------------------------------------------------------------------*/
  function TvBraviaNodeConfig(config) {
    RED.nodes.createNode(this, config);

    // Configuration options passed by Node Red
    this.name = config.name;
    this.debug = config.debug;
    this.address = config.address;
    this.port = config.port;

    // Config node state
    this.closing = false;

    // Define functions called by nodes
    var node = this;

    // Define config node event listeners
    node.on("close", function(done){
      node.closing = true;
      done();
    });
  }
  RED.nodes.registerType("tv-bravia", TvBraviaNodeConfig, {
    credentials: {
         key: {type:"text"}
       }
    });





  /* ---------------------------------------------------------------------------
   * PUT node
   * -------------------------------------------------------------------------*/
  function TvBraviaPut(config) {
    RED.nodes.createNode(this, config);

    // Save settings in local node
    this.device = config.device;
    this.configNode = RED.nodes.getNode(this.device);
    this.name = config.name;
    this.action = config.action;

    var node = this;
    if (this.configNode) {

  		// Input handler, called on incoming flow
      this.on('input', function(msg) {

        // connect to tv
        const remote = new BraviaRemoteControl(node.configNode.address, node.configNode.port, node.configNode.credentials.key);

        // send command to TV
        remote.sendAction(node.action).then(function() {
          if (node.configNode.debug) {
            node.log('Successfully send command:' + node.action);
          }
        }).catch(function(error) {
          node.error('Failed to send action to TV with error: ' + error);
        });

      });

    } else {
      this.error(RED._("tv-bravia.errors.missing-config"));
    }
  }
  RED.nodes.registerType("tv-bravia-put", TvBraviaPut);

};
