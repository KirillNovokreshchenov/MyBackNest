export class EmailConfirmationDto {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}
