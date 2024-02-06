export class DestinationIsDirectoryError extends Error {
  constructor(path) {
    super(`Destination is a directory: ${path}`);
    this.path = path;
  }
}

export class DestinationIsNotDirectoryError extends Error {
  constructor(path) {
    super(`Destination is not a directory: ${path}`);
    this.path = path;
  }
}
