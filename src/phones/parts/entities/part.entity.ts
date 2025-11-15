import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from '@/phones/models/entities/model.entity';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from '@/phones/categories/entities/category.entity';

export type PartDocument = HydratedDocument<Part>;

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
export class Part {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  reference: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Category.name,
  })
  categoryId: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Model.name,
  })
  modelId: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: Model.name,
    default: [],
  })
  compatible_models: string[];
}

export const PartSchema = SchemaFactory.createForClass(Part);
