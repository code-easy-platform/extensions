class h {
  constructor(e) {
    this._target = e, this.onMessage = null, this._target.addEventListener("error", this._onErrorEvent.bind(this)), this._target.addEventListener("message", this._onMessageEvent.bind(this)), this._target.addEventListener("messageerror", this._onErrorMessageEvent.bind(this));
  }
  _respond(e) {
    this._target.postMessage({ messageId: e, type: "response" });
  }
  _onMessageEvent(e) {
    var t;
    e instanceof MessageEvent && e.data.type === "request" && ((t = this.onMessage) == null || t.call(this, e.data.payload), this._respond(e.data.messageId));
  }
  _onErrorEvent(e) {
    e instanceof MessageEvent && console.log(e);
  }
  _onErrorMessageEvent(e) {
    e instanceof MessageEvent && console.log(e);
  }
}
class l {
  constructor(e) {
    this._target = e, this._messageQueue = {}, this._target.addEventListener("message", this._onMessageEvent.bind(this));
  }
  async send(e) {
    return new Promise((t, s) => {
      const n = crypto.randomUUID();
      this._messageQueue[n] = () => {
        delete this._messageQueue[n], t("complete");
      }, this._target.postMessage({
        type: "request",
        payload: e,
        messageId: n
      }), setTimeout(() => {
        delete this._messageQueue[n], s("Time out");
      }, 500);
    });
  }
  _onMessageEvent(e) {
    var t, s;
    e instanceof MessageEvent && e.data.type === "response" && ((s = (t = this._messageQueue)[e.data.messageId]) == null || s.call(t));
  }
}
class c {
  constructor(e, t) {
    this._worker = null, this._workerMessageSender = null, this._workerMessageReceiver = null, this._ready = !1, this._hasError = !1, this._hasInitialized = !1;
    const s = URL.createObjectURL(
      new Blob(
        [`import("${e}").then(m => new m.default(self))`],
        { type: "text/javascript" }
      )
    );
    this._worker = new Worker(s, { type: "module" }), setTimeout(() => URL.revokeObjectURL(s), 0), this._workerMessageSender = new l(this._worker), this._workerMessageReceiver = new h(this._worker), this._workerMessageReceiver.onMessage = (n) => this._onReceive(n, t);
  }
  get ready() {
    return this._ready;
  }
  get hasError() {
    return this._hasError;
  }
  get hasInitialized() {
    return this._hasInitialized;
  }
  async activate() {
    var e;
    await ((e = this._workerMessageSender) == null ? void 0 : e.send({ type: "activate" }).then(() => {
      this._hasInitialized = !0;
    }).catch(() => {
      this._hasError = !0, console.warn("Failed to activate a extension");
    }));
  }
  async deactivate() {
    var e;
    await ((e = this._workerMessageSender) == null ? void 0 : e.send({ type: "deactivate" }).then(() => {
      var t;
      (t = this._worker) == null || t.terminate(), this._worker = null, this._hasInitialized = !1, this._workerMessageSender = null;
    }).catch(() => console.warn("Failed to deactivate a extension")));
  }
  async send(e) {
    var t;
    return await ((t = this._workerMessageSender) == null ? void 0 : t.send(e));
  }
  _onReceive(e, t) {
    switch (e.type) {
      case "ready":
        this._ready = !0, t(e), this.activate();
        break;
      default:
        t(e);
        break;
    }
  }
}
class _ {
  constructor(e) {
    if (this.name = null, this.version = null, this.description = null, this.extensionCodeUrl = null, this.extensionManifestUrl = null, URL.canParse(e))
      e.endsWith("package.json") ? this._urlRoot = new URL(e.replace("package.json", "")) : this._urlRoot = new URL(e);
    else
      try {
        this._urlRoot = new URL(`https://cdn.jsdelivr.net/npm/${e}/`);
      } catch (t) {
        throw console.log(t), new Error("Error when try to parse the extension URL");
      }
    this._cancelSignal = new AbortController(), this.extensionPackageUrl = this._urlRoot.href.concat("package.json"), fetch(this.extensionPackageUrl, { signal: this._cancelSignal.signal }).then((t) => t.json()).then((t) => {
      this.name = t.name, this.version = t.version, this.description = t.description, this.extensionCodeUrl = new URL(t.module, this._urlRoot.href).toString(), this.extensionManifestUrl = new URL(t.manifest, this._urlRoot.href).toString(), this.onPackageLoaded(t);
    }).catch((t) => {
      console.log(t);
    });
  }
  onExtensionLoaded(e, t) {
  }
  cancelLoad() {
    this._cancelSignal.abort("Request canceled by the user");
  }
  onPackageLoaded(e) {
    if (!this.extensionManifestUrl) throw new Error("Manifest URL not found");
    if (!this.extensionCodeUrl) throw new Error("Code URL not found");
    fetch(this.extensionManifestUrl).then((t) => t.json()).then((t) => {
      this.onExtensionLoaded(e, t);
    });
  }
}
const r = class r {
  constructor(e) {
    this._extensionWorker = null, this.name = null, this.version = null, this.packageName = null, this.description = null, this.exporters = [], this._debug("start - extensionPackageOrUrl", e), this._extensionId = crypto.randomUUID(), this._extensionLoader = new _(e), this._extensionLoader.onExtensionLoaded = (t, s) => {
      this._debug("extension - loaded", t, s), this.name = s.name, this.description = s.description, this.packageName = s.packageName, this.version = this._extensionLoader.version, this.exporters = s.exporters.map((n) => ({
        label: n.label,
        description: n.description,
        key: `${this._extensionId}::${n.key}`,
        action: async (i) => {
          var a;
          this._debug("exporter - data,exporter", i, n), await ((a = this._extensionWorker) == null ? void 0 : a.send({ payload: i, type: `exporters:${n.key}` }));
        }
      })), this._extensionWorker = new c(this._extensionLoader.extensionCodeUrl || "", this._onReceive.bind(this));
    };
  }
  _debug(e, ...t) {
    r.debug && console.log(e, ...t);
  }
  async deactivate() {
    var e;
    this._extensionLoader.cancelLoad(), await ((e = this._extensionWorker) == null ? void 0 : e.deactivate()), r.removeExporters(this.exporters.map((t) => t.key));
  }
  _onReceive(e) {
    switch (e.type) {
      case "feedback":
        this._handleFeedback(e.payload);
        break;
      case "download:file":
        this._handleDownloadFile(e.payload);
        break;
      case "ready":
        console.log("Pronto, carregado"), r.addExporters(this.exporters);
        break;
    }
  }
  _handleDownloadFile(e) {
    e && r.downloadFile(e.fileName, e.fileType, e.fileContent);
  }
  _handleFeedback(e) {
    e && r.feedback(e.message, e.type);
  }
  static addExporters(e) {
    throw new Error("Download file method not implemented yet");
  }
  static removeExporters(e) {
    throw new Error("Download file method not implemented yet");
  }
  static downloadFile(e, t, s) {
    throw new Error("Download file method not implemented yet");
  }
  static feedback(e, t) {
    throw new Error("Feedback method not implemented yet");
  }
};
r.debug = !1;
let d = r;
class g {
  constructor(e) {
    this._commands = {}, this.commands = {
      /**
       * Allow you to add a project exporter in the platform. You can develop a code export.
       * 
       * @param key Key of the exporter previous added
       * @param action Function to be executed when the event was called
       */
      addExporter: async (t, s) => {
        const n = `${t}`;
        console.log("add export", n, s), this._commands[`exporters:${n}`] = s.bind(this);
      },
      /**
       * Used to remove the project exporter
       * 
       * @param key Key of the exporter previous added
       */
      removeExporter: async (t) => {
        const s = `${t}`;
        console.log("remove export", s), delete this._commands[`exporters:${s}`];
      },
      /**
       * Allow you to download some content in a file
       * 
       * @param fileName Name of the generated file
       * @param fileType extension of the file
       * @param fileContent file content in string
       */
      downloadFile: async (t, s, n) => {
        await this._workerSender.send({
          type: "download:file",
          payload: { fileName: t, fileType: s, fileContent: n }
        });
      },
      /**
       * Allow to show some feedback to the platform user
       * 
       * @param message Message of the feedback
       * @param type type of the feedback
       */
      feedback: async (t, s) => {
        await this._workerSender.send({
          type: "feedback",
          payload: { message: t, type: s }
        });
      }
    }, this._workerReceiver = new h(e), this._workerSender = new l(e), this._commands.activate = this.activate.bind(this), this._commands.deactivate = this.deactivate.bind(this), this._workerReceiver.onMessage = this._onEvent.bind(this), this._handleReady();
  }
  _onEvent(e) {
    var t, s;
    console.log("message", e, this._commands), (s = (t = this._commands)[e.type]) == null || s.call(t, e.payload);
  }
  async _handleReady() {
    await this._workerSender.send({ type: "ready" });
  }
}
export {
  g as Extension,
  d as ExtensionRunner
};
//# sourceMappingURL=index.es.js.map
