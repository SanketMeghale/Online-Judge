import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    organizer: { type: String, default: "Judgo Official" },
    contestType: {
      type: String,
      enum: ["Weekly", "Biweekly", "Hiring", "Special", "Monthly"],
      default: "Weekly"
    },
    category: { type: String, default: "Algorithm" },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    duration: { type: String, default: "1h 30m" },
    participantCount: { type: Number, default: 0 },
    prize: { type: String, default: "Judgo XP & Badges" },
    badge: { type: String, default: "Contest Participant" },
    registrationOpen: { type: Boolean, default: true },
    registrationDeadline: { type: Date },
    problemIds: { type: [String], default: [] },
    problems: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        points: { type: Number, default: 250 },
        diff: { type: String, default: "Medium" },
        statement: { type: String, default: "" },
        starterCode: { type: Map, of: String, default: {} }
      }
    ],
    rules: {
      type: String,
      default: "Standard ACM/ICPC rules apply. Penalty of 5 minutes per wrong submission."
    }
  },
  { timestamps: true, collection: "contests" }
);

export const Contest = mongoose.models.Contest || mongoose.model("Contest", contestSchema);
