import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdoption extends Document {
  name: string;
  type: 'Dog' | 'Cat' | 'Other';
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  size: 'Small' | 'Medium' | 'Large';
  description: string;
  images: string[];
  location: string;
  health?: string;
  behavior?: string;
  status: 'available' | 'pending' | 'adopted';
  postedBy: mongoose.Types.ObjectId;
  postedByType: 'User' | 'WelfareOrganization';
  adoptedBy?: mongoose.Types.ObjectId;
  adoptionFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const adoptionSchema = new Schema<IAdoption>({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Dog', 'Cat', 'Other'] },
  breed: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female'] },
  size: { type: String, required: true, enum: ['Small', 'Medium', 'Large'] },
  description: { type: String, required: true },
  images: [{ type: String }],
  location: { type: String, required: true },
  health: { type: String },
  behavior: { type: String },
  status: { type: String, enum: ['available', 'pending', 'adopted'], default: 'available' },
  postedBy: { type: Schema.Types.ObjectId, required: true, refPath: 'postedByType' },
  postedByType: { type: String, required: true, enum: ['User', 'WelfareOrganization'] },
  adoptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  adoptionFee: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Adoption: Model<IAdoption> = mongoose.models.Adoption || mongoose.model<IAdoption>('Adoption', adoptionSchema);

export default Adoption;
