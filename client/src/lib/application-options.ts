// Suggestions for the application form. Names match the CRM reference (prisma/seed.ts in
// AuraSeaCrewing/CRM-Aura-Sea) so they map to ranks and vessel types without manual fixing.

export const RANKS = [
  "Master", "Chief Officer", "2nd Officer", "3rd Officer", "Junior Officer", "Deck Cadet", "Bosun",
  "Able Seaman", "Ordinary Seaman", "Pumpman", "Carpenter", "Crane Operator", "DP Officer", "Safety Officer",
  "Chief Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer", "Junior Engineer", "Single Engineer",
  "Gas Engineer", "Electro-Technical Officer", "Electrical Engineer", "Electrical Assistant", "Electrician",
  "Refrigeration Engineer", "Engine Cadet", "Electrical Cadet", "Motorman", "Fitter", "Wiper", "Storekeeper",
  "Cook", "2nd Cook", "AB/Cook", "OS/Cook", "Messman", "Steward", "Yacht Master", "Staff Captain",
  "Medical Officer", "Radio Officer",
];

export const VESSEL_TYPES = [
  "Bulk carrier", "Container ship", "General cargo", "Multipurpose", "Project cargo", "Ro-Ro", "Car carrier",
  "Reefer", "Oil tanker", "Chemical tanker", "Oil/Chemical tanker", "LPG carrier", "LNG carrier",
  "Offshore vessel", "Tug", "Passenger vessel", "Cruise ship", "FPSO / FSO", "Drillship", "Jack-up rig",
  "Offshore construction vessel", "Dredger", "Research / survey vessel", "Livestock carrier", "Fishing vessel",
  "Barge", "Yacht",
];

export const CERTIFICATES = [
  "Certificate of Competency (CoC)", "Endorsement", "Basic Safety Training", "Proficiency in Survival Craft",
  "Advanced Fire Fighting", "Medical First Aid", "Medical Care", "Ship Security Officer",
  "Security Awareness", "Designated Security Duties", "GMDSS GOC", "ECDIS", "Bridge Resource Management",
  "Engine Resource Management", "High Voltage", "Basic Oil and Chemical Tanker Cargo Operations",
  "Advanced Oil Tanker Cargo Operations", "Advanced Chemical Tanker Cargo Operations",
  "Basic Liquefied Gas Tanker Cargo Operations", "Advanced Liquefied Gas Tanker Cargo Operations",
  "Fast Rescue Boats", "Ship Handling", "Radar / ARPA", "Medical Certificate", "Yellow Fever Vaccination",
  "COVID-19 Vaccination", "Drug and Alcohol Test",
];

/** value goes to the CRM in English; uk — label on the Ukrainian page. */
export const ENGLISH_LEVELS = [
  { value: "Elementary", uk: "Elementary — початковий" },
  { value: "Pre-Intermediate", uk: "Pre-Intermediate — нижче середнього" },
  { value: "Intermediate", uk: "Intermediate — середній" },
  { value: "Upper-Intermediate", uk: "Upper-Intermediate — вище середнього" },
  { value: "Advanced", uk: "Advanced — просунутий" },
  { value: "Fluent", uk: "Fluent — вільно" },
];

export const EMPLOYMENT_STATUSES = [
  { value: "Looking for a job", uk: "Шукаю роботу" },
  { value: "On vacation", uk: "У відпустці" },
  { value: "On board", uk: "На борту" },
];

export const DOCUMENT_TYPES = [
  { value: "PASSPORT", label: "International passport", uk: "Закордонний паспорт" },
  { value: "SEAMANS_BOOK", label: "Seaman’s book", uk: "Мореплавна книжка (Seaman’s book)" },
  { value: "INTERNAL_PASSPORT", label: "National ID / internal passport", uk: "Внутрішній паспорт / ID-картка" },
  { value: "VISA", label: "Visa", uk: "Віза" },
  { value: "OTHER", label: "Other document", uk: "Інший документ" },
] as const;
