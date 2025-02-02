export class Address {
  id: string;
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Address>) {
    Object.assign(this, partial);
  }
}
