import { isDatabaseConnected } from "./db.js";
import { Submission } from "../models/Submission.js";
import mongoose from "mongoose";

const memorySubmissions = [];

export async function createSubmissionRecord(record) {
  const generatedId = record._id || record.id || new mongoose.Types.ObjectId().toString();
  const initial = {
    _id: generatedId,
    id: String(generatedId),
    submissionId: String(generatedId),
    status: record.status || "QUEUED",
    verdict: record.verdict || "PENDING",
    statusText: record.statusText || "Queued for evaluation",
    createdAt: record.createdAt || new Date(),
    ...record
  };

  if (isDatabaseConnected()) {
    try {
      const doc = await Submission.create(initial);
      const obj = doc.toObject();
      const formattedObj = {
        ...obj,
        id: String(obj._id),
        submissionId: String(obj._id)
      };
      memorySubmissions.unshift(formattedObj);
      return formattedObj;
    } catch (err) {
      // Fallback to memory below
    }
  }

  memorySubmissions.unshift(initial);
  return initial;
}

export async function updateSubmissionRecord(submissionId, updates) {
  const cleanId = String(submissionId).trim();
  if (isDatabaseConnected() && mongoose.Types.ObjectId.isValid(cleanId)) {
    try {
      await Submission.findByIdAndUpdate(cleanId, updates);
    } catch (err) {}
  }

  const idx = memorySubmissions.findIndex((s) => String(s.id || s._id) === cleanId);
  if (idx !== -1) {
    memorySubmissions[idx] = {
      ...memorySubmissions[idx],
      ...updates
    };
    return memorySubmissions[idx];
  }
  return null;
}

export async function listSubmissionRecords() {
  if (isDatabaseConnected()) {
    try {
      const docs = await Submission.find().sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((doc) => ({
          ...doc,
          id: String(doc._id),
          submissionId: String(doc._id)
        }));
      }
    } catch (err) {}
  }
  return memorySubmissions;
}
