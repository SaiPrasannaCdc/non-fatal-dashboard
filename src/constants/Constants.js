  
export const dataUrl = window.location.origin.includes('localhost') ? '/' : '/overdose-prevention/data-dashboards/sudors-dashboard/';

export const colorScale = {
    'Male': '#5C2E79',
    'Female': '#63A244',
    'Race': '#BBA1EA',
    'RaceAccent': '#5C2E79',
    'Month': '#325D7D',
    'Intervention': '#712177',
    'Combination': '#712177',
    'Opioids and stimulants': '#384766',
    'Opioids and no stimulants': '#7299B1',
    'Stimulants and no opioids': '#00695C',
    'Neither opioids nor stimulants': '#57A292',
    'All': '#325D7D',
    'Any opioids': '#1C1570',
    'Opioid': '#000C77',
    'Methamphetamine': '#9279B7',
    'Heroin': '#0E6F97',
    'Prescription opioids': '#3F9FAA',
    'Any stimulants': '#42286C',
    'Stimulant': '#42286C',
    'Cocaine': '#663795',
    'Illegally-made fentanyls': '#06298F',
    'Any non-opioid sedatives': '#7D2441',
    'Benzodiazepines': '#B83A5E',
    'AI/AN, non-Hispanic': '#1C1570',
    'Asian, non-Hispanic': '#06298F',
    'Black, non-Hispanic': '#0E6F97',
    'Hispanic': '#3F9FAA',
    'Multi-race, non-Hispanic': '#42286C',
    'NH/PI, non-Hispanic': '#663795',
    'White, non-Hispanic': '#9279B7',
    '15–24': '#0E6F97',
    '65+': '#B83A5E',
    '25–34': '#3F9FAA',
    '55–64': '#7D2441',
    '45–54': '#9279B7',
    '35–44': '#663795',
    '<15': '#1C1570',

    'Current treatment for substance use disorder(s)': '#325D7D',
    'Fatal drug use witnessed': '#000C77',
    'Evidence of a mental health diagnosis': '#A378E8',
    'Potential bystander present': '#0C6F96',
    'Prior overdose': '#325D7D',
    'Decedent was recently released from institutional setting': '#7C2441',

    'Potential bystander present': '#325D7D',
    'Bystander provided no overdose response': '#000C77',
    'Bystander was spatially separated from decedent': '#A378E8',
    'Bystander was unaware decedent was using substances': '#0C6F96',
    'Bystander did not recognize abnormalities': '#325D7D',
    'Bystander did not recognize abnormalities as an overdose': '#7C2441',
    'Bystander was using substances or alcohol': '#294891',
    'It was a public space and strangers did not intervene': '#B83A5E',

    'Prior overdose': '#325D7D',
    'Prior overdose within one month of death': '#000C77',
    'History of drug use': '#A378E8',
    'History of opioid use': '#0C6F96',
    'History of stimulant use': '#325D7D',
    'Recent return to use of opioids': '#7C2441',

    'Evidence of a mental health diagnosis': '#325D7D',
    'Ever treated for mental health or substance use disorder(s)': '#000C77',
    'History of suicide attempt, ideation, or self-harm': '#0C6F96',

    'Decedent was recently released from institutional setting': '#325D7D',
    'Overdose occurred in a house or apartment setting': '#000C77',
    'Overdose occurred where the decedent lived': '#A378E8',
    'Overdose occurred at a hotel/motel': '#0C6F96',
    'Decedent was experiencing homelessness or housing instability': '#325D7D',
    'Decedent was currently treated for pain': '#7C2441',

    'No pulse at first responder arrival': '#325D7D',
    'Naloxone administered': '#000C77',
    'Seen in emergency department': '#A378E8',
    'Admitted to hospital': '#0C6F96',

    'Evidence of ingestion': '#325D7D',
    'Evidence of injection': '#000C77',
    'Evidence of smoking': '#A378E8',
    'Evidence of snorting': '#0C6F96',
    'Evidence of other route of drug use': '#325D7D',
    'No information on route of drug use': '#7C2441',

    'Evidence of prescription drug use': '#325D7D',
    'Evidence of illegal drug use': '#000C77',
    'Evidence of counterfeit pill use': '#A378E8',

    'Ever treated for substance use disorder(s)': '#325D7D',
    'Prescribed medications for opioid use disorder': '#000C77',
    'Current treatment for mental health or substance use disorder(s)': '#A378E8'
};

export const colorScaleLighter = {
    'Male': '#e7d7e7',
    'Female': '#c0d7c8',
    'Race': '#BBA1EA',
    'RaceAccent': '#5C2E79',
    'Month': '#325D7D',
    'Intervention': '#712177',
    'Combination': '#712177',
    'Opioids and stimulants': '#dbe0ea', //rgb(219 224 234)
    'Opioids and no stimulants': '#d6e1e9',  //rgb(214, 225, 233),
    'Stimulants and no opioids': '#d7e5e4', //rgb(215, 229, 228),
    'Neither opioids nor stimulants': '#d4e2df',// rgb(212, 226, 223),
    'All': '#d1dfea', // rgb(209, 223, 234),
    'Any opioids': '#d3d6ea',// rgb(211, 214, 234),
    'Opioid': '#d3d6ea',// rgb(211, 214, 234),
    'Methamphetamine': '#e2dcea',// rgb(226, 220, 234),
    'Heroin': '#e1ecf1',// rgb(225, 236, 241),
    'Prescription opioids': '#dbedef', // rgb(219, 237, 239),
    'Any stimulants': '#e7d7e7',
    'Stimulant': '#e7d7e7',
    'Cocaine': '#e6deed', // rgb(230, 222, 237),
    'Illegally-made fentanyls': '#d8ddea',// rgb(216, 221, 234),
    'Any non-opioid sedatives': '#e4d9dd', // rgb(228, 217, 221),
    'Benzodiazepines': '#ead7dd', //rgb(234, 215, 221)
    'AI/AN, non-Hispanic': '#d1dfea',
    'Asian, non-Hispanic': '#d3d6ea',
    'Black, non-Hispanic': '#e2dcea',
    'Hispanic': '#e1ecf1',
    'Multi-race, non-Hispanic': '#d1dfea',
    'NH/PI, non-Hispanic': '#e4d9dd',
    'White, non-Hispanic': '#d8ddea',
    '15–24': '#d1dfea',
    '65+': '#d3d6ea',
    '25–34': '#e4d9dd',
    '55–64': '#e1ecf1',
    '45–54': '#dbedef',
    '35–44': '#e4d9dd',
    '<15': '#d8ddea'
};

export const colorScaleLighterClasses = {
    'Male': 'anystimulants-lighter',
    'Female': 'female-lighter',
    'Race': '#BBA1EA',
    'RaceAccent': '#5C2E79',
    'Month': '#325D7D',
    'Intervention': '#712177',
    'Combination': '#712177',
    'Opioids and stimulants': 'opioidsandstimulants-lighter', //rgb(219 224 234)
    'Opioids and no stimulants': 'opioidsandnostimulants-lighter',  //rgb(214, 225, 233),
    'Stimulants and no opioids': 'stimulantsandnoopioids-lighter' , //rgb(215, 229, 228),
    'Neither opioids nor stimulants': 'neitheropioidsnorstimulants-lighter',// rgb(212, 226, 223),
    'All': 'all-lighter', // rgb(209, 223, 234),
    'Any opioids': 'anyopioids-lighter',// rgb(211, 214, 234),
    'Opioid': 'opioid-lighter',// rgb(211, 214, 234),
    'Methamphetamine': 'methamphetamine-lighter',// rgb(226, 220, 234),
    'Heroin': 'heroin-lighter',// rgb(225, 236, 241),
    'Prescription opioids': 'prescriptionopioids-lighter', // rgb(219, 237, 239),
    'Any stimulants': 'anystimulants-lighter',
    'Stimulant': 'stimulant-lighter',
    'Cocaine': 'cocaine-ligher', // rgb(230, 222, 237),
    'Illegally-made fentanyls': 'illegally-made-fentanyls-lighter',// rgb(216, 221, 234),
    'Any non-opioid sedatives': 'any-non-opioid-sedatives-lighter', // rgb(228, 217, 221),
    'Benzodiazepines': 'benzodiazepines-lighter', //rgb(234, 215, 221)
    'AI/AN, non-Hispanic': 'all-lighter',
    'Asian, non-Hispanic': 'anyopioids-lighter',
    'Black, non-Hispanic': 'methamphetamine-lighter',
    'Hispanic': 'heroin-lighter',
    'Multi-race, non-Hispanic': 'all-lighter',
    'NH/PI, non-Hispanic': 'any-non-opioid-sedatives-lighter',
    'White, non-Hispanic': 'illegally-made-fentanyls-lighter',
    '15–24': 'all-lighter',
    '65+': 'anyopioids-lighter',
    '25–34': 'anystimulants-lighter',
    '55–64': 'heroin-lighter',
    '45–54': 'prescriptionopioids-lighter',
    '35–44': 'any-non-opioid-sedatives-lighter',
    '<15': 'illegally-made-fentanyls-lighter'
};

export const ageMapping = {
    '0': '<15',
    '1': '15–24',
    '2': '25–34',
    '3': '35–44',
    '4': '45–54',
    '5': '55–64',
    '6': '65+'
};

export const raceMapping = {
    'AI/AN, non-Hispanic': 'American Indian/Alaska Native, non-Hispanic ',
    'NH/PI, non-Hispanic': 'Native Hawaiian/Pacific Islander, non-Hispanic'
}

export const monthLabelOverrides = {
    '0': '    January–March',
    '1': '    April–June',
    '2': '    July–September',
    '3': '    October–December'
};
export const statesMappingByGeo = {
    // States
    'US-AL': ['Alabama', 'AL'],
    'US-AK': ['Alaska', 'AK'],
    'US-AZ': ['Arizona', 'AZ'],
    'US-AR': ['Arkansas', 'AR'],
    'US-CA': ['California', 'CA'],
    'US-CO': ['Colorado', 'CO'],
    'US-CT': ['Connecticut', 'CT'],
    'US-DE': ['Delaware', 'DE'],
    'US-DC': ['District of Columbia', 'DC'],
    'US-FL': ['Florida', 'FL'],
    'US-GA': ['Georgia', 'GA'],
    'US-HI': ['Hawaii', 'HI'],
    'US-ID': ['Idaho', 'ID'],
    'US-IL': ['Illinois', 'IL'],
    'US-IN': ['Indiana', 'IN'],
    'US-IA': ['Iowa', 'IA'],
    'US-KS': ['Kansas', 'KS'],
    'US-KY': ['Kentucky', 'KY'],
    'US-LA': ['Louisiana', 'LA'],
    'US-ME': ['Maine', 'ME'],
    'US-MD': ['Maryland', 'MD'],
    'US-MA': ['Massachusetts', 'MA'],
    'US-MI': ['Michigan', 'MI'],
    'US-MN': ['Minnesota', 'MN'],
    'US-MS': ['Mississippi', 'MS'],
    'US-MO': ['Missouri', 'MO'],
    'US-MT': ['Montana', 'MT'],
    'US-NE': ['Nebraska', 'NE'],
    'US-NV': ['Nevada', 'NV'],
    'US-NH': ['New Hampshire', 'NH'],
    'US-NJ': ['New Jersey', 'NJ'],
    'US-NM': ['New Mexico', 'NM'],
    'US-NY': ['New York', 'NY'],
    'US-NC': ['North Carolina', 'NC'],
    'US-ND': ['North Dakota', 'ND'],
    'US-OH': ['Ohio', 'OH'],
    'US-OK': ['Oklahoma', 'OK'],
    'US-OR': ['Oregon', 'OR'],
    'US-PA': ['Pennsylvania', 'PA'],
    'US-PR': ['Puerto Rico', 'PR'],
    'US-RI': ['Rhode Island', 'RI'],
    'US-SC': ['South Carolina', 'SC'],
    'US-SD': ['South Dakota', 'SD'],
    'US-TN': ['Tennessee', 'TN'],
    'US-TX': ['Texas', 'TX'],
    'US-UT': ['Utah', 'UT'],
    'US-VT': ['Vermont', 'VT'],
    'US-VA': ['Virginia', 'VA'],
    'US-WA': ['Washington', 'WA'],
    'US-WV': ['West Virginia', 'WV'],
    'US-WI': ['Wisconsin', 'WI'],
    'US-WY': ['Wyoming', 'WY']
};

export const statesMappingByStateName = {
    // States
    'Alabama': ['US-AL', 'AL'],
    'Alaska': ['US-AK', 'AK'],
    'Arizona': ['US-AZ', 'AZ'],
    'Arkansas': ['US-AR', 'AR'],
    'California': ['US-CA', 'CA'],
    'Colorado': ['US-CO', 'CO'],
    'Connecticut': ['US-CT', 'CT'],
    'Delaware': ['US-DE', 'DE'],
    'District of Columbia': ['US-DC', 'DC'],
    'Florida': ['US-FL', 'FL'],
    'Georgia': ['US-GA', 'GA'],
    'Hawaii': ['US-HI', 'HI'],
    'Idaho': ['US-ID', 'ID'],
    'Illinois': ['US-IL', 'IL'],
    'Indiana': ['US-IN', 'IN'],
    'Iowa': ['US-IA', 'IA'],
    'Kansas': ['US-KS', 'KS'],
    'Kentucky': ['US-KY', 'KY'],
    'Louisiana': ['US-LA', 'LA'],
    'Maine': ['US-ME', 'ME'],
    'Maryland': ['US-MD', 'MD'],
    'Massachusetts': ['US-MA', 'MA'],
    'Michigan': ['US-MI', 'MI'],
    'Minnesota': ['US-MN', 'MN'],
    'Mississippi': ['US-MS', 'MS'],
    'Missouri': ['US-MO', 'MO'],
    'Montana': ['US-MT', 'MT'],
    'Nebraska': ['US-NE', 'NE'],
    'Nevada': ['US-NV', 'NV'],
    'New Hampshire': ['US-NH', 'NH'],
    'New Jersey': ['US-NJ', 'NJ'],
    'New Mexico': ['US-NM', 'NM'],
    'New York': ['US-NY', 'NY'],
    'North Carolina': ['US-NC', 'NC'],
    'North Dakota': ['US-ND', 'ND'],
    'Ohio': ['US-OH', 'OH'],
    'Oklahoma': ['US-OK', 'OK'],
    'Oregon': ['US-OR', 'OR'],
    'Pennsylvania': ['US-PA', 'PA'],
    'Puerto Rico': ['US-PR', 'PR'],
    'Rhode Island': ['US-RI', 'RI'],
    'South Carolina': ['US-SC', 'SC'],
    'South Dakota': ['US-SD', 'SD'],
    'Tennessee': ['US-TN', 'TN'],
    'Texas': ['US-TX', 'TX'],
    'Utah': ['US-UT', 'UT'],
    'Vermont': ['US-VT', 'VT'],
    'Virginia': ['US-VA', 'VA'],
    'Washington': ['US-WA', 'WA'],
    'West Virginia': ['US-WV', 'WV'],
    'Wisconsin': ['US-WI', 'WI'],
    'Wyoming': ['US-WY', 'WY']
};

export const legendOrderByCount = [
    '≥150 deaths',
    '100–149 deaths',
    '50–99 deaths',
    '10–49 deaths',
    '1–9 deaths',
    '0 deaths',
    'Data not available'
];
export const legendOrderByPercent = [
    '≥10.0%',
    '5.0%–9.9%',
    '2.0%–4.9%',
    '1.0%–1.9%',
    '>0.0%–0.9%',
    '0.0%',
    'Data not available'
];

export const legendOrderDrugPercentTrend = [
    '≥25.0 point increase',
    '10.0 to 24.9 point increase',
    '<10.0 point increase',
    'No significant change',
    '<10.0 point decrease',
    '10.0 to 24.9 point decrease',
    '≥25.0 point decrease',

    'Data not available'
];

export const legendOrderDrugRateTrend = [
    '≥25.0% increase',
    '10.0% to 24.9% increase',
    '1.0% to 9.9% increase',
    '<1.0%\u00A0increase\u00A0or\u00A0decrease', // Non-breaking spaces added
    '1.0% to 9.9% decrease',
    '10.0% to 24.9% decrease',
    '≥25.0% decrease',
    'Suppressed',
    'Data not available'
];

export const legendOrderDrugsDetectedCountTrend = [
    'Increase of ≥100 deaths',
    'Increase of 50 to 99 deaths',
    'Increase of 1 to 49 deaths',
    'No change',
    'Decrease of 1 to 49 deaths',
    'Decrease of 50 to 99 deaths',
    'Decrease of ≥100 deaths',
    'Data not available'
];

export const legendOrderDrugsDetectedPercentTrend = [
    '≥10.0 point increase',
    '2.0 to 9.9 point increase',
    '<2.0 point increase',
    'No change',
    '<2.0 point decrease',
    '2.0 to 9.9 point decrease',
    '≥10.0 point decrease',
    'Data not available'
];

export const mapColorPalette = [
    '#00473B',
    '#3A6B57',
    '#638B77',
    '#62B894',
    '#C2D5C6',
    '#ffffff',
    '#E6E6EF'
];

export const mapColorPaletteDrugRateTrend = [
    '#832034', // > 25 increase
    '#B21F39', // 10 - 25 increase
    '#F5BAC3', // <10 increase
    '#ffffff', // No Change
    '#94DCDC', // <10 decrease
    '#3F9FAA', // 10 - 25 decrease
    '#005F69', // >25 decrease
    '#C0C0C0', // Suppressed
    '#33a0be',  // >25 decrease
];

export const datasetUrls = {
    timeData: dataUrl + 'data/time.json',
    mapData: dataUrl + 'data/map.json',
    drugDataRates: dataUrl + 'data/age-adjusted-drug-rates.json',
    interventionData: dataUrl + 'data/interventions.json',
    circumstancesData: dataUrl + 'data/circumstance.json',
    totalData: dataUrl + 'data/totals.json',
    combinationData: dataUrl + 'data/top-combination.json',
    causeData: dataUrl + 'data/cause.json',
    additionalDrugData: dataUrl + 'data/additional_drug.json',
    opioidStimulantData: dataUrl + 'data/opioid-stimulant.json',
    sexData: dataUrl + 'data/sex.json',
    sexDataRates: dataUrl + 'data/age-adjusted-sex-rates.json',
    ageData: dataUrl + 'data/age.json',
    raceData: dataUrl + 'data/race.json',
    raceDataRates: dataUrl + 'data/age-adjusted-race-rates.json',
    ageBySexData: dataUrl + 'data/age-by-sex.json',
    stateLabels: dataUrl + 'data/state_labels.json',
    statesIncluded: dataUrl + 'data/preliminary_states_included.json',
    emergingDrugsData: dataUrl + 'data/emerging-drug.json',
    footNoteDate: dataUrl + 'data/footnote_date.JSON',
    emergingDrugInclusionData: dataUrl + 'data/emerging-drug_inclusion.json',
    footNotePercent: dataUrl + 'data/footnote_percent.json'
};

export const orderOfCircumstance = {
    'Potential opportunities for intervention to prevent overdoseCurrent treatment for substance use disorder(s)': 7,
    'Potential opportunities for intervention to prevent overdoseFatal drug use witnessed': 6,
    'Potential opportunities for intervention to prevent overdoseMental health diagnosis': 5,
    'Potential opportunities for intervention to prevent overdosePotential bystander present': 4,
    'Potential opportunities for intervention to prevent overdosePrior overdose': 3,
    'Potential opportunities for intervention to prevent overdoseDecedent was recently released from institutional setting': 1,

    'BystandersPotential bystander present': 107,
    'BystandersBystander provided no overdose response': 106,
    'BystandersBystander was spatially separated from decedent': 105,
    'BystandersBystander was unaware decedent was using substances': 104,
    'BystandersBystander did not recognize abnormalities': 103,
    'BystandersBystander did not recognize abnormalities as an overdose': 102,
    'BystandersBystander was using substances or alcohol':101,
    'BystandersIt was a public space and strangers did not intervene': 100,

    'Overdose responseNo pulse at first responder arrival':204,
    'Overdose responseNaloxone administered': 203,
    'Overdose responseSeen in emergency department': 202,
    'Overdose responseAdmitted to hospital': 201,

    'History of drug use and overdoseHistory of drug use':306,
    'History of drug use and overdoseHistory of opioid use':305,
    'History of drug use and overdoseHistory of stimulant use':304,
    'History of drug use and overdoseRecent return to use of opioids':303,
    'History of drug use and overdosePrior overdose': 302,
    'History of drug use and overdosePrior overdose within one month of death':300,

    // 'Ever treated for mental health or substance use disorder(s)': 401,
    // 'Current treatment for mental health or substance use disorder(s)': 402,
    // 'History of suicide attempt, ideation, or self-harm':403

    'Mental health and treatmentEvidence of a mental health diagnosis': 504,
    'Mental health and treatmentEver treated for mental health or substance use disorder(s)': 503,
    'Mental health and treatmentCurrent treatment for mental health or substance use disorder(s)': 502,
    'Mental health and treatmentHistory of suicide attempt, ideation, or self-harm': 501,

    'Treatment for substance use disorder(s)Ever treated for substance use disorder(s)': 603,
    'Treatment for substance use disorder(s)Current treatment for substance use disorder(s)': 602,
    'Treatment for substance use disorder(s)Prescribed medications for opioid use disorder': 600,

    'Other overdose-related circumstancesOverdose occurred in a house or apartment setting':706,
    'Other overdose-related circumstancesOverdose occurred where the decedent lived':705,
    'Other overdose-related circumstancesOverdose occurred at a hotel/motel':704,
    'Other overdose-related circumstancesDecedent was experiencing homelessness or housing instability':703,
    'Other overdose-related circumstancesDecedent was recently released from institutional setting':702,
    'Other overdose-related circumstancesDecedent was currently treated for pain':700,

    'Scene evidenceEvidence of prescription drug use': 803,
    'Scene evidenceEvidence of illegal drug use': 802,
    'Scene evidenceEvidence of counterfeit pill use': 801
  }