import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { KEYS, DEFAULTS, appendCapped } from './storage.js';
import { KEY_CYCLE } from '../data/notes.js';

const Ctx = createContext(null);

export function AppStateProvider({ children }) {
  const [week, setWeek] = usePersistedState(KEYS.week, DEFAULTS[KEYS.week]);
  const [storedSettings, setSettings] = usePersistedState(KEYS.settings, DEFAULTS[KEYS.settings]);
  // merge so settings added in newer versions get defaults for existing users
  const settings = useMemo(() => ({ ...DEFAULTS[KEYS.settings], ...storedSettings }), [storedSettings]);
  const [storedMetroCfg, setMetroCfg] = usePersistedState(KEYS.metronome, DEFAULTS[KEYS.metronome]);
  const metroCfg = useMemo(() => ({ ...DEFAULTS[KEYS.metronome], ...storedMetroCfg }), [storedMetroCfg]);
  const [tasks, setTasks] = usePersistedState(KEYS.tasks, DEFAULTS[KEYS.tasks]);
  const [mastery, setMastery] = usePersistedState(KEYS.mastery, DEFAULTS[KEYS.mastery]);
  const [completedWeeks, setCompletedWeeks] = usePersistedState(KEYS.completedWeeks, DEFAULTS[KEYS.completedWeeks]);

  const track = settings.track;
  const currentKey = KEY_CYCLE[(week - 1) % KEY_CYCLE.length];
  const nextKey = KEY_CYCLE[week % KEY_CYCLE.length];
  const weekTasks = tasks[week] || {};

  const updateSettings = useCallback(
    (patch) => setSettings((s) => ({ ...s, ...patch })),
    [setSettings]
  );

  const toggleTask = useCallback(
    (taskId) =>
      setTasks((t) => {
        const wk = { ...(t[week] || {}) };
        wk[taskId] = !wk[taskId];
        return { ...t, [week]: wk };
      }),
    [setTasks, week]
  );

  const setTaskDone = useCallback(
    (taskId, done) =>
      setTasks((t) => ({ ...t, [week]: { ...(t[week] || {}), [taskId]: done } })),
    [setTasks, week]
  );

  const resetWeekTasks = useCallback(
    () => setTasks((t) => ({ ...t, [week]: {} })),
    [setTasks, week]
  );

  const toggleMastery = useCallback(
    (key, idx) =>
      setMastery((m) => ({
        ...m,
        [key]: { ...(m[key] || {}), [idx]: !(m[key] || {})[idx] },
      })),
    [setMastery]
  );

  const completeWeek = useCallback(() => {
    setCompletedWeeks((list) => [
      ...list,
      { week, key: currentKey, track, completedAt: new Date().toISOString() },
    ]);
    setWeek((w) => (w % KEY_CYCLE.length) + 1);
  }, [setCompletedWeeks, setWeek, week, currentKey, track]);

  const logHistory = useCallback((record) => appendCapped(KEYS.history, record), []);
  const logDrill = useCallback((entry) => appendCapped(KEYS.drillLog, entry), []);

  const value = useMemo(
    () => ({
      week,
      setWeek,
      track,
      settings,
      updateSettings,
      currentKey,
      nextKey,
      tasks,
      weekTasks,
      toggleTask,
      setTaskDone,
      resetWeekTasks,
      mastery,
      toggleMastery,
      completedWeeks,
      completeWeek,
      logHistory,
      logDrill,
      metroCfg,
      setMetroCfg,
    }),
    [week, setWeek, track, settings, updateSettings, currentKey, nextKey, tasks, weekTasks, toggleTask, setTaskDone, resetWeekTasks, mastery, toggleMastery, completedWeeks, completeWeek, logHistory, logDrill, metroCfg, setMetroCfg]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState outside provider');
  return ctx;
}
