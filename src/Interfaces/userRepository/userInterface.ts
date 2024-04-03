export interface UserInterface {
  id?: string;
  name?: string;
  isBlocked?: boolean;
  profile?: string;
  emial?: string;
  password?: string;
  phone?: number;
  address?: {
    houseNo?: number;
    location?: string;
    pin?: number;
  };
}
