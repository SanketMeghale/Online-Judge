import { connectDatabase, isDatabaseConnected } from "./db.js";
import { Submission } from "../models/Submission.js";
import mongoose from "mongoose";

const memorySubmissions = [];

export async function createSubmissionRecord(record) {
  await connectDatabase();
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
  await connectDatabase();

  if (isDatabaseConnected()) {
    try {
      const query = mongoose.Types.ObjectId.isValid(String(id))
        ? { $or: [{ _id: id }, { id: String(id) }, { submissionId: String(id) }] }
        : { $or: [{ id: String(id) }, { submissionId: String(id) }] };

      const doc = await Submission.findOneAndUpdate(query, updates, { new: true, upsert: true }).lean();
      if (doc) {
        return { ...doc, id: String(doc._id), submissionId: String(doc._id) };
      }
    } catch (err) {
      console.error("[SubmissionStore] Submission.update DB error:", err);
    }
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

export async function listSubmissionRecords(query = {}) {
  await connectDatabase();
  if (isDatabaseConnected()) {
    try {
      const docs = await Submission.find(query).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d) => ({ ...d, id: String(d._id), submissionId: String(d._id) }));
      }
    } catch (err) {}
  }

  return memorySubmissions;
}
