import React, { useState, useEffect, useRef } from 'react';

/**
 * InstructionSteps — Step-by-step instruction pipeline with interactive timers.
 *
 * Parses instruction text for time references and auto-injects countdown timer chips.
 * Each step is rendered as a numbered card with connected timeline.
 */

// Regex to extract time references from step descriptions
const TIME_REGEX = /(\d+)\s*(minutes?|mins?|seconds?|secs?|hours?|hrs?)/gi;

function parseTimeReferences(text) {
  const matches = [];
  let match;
  while ((match = TIME_REGEX.exec(text)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    let seconds = value;
    if (unit.startsWith('min')) seconds = value * 60;
    else if (unit.startsWith('hour') || unit.startsWith('hr')) seconds = value * 3600;
    matches.push({ value, unit: match[2], seconds, label: `${value} ${match[2]}` });
  }
  return matches;
}

function formatCountdown(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const CountdownChip = ({ seconds, label }) => {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleToggle = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      if (remaining <= 0) setRemaining(seconds);
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIsRunning(true);
    }
  };

  const handleReset = (e) => {
    e.stopPropagation();
    clearInterval(intervalRef.current);
    setRemaining(seconds);
    setIsRunning(false);
  };

  const isDone = remaining === 0 && !isRunning;

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer mt-2 border min-h-[36px] ${
        isDone
          ? 'bg-success-surface border-success-border text-brand-strong'
          : isRunning
            ? 'bg-tertiary-container/20 border-tertiary/30 text-tertiary animate-pulse'
            : 'bg-surface-container-low border-border-subtle text-text-body hover:border-brand-strong'
      }`}
      title={isRunning ? 'Pause timer' : isDone ? 'Timer complete — click to restart' : 'Start timer'}
    >
      <span className="material-symbols-outlined text-[16px]">
        {isDone ? 'check_circle' : isRunning ? 'pause_circle' : 'timer'}
      </span>
      <span>{isDone ? 'Done!' : isRunning ? formatCountdown(remaining) : label}</span>
      {(isRunning || isDone) && (
        <span
          onClick={handleReset}
          className="material-symbols-outlined text-[14px] opacity-60 hover:opacity-100"
          title="Reset"
        >
          replay
        </span>
      )}
    </button>
  );
};

export const InstructionSteps = ({ steps = [] }) => {
  return (
    <div className="bg-card rounded-card p-4 md:p-6 border border-border-subtle shadow-card space-y-4 font-sans" id="recipe-steps">
      <h3 className="text-sm md:text-base font-bold text-text-strong border-b border-border-subtle/50 pb-3 flex items-center gap-2 uppercase tracking-wider">
        <span className="material-symbols-outlined text-brand-strong text-xl">menu_book</span>
        Preparation Steps
      </h3>

      <div className="space-y-0 mt-4">
        {steps.map((step, idx) => {
          const timeRefs = parseTimeReferences(step?.description || '');

          return (
            <div key={idx} className="flex gap-4 group">
              {/* Timeline connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-brand-strong text-text-inverse flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-xs">
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-[2px] flex-grow bg-border-subtle group-hover:bg-brand-strong/30 transition-colors my-1.5" />
                )}
              </div>

              {/* Step content card */}
              <div className="pb-6 flex-1 min-w-0">
                <h4 className="font-label-md text-xs font-bold text-brand-strong uppercase tracking-widest mb-1.5">
                  {step?.title || `Step ${idx + 1}`}
                </h4>
                <p className="text-sm text-text-body leading-relaxed font-medium">
                  {step?.description}
                </p>

                {/* Timer chips */}
                <div className="flex flex-wrap gap-2">
                  {step?.timer && (
                    <CountdownChip seconds={step.timer * 60} label={`${step.timer} mins`} />
                  )}
                  {timeRefs.length > 0 && !step?.timer && timeRefs.map((ref, i) => (
                    <CountdownChip key={i} seconds={ref.seconds} label={ref.label} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstructionSteps;
