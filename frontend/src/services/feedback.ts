import { api } from "./api";

export interface FeedbackEntry {
  user: string;
  message: string;
  feedback_type: string;
}

// For what the backend returns on GET /feedback/pending
export interface FeedbackPending extends FeedbackEntry {
  id: number;
  status: string;
  gpt_sentiment?: string;
  gpt_suggestion?: string;
  gpt_confidence?: number | string;
  [key: string]: unknown; // For any extra fields
}

// Submit feedback (returns status + id)
export async function submitFeedback(data: FeedbackEntry): Promise<{ status: string; id: number }> {
  const res = await api.post<{ status: string; id: number }>("/feedback/submit", data);
  return res.data;
}

// Get pending feedbacks (admin only; returns array)
export async function getPendingFeedback(): Promise<FeedbackPending[]> {
  const res = await api.get<FeedbackPending[]>("/feedback/pending");
  return res.data;
}

// (Optional) Analyze feedback using GPT
export async function analyzeFeedback(message: string, feedback_type: string): Promise<unknown> {
  const res = await api.post("/feedback/analyze", { message, feedback_type });
  return res.data.analysis;
}

// (Optional) Approve feedback by id (admin only)
export async function approveFeedback(id: number): Promise<{ status: string }> {
  const res = await api.post<{ status: string }>(`/feedback/approve/${id}`);
  return res.data;
}