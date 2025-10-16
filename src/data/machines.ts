export interface MachinePart {
  name: string;
  defaultMessage: string;
}

export interface CpapMachine {
  name: string;
  parts: MachinePart[];
}

export const cpapMachines: CpapMachine[] = [
  {
    name: "Philips Respironics DreamStation",
    parts: [
      { name: "Disposable Filter", defaultMessage: "Replace disposable filter" },
      { name: "Reusable Filter", defaultMessage: "Clean reusable filter weekly" },
      { name: "Hose/Tubing", defaultMessage: "Clean hose and tubing weekly" },
      { name: "Mask (Full)", defaultMessage: "Clean full face mask daily" },
      { name: "Mask (Nasal)", defaultMessage: "Clean nasal mask daily" },
      { name: "Humidifier Chamber", defaultMessage: "Clean humidifier chamber weekly" },
    ],
  },
  {
    name: "ResMed AirSense 10",
    parts: [
      { name: "Air Filter", defaultMessage: "Replace air filter monthly" },
      { name: "Tubing", defaultMessage: "Clean tubing weekly" },
      { name: "Cushion", defaultMessage: "Replace nasal pillows/cushion monthly" },
      { name: "Water Tub", defaultMessage: "Clean water tub weekly" },
      { name: "Headgear", defaultMessage: "Replace headgear every 6 months" },
    ],
  },
  {
    name: "ResMed S9",
    parts: [
      { name: "Standard Filter", defaultMessage: "Replace standard filter monthly" },
      { name: "Hypoallergenic Filter", defaultMessage: "Replace hypoallergenic filter monthly" },
      { name: "Tubing", defaultMessage: "Clean tubing weekly" },
      { name: "Mask System", defaultMessage: "Clean mask system daily" },
      { name: "Water Chamber", defaultMessage: "Clean water chamber weekly" },
    ],
  },
  {
    name: "Fisher & Paykel SleepStyle",
    parts: [
        { name: "Air Filter", defaultMessage: "Replace air filter every 3 months" },
        { name: "Tube", defaultMessage: "Clean tube weekly" },
        { name: "Mask", defaultMessage: "Clean mask daily" },
        { name: "Water Chamber", defaultMessage: "Clean water chamber daily with distilled water" },
    ],
  },
  {
    name: "3B Medical Luna II",
    parts: [
        { name: "Filter", defaultMessage: "Replace filter monthly" },
        { name: "Tubing", defaultMessage: "Clean tubing weekly" },
        { name: "Mask", defaultMessage: "Clean mask daily" },
        { name: "Humidifier Chamber", defaultMessage: "Clean humidifier chamber weekly" },
    ],
  },
];