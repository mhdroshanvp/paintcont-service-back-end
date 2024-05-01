import { Document } from 'mongoose';

interface Address {
  country?: string;
  state?: string;
  city?: string;
}

interface PainterInterface extends Document {
  username: string;
  email: string;
  password: string;
  isBlocked?: boolean;
  profile?: string;
  phone?: number;
  address?: Address;
  experience?: string;
  specialised?: string[];
  description?: string;
  followers?: number;
  premium?: boolean;
  premiumEndingDate?: Date;
  isValid?: boolean;
}

export default PainterInterface;
