let h;
const v = new Uint8Array(16);
function k() {
  if (!h && (h = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !h))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return h(v);
}
const r = [];
for (let n = 0; n < 256; ++n)
  r.push((n + 256).toString(16).slice(1));
function f(n, e = 0) {
  return r[n[e + 0]] + r[n[e + 1]] + r[n[e + 2]] + r[n[e + 3]] + "-" + r[n[e + 4]] + r[n[e + 5]] + "-" + r[n[e + 6]] + r[n[e + 7]] + "-" + r[n[e + 8]] + r[n[e + 9]] + "-" + r[n[e + 10]] + r[n[e + 11]] + r[n[e + 12]] + r[n[e + 13]] + r[n[e + 14]] + r[n[e + 15]];
}
const x = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), _ = {
  randomUUID: x
};
function w(n, e, t) {
  if (_.randomUUID && !e && !n)
    return _.randomUUID();
  n = n || {};
  const s = n.random || (n.rng || k)();
  return s[6] = s[6] & 15 | 64, s[8] = s[8] & 63 | 128, f(s);
}
function d(n) {
  const e = [], t = w(), s = (o) => {
    n = o, e.forEach((l) => l.emit(o));
  }, i = () => n;
  return {
    subscribe: (o) => {
      const l = { id: w(), emit: o };
      return e.push(l), {
        observerId: t,
        id: l.id,
        unsubscribe: () => {
          const u = e.findIndex((y) => y.id === l.id);
          u < 0 || e.splice(u, 1);
        }
      };
    },
    id: t,
    get value() {
      return i();
    },
    set value(o) {
      s(o);
    }
  };
}
class p {
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
class m {
  constructor(e) {
    this._target = e, this._messageQueue = {}, this._target.addEventListener("message", this._onMessageEvent.bind(this));
  }
  async send(e) {
    return new Promise((t, s) => {
      const i = crypto.randomUUID();
      this._messageQueue[i] = () => {
        delete this._messageQueue[i], t("complete");
      }, this._target.postMessage({
        type: "request",
        payload: e,
        messageId: i
      }), setTimeout(() => {
        delete this._messageQueue[i], s("Time out");
      }, 500);
    });
  }
  _onMessageEvent(e) {
    var t, s;
    e instanceof MessageEvent && e.data.type === "response" && ((s = (t = this._messageQueue)[e.data.messageId]) == null || s.call(t));
  }
}
class b {
  constructor(e, t) {
    this._worker = null, this._workerMessageSender = null, this._workerMessageReceiver = null, this._ready = !1, this._hasError = !1, this._hasInitialized = !1;
    const s = URL.createObjectURL(
      new Blob(
        [`import("${e}").then(m => new m.default(self))`],
        { type: "text/javascript" }
      )
    );
    this._worker = new Worker(s, { type: "module" }), setTimeout(() => URL.revokeObjectURL(s), 0), this._workerMessageSender = new m(this._worker), this._workerMessageReceiver = new p(this._worker), this._workerMessageReceiver.onMessage = (i) => this._onReceive(i, t);
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
class E {
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
const a = class a {
  constructor(e) {
    this._extensionWorker = null, this.loading = d(!1), this.url = d(null), this.name = d(null), this.version = d(null), this.packageName = d(null), this.description = d(null), this.exporters = d([]), this._debug("start - extensionPackageOrUrl", e), this.loading.value = !0, this._extensionId = crypto.randomUUID(), this._extensionLoader = new E(e), this._extensionLoader.onExtensionLoaded = (t, s) => {
      this._debug("extension - loaded", t, s), this.name.value = s.name, this.description.value = s.description, this.packageName.value = s.packageName, this.version.value = this._extensionLoader.version, this.url.value = this._extensionLoader.extensionPackageUrl, this.exporters.value = s.exporters.map((i) => ({
        label: i.label,
        description: i.description,
        key: `${this._extensionId}::${i.key}`,
        action: async (c) => {
          var o;
          this._debug("exporter - data,exporter", c, i), await ((o = this._extensionWorker) == null ? void 0 : o.send({ payload: c, type: `exporters:${i.key}` }));
        }
      })), this._extensionWorker = new b(this._extensionLoader.extensionCodeUrl || "", this._onReceive.bind(this)), this.loading.value = !1;
    };
  }
  _debug(e, ...t) {
    a.debug && console.log(e, ...t);
  }
  async deactivate() {
    var e;
    this._extensionLoader.cancelLoad(), await ((e = this._extensionWorker) == null ? void 0 : e.deactivate()), a.removeExporters(this.exporters.value.map((t) => t.key));
  }
  _onReceive(e) {
    switch (e.type) {
      case "feedback":
        this._handleFeedback(e.payload);
        break;
      case "download:file":
        this._handleDownloadFile(e.payload);
      case "download:files":
        this._handleDownloadFiles(e.payload);
        break;
      case "ready":
        a.addExporters(this.exporters.value);
        break;
    }
  }
  _handleDownloadFile(e) {
    e && a.downloadFile(e.fileName, e.fileType, e.fileContent);
  }
  _handleDownloadFiles(e) {
    e && a.downloadFiles(e.downloadName, e.files);
  }
  _handleFeedback(e) {
    e && a.feedback(e.message, e.type);
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
  static downloadFiles(e, t) {
    throw new Error("Download files method not implemented yet");
  }
  static feedback(e, t) {
    throw new Error("Feedback method not implemented yet");
  }
};
a.debug = !1;
let g = a;
class U {
  constructor(e) {
    this._commands = {}, this.commands = {
      /**
       * Allow you to add a project exporter in the platform. You can develop a code export.
       * 
       * @param key Key of the exporter previous added
       * @param action Function to be executed when the event was called
       */
      addExporter: async (t, s) => {
        const i = `${t}`;
        this._commands[`exporters:${i}`] = s.bind(this);
      },
      /**
       * Used to remove the project exporter
       * 
       * @param key Key of the exporter previous added
       */
      removeExporter: async (t) => {
        const s = `${t}`;
        delete this._commands[`exporters:${s}`];
      },
      /**
       * Allow you to download some content in a file
       * 
       * @param fileName Name of the generated file
       * @param fileType extension of the file
       * @param fileContent file content in string
       */
      downloadFile: async (t, s, i) => {
        await this._workerSender.send({
          type: "download:file",
          payload: { fileName: t, fileType: s, fileContent: i }
        });
      },
      /**
       * Allow you to download a lot of files and folders as zip
       * 
       * @param downloadName Name of the download as zip
       * @param files List of files or folders to download
       */
      downloadFiles: async (t, s) => {
        await this._workerSender.send({
          type: "download:files",
          payload: { downloadName: t, files: s }
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
    }, this._workerReceiver = new p(e), this._workerSender = new m(e), this._commands.activate = this.activate.bind(this), this._commands.deactivate = this.deactivate.bind(this), this._workerReceiver.onMessage = this._onEvent.bind(this), this._handleReady();
  }
  _onEvent(e) {
    var t, s;
    (s = (t = this._commands)[e.type]) == null || s.call(t, e.payload);
  }
  async _handleReady() {
    await this._workerSender.send({ type: "ready" });
  }
}
export {
  U as Extension,
  g as ExtensionRunner
};
//# sourceMappingURL=index.es.js.map
