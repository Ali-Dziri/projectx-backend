import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret) => {
      const { _id, ...rest } = ret;
      return { id: _id, ...rest };
    },
  },
})
export class RefreshToken {
  @Prop({ required: true, type: String })
  hashedRefreshToken: string;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, type: Date })
  expiresIn: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
