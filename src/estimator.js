/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */

// const Data = {
//   region: {
//     name: 'Africa',
//     avgAge: 19.7,
//     avgDailyIncomeInUSD: 5,
//     avgDailyIncomePopulation: 0.71
//   },
//   periodType: 'days',
//   timeToElapse: 58,
//   reportedCases: 674,
//   population: 66622705,
//   totalHospitalBeds: 14
// };
// 1380614

const covid19ImpactEstimator = (data) => {
  const { reportedCases, periodType, timeToElapse } = data;

  let period = timeToElapse;
  if (periodType === 'weeks') {
    period = timeToElapse * 7;
  } else if (periodType === 'months') {
    period = timeToElapse * 30;
  } else {
    period = timeToElapse;
  }

  const currentlyInfected = (cases) => ({
    impact: cases * 10,
    severe: cases * 50
  });
  const estimate = (i) => {
    const factor = Math.floor(period / 3);
    return {
      impact: Math.floor(i.impact * 2 ** factor),
      severe: Math.floor(i.severe * 2 ** factor)
    };
  };
  const hospitalSpace = (severed) => {
    const availbleSpace = Math.floor(0.35 * data.totalHospitalBeds);
    return {
      impact: availbleSpace - severed.impact,
      severe: availbleSpace - severed.severe
    };
  };
  const infected = currentlyInfected(reportedCases);
  const estimation = estimate(infected);
  const severeCases = {
    impact: estimation.impact * 0.15,
    severe: estimation.severe * 0.15
  };
  const hospital = hospitalSpace(severeCases);
  const inflight = (es) => {
    const { avgDailyIncomeInUSD, avgDailyIncomePopulation } = data.region;
    const { impact, severe } = es;
    const inflightImpact = (impact * avgDailyIncomeInUSD) / period;
    const inflightSevere = (severe * avgDailyIncomeInUSD) / period;

    return {
      impact: Math.floor(inflightImpact * avgDailyIncomePopulation),
      severe: Math.floor(inflightSevere * avgDailyIncomePopulation)
    };
  };
  const d = inflight(estimation);
  return {
    data,
    impact: {
      currentlyInfected: infected.impact,
      infectionsByRequestedTime: estimation.impact,
      severeCasesByRequestedTime: severeCases.impact,
      hospitalBedsByRequestedTime: hospital.impact,
      casesForICUByRequestedTime: 0.05 * estimation.impact,
      casesForVentilatorsByRequestedTime: 0.02 * estimation.impact,
      dollarsInFlight: d.impact
    },
    severeImpact: {
      currentlyInfected: infected.severe,
      infectionsByRequestedTime: estimation.severe,
      severeCasesByRequestedTime: severeCases.severe,
      hospitalBedsByRequestedTime: hospital.severe,
      casesForICUByRequestedTime: 0.05 * estimation.severe,
      casesForVentilatorsByRequestedTime: 0.02 * estimation.severe,
      dollarsInFlight: d.severe
    }
  };
};
// console.log(covid19ImpactEstimator(Data));
module.exports = covid19ImpactEstimator;
