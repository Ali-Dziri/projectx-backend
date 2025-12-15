/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { HydratedDocument } from 'mongoose';
import { AdminAccountStatus } from 'src/common/types/users-types';

export interface AdminDocument extends HydratedDocument<Admin> {
  createdAt: Date;
  updatedAt: Date;
}

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret: AdminDocument) => {
      const { _id, password, phone, createdAt, updatedAt, ...rest } = ret;
      return {
        id: _id,
        phone: { code: phone.code, number: phone.number },
        ...rest,
      };
    },
  },
})
export class Admin {
  id?: string;

  @Prop({ required: true, type: String })
  firstname: string;

  @Prop({ required: true, type: String })
  lastname: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  username: string;

  @Prop({
    required: true,
    type: {
      code: { type: String },
      number: { type: String },
    },
    // type: String,
  })
  phone: {
    code: string;
    number: string;
  };

  @Prop({ required: true, type: String })
  password: string;

  @Prop({
    required: true,
    enum: Object.values(AdminAccountStatus),
    default: AdminAccountStatus.PENDING,
  })
  accountStatus: AdminAccountStatus;

  @Prop({ required: false, type: Date })
  lastActivity: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 12);
    return next();
  } catch (error) {
    return next(error);
  }
});
