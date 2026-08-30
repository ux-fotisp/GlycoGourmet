import React, { useState, useEffect, useRef } from 'react';

/**
 * StepTimer — In-step interactive culinary countdown timer with audio chime & amber alert state.
 */
export const StepTimer = ({ durationMinutes = 5, stepId = 'step', label }) => {
  const totalSeconds = Math.max(1, Math.round(durationMinutes * 60));
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsFinished(true);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const playChime = () => {
    try {
      // Synthesize audio tone using Web Audio API
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2); // A5
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('[StepTimer] Web Audio not available', e);
    }

    // Attempt browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('⏱️ Step Timer Complete!', {
        body: `${label || 'Culinary step'} timer has finished (${durationMinutes}m).`,
      });
    }
  };

  const toggleRun = () => {
    if (isFinished) {
      setTimeLeft(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  const resetTimer = (e) => {
    e.stopPropagation();
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(totalSeconds);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (isFinished) {
    return (
      <div className="inline-flex items-center gap-2 bg-amber-bg border-2 border-amber-text text-amber-text px-4 py-2 rounded-full font-bold text-xs shadow-md animate-pulse">
        <span className="material-symbols-outlined text-[18px]">alarm_on</span>
        <span>Time's Up! (00:00)</span>
        <button
          type="button"
          onClick={resetTimer}
          className="ml-1 underline hover:opacity-80 text-[11px]"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-sage-bg border border-sage-text/30 text-sage-text px-3.5 py-1.5 rounded-full font-extrabold text-xs shadow-2xs">
      <button
        type="button"
        onClick={toggleRun}
        className="flex items-center gap-1.5 hover:opacity-80 cursor-pointer"
        aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
      >
        <span className="material-symbols-outlined text-[16px]">
          {isRunning ? 'pause_circle' : 'play_circle'}
        </span>
        <span>
          {isRunning ? formattedTime : `⏱️ Start ${durationMinutes}m Timer`}
        </span>
      </button>

      {isRunning && (
        <button
          type="button"
          onClick={resetTimer}
          title="Reset timer"
          className="p-0.5 hover:bg-sage-text/10 rounded-full flex items-center justify-center text-sage-text/80 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">restart_alt</span>
        </button>
      )}
    </div>
  );
};

export default StepTimer;
