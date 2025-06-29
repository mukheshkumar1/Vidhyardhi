import mongoose from "mongoose";

const staffSchema= new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    
    mobileNumber:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
    },
    gender:{
        type: String,
        required: true,
        enum: ["male","female"],
    },
    profilePicture: {
      imageUrl: {
        type: String,
        required:true,
    },
  },
    role: {
        type: String,
        enum: ["admin", "staff"],
        default: "staff",
      },
      permissions: {
        canEditStudents: { type: Boolean, default: false }
      },

      teaching: {
        type: Boolean,
        default: false,
      },
      subjects: [{
        type: String,
        required: function() { return this.teaching; }
      }],
      salary: {
        type: String,
        required: true,
      },
      attendance: {
        monthly: {
        },
        yearly: {
          workingDays: { type: Number, default: 0 },
          presentDays: { type: Number, default: 0 },
          percentage: { type: Number, default: 0 }
        }
      },
      className: {
        type: String,
        required: function () {
          return this.isNew && this.teaching;
        },
      },
      
      
      otp: { type: String },
      otpExpires: { type: Date },
      
        createdAt: { type: Date, default: Date.now }
      });
const Staff = mongoose.model("Staff",staffSchema)

export default Staff;