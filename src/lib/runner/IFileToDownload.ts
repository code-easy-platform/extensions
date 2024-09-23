
interface IFile {
  /** Type of the file */
  type: string;
  /** File content */
  content: string;
};

interface IFolder {
  /** Type of the file */
  type?: undefined;
  /** List of files or folders */
  content: TFileToDownload[];
};

/**
 * Basic structure os a file to download
 */
export type TFileToDownload = (IFile | IFolder) & {
  /** Name of the folder or file */
  name: string;
}
