export enum CloudProvider {
  GOOGLE_DRIVE = 'google',
  ONE_DRIVE = 'onedrive',
}

export function parseProvider(value: string): CloudProvider {
  switch (value.toLowerCase()) {
    case 'google':
    case 'gdrive':
    case 'googledrive':
      return CloudProvider.GOOGLE_DRIVE;
    case 'onedrive':
    case 'one':
    case 'ms':
      return CloudProvider.ONE_DRIVE;
    default:
      throw new Error(`Unknown provider '${value}'`);
  }
}
