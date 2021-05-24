export class Address {
  constructor(public email: string, public name: string = '') {}
}

export class Attachment {
  constructor(public name: string, public type: string, public data: string) {}
}

export class Mail {
  constructor(
    public from: Address,
    public to: Address[],
    public subject: string,
    public body: string,
    public cc?: Address[],
    public attachments?: Attachment[],
  ) {}
}
