export const DOCUMENT_CATEGORIES = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    slug: 'aadhaar',
    iconName: 'Fingerprint',
    badgeClass: 'cat-aadhaar',
    requiresBothSides: true,
    description: '12-digit Unique Identification Authority of India (UIDAI) Card',
    numberFormat: 'XXXX-XXXX-XXXX (12 digits)',
    numberPlaceholder: '5482 9102 3847',
    issuingAuthority: 'UIDAI - Govt. of India',
    hasExpiry: false,
    color: '#2563eb'
  },
  {
    id: 'pan',
    name: 'PAN Card',
    slug: 'pan',
    iconName: 'CreditCard',
    badgeClass: 'cat-pan',
    requiresBothSides: false,
    description: 'Permanent Account Number for Income Tax & Financial transactions',
    numberFormat: 'AAAAA0000A (10 characters)',
    numberPlaceholder: 'ABCDE1234F',
    issuingAuthority: 'Income Tax Department - Govt. of India',
    hasExpiry: false,
    color: '#d97706'
  },
  {
    id: 'passport',
    name: 'Passport',
    slug: 'passport',
    iconName: 'BookOpen',
    badgeClass: 'cat-passport',
    requiresBothSides: true,
    description: 'Republic of India International Travel Document',
    numberFormat: '1 letter followed by 7 digits',
    numberPlaceholder: 'Z1234567',
    issuingAuthority: 'Ministry of External Affairs',
    hasExpiry: true,
    color: '#4f46e5'
  },
  {
    id: 'voter-id',
    name: 'Voter ID (EPIC)',
    slug: 'voter-id',
    iconName: 'Vote',
    badgeClass: 'cat-voter-id',
    requiresBothSides: true,
    description: 'Elector Photo Identity Card by Election Commission of India',
    numberFormat: '3 alphabets followed by 7 digits',
    numberPlaceholder: 'WXY1234567',
    issuingAuthority: 'Election Commission of India',
    hasExpiry: false,
    color: '#059669'
  },
  {
    id: 'driving-license',
    name: 'Driving License',
    slug: 'driving-license',
    iconName: 'Car',
    badgeClass: 'cat-driving-license',
    requiresBothSides: true,
    description: 'Regional Transport Office (RTO) Motor Driving License',
    numberFormat: 'State code + RTO + Year + 7 digits',
    numberPlaceholder: 'DL-0420180054321',
    issuingAuthority: 'Transport Dept. - Govt. of India',
    hasExpiry: true,
    color: '#7c3aed'
  },
  {
    id: 'other',
    name: 'Other / Insurance',
    slug: 'other',
    iconName: 'ShieldCheck',
    badgeClass: 'cat-other',
    requiresBothSides: false,
    description: 'Health Insurance, Birth Certificates, Property deeds, and policies',
    numberFormat: 'Policy / Certificate / Account Reference',
    numberPlaceholder: 'POL-STAR-8839219',
    issuingAuthority: 'Various Authorities',
    hasExpiry: true,
    color: '#e11d48'
  }
];

export const getCategoryById = (id) => {
  return DOCUMENT_CATEGORIES.find((cat) => cat.id === id || cat.name.toLowerCase().includes(id.toLowerCase())) || DOCUMENT_CATEGORIES[5];
};

