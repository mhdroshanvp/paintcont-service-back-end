export interface UserInterface {
  id?: string;
  username?: string;
  isBlocked?: boolean;
  profile?: string;
  email: string;
  password?: string;
  phone?: number;
  address?: {
    houseNo?: number;
    location?: string;
    pin?: number;
  };
  isValid?:boolean
}
