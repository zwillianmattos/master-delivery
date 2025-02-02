export class GetUserByEmailQuery {
  constructor(public readonly email: string) {}
}

export class GetUserByIdQuery {
  constructor(public readonly id: string) {}
}
