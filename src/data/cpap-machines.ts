export const cpapMachines = [
  {
    value: "resmed-airsense-11",
    label: "ResMed AirSense 11",
    parts: [
      { value: "filter", label: "Filter", image_url: "/placeholder.svg", models: [{ value: "standard-filter", label: "Standard Filter (30-day)", reorder_info: "ResMed SKU 37301" }] },
      { value: "tubing", label: "Tubing", image_url: "/placeholder.svg", models: [{ value: "heated-tubing", label: "ClimateLineAir 11 Heated Tubing", reorder_info: "ResMed SKU 39102" }, { value: "standard-tubing", label: "Standard Tubing", reorder_info: "ResMed SKU 37342" }] },
      { value: "water-chamber", label: "Water Chamber", image_url: "/placeholder.svg", models: [{ value: "standard-chamber", label: "Standard Water Chamber", reorder_info: "ResMed SKU 37300" }] },
      { 
        value: "mask-cushion", 
        label: "Mask Cushion/Pillow", 
        image_url: "/placeholder.svg",
        models: [
          { value: "f30i-cushion", label: "AirFit F30i Full Face Cushion", reorder_info: "ResMed SKU 63330" },
          { value: "n30i-cushion", label: "AirFit N30i Nasal Cushion", reorder_info: "ResMed SKU 63800" },
          { value: "p30i-pillow", label: "AirFit P30i Nasal Pillow", reorder_info: "ResMed SKU 63700" },
        ] 
      },
      { value: "mask-frame", label: "Mask Frame", image_url: "/placeholder.svg", models: [{ value: "f30i-frame", label: "AirFit F30i Frame", reorder_info: "ResMed SKU 63331" }, { value: "n30i-frame", label: "AirFit N30i Frame", reorder_info: "ResMed SKU 63801" }] },
      { value: "headgear", label: "Headgear", image_url: "/placeholder.svg", models: [{ value: "f30i-headgear", label: "AirFit F30i Headgear", reorder_info: "ResMed SKU 63332" }, { value: "n30i-headgear", label: "AirFit N30i Headgear", reorder_info: "ResMed SKU 63802" }] },
    ],
  },
  {
    value: "philips-dreamstation-2",
    label: "Philips Respironics DreamStation 2",
    parts: [
      { value: "disposable-filter", label: "Disposable Filter", image_url: "/placeholder.svg", models: [{ value: "ds2-disposable-filter", label: "Disposable Filter", reorder_info: "Philips SKU 1122384" }] },
      { value: "reusable-filter", label: "Reusable Filter", image_url: "/placeholder.svg", models: [{ value: "ds2-reusable-filter", label: "Reusable Filter", reorder_info: "Philips SKU 1122385" }] },
      { value: "tubing", label: "Tubing", image_url: "/placeholder.svg", models: [{ value: "ds2-heated-tubing", label: "Heated Tubing", reorder_info: "Philips SKU 1122184" }, { value: "ds2-standard-tubing", label: "Standard Tubing", reorder_info: "Philips SKU 1122185" }] },
      { value: "water-tank", label: "Water Tank", image_url: "/placeholder.svg", models: [{ value: "ds2-water-tank", label: "Water Tank", reorder_info: "Philips SKU 1122186" }] },
      { 
        value: "mask-cushion", 
        label: "Mask Cushion/Pillow", 
        image_url: "/placeholder.svg",
        models: [
          { value: "f20-cushion", label: "DreamWear Full Face Cushion", reorder_info: "Philips SKU 1133456" },
          { value: "n20-cushion", label: "DreamWear Nasal Cushion", reorder_info: "Philips SKU 1133457" },
        ] 
      },
      { value: "headgear", label: "Headgear", image_url: "/placeholder.svg", models: [{ value: "dreamwear-headgear", label: "DreamWear Headgear", reorder_info: "Philips SKU 1133458" }] },
    ],
  },
  {
    value: "resmed-airmini",
    label: "ResMed AirMini",
    parts: [
      { value: "filter", label: "Filter", image_url: "/placeholder.svg", models: [{ value: "airmini-filter", label: "AirMini Filter", reorder_info: "ResMed SKU 38801" }] },
      { value: "humidx", label: "HumidX Cartridge", image_url: "/placeholder.svg", models: [{ value: "humidx-standard", label: "HumidX Standard (30-day)", reorder_info: "ResMed SKU 38802" }, { value: "humidx-plus", label: "HumidX Plus (30-day)", reorder_info: "ResMed SKU 38803" }] },
      { value: "tubing", label: "Tubing", image_url: "/placeholder.svg", models: [{ value: "airmini-tubing", label: "AirMini Tubing", reorder_info: "ResMed SKU 38804" }] },
      { value: "mask-connector", label: "Mask Connector", image_url: "/placeholder.svg", models: [{ value: "airmini-connector", label: "AirMini Connector", reorder_info: "ResMed SKU 38805" }] },
    ],
  },
  {
    value: "breas-z2-auto",
    label: "Breas Z2 Auto Travel CPAP",
    parts: [
      { value: "filter", label: "Filter", image_url: "/placeholder.svg", models: [{ value: "z2-filter", label: "Z2 Filter (30-day)", reorder_info: "Breas SKU 100500" }] },
      { value: "hme-cartridge", label: "HME Cartridge", image_url: "/placeholder.svg", models: [{ value: "z2-hme", label: "HME Cartridge (7-day)", reorder_info: "Breas SKU 100501" }] },
      { value: "tubing-adapter", label: "Tubing Adapter", image_url: "/placeholder.svg", models: [{ value: "z2-adapter", label: "Tubing Adapter", reorder_info: "Breas SKU 100502" }] },
      { value: "tubing", label: "Tubing", image_url: "/placeholder.svg", models: [{ value: "z2-tubing", label: "Z2 Standard Tubing", reorder_info: "Breas SKU 100503" }] },
    ],
  },
  {
    value: "fisher-paykel-sleepstyle",
    label: "Fisher & Paykel SleepStyle",
    parts: [
      { value: "filter", label: "Filter", image_url: "/placeholder.svg", models: [{ value: "fp-filter", label: "SleepStyle Filter (30-day)", reorder_info: "F&P SKU 900SS101" }] },
      { value: "water-chamber", label: "Water Chamber", image_url: "/placeholder.svg", models: [{ value: "fp-chamber", label: "SleepStyle Water Chamber", reorder_info: "F&P SKU 900SS102" }] },
      { value: "tubing", label: "Tubing", image_url: "/placeholder.svg", models: [{ value: "fp-tubing", label: "SleepStyle Heated Tubing", reorder_info: "F&P SKU 900SS103" }] },
      { value: "chamber-seal", label: "Chamber Seal", image_url: "/placeholder.svg", models: [{ value: "fp-seal", label: "Chamber Seal", reorder_info: "F&P SKU 900SS104" }] },
      { value: "mask-cushion", label: "Mask Cushion/Pillow", image_url: "/placeholder.svg", models: [{ value: "easi-cushion", label: "EasiLife Nasal Cushion", reorder_info: "F&P SKU 400EAS101" }] },
    ],
  },
  {
    value: "3b-medical-luna-ii",
    label: "3B Medical Luna II",
    parts: [
      { value: "filter", label: "Filter", image_url: "/placeholder.svg", models: [{ value: "luna-filter", label: "Luna II Filter (30-day)", reorder_info: "3B SKU 10001" }] },
      { value: "tubing", label: "Tubing", image_url: "/placeholder.svg", models: [{ value: "luna-tubing", label: "Luna II Heated Tubing", reorder_info: "3B SKU 10002" }] },
      { value: "water-chamber", label: "Water Chamber", image_url: "/placeholder.svg", models: [{ value: "luna-chamber", label: "Luna II Water Chamber", reorder_info: "3B SKU 10003" }] },
      { value: "mask-cushion", label: "Mask Cushion/Pillow", image_url: "/placeholder.svg", models: [{ value: "luna-mask-cushion", label: "Luna II Full Face Cushion", reorder_info: "3B SKU 10004" }] },
    ],
  },
  {
    value: "resmed-airsense-10",
    label: "ResMed AirSense 10",
    parts: [
      { value: "filter", label: "Filter", image_url: "/placeholder.svg", models: [{ value: "standard-filter-10", label: "Standard Filter (30-day)", reorder_info: "ResMed SKU 37291" }] },
      { value: "tubing", label: "Tubing", image_url: "/placeholder.svg", models: [{ value: "heated-tubing-10", label: "ClimateLineAir Heated Tubing", reorder_info: "ResMed SKU 37296" }, { value: "standard-tubing-10", label: "Standard Tubing", reorder_info: "ResMed SKU 37297" }] },
      { value: "water-chamber", label: "Water Chamber", image_url: "/placeholder.svg", models: [{ value: "standard-chamber-10", label: "Standard Water Chamber", reorder_info: "ResMed SKU 37299" }] },
      { 
        value: "mask-cushion", 
        label: "Mask Cushion/Pillow", 
        image_url: "/placeholder.svg",
        models: [
          { value: "f20-cushion-10", label: "AirFit F20 Full Face Cushion", reorder_info: "ResMed SKU 63400" },
          { value: "n20-cushion-10", label: "AirFit N20 Nasal Cushion", reorder_info: "ResMed SKU 63500" },
        ] 
      },
      { value: "headgear", label: "Headgear", image_url: "/placeholder.svg", models: [{ value: "f20-headgear-10", label: "AirFit F20 Headgear", reorder_info: "ResMed SKU 63401" }] },
    ],
  },
  {
    value: "philips-dreamstation",
    label: "Philips Respironics DreamStation",
    parts: [
      { value: "disposable-filter", label: "Disposable Filter", image_url: "/placeholder.svg", models: [{ value: "ds-disposable-filter", label: "Disposable Filter (30-day)", reorder_info: "Philips SKU 1035484" }] },
      { value: "reusable-filter", label: "Reusable Filter", image_url: "/placeholder.svg", models: [{ value: "ds-reusable-filter", label: "Reusable Filter (90-day)", reorder_info: "Philips SKU 1035485" }] },
      { value: "tubing", label: "Tubing", image_url: "/placeholder.svg", models: [{ value: "ds-heated-tubing", label: "Heated Tubing", reorder_info: "Philips SKU 1035486" }, { value: "ds-standard-tubing", label: "Standard Tubing", reorder_info: "Philips SKU 1035487" }] },
      { value: "water-tank", label: "Water Tank", image_url: "/placeholder.svg", models: [{ value: "ds-water-tank", label: "Water Tank", reorder_info: "Philips SKU 1035488" }] },
      { value: "mask-cushion", label: "Mask Cushion/Pillow", image_url: "/placeholder.svg", models: [{ value: "dreamwear-cushion", label: "DreamWear Nasal Cushion", reorder_info: "Philips SKU 1116748" }] },
    ],
  },
];