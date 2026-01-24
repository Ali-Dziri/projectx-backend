import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type BrandDocument = HydratedDocument<Brand>;

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
export class Brand {
  id?: string;
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: false,
  })
  website: string;

  @Prop({
    type: String,
    required: false,
  })
  countryOfOrigin: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
