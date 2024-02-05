export class DestinationIsDirectoryError extends Error {
  constructor(path) {
    super(`Destination is a directory: ${path}`);
    this.path = path;
  }
}
