import { IManifest } from './IManifest';


export class ExtensionLoader {
  private _urlRoot: URL;
  private _cancelSignal: AbortController;

  public extensionPackageUrl: string;

  public name: string | null = null;
  public version: string | null = null;
  public description: string | null = null;
  public extensionCodeUrl: string | null = null;
  public extensionManifestUrl: string | null = null;


  constructor(extension: string) {
    if (URL.canParse(extension)) {
      if (extension.endsWith('package.json')) {
        this._urlRoot = new URL(extension.replace('package.json', ''));
      } else {
        this._urlRoot = new URL(extension);
      }
    } else {
      try {
        this._urlRoot = new URL(`https://cdn.jsdelivr.net/npm/${extension}/`);
      } catch (error) {
        console.log(error);
        throw new Error('Error when try to parse the extension URL');
      }
    }

    this._cancelSignal = new AbortController();

    this.extensionPackageUrl = this._urlRoot.href.concat('package.json');
    fetch(this.extensionPackageUrl, { signal: this._cancelSignal.signal })
      .then(res => res.json())
      .then(data => {
        this.name = data.name;
        this.version = data.version;
        this.description = data.description;
        this.extensionCodeUrl = new URL(data.module, this._urlRoot.href).toString();
        this.extensionManifestUrl = new URL(data.manifest, this._urlRoot.href).toString();

        this.onPackageLoaded(data);
      })
      .catch(error => {
        console.log(error);
      });
  }

  public onExtensionLoaded(_packageData: Record<string, any>, _manifest: IManifest) { }


  public cancelLoad() {
    this._cancelSignal.abort('Request canceled by the user');
  }


  private onPackageLoaded(packageData: any) {
    if (!this.extensionManifestUrl) throw new Error('Manifest URL not found')
    if (!this.extensionCodeUrl) throw new Error('Code URL not found')

    fetch(this.extensionManifestUrl)
      .then(res => res.json())
      .then((manifestData) => {
        this.onExtensionLoaded(packageData, manifestData);
      });
  }
}
