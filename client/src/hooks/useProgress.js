import { useState, useEffect } from 'react';
import { getProgress } from '../services/stats.service.js';

export const useProgress = () => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    getProgress().then(data => setProgress(data?.message ? null : data));
  }, []);

  return progress;
};
