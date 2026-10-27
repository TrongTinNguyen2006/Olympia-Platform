import mongoose, { Schema, Document } from 'mongoose';
import { MatchDbModel } from '../../types.js';

export interface IMatch extends Document, Omit<MatchDbModel, '_id'> {}

const MediaAttachmentSchema = new Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'audio'], required: true }
}, { _id: false });

const KhoiDongQuestionSchema = new Schema({
  id: { type: String, required: true },
  noi_dung: { type: String, required: true },
  dap_an_dung: { type: String, required: true },
  chu_thich: { type: String },
  media: { type: MediaAttachmentSchema }
});

const ObstacleRowSchema = new Schema({
  id: { type: Number, required: true, min: 1, max: 5 },
  cau_hoi: { type: String, required: true },
  dap_an: { type: String, required: true },
  so_ky_tu: { type: Number, required: true },
  media: { type: MediaAttachmentSchema }
}, { _id: false });

const VuotChuongNgaiVatSchema = new Schema({
  tu_khoa_chinh: { type: String, required: true },
  anh_goc_url: { type: String, required: true },
  hang_ngang: { type: [ObstacleRowSchema], required: true }
}, { _id: false });

const TangTocQuestionSchema = new Schema({
  id: { type: Number, required: true, min: 1, max: 4 },
  noi_dung: { type: String, required: true },
  dap_an_dung: { type: String, required: true },
  media: { type: MediaAttachmentSchema },
  anh_dap_an_url: { type: String },
  thoi_gian: { type: Number, enum: [20, 30], required: true }
}, { _id: false });

const VeDichQuestionSchema = new Schema({
  id: { type: String, required: true },
  noi_dung: { type: String, required: true },
  dap_an_dung: { type: String, required: true },
  muc_diem: { type: Number, enum: [20, 30], required: true },
  linh_vuc: { type: String, required: true },
  media: { type: MediaAttachmentSchema }
});

const CauHoiPhuQuestionSchema = new Schema({
  id: { type: Number, required: true, min: 1, max: 3 },
  noi_dung: { type: String, required: true },
  dap_an_dung: { type: String, required: true },
  media: { type: MediaAttachmentSchema }
}, { _id: false });

const JeopardyClueSchema = new Schema({
  points: { type: Number, required: true },
  question: { type: String, required: true },
  dap_an_dung: { type: String, required: true },
  media: { type: MediaAttachmentSchema }
}, { _id: false });

const JeopardyCategorySchema = new Schema({
  title: { type: String, required: true },
  clues: { type: [JeopardyClueSchema], required: true }
}, { _id: false });

const JeopardySchema = new Schema({
  boardSize: { type: String, enum: ['5x4', '6x5'], default: '5x4' },
  categories: { type: [JeopardyCategorySchema], required: true }
}, { _id: false });

const MaTranKepQuestionSchema = new Schema({
  id: { type: Number, required: true },
  noi_dung: { type: String, required: true },
  dap_an_1: { type: String, required: true },
  dap_an_2: { type: String, required: true }
}, { _id: false });

const MaTranKepSchema = new Schema({
  cau_hoi: { type: [MaTranKepQuestionSchema], required: true },
  dap_an_nhieu: { type: [String], default: [] }
}, { _id: false });

const ExternalMediaSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['audio', 'image', 'video'], required: true }
}, { _id: false });

const DauTriBonusQuestionSchema = new Schema({
  id: { type: Schema.Types.Mixed },
  noi_dung: { type: String, required: true },
  dap_an_dung: { type: String, required: true },
  chu_thich: { type: String },
  media: { type: MediaAttachmentSchema }
}, { _id: false });

const DauTriBonusPackSchema = new Schema({
  chu_de: { type: String, required: true },
  cau_hoi: { type: [DauTriBonusQuestionSchema], required: true }
}, { _id: false });

const DauTriQuestionSchema = new Schema({
  id: { type: Number, required: true },
  noi_dung: { type: String, required: true },
  dap_an_dung: { type: String, required: true },
  chu_thich: { type: String },
  media: { type: MediaAttachmentSchema },
  goi_thuong: { type: DauTriBonusPackSchema, required: true }
}, { _id: false });

const DauTriSchema = new Schema({
  cau_hoi: { type: [DauTriQuestionSchema], required: true }
}, { _id: false });

const MatchSchema = new Schema<IMatch>({
  matchCode: { type: String, required: true, unique: true, index: true },
  matchPassword: { type: String, required: true },
  userId: { type: String, index: true },
  ownerEmail: { type: String, index: true },
  ownerName: { type: String },
  khoi_dong: {
    cau_hoi: { type: [KhoiDongQuestionSchema], required: true }
  },
  vuot_chuong_ngai_vat: { type: VuotChuongNgaiVatSchema, required: true },
  tang_toc: {
    cau_hoi: { type: [TangTocQuestionSchema], required: true }
  },
  ve_dich: {
    cau_hoi: { type: [VeDichQuestionSchema], required: true }
  },
  cau_hoi_phu: {
    cau_hoi: { type: [CauHoiPhuQuestionSchema], required: true }
  },
  jeopardy: { type: JeopardySchema, required: false },
  ma_tran_kep: { type: MaTranKepSchema, required: false },
  dau_tri: { type: DauTriSchema, required: false },
  media_ngoai: { type: [ExternalMediaSchema], default: [] }
}, {
  timestamps: true
});

export const MatchModel = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
