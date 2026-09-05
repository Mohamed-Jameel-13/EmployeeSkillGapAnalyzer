import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getSkillGap } from "../api/skillGap";
import { getRecommendations } from "../api/recommendations";

const AnalysisContext = createContext(null);

const STORAGE_KEYS = {
  STUDENT_ID: "skillbridge_selected_student_id",
  JOB_ID: "skillbridge_selected_job_id",
  GAP_CACHE: "skillbridge_gap_data_cache",
  RECS_CACHE: "skillbridge_recs_cache",
  MATCH_SCORES: "skillbridge_match_scores"
};

function safeGetStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("LocalStorage set error for key:", key, e);
  }
}

export function AnalysisProvider({ children }) {
  const { user } = useAuth();

  // 1. Selected Student ID (persisted)
  const [selectedStudentId, setSelectedStudentIdState] = useState(() => {
    const saved = safeGetStorage(STORAGE_KEYS.STUDENT_ID, null);
    if (saved) return parseInt(saved, 10);
    return user?.id || 101;
  });

  // 2. Selected Job ID (persisted)
  const [selectedJobId, setSelectedJobIdState] = useState(() => {
    const saved = safeGetStorage(STORAGE_KEYS.JOB_ID, null);
    if (saved) return parseInt(saved, 10);
    return 501;
  });

  // 3. Cache maps
  const [gapDataMap, setGapDataMap] = useState(() => safeGetStorage(STORAGE_KEYS.GAP_CACHE, {}));
  const [recsMap, setRecsMap] = useState(() => safeGetStorage(STORAGE_KEYS.RECS_CACHE, {}));
  const [matchScoresMap, setMatchScoresMap] = useState(() => safeGetStorage(STORAGE_KEYS.MATCH_SCORES, {}));

  // Update selected student when user changes if not manually set
  useEffect(() => {
    if (user?.id && (!selectedStudentId || user.role !== "ADMIN")) {
      setSelectedStudentIdState(user.id);
      safeSetStorage(STORAGE_KEYS.STUDENT_ID, user.id);
    }
  }, [user]);

  const setSelectedStudentId = useCallback((id) => {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed)) {
      setSelectedStudentIdState(parsed);
      safeSetStorage(STORAGE_KEYS.STUDENT_ID, parsed);
    }
  }, []);

  const setSelectedJobId = useCallback((id) => {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed)) {
      setSelectedJobIdState(parsed);
      safeSetStorage(STORAGE_KEYS.JOB_ID, parsed);
    }
  }, []);

  // Cache updater helpers
  const saveGapResult = useCallback((studentId, jobId, data) => {
    const key = `${studentId}_${jobId}`;
    const score = data?.overallMatchPercent ?? data?.overallMatch ?? 0;

    setGapDataMap((prev) => {
      const next = { ...prev, [key]: data };
      safeSetStorage(STORAGE_KEYS.GAP_CACHE, next);
      return next;
    });

    setMatchScoresMap((prev) => {
      const next = { ...prev, [key]: score };
      safeSetStorage(STORAGE_KEYS.MATCH_SCORES, next);
      return next;
    });
  }, []);

  const saveRecsResult = useCallback((studentId, jobId, recs) => {
    const key = `${studentId}_${jobId}`;
    setRecsMap((prev) => {
      const next = { ...prev, [key]: recs };
      safeSetStorage(STORAGE_KEYS.RECS_CACHE, next);
      return next;
    });
  }, []);

  // Fetch or retrieve Skill Gap Data with instant cache return
  const fetchGapAnalysis = useCallback(async (studentId, jobId, forceRefresh = false) => {
    const sId = parseInt(studentId, 10);
    const jId = parseInt(jobId, 10);
    if (!sId || !jId) return null;

    const key = `${sId}_${jId}`;
    const cached = gapDataMap[key];

    // If we have cached data and not forcing refresh, we can return cache immediately
    if (cached && !forceRefresh) {
      // Background revalidation
      getSkillGap(sId, jId)
        .then((fresh) => {
          if (fresh) saveGapResult(sId, jId, fresh);
        })
        .catch((err) => {
          console.warn("Background gap revalidation error:", err);
        });
      return cached;
    }

    // Otherwise fetch fresh from REST API
    try {
      const result = await getSkillGap(sId, jId);
      if (result) {
        saveGapResult(sId, jId, result);
      }
      return result;
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  }, [gapDataMap, saveGapResult]);

  // Fetch or retrieve Recommendations with instant cache return
  const fetchRecommendationsData = useCallback(async (studentId, jobId, forceRefresh = false) => {
    const sId = parseInt(studentId, 10);
    const jId = parseInt(jobId, 10);
    if (!sId || !jId) return [];

    const key = `${sId}_${jId}`;
    const cached = recsMap[key];

    if (cached && !forceRefresh) {
      getRecommendations(sId, jId)
        .then((fresh) => {
          if (Array.isArray(fresh)) saveRecsResult(sId, jId, fresh);
        })
        .catch(() => {});
      return cached;
    }

    try {
      const result = await getRecommendations(sId, jId);
      const recs = Array.isArray(result) ? result : [];
      saveRecsResult(sId, jId, recs);
      return recs;
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  }, [recsMap, saveRecsResult]);

  // Quick lookup for match score
  const getMatchScore = useCallback((studentId, jobId) => {
    const sId = parseInt(studentId, 10);
    const jId = parseInt(jobId, 10);
    const key = `${sId}_${jId}`;
    if (matchScoresMap[key] !== undefined) {
      return matchScoresMap[key];
    }
    if (gapDataMap[key]?.overallMatchPercent !== undefined) {
      return gapDataMap[key].overallMatchPercent;
    }
    return null;
  }, [matchScoresMap, gapDataMap]);

  // Batch preload match scores for all open jobs for a student
  const preloadJobMatches = useCallback(async (studentId, jobs = []) => {
    const sId = parseInt(studentId, 10);
    if (!sId || !Array.isArray(jobs) || jobs.length === 0) return;

    const uncachedJobs = jobs.filter((j) => {
      const key = `${sId}_${j.id}`;
      return matchScoresMap[key] === undefined;
    });

    if (uncachedJobs.length === 0) return;

    // Fetch in parallel for uncached jobs
    await Promise.allSettled(
      uncachedJobs.map(async (j) => {
        try {
          const res = await getSkillGap(sId, j.id);
          if (res) {
            saveGapResult(sId, j.id, res);
          }
        } catch (e) {
          // ignore individual job errors
        }
      })
    );
  }, [matchScoresMap, saveGapResult]);

  // Invalidate cache when candidate skills change
  const invalidateStudentCache = useCallback((studentId) => {
    const sId = parseInt(studentId, 10);
    const prefix = `${sId}_`;

    setGapDataMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(prefix)) delete next[k];
      });
      safeSetStorage(STORAGE_KEYS.GAP_CACHE, next);
      return next;
    });

    setRecsMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(prefix)) delete next[k];
      });
      safeSetStorage(STORAGE_KEYS.RECS_CACHE, next);
      return next;
    });

    setMatchScoresMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(prefix)) delete next[k];
      });
      safeSetStorage(STORAGE_KEYS.MATCH_SCORES, next);
      return next;
    });
  }, []);

  return (
    <AnalysisContext.Provider
      value={{
        selectedStudentId,
        setSelectedStudentId,
        selectedJobId,
        setSelectedJobId,
        gapDataMap,
        recsMap,
        matchScoresMap,
        fetchGapAnalysis,
        fetchRecommendationsData,
        getMatchScore,
        preloadJobMatches,
        invalidateStudentCache
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext);
  if (!ctx) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return ctx;
};
