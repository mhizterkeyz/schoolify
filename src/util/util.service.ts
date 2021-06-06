const defaultRandomStringFactory = 'a1b2c3d4e5f6g7h8i9j0klmnopqrstuvwxyz';

export class UtilService {
  public alphabetFactory = 'abcdefghijklmnopqrstuvwxyz';

  generateRandomString(
    length: number,
    factory = defaultRandomStringFactory,
  ): string {
    let randomString = '';
    while (randomString.length < length) {
      const selected = factory.charAt(
        Math.floor(Math.random() * factory.length),
      );
      randomString += selected;
    }

    return randomString;
  }

  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}
