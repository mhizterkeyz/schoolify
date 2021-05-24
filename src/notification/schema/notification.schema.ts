export class VerifyEmailPayload {
  constructor(public authToken: string, public name: string = 'there') {}
}
