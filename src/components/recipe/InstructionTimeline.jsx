import React from 'react';

/**
 * InstructionTimeline - Step timeline with contextual thermal kinetic alerts.
 */
export const InstructionTimeline = ({ instructions = [] }) => {
  const defaultInstructions = [
    {
      step: 1,
      title: 'Fiber Preservation & Prep',
      text: 'Thoroughly wash and chop the broccoli florets into bite-sized pieces. Keep stems intact to maximize insoluble dietary fiber content.',
    },
    {
      step: 2,
      title: 'Controlled Flash Steaming',
      text: 'Steam the broccoli florets in a steamer basket over boiling water for exactly 3 to 4 minutes until crisp-tender. Promptly transfer to an ice bath to arrest starch gelatinization.',
      thermalWarning: 'Steaming increases GI from 30 -> 31 (x1.02 thermal multiplier)',
    },
    {
      step: 3,
      title: 'Protein Searing & Pan Assembly',
      text: 'Season the wild salmon fillet with sea salt and cracked black pepper. Sear in 1 tablespoon of extra virgin olive oil over medium-high heat for 4 minutes per side until reaching 145°F internal temperature.',
    },
    {
      step: 4,
      title: 'Emulsification & Plating',
      text: 'Whisk together diced avocado, remaining olive oil, lemon juice, and fresh herbs to create a creamy cold-pressed dressing. Toss with the steamed broccoli, edamame, and flaked salmon.',
    },
  ];

  const activeSteps = instructions && instructions.length > 0 ? instructions : defaultInstructions;

  return (
    <section className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200 shadow-xs space-y-6 font-sans text-[#1A2118]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sage-text text-[20px]">format_list_numbered</span>
          <h3 className="text-xs font-extrabold tracking-wider text-primary uppercase">
            Step-by-Step Culinary Instructions
          </h3>
        </div>
        <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
          {activeSteps.length} Steps
        </span>
      </div>

      {/* Step Timeline */}
      <div className="space-y-6 relative before:absolute before:top-4 before:bottom-4 before:left-[17px] before:w-0.5 before:bg-stone-200">
        {activeSteps.map((stepItem, idx) => {
          const stepNumber = stepItem.step || idx + 1;
          const stepText = typeof stepItem === 'string' ? stepItem : stepItem.text;
          const stepTitle = stepItem.title || `Step ${stepNumber}`;
          const thermalWarning = stepItem.thermalWarning;

          return (
            <div key={stepNumber} className="relative flex items-start gap-4 group">
              {/* Circular Numbered Step Node */}
              <div className="w-9 h-9 rounded-full bg-primary text-white font-display font-extrabold text-sm flex items-center justify-center shrink-0 border-2 border-white shadow-sm z-10">
                {stepNumber}
              </div>

              {/* Step Content Body */}
              <div className="flex-1 bg-[#F6F4EE] border border-stone-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">
                  {stepTitle}
                </h4>
                <p className="text-xs font-medium text-stone-700 leading-relaxed">
                  {stepText}
                </p>

                {/* Inline Thermal Warning Callout Alert */}
                {thermalWarning && (
                  <div className="mt-3 bg-amber-bg/70 border border-amber-text/20 rounded-xl p-3 flex items-center gap-2.5 text-amber-text">
                    <span className="material-symbols-outlined text-[18px] shrink-0">thermostat</span>
                    <p className="text-[11px] font-extrabold leading-snug">
                      Thermal Warning: Steaming increases GI from 30 &rarr; 31 (x1.02 thermal multiplier)
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InstructionTimeline;
