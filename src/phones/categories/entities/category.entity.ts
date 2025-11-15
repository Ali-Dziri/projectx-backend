import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

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
export class Category {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  slug: string;

  @Prop({ required: false, type: String })
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
