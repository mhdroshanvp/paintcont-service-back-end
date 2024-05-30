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
  age?:number;
  experience?: string;
  specialised?: string[];
  description?: string;
  experienceYears?:number
  aboutMe?: string;
  followers?: string[];
  premium?: boolean;
  premiumEndingDate?: Date;
  isValid?: boolean;
  location?:string
}

export default PainterInterface;
