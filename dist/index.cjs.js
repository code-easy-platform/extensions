"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});let c;const v=new Uint8Array(16);function k(){if(!c&&(c=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!c))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return c(v)}const i=[];for(let s=0;s<256;++s)i.push((s+256).toString(16).slice(1));function b(s,e=0){return i[s[e+0]]+i[s[e+1]]+i[s[e+2]]+i[s[e+3]]+"-"+i[s[e+4]]+i[s[e+5]]+"-"+i[s[e+6]]+i[s[e+7]]+"-"+i[s[e+8]]+i[s[e+9]]+"-"+i[s[e+10]]+i[s[e+11]]+i[s[e+12]]+i[s[e+13]]+i[s[e+14]]+i[s[e+15]]}const x=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),g={randomUUID:x};function p(s,e,t){if(g.randomUUID&&!e&&!s)return g.randomUUID();s=s||{};const n=s.random||(s.rng||k)();return n[6]=n[6]&15|64,n[8]=n[8]&63|128,b(n)}function d(s){const e=[],t=p(),n=o=>{s=o,e.forEach(h=>h.emit(o))},r=()=>s;return{subscribe:o=>{const h={id:p(),emit:o};return e.push(h),{observerId:t,id:h.id,unsubscribe:()=>{const _=e.findIndex(y=>y.id===h.id);_<0||e.splice(_,1)}}},id:t,get value(){return r()},set value(o){n(o)}}}class m{constructor(e){this._target=e,this.onMessage=null,this._target.addEventListener("error",this._onErrorEvent.bind(this)),this._target.addEventListener("message",this._onMessageEvent.bind(this)),this._target.addEventListener("messageerror",this._onErrorMessageEvent.bind(this))}_respond(e){this._target.postMessage({messageId:e,type:"response"})}_onMessageEvent(e){var t;e instanceof MessageEvent&&e.data.type==="request"&&((t=this.onMessage)==null||t.call(this,e.data.payload),this._respond(e.data.messageId))}_onErrorEvent(e){e instanceof MessageEvent&&console.log(e)}_onErrorMessageEvent(e){e instanceof MessageEvent&&console.log(e)}}class w{constructor(e){this._target=e,this._messageQueue={},this._target.addEventListener("message",this._onMessageEvent.bind(this))}async send(e){return new Promise((t,n)=>{const r=crypto.randomUUID();this._messageQueue[r]=()=>{delete this._messageQueue[r],t("complete")},this._target.postMessage({type:"request",payload:e,messageId:r}),setTimeout(()=>{delete this._messageQueue[r],n("Time out")},500)})}_onMessageEvent(e){var t,n;e instanceof MessageEvent&&e.data.type==="response"&&((n=(t=this._messageQueue)[e.data.messageId])==null||n.call(t))}}class E{constructor(e,t){this._worker=null,this._workerMessageSender=null,this._workerMessageReceiver=null,this._ready=!1,this._hasError=!1,this._hasInitialized=!1;const n=URL.createObjectURL(new Blob([`import("${e}").then(m => new m.default(self))`],{type:"text/javascript"}));this._worker=new Worker(n,{type:"module"}),setTimeout(()=>URL.revokeObjectURL(n),0),this._workerMessageSender=new w(this._worker),this._workerMessageReceiver=new m(this._worker),this._workerMessageReceiver.onMessage=r=>this._onReceive(r,t)}get ready(){return this._ready}get hasError(){return this._hasError}get hasInitialized(){return this._hasInitialized}async activate(){var e;await((e=this._workerMessageSender)==null?void 0:e.send({type:"activate"}).then(()=>{this._hasInitialized=!0}).catch(()=>{this._hasError=!0,console.warn("Failed to activate a extension")}))}async deactivate(){var e;await((e=this._workerMessageSender)==null?void 0:e.send({type:"deactivate"}).then(()=>{var t;(t=this._worker)==null||t.terminate(),this._worker=null,this._hasInitialized=!1,this._workerMessageSender=null}).catch(()=>console.warn("Failed to deactivate a extension")))}async send(e){var t;return await((t=this._workerMessageSender)==null?void 0:t.send(e))}_onReceive(e,t){switch(e.type){case"ready":this._ready=!0,t(e),this.activate();break;default:t(e);break}}}class f{constructor(e){if(this.name=null,this.version=null,this.description=null,this.extensionCodeUrl=null,this.extensionManifestUrl=null,URL.canParse(e))e.endsWith("package.json")?this._urlRoot=new URL(e.replace("package.json","")):this._urlRoot=new URL(e);else try{this._urlRoot=new URL(`https://cdn.jsdelivr.net/npm/${e}/`)}catch(t){throw console.log(t),new Error("Error when try to parse the extension URL")}this._cancelSignal=new AbortController,this.extensionPackageUrl=this._urlRoot.href.concat("package.json"),fetch(this.extensionPackageUrl,{signal:this._cancelSignal.signal}).then(t=>t.json()).then(t=>{this.name=t.name,this.version=t.version,this.description=t.description,this.extensionCodeUrl=new URL(t.module,this._urlRoot.href).toString(),this.extensionManifestUrl=new URL(t.manifest,this._urlRoot.href).toString(),this.onPackageLoaded(t)}).catch(t=>{console.log(t)})}onExtensionLoaded(e,t){}cancelLoad(){this._cancelSignal.abort("Request canceled by the user")}onPackageLoaded(e){if(!this.extensionManifestUrl)throw new Error("Manifest URL not found");if(!this.extensionCodeUrl)throw new Error("Code URL not found");fetch(this.extensionManifestUrl).then(t=>t.json()).then(t=>{this.onExtensionLoaded(e,t)})}}const a=class a{constructor(e){this._extensionWorker=null,this.loading=d(!1),this.name=d(null),this.version=d(null),this.packageName=d(null),this.description=d(null),this.exporters=d([]),this._debug("start - extensionPackageOrUrl",e),this.loading.value=!0,this._extensionId=crypto.randomUUID(),this._extensionLoader=new f(e),this._extensionLoader.onExtensionLoaded=(t,n)=>{this._debug("extension - loaded",t,n),this.name.value=n.name,this.description.value=n.description,this.packageName.value=n.packageName,this.version.value=this._extensionLoader.version,this.exporters.value=n.exporters.map(r=>({label:r.label,description:r.description,key:`${this._extensionId}::${r.key}`,action:async l=>{var o;this._debug("exporter - data,exporter",l,r),await((o=this._extensionWorker)==null?void 0:o.send({payload:l,type:`exporters:${r.key}`}))}})),this._extensionWorker=new E(this._extensionLoader.extensionCodeUrl||"",this._onReceive.bind(this)),this.loading.value=!1}}_debug(e,...t){a.debug&&console.log(e,...t)}async deactivate(){var e;this._extensionLoader.cancelLoad(),await((e=this._extensionWorker)==null?void 0:e.deactivate()),a.removeExporters(this.exporters.value.map(t=>t.key))}_onReceive(e){switch(e.type){case"feedback":this._handleFeedback(e.payload);break;case"download:file":this._handleDownloadFile(e.payload);break;case"ready":a.addExporters(this.exporters.value);break}}_handleDownloadFile(e){e&&a.downloadFile(e.fileName,e.fileType,e.fileContent)}_handleFeedback(e){e&&a.feedback(e.message,e.type)}static addExporters(e){throw new Error("Download file method not implemented yet")}static removeExporters(e){throw new Error("Download file method not implemented yet")}static downloadFile(e,t,n){throw new Error("Download file method not implemented yet")}static feedback(e,t){throw new Error("Feedback method not implemented yet")}};a.debug=!1;let u=a;class U{constructor(e){this._commands={},this.commands={addExporter:async(t,n)=>{const r=`${t}`;this._commands[`exporters:${r}`]=n.bind(this)},removeExporter:async t=>{const n=`${t}`;delete this._commands[`exporters:${n}`]},downloadFile:async(t,n,r)=>{await this._workerSender.send({type:"download:file",payload:{fileName:t,fileType:n,fileContent:r}})},feedback:async(t,n)=>{await this._workerSender.send({type:"feedback",payload:{message:t,type:n}})}},this._workerReceiver=new m(e),this._workerSender=new w(e),this._commands.activate=this.activate.bind(this),this._commands.deactivate=this.deactivate.bind(this),this._workerReceiver.onMessage=this._onEvent.bind(this),this._handleReady()}_onEvent(e){var t,n;(n=(t=this._commands)[e.type])==null||n.call(t,e.payload)}async _handleReady(){await this._workerSender.send({type:"ready"})}}exports.Extension=U;exports.ExtensionRunner=u;
//# sourceMappingURL=index.cjs.js.map
