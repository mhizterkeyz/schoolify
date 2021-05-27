export class VerifyEmailPayload {
  constructor(public authToken: string, public name: string = 'there') {}
}

export class RecoverPasswordPayload {
  constructor(public recoveryCode: string) {}
}
