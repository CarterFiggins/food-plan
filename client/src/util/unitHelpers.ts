type Volume = "cup"  | "tsp" | "tbsp" | "fl_oz" | "pnt" | "qt" | "gal";
type Mass = "oz" | "lb";
type Package = "whole" | "can"
type Unit = Volume | Mass


const cupRatio = {
  gal: 16,
  qt: 4,
  pnt: 2,
  fl_oz: 0.125,
  tbsp: 0.0625,
  tsp: 0.0208333,
  cup: 1,
}

const ozRation = {
  lb: 16,
  oz: 1,
}

export const units = [
  // package
  "whole",
  "can",
  // volume
  "cup",
  "fl_oz",
  "gal",
  "pnt",
  "qt",
  "tbsp",
  "tsp",
  // mass
  "lb",
  "oz",
];

export function convertUnit(amount: number, from: string, to: string) { 
  const mass = ["oz", "lb"];
  const volume = ["cup", "fl_oz", "gal", "pnt", "qt", "tbsp", "tsp"];
  const size = ["whole", "can"];

  if (mass.includes(from) && mass.includes(to)) {
    return convertMassUnits(amount, from, to)
  } else if (volume.includes(from) && volume.includes(to)) {
    return convertVolumeUnits(amount, from, to)
  }

  return null
}

function convertVolumeUnits(amount: number, from: string, to: string) {
  const amountInCups = Math.round(amount / cupRatio[from as Volume]);
  const convertedAmount = amountInCups * cupRatio[to as Volume];
  return convertedAmount;
}

function convertMassUnits(amount: number, from: string, to: string) {
  const amountInOz = Math.round(amount / ozRation[from as Mass]);
  const convertedAmount = amountInOz * ozRation[to as Mass];
  return convertedAmount;
}
