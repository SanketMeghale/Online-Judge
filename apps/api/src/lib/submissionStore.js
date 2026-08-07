import { isDatabaseConnected } from "./db.js";
import { Submission } from "../models/Submission.js";
import mongoose from "mongoose";

const memorySubmissions = [];

export async function createSubmissionRecord(record) {
  const generatedId = record.id || new mongoose.Types.ObjectId().toString();
  const initial = {
    _id: generatedId,
    id: generatedId,
    submissionId: generatedId,
    status: record.status || "QUEUED",
    verdict: record.verdict || "PENDING",
    statusText: record.statusText || "Queued for evaluation",
    createdAt: new Date(),
    ...record
  };

  if (isDatabaseConnected()) {
    try {
      const doc = await Submission.create(initial);
      const obj = doc.toObject();
      return {
        ...obj,
        id: String(obj.id || obj._id),
        submissionId: String(obj.id || obj._id)
      };
    } catch (err) {
      console.error("[SubmissionStore] Submission.create DB error:", err);
    }
  }

  memorySubmissions.unshift(initial);
  return initial;
}

export async function updateSubmissionRecord(id, updates) {
  if (!id) return null;

  if (isDatabaseConnected() && mongoose.Types.ObjectId.isValid(String(id))) {
    try {
      const doc = await Submission.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (doc) {
        return { ...doc, id: String(doc._id), submissionId: String(doc._id) };
      }
    } catch (err) {}
  }

  const index = memorySubmissions.findIndex((s) => s.id === id || s._id === id || s.submissionId === id);
  if (index !== -1) {
    memorySubmissions[index] = {
      ...memorySubmissions[index],
      ...updates
    };
    return memorySubmissions[index];
  }

  return null;
}

export async function listSubmissionRecords() {
  if (isDatabaseConnected()) {
    try {
      const docs = await Submission.find().sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d) => ({ ...d, id: String(d._id), submissionId: String(d._id) }));
      }
    } catch {}
  }

  return memorySubmissions;
}
