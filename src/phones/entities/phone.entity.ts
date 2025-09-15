import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Phone {
  id?: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  reference: string;
}

export const PhoneSchema = SchemaFactory.createForClass(Phone);
