import { Brand } from '@/modules/phones/brands/entities/brand.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ModelDocument = HydratedDocument<Model>;

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
export class Model {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Brand.name,
    required: true,
  })
  brand: string;

  @Prop({
    type: String,
    required: true,
  })
  slug: string;

  @Prop({
    type: Date,
    required: true,
  })
  release_date: Date;
}

export const ModelSchema = SchemaFactory.createForClass(Model);
