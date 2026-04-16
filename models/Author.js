import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },
  shortBio: {
    type: String
  },
  fullBio: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
  }
}, { timestamps: true });

export default mongoose.model("Author", authorSchema);