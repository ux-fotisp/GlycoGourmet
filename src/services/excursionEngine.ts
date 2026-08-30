/**
 * src/services/excursionEngine.ts
 * Deterministic Clinical Glucose Excursion Modeling Engine
 */

export interface ExcursionDataPoint {
  time: number; // minutes from meal start (0, 15, 30, ... 120)
  predictedGlucose: number; // mg/dL
  baselineGlucose: number;
}

export interface ExcursionInput {
  glycemicLoad: number;
  glycemicIndex?: number;
  netCarbs?: number;
  calibration: {
    targetPreMealGlucose?: number;
    insulinSensitivityFactor?: number;
    carbToInsulinRatio?: number;
    bolusTimingOffset?: number;
    bolusOffsetMinutes?: number;
  };
}

/**
 * predictGlucoseExcursion
 * Deterministic postprandial 2-hour blood glucose trajectory calculation.
 */
export function predictGlucoseExcursion({
  glycemicLoad,
  glycemicIndex = 30,
  netCarbs = 20,
  calibration,
}: ExcursionInput): ExcursionDataPoint[] {
  const g0 = Math.max(50, Math.min(250, Number(calibration?.targetPreMealGlucose) || 100));
  const isf = Math.max(1, Number(calibration?.insulinSensitivityFactor) || 50);
  const cir = Math.max(1, Number(calibration?.carbToInsulinRatio) || 15);
  const bolusOffset = Math.max(0, Number(calibration?.bolusOffsetMinutes ?? calibration?.bolusTimingOffset) || 15);

  const effectiveGL = Math.max(0, Number(glycemicLoad) || 4);
  const effectiveGI = Math.max(10, Math.min(100, Number(glycemicIndex) || 30));
  const effectiveCarbs = Math.max(1, Number(netCarbs) || 18);

  // Bolus amount (Units)
  const bolusUnits = effectiveCarbs / cir;
  // Total potential glucose drop from bolus (mg/dL)
  const totalInsulinDrop = bolusUnits * isf;

  // Total potential glucose rise from carbohydrates (mg/dL)
  // Higher GI means faster, steeper spike; GL scales the total excursion magnitude
  const totalCarbRise = (effectiveGL * 4.5) + (effectiveCarbs * 1.2);

  // Peak appearance time in minutes (Low GI peak is slower/flatter ~65m; High GI is faster ~40m)
  const carbPeakTime = Math.max(35, Math.min(75, 75 - (effectiveGI - 25) * 0.6));
  const insulinPeakTime = 60; // Standard rapid-acting analog peak

  const dataPoints: ExcursionDataPoint[] = [];

  for (let t = 0; t <= 120; t += 15) {
    // 1. Carb Absorption Fraction (Log-logistic approximation)
    const carbZ = t / carbPeakTime;
    const carbFraction = Math.exp(1) * carbZ * Math.exp(-carbZ);
    const carbImpact = totalCarbRise * carbFraction;

    // 2. Insulin Action Fraction (shifted by pre-meal bolus offset)
    const insulinTime = t + bolusOffset;
    const insulinZ = Math.max(0, insulinTime) / insulinPeakTime;
    const insulinFraction = Math.exp(1) * insulinZ * Math.exp(-insulinZ);
    const insulinImpact = totalInsulinDrop * insulinFraction;

    // 3. Net Glucose at minute t
    const netDelta = carbImpact - insulinImpact;
    const predicted = Math.round(g0 + netDelta);
    const clampedGlucose = Math.max(50, Math.min(250, predicted));

    dataPoints.push({
      time: t,
      predictedGlucose: clampedGlucose,
      baselineGlucose: g0,
    });
  }

  return dataPoints;
}

export default {
  predictGlucoseExcursion,
};
