import Cookies from "js-cookie";
import api from "./apiClient";
import axios from "axios";

const userId = () => Cookies.get("userId");

export const getDashboardStats = () =>
  api.get("/dashboard/stats", { headers: { userId: userId() } });

export const extractTextFromImage = (imageBase64, mimeType) =>
  axios.post("/api/extract-text", { imageBase64, mimeType });

export const saveSubject = (subject) =>
  api.post("/subject/create", subject, { headers: { userId: userId() } });

export const getSubjects = () =>
  api.get("/subject/getAll", { headers: { userId: userId() } });

export const updateSubject = (id, subject) =>
  api.put(`/subject/update/${id}`, subject, { headers: { userId: userId() } });

export const deleteSubject = (id) =>
  api.delete(`/subject/delete/${id}`);

export const saveChapter = (chapter, subjectId) =>
  api.post(`/chapter/create?subjectId=${subjectId}`, chapter, { headers: { userId: userId() } });

export const getChapterBySubject = (subjectId) =>
  api.get(`/chapter/subject/${subjectId}`);

export const updateChapter = (id, chapter) =>
  api.put(`/chapter/update/${id}`, chapter, { headers: { userId: userId() } });

export const deleteChapter = (id) =>
  api.delete(`/chapter/delete/${id}`, { headers: { userId: userId() } });

export const saveQuestion = (question) =>
  api.post("/question/create", question, { headers: { userId: userId() } });

export const getQuestionsByChapter = (chapterId) =>
  api.get(`/question/chapter/${chapterId}`);

export const deleteQuestion = (id) =>
  api.delete(`/question/delete/${id}`);
