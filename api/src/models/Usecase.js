const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

/**
 * @swagger
 * definitions:
 *   BaseModel:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *
 *   SerializedUsecase:
 *     allOf:
 *       - $ref: '#/definitions/BaseModel'
 *       - properties:
 *          title:
 *            type: string
 *          body:
 *            type: string
 *          milestones:
 *            type: array
 *            items:
 *              $ref: '#/definitions/SerializedMilestone'
 *   SerializedMilestone:
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       name:
 *         type: string
 *       name_de:
 *         type: string
 *       name_en:
 *         type: string
 *       start_date:
 *         type: string
 *         format: "date-time"
 *       end_date:
 *         type: string
 *         format: "date-time"
 *       usecase:
 *         type: number
 */
const schema = new Schema({
  title: {
    type: String,
    required: [true, 'Required'],
  },
  body: {
    type: String,
    required: [true, 'Required'],
  },
  milestones: [
    {
      id: Number,
      name: String,
      name_de: String,
      name_en: String,
      start_date: Date,
      end_date: Date,
      usecase: Number,
    },
  ],
});
schema.plugin(mongoosePaginate);

mongoose.model('Usecase', schema);
