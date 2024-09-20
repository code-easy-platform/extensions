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
class o {
  constructor(e) {
    this._target = e, this._messageQueue = {}, this._target.onerror = this._onErrorEvent.bind(this), this._target.onmessageerror = this._onErrorMessageEvent.bind(this), this._target.addEventListener("error", this._onErrorEvent.bind(this)), this._target.addEventListener("message", this._onMessageEvent.bind(this)), this._target.addEventListener("messageerror", this._onErrorMessageEvent.bind(this));
  }
  async send(e) {
    return new Promise((t, s) => {
      const a = crypto.randomUUID();
      this._messageQueue[a] = () => {
        delete this._messageQueue[a], t("complete");
      }, this._target.postMessage({
        type: "request",
        payload: e,
        messageId: a
      }), setTimeout(() => {
        delete this._messageQueue[a], s("Time out");
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
class r {
  constructor(e) {
    this._url = e, this._worker = null, this._workerMessageSender = null, this._workerMessageReceiver = null, this.name = null, this.hasError = !1, this.description = null, this.hasInitialized = !1;
  }
  activate() {
    const e = URL.createObjectURL(
      new Blob(
        [`import("${this._url}").then(m => new m.default(self))`],
        { type: "text/javascript" }
      )
    );
    setTimeout(() => URL.revokeObjectURL(e), 0), this._worker = new Worker(e, { type: "module" }), this._workerMessageSender = new o(this._worker), this._workerMessageReceiver = new n(this._worker), this._workerMessageReceiver.onMessage = this._onEvent.bind(this), this._workerMessageSender.send({ type: "activate" }).then(() => this.hasInitialized = !0).catch(() => console.warn("Failed to activate a extension"));
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
      case "set:name":
        this.name = e.payload || "Nothing set here";
        break;
      case "set:description":
        this.description = e.payload || "Nothing set here";
        break;
      case "feedback":
        this._handleFeedback(e.payload);
        break;
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
    e && r.addExporter({
      key: e.key,
      label: e.label,
      action: async (t) => {
        var s;
        await ((s = this._workerMessageSender) == null ? void 0 : s.send({ payload: t, type: `exporters:${e.key}` }));
      }
    });
  }
  _handleRemoveExporter(e) {
    e && r.removeExporter(e);
  }
  _handleDownloadFile(e) {
    e && r.downloadFile(e.fileName, e.fileType, e.fileContent);
  }
  _handleFeedback(e) {
    e && r.feedback(e.message, e.type);
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
  static feedback(e, t) {
    throw new Error("Feedback method not implemented yet");
  }
}
class d {
  constructor(e) {
    this._extensionId = crypto.randomUUID(), this._commands = {}, this.name = null, this.description = null, this._workerReceiver = new n(e), this._workerSender = new o(e), this._commands.activate = this.activate.bind(this), this._commands.deactivate = this.deactivate.bind(this), this._workerReceiver.onMessage = this._onEvent.bind(this), this._onInit();
  }
  /**
   * First function call when extension starts.
   */
  activate() {
  }
  /**
   * Last function call when extension ends.
   */
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
  async feedback(e, t) {
    await this._workerSender.send({
      type: "feedback",
      payload: { message: e, type: t }
    });
  }
  _onEvent(e) {
    var t, s;
    (s = (t = this._commands)[e.type]) == null || s.call(t, e.payload);
  }
  async _onInit() {
    await this._workerSender.send({
      type: "set:name",
      payload: this.name || "Nothing set here"
    }), await this._workerSender.send({
      type: "set:description",
      payload: this.description || "Nothing set here"
    });
  }
}
export {
  d as Extension,
  r as ExtensionRunner
};
//# sourceMappingURL=index.es.js.map
