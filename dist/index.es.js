class n {
  constructor(e) {
    this._target = e, this.onMessage = null, this._target.addEventListener("message", this._onMessageEvent.bind(this));
  }
  _respond(e) {
    this._target.postMessage({ messageId: e, type: "response" });
  }
  _onMessageEvent(e) {
    var t;
    e instanceof MessageEvent && e.data.type === "request" && ((t = this.onMessage) == null || t.call(this, e.data.payload), this._respond(e.data.messageId));
  }
}
class i {
  constructor(e) {
    this._target = e, this._messageQueue = {}, this._target.onerror = this._onErrorEvent.bind(this), this._target.onmessageerror = this._onErrorMessageEvent.bind(this), this._target.addEventListener("error", this._onErrorEvent.bind(this)), this._target.addEventListener("message", this._onMessageEvent.bind(this)), this._target.addEventListener("messageerror", this._onErrorMessageEvent.bind(this));
  }
  async send(e) {
    return new Promise((t, s) => {
      const r = crypto.randomUUID();
      this._messageQueue[r] = () => {
        delete this._messageQueue[r], t("complete");
      }, this._target.postMessage({
        type: "request",
        payload: e,
        messageId: r
      }), setTimeout(() => {
        delete this._messageQueue[r], s("Time out");
      }, 500);
    });
  }
  _onErrorEvent(e) {
    e instanceof MessageEvent && console.log(e);
  }
  _onErrorMessageEvent(e) {
    e instanceof MessageEvent && console.log(e);
  }
  _onMessageEvent(e) {
    var t, s;
    e instanceof MessageEvent && e.data.type === "response" && ((s = (t = this._messageQueue)[e.data.messageId]) == null || s.call(t));
  }
}
class a {
  constructor(e) {
    this._url = e, this._worker = null, this._workerMessageSender = null, this._workerMessageReceiver = null, this.hasError = !1, this.hasInitialized = !1;
  }
  activate() {
    const e = URL.createObjectURL(
      new Blob(
        [`import("${this._url}").then(m => new m.default(self))`],
        { type: "text/javascript" }
      )
    );
    setTimeout(() => URL.revokeObjectURL(e), 0), this._worker = new Worker(e, { type: "module" }), this._workerMessageSender = new i(this._worker), this._workerMessageReceiver = new n(this._worker), this._workerMessageReceiver.onMessage = this._onEvent.bind(this), this._workerMessageSender.send({ type: "activate" }).then(() => this.hasInitialized = !0).catch(() => console.warn("Failed to activate a extension"));
  }
  deactivate() {
    var e;
    (e = this._workerMessageSender) == null || e.send({ type: "deactivate" }).then(() => {
      var t;
      (t = this._worker) == null || t.terminate(), this._worker = null, this.hasInitialized = !1, this._workerMessageSender = null;
    }).catch(() => console.warn("Failed to deactivate a extension"));
  }
  _onEvent(e) {
    switch (e.type) {
      case "add:exporter":
        this._handleAddExporter(e.payload);
        break;
      case "remove:exporter":
        this._handleRemoveExporter(e.payload);
        break;
      case "download:file":
        this._handleDownloadFile(e.payload);
        break;
    }
  }
  _handleAddExporter(e) {
    e && a.addExporter({
      key: e.key,
      label: e.label,
      action: async (t) => {
        var s;
        await ((s = this._workerMessageSender) == null ? void 0 : s.send({ payload: t, type: `exporters:${e.key}` }));
      }
    });
  }
  _handleRemoveExporter(e) {
    e && a.removeExporter(e);
  }
  _handleDownloadFile(e) {
    e && a.downloadFile(e.fileName, e.fileType, e.fileContent);
  }
  static addExporter(e) {
    throw new Error("Add exporter method not implemented yet");
  }
  static removeExporter(e) {
    throw new Error("Remove exporter method not implemented yet");
  }
  static downloadFile(e, t, s) {
    throw new Error("Download file method not implemented yet");
  }
}
class d {
  constructor(e) {
    this._extensionId = crypto.randomUUID(), this._commands = {}, this._workerReceiver = new n(e), this._workerSender = new i(e), this._commands.activate = this.activate.bind(this), this._commands.deactivate = this.deactivate.bind(this), this._workerReceiver.onMessage = this._onEvent.bind(this);
  }
  activate() {
  }
  deactivate() {
  }
  async addExporter(e) {
    const t = `${this._extensionId}:${e.key}`;
    this._commands[`exporters:${t}`] = e.action.bind(this), await this._workerSender.send({
      type: "add:exporter",
      payload: {
        key: t,
        label: e.label
      }
    });
  }
  async removeExporter(e) {
    const t = `${this._extensionId}:${e}`;
    delete this._commands[`exporters:${t}`], await this._workerSender.send({
      type: "remove:exporter",
      payload: t
    });
  }
  async downloadFile(e, t, s) {
    await this._workerSender.send({
      type: "download:file",
      payload: { fileName: e, fileType: t, fileContent: s }
    });
  }
  _onEvent(e) {
    var t, s;
    (s = (t = this._commands)[e.type]) == null || s.call(t, e.payload);
  }
}
export {
  d as Extension,
  a as ExtensionRunner
};
//# sourceMappingURL=index.es.js.map
