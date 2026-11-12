/**
 * Generates realistic SVG data URLs for Indian identity documents
 * (Aadhaar, PAN, Passport, Voter ID, Driving License, Insurance)
 */

const encodeSvg = (svgString) => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
};

export const generateSampleDocumentCard = (category, side = 'front', docNumber = '5482 9102 3847', memberName = 'Santhosh Sharma', relation = 'Son of Rajesh Sharma') => {
  const cat = (category || '').toLowerCase();

  // 1. AADHAAR CARD
  if (cat.includes('aadhaar')) {
    if (side === 'front') {
      return encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
          <defs>
            <linearGradient id="aadhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#f8fafc"/>
            </linearGradient>
          </defs>
          <rect width="500" height="315" rx="16" fill="url(#aadhGrad)" stroke="#cbd5e1" stroke-width="2"/>
          <!-- Top Header Tricolor bar -->
          <rect x="0" y="0" width="500" height="12" rx="0" fill="#f97316"/>
          <rect x="0" y="12" width="500" height="12" rx="0" fill="#ffffff"/>
          <rect x="0" y="24" width="500" height="12" rx="0" fill="#16a34a"/>
          
          <!-- Header text -->
          <g fill="#1e293b" font-family="sans-serif">
            <text x="250" y="58" font-size="13" font-weight="bold" text-anchor="middle" fill="#0f172a">भारत सरकार / GOVERNMENT OF INDIA</text>
            <text x="250" y="74" font-size="11" font-weight="600" text-anchor="middle" fill="#475569">भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI)</text>
          </g>
          
          <!-- Photo Placeholder -->
          <rect x="36" y="96" width="100" height="125" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
          <circle cx="86" cy="140" r="28" fill="#cbd5e1"/>
          <path d="M50 205 Q86 175 122 205" fill="#94a3b8"/>
          
          <!-- Details -->
          <g font-family="sans-serif" fill="#1e293b">
            <text x="156" y="112" font-size="11" fill="#64748b">नाम / Name</text>
            <text x="156" y="130" font-size="15" font-weight="bold" fill="#0f172a">${memberName}</text>
            
            <text x="156" y="152" font-size="11" fill="#64748b">जन्म तिथि / DOB</text>
            <text x="156" y="168" font-size="13" font-weight="600">14/08/1992</text>
            
            <text x="156" y="190" font-size="11" fill="#64748b">लिंग / Gender</text>
            <text x="156" y="206" font-size="13" font-weight="600">पुरुष / MALE</text>
          </g>
          
          <!-- Aadhaar Number -->
          <rect x="36" y="242" width="428" height="46" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
          <text x="250" y="272" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="4" text-anchor="middle" fill="#1e3a8a">${docNumber}</text>
          <text x="250" y="302" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#dc2626">मेरा आधार, मेरी पहचान</text>
        </svg>
      `);
    } else {
      // Aadhaar Back
      return encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
          <rect width="500" height="315" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="0" y="0" width="500" height="8" fill="#1e3a8a"/>
          
          <!-- Address Info -->
          <g font-family="sans-serif" fill="#1e293b">
            <text x="36" y="45" font-size="13" font-weight="bold" fill="#0f172a">पता / Address:</text>
            <text x="36" y="68" font-size="11" fill="#475569">S/O ${relation},</text>
            <text x="36" y="86" font-size="11" fill="#475569">Flat 402, Green Valley Heights, MG Road,</text>
            <text x="36" y="104" font-size="11" fill="#475569">Indiranagar, Bengaluru Urban, Karnataka - 560038</text>
            
            <text x="36" y="135" font-size="10" fill="#64748b">Unique ID Verification QR Code:</text>
          </g>
          
          <!-- Mock QR Code -->
          <rect x="36" y="145" width="100" height="100" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
          <rect x="46" y="155" width="24" height="24" fill="#0f172a"/>
          <rect x="102" y="155" width="24" height="24" fill="#0f172a"/>
          <rect x="46" y="211" width="24" height="24" fill="#0f172a"/>
          <rect x="76" y="185" width="16" height="16" fill="#0f172a"/>
          
          <g font-family="sans-serif" fill="#64748b" font-size="10">
            <text x="156" y="165">Helpline: 1947 | help@uidai.gov.in</text>
            <text x="156" y="185">www.uidai.gov.in</text>
            <text x="156" y="210" fill="#0f172a" font-weight="bold">This document is digitally verified.</text>
          </g>
          
          <!-- Bottom Number Repeat -->
          <rect x="0" y="270" width="500" height="45" fill="#f1f5f9"/>
          <text x="250" y="298" font-family="monospace" font-size="16" font-weight="bold" letter-spacing="3" text-anchor="middle" fill="#1e293b">${docNumber}</text>
        </svg>
      `);
    }
  }

  // 2. PAN CARD
  if (cat.includes('pan')) {
    return encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
        <rect width="500" height="315" rx="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
        <!-- Header -->
        <rect x="0" y="0" width="500" height="60" rx="16" fill="#1e3a8a"/>
        <text x="250" y="26" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">आयकर विभाग / INCOME TAX DEPARTMENT</text>
        <text x="250" y="45" font-family="sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">भारत सरकार / GOVT. OF INDIA</text>
        
        <!-- Photo -->
        <rect x="36" y="80" width="95" height="115" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
        <circle cx="83.5" cy="120" r="24" fill="#cbd5e1"/>
        <path d="M50 180 Q83.5 155 117 180" fill="#94a3b8"/>
        
        <!-- Details -->
        <g font-family="sans-serif" fill="#1e293b">
          <text x="150" y="95" font-size="10" fill="#64748b">नाम / Name</text>
          <text x="150" y="112" font-size="14" font-weight="bold" fill="#0f172a">${memberName}</text>
          
          <text x="150" y="135" font-size="10" fill="#64748b">पिता का नाम / Father's Name</text>
          <text x="150" y="150" font-size="12" font-weight="bold" fill="#0f172a">RAJESH SHARMA</text>
          
          <text x="150" y="172" font-size="10" fill="#64748b">जन्म तिथि / Date of Birth</text>
          <text x="150" y="188" font-size="12" font-weight="bold">14/08/1992</text>
        </g>
        
        <!-- Permanent Account Number Card -->
        <rect x="36" y="210" width="428" height="50" rx="8" fill="#ffffff" stroke="#d97706" stroke-width="1.5"/>
        <text x="50" y="228" font-family="sans-serif" font-size="9" font-weight="bold" fill="#b45309">स्थायी लेखा संख्या / PERMANENT ACCOUNT NUMBER</text>
        <text x="250" y="248" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="4" text-anchor="middle" fill="#0f172a">${docNumber}</text>
        
        <!-- Signature area -->
        <g transform="translate(320, 150)">
          <rect width="130" height="40" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
          <text x="65" y="26" font-family="cursive" font-size="14" font-weight="bold" fill="#1e40af" text-anchor="middle">S. Sharma</text>
          <text x="65" y="48" font-family="sans-serif" font-size="8" fill="#64748b" text-anchor="middle">हस्ताक्षर / Signature</text>
        </g>
      </svg>
    `);
  }

  // 3. PASSPORT
  if (cat.includes('passport')) {
    if (side === 'front') {
      return encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
          <rect width="500" height="315" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
          <circle cx="250" cy="110" r="50" fill="none" stroke="#fbbf24" stroke-width="2"/>
          <text x="250" y="60" font-family="sans-serif" font-size="13" font-weight="bold" letter-spacing="3" fill="#fef08a" text-anchor="middle">REPUBLIC OF INDIA</text>
          <text x="250" y="80" font-family="sans-serif" font-size="12" font-weight="bold" letter-spacing="2" fill="#ffffff" text-anchor="middle">भारत गणराज्य</text>
          
          <!-- Emblem Icon Graphic -->
          <text x="250" y="118" font-family="serif" font-size="32" fill="#fbbf24" text-anchor="middle">☬</text>
          
          <text x="250" y="195" font-family="sans-serif" font-size="18" font-weight="800" letter-spacing="6" fill="#fbbf24" text-anchor="middle">PASSPORT</text>
          <text x="250" y="215" font-family="sans-serif" font-size="13" font-weight="bold" letter-spacing="4" fill="#e2e8f0" text-anchor="middle">पासपोर्ट</text>
          
          <rect x="60" y="245" width="380" height="36" rx="6" fill="#0f172a" stroke="#475569"/>
          <text x="250" y="268" font-family="monospace" font-size="15" font-weight="bold" fill="#38bdf8" letter-spacing="3" text-anchor="middle">NO: ${docNumber}</text>
        </svg>
      `);
    } else {
      // Passport Bio page
      return encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
          <rect width="500" height="315" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="0" y="0" width="500" height="36" fill="#4338ca"/>
          <text x="250" y="22" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">GOVERNMENT OF INDIA - PASSPORT BIO PAGE</text>
          
          <rect x="30" y="50" width="95" height="120" rx="4" fill="#f1f5f9" stroke="#94a3b8"/>
          <circle cx="77.5" cy="95" r="22" fill="#cbd5e1"/>
          
          <g font-family="sans-serif" font-size="10" fill="#475569">
            <text x="140" y="65">Type: <tspan font-weight="bold" fill="#0f172a">P</tspan>  Code: <tspan font-weight="bold" fill="#0f172a">IND</tspan>  Passport No: <tspan font-weight="bold" fill="#0f172a">${docNumber}</tspan></text>
            <text x="140" y="90">Given Name(s):</text>
            <text x="140" y="105" font-size="13" font-weight="bold" fill="#0f172a">${memberName.toUpperCase()}</text>
            <text x="140" y="125">Nationality: <tspan font-weight="bold" fill="#0f172a">INDIAN</tspan>   Sex: <tspan font-weight="bold" fill="#0f172a">M</tspan></text>
            <text x="140" y="145">Date of Issue: <tspan font-weight="bold" fill="#0f172a">10/05/2021</tspan>  Date of Expiry: <tspan font-weight="bold" fill="#0f172a">09/05/2031</tspan></text>
            <text x="140" y="165">Place of Issue: <tspan font-weight="bold" fill="#0f172a">BENGALURU</tspan></text>
          </g>
          
          <!-- Machine Readable Zone (MRZ) -->
          <rect x="15" y="215" width="470" height="75" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="25" y="245" font-family="monospace" font-size="12" letter-spacing="3" fill="#0f172a">P&lt;INDSHARMA&lt;&lt;SANTHOSH&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
          <text x="25" y="270" font-family="monospace" font-size="12" letter-spacing="3" fill="#0f172a">${docNumber}8IND9208144M3105098&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</text>
        </svg>
      `);
    }
  }

  // 4. DRIVING LICENSE
  if (cat.includes('driving')) {
    if (side === 'front') {
      return encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
          <rect width="500" height="315" rx="16" fill="#f5f3ff" stroke="#7c3aed" stroke-width="2"/>
          <rect x="0" y="0" width="500" height="42" fill="#6d28d9"/>
          <text x="250" y="26" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">INDIAN UNION DRIVING LICENCE - KARNATAKA STATE</text>
          
          <!-- Chip -->
          <rect x="35" y="60" width="45" height="35" rx="4" fill="#fde047" stroke="#ca8a04"/>
          
          <!-- Details -->
          <g font-family="sans-serif" font-size="11" fill="#1e293b">
            <text x="95" y="70" font-size="10" fill="#6d28d9" font-weight="bold">DL NO:</text>
            <text x="95" y="88" font-size="14" font-weight="bold" font-family="monospace" fill="#0f172a">${docNumber}</text>
            
            <text x="35" y="125" font-size="10" fill="#64748b">Name:</text>
            <text x="35" y="142" font-size="13" font-weight="bold">${memberName}</text>
            
            <text x="35" y="165" font-size="10" fill="#64748b">Authorised to Drive:</text>
            <text x="35" y="180" font-weight="bold" fill="#047857">MCWG, LMV (Car + Motorcycle)</text>
            
            <text x="35" y="205" font-size="10" fill="#64748b">Valid Till (Non-Transport):</text>
            <text x="35" y="220" font-weight="bold" fill="#b91c1c">13/08/2042</text>
          </g>
          
          <!-- Photo -->
          <rect x="360" y="60" width="105" height="135" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
          <circle cx="412" cy="110" r="26" fill="#cbd5e1"/>
          <rect x="360" y="205" width="105" height="35" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
          <text x="412" y="228" font-family="cursive" font-size="13" font-weight="bold" fill="#4338ca" text-anchor="middle">Santhosh</text>
          
          <rect x="0" y="260" width="500" height="55" fill="#ede9fe"/>
          <text x="250" y="292" font-family="sans-serif" font-size="11" font-weight="bold" fill="#5b21b6" text-anchor="middle">Issuing Authority: RTO INDIRANAGAR (KA-03)</text>
        </svg>
      `);
    } else {
      return encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
          <rect width="500" height="315" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="0" y="0" width="500" height="30" fill="#5b21b6"/>
          <text x="250" y="20" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">DRIVING LICENCE - REVERSE SIDE</text>
          
          <g font-family="sans-serif" font-size="11" fill="#1e293b">
            <text x="35" y="55" font-weight="bold">Address:</text>
            <text x="35" y="75" fill="#475569">402 Green Valley Heights, 100 Feet Rd, Indiranagar, Bengaluru 560038</text>
            
            <text x="35" y="110" font-weight="bold">Emergency Contact:</text>
            <text x="35" y="130" fill="#475569">+91 98765 43211 (Spouse - Priya Sharma)</text>
            
            <text x="35" y="165" font-weight="bold">Blood Group:</text>
            <text x="35" y="185" font-weight="bold" fill="#dc2626">O +VE</text>
            
            <text x="35" y="215" font-weight="bold">Organ Donor:</text>
            <text x="35" y="235" font-weight="bold" fill="#059669">YES (Pledged)</text>
          </g>
          
          <rect x="340" y="80" width="120" height="120" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="400" y="145" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Security Barcode</text>
        </svg>
      `);
    }
  }

  // 5. VOTER ID
  if (cat.includes('voter')) {
    return encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
        <rect width="500" height="315" rx="16" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
        <rect x="0" y="0" width="500" height="45" fill="#047857"/>
        <text x="250" y="22" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">भारत निर्वाचन आयोग</text>
        <text x="250" y="38" font-family="sans-serif" font-size="11" font-weight="bold" fill="#a7f3d0" text-anchor="middle">ELECTION COMMISSION OF INDIA</text>
        
        <rect x="35" y="70" width="95" height="120" rx="4" fill="#ffffff" stroke="#94a3b8"/>
        <circle cx="82.5" cy="115" r="24" fill="#cbd5e1"/>
        
        <g font-family="sans-serif" fill="#1e293b">
          <text x="145" y="75" font-size="10" fill="#047857" font-weight="bold">EPIC NO / पहचान पत्र सं.:</text>
          <text x="145" y="98" font-size="17" font-weight="bold" font-family="monospace" fill="#0f172a">${docNumber}</text>
          
          <text x="145" y="125" font-size="10" fill="#64748b">Elector's Name:</text>
          <text x="145" y="142" font-size="14" font-weight="bold">${memberName}</text>
          
          <text x="145" y="165" font-size="10" fill="#64748b">Father's / Husband's Name:</text>
          <text x="145" y="180" font-size="12" font-weight="bold">Rajesh Sharma</text>
          
          <text x="145" y="205" font-size="10" fill="#64748b">Constituency:</text>
          <text x="145" y="220" font-size="12" font-weight="bold">160 - Sarvagnanagar, Karnataka</text>
        </g>
        
        <rect x="0" y="270" width="500" height="45" fill="#d1fae5"/>
        <text x="250" y="297" font-family="sans-serif" font-size="11" font-weight="bold" fill="#065f46" text-anchor="middle">Identity card for universal adult suffrage in India</text>
      </svg>
    `);
  }

  // 6. DEFAULT / INSURANCE / OTHER
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%">
      <rect width="500" height="315" rx="16" fill="#fff1f2" stroke="#f43f5e" stroke-width="2"/>
      <rect x="0" y="0" width="500" height="45" fill="#e11d48"/>
      <text x="250" y="28" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">STAR HEALTH FAMILY OPTIMA INSURANCE</text>
      
      <g font-family="sans-serif" fill="#1e293b">
        <text x="40" y="80" font-size="11" fill="#e11d48" font-weight="bold">POLICY NUMBER:</text>
        <text x="40" y="105" font-size="18" font-family="monospace" font-weight="bold" fill="#0f172a">${docNumber}</text>
        
        <text x="40" y="140" font-size="11" fill="#64748b">Primary Insured:</text>
        <text x="40" y="160" font-size="14" font-weight="bold">${memberName}</text>
        
        <text x="40" y="195" font-size="11" fill="#64748b">Sum Insured:</text>
        <text x="40" y="215" font-size="16" font-weight="bold" fill="#047857">₹ 15,00,000 (Floater)</text>
        
        <text x="280" y="140" font-size="11" fill="#64748b">Valid Through:</text>
        <text x="280" y="160" font-size="14" font-weight="bold" fill="#b91c1c">31/12/2026</text>
        
        <text x="280" y="195" font-size="11" fill="#64748b">TPA Network:</text>
        <text x="280" y="215" font-size="14" font-weight="bold">MediAssist Cashless</text>
      </g>
      
      <rect x="0" y="265" width="500" height="50" fill="#ffe4e6"/>
      <text x="250" y="295" font-family="sans-serif" font-size="11" font-weight="bold" fill="#9f1239" text-anchor="middle">Toll Free 24x7 Emergency Assistance: 1800 425 2255</text>
    </svg>
  `);
};

