import mongoose from "mongoose";

const userInfoSchema = new mongoose.Schema(
  {
    _id: String, // Explicitly match DB type (Firebase UID)
    name: String,
    email: String,
    phoneNumber: String,
    blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userInfoSchema.virtual('id').get(function () {
  return this._id;
});
userInfoSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model("UserInfo", userInfoSchema, "usersInfo");
