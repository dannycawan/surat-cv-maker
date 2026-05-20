// src/templates/htmlTemplates.ts

// Interface for work experience in job application
interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  achievements: string;
}

// Interface for work experience in CV
interface CVWorkExperience {
  id: string;
  company: string;
  jobTitle: string;
  workStart: string;
  workEnd: string;
  responsibilities: string;
}

// Template style definitions for job applications
const JOB_APPLICATION_STYLES = {
  standard: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12pt',
    headerStyle: 'font-weight: bold;',
    containerStyle: '',
    signatureStyle: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#000000',
  },
  modern: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '12pt',
    headerStyle: 'color: #2196F3; text-transform: uppercase; letter-spacing: 2px;',
    containerStyle: 'border-left: 4px solid #2196F3; padding-left: 15px;',
    signatureStyle: 'color: #2196F3; font-weight: bold;',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#2196F3',
  },
  formal: {
    fontFamily: 'Times New Roman, serif',
    fontSize: '12pt',
    headerStyle: 'text-decoration: underline;',
    containerStyle: '',
    signatureStyle: 'font-style: italic;',
    backgroundColor: '#f9f9f9',
    textColor: '#000000',
    accentColor: '#555555',
  },
};

// Template style definitions for CV
const CV_STYLES = {
  classic: {
    fontFamily: 'Times New Roman, serif',
    fontSize: '12pt',
    headerStyle: 'text-align: center; font-weight: bold; text-transform: uppercase;',
    sectionStyle: 'border-bottom: 1px solid #000;',
    sectionContentStyle: 'margin-left: 15px;',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#000000',
  },
  professional: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '11pt',
    headerStyle: 'text-align: center; color: #2196F3; font-weight: bold; letter-spacing: 1px;',
    sectionStyle: 'color: #2196F3; border-bottom: 2px solid #2196F3;',
    sectionContentStyle: 'margin-left: 0; padding: 10px;',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#2196F3',
  },
  creative: {
    fontFamily: 'Calibri, Arial, sans-serif',
    fontSize: '11pt',
    headerStyle: 'text-align: center; background-color: #4CAF50; color: white; padding: 10px;',
    sectionStyle: 'background-color: #E8F5E9; color: #4CAF50; padding: 5px; border-radius: 5px;',
    sectionContentStyle: 'margin-left: 0; padding: 10px; border-left: 3px solid #4CAF50;',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#4CAF50',
  },
};

// Template style definitions for resignation letters
const RESIGNATION_STYLES = {
  simple: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12pt',
    headerStyle: '',
    containerStyle: '',
    signatureStyle: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#000000',
  },
  respectful: {
    fontFamily: 'Georgia, serif',
    fontSize: '12pt',
    headerStyle: 'font-style: italic;',
    containerStyle: 'line-height: 1.8;',
    signatureStyle: 'font-style: italic;',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#6a5acd',
  },
  detailed: {
    fontFamily: 'Verdana, sans-serif',
    fontSize: '11pt',
    headerStyle: 'letter-spacing: 1px;',
    containerStyle: 'border: 1px solid #ccc; padding: 15px; border-radius: 5px;',
    signatureStyle: 'font-weight: bold;',
    backgroundColor: '#fafafa',
    textColor: '#333333',
    accentColor: '#d32f2f',
  },
};

// Dictionary of resignation reasons
const REASON_TEXT = {
  id: {
    personal: 'Saya ingin lebih fokus pada urusan pribadi dan keluarga yang memerlukan perhatian lebih saat ini.',
    career: 'Saya telah menerima tawaran pekerjaan yang lebih selaras dengan perkembangan karier dan tujuan profesional saya.',
    education: 'Saya berencana untuk melanjutkan pendidikan guna meningkatkan keterampilan dan pengetahuan saya di bidang yang saya tekuni.',
    health: 'Saya memerlukan waktu untuk fokus pada kesehatan saya dan pemulihan yang lebih optimal.',
    relocation: 'Saya dan keluarga akan pindah ke kota lain sehingga tidak memungkinkan untuk melanjutkan pekerjaan.',
    other: ''
  },
  en: {
    personal: 'I need to focus on personal matters and family obligations that require my full attention at this time.',
    career: 'I have received a new career opportunity that aligns better with my professional aspirations and goals.',
    education: 'I plan to continue my education to enhance my skills and knowledge in my field.',
    health: 'I need to focus on my health and recovery to ensure my well-being.',
    relocation: 'My family and I will be relocating to another city, making it impossible for me to continue my role.',
    other: ''
  }
};

// Template for Job Application Letter
export const jobApplicationHtmlTemplate = (data: any): string => {
  const { language, templateId = 'standard', workExperiences = [] } = data;
  const isIndonesian = language === 'id';
  
  // Get template style
  const template = JOB_APPLICATION_STYLES[templateId as keyof typeof JOB_APPLICATION_STYLES] || JOB_APPLICATION_STYLES.standard;
  
  // Determine heading and footer based on language
  const heading = isIndonesian ? 'Surat Lamaran Kerja' : 'Job Application Letter';
  const date = new Date().toLocaleDateString(isIndonesian ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format work experiences
  const formatWorkExperiences = () => {
    if (!workExperiences || workExperiences.length === 0) {
      return isIndonesian 
        ? "<p>Saya memiliki pengalaman yang relevan dengan posisi ini.</p>"
        : "<p>I have relevant experience for this position.</p>";
    }
    
    const header = isIndonesian
      ? "<p>Berikut adalah pengalaman kerja saya:</p>"
      : "<p>Below is my work experience:</p>";
    
    const experienceItems = workExperiences.map((exp: WorkExperience) => {
      const position = exp.position || "Staff";
      const company = exp.company;
      const duration = exp.duration;
      const achievements = exp.achievements;
      
      return `
        <div class="experience-item">
          <p><strong>${position}</strong> ${isIndonesian ? 'di' : 'at'} ${company}${duration ? ` (${duration})` : ''}</p>
          <p>${achievements || (isIndonesian ? 'Bertanggung jawab untuk berbagai tugas penting.' : 'Responsible for various important tasks.')}</p>
        </div>
      `;
    }).join('');
    
    return `${header}
      <div class="experience-list">
        ${experienceItems}
      </div>`;
  };
  
  // Generate content based on language
  let content = '';
  
  if (isIndonesian) {
    content = `
      <div class="date">
        <p>${date}</p>
      </div>
      
      <div class="recipient">
        <p>Kepada Yth.<br>
        ${data.recipientName ? data.recipientName + '<br>' : ''}${data.companyName}<br>
        ${data.companyAddress}</p>
      </div>
      
      <p>Dengan hormat,</p>
      
      <p>Sehubungan dengan informasi mengenai lowongan kerja untuk posisi ${data.position} di ${data.companyName}, 
      Maka dari itu, bersamaan dengan surat ini, saya hendak melamar untuk posisi yang lowong tersebut.</p>
      
      ${formatWorkExperiences()}
      
      <p>Berikut biodata diri saya.</p>
      
      <div class="personal-info">
        <p>Nama: ${data.name}<br>
        Alamat: ${data.address}<br>
        Telepon: ${data.phone}<br>
        Email: ${data.email}</p>
      </div>
      
      <p>Berikut saya lampirkan dokumen pendukung sebagai bahan pertimbangan:</p>
      <ol>
        ${data.supportingDocuments.map((doc: any) => `<li>${doc.name}</li>`).join('\n        ')}
      </ol>
      
      <p>Demikian surat lamaran yang sudah saya buat. Besar harapan saya agar dapat melanjutkan proses rekrutmen ini. 
      Atas Perhatian dari Bapak/Ibu, saya ucapkan banyak terima kasih.</p>
      
      <div class="signature">
        <p>Hormat saya,<br><br><br><br>
        ${data.name}</p>
      </div>
    `;
  } else {
    content = `
      <div class="date">
        <p>${date}</p>
      </div>
      
      <div class="recipient">
        <p>Dear ${data.recipientName || 'Hiring Manager'},</p>
      </div>
      
      <p>I am writing to express my interest in the ${data.position} position at ${data.companyName}, as advertised. With this letter, I would like to apply for the opportunity to contribute my skills and experience to your team.</p>
      
      ${formatWorkExperiences()}
      
      <p>Below are my personal details:</p>
      
      <div class="personal-info">
        <p>Full Name: ${data.name}<br>
        Address: ${data.address}<br>
        Phone Number: ${data.phone}<br>
        Email: ${data.email}</p>
      </div>
      
      <p>I have attached the following documents for your consideration:</p>
      <ol>
        ${data.supportingDocuments.map((doc: any) => `<li>${doc.name}</li>`).join('\n        ')}
      </ol>
      
      <p>I would be honored to have the opportunity to discuss my qualifications further in an interview. Please feel free to contact me via ${data.email} or ${data.phone}.</p>
      
      <p>Thank you for your time and consideration. I look forward to your response.</p>
      
      <div class="signature">
        <p>Sincerely,<br><br><br><br>
        ${data.name}</p>
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${heading}</title>
        <style>
          body {
            font-family: ${template.fontFamily};
            font-size: ${template.fontSize};
            line-height: 1.5;
            margin: 1cm 0.8cm; /* Reduced side margins */
            background-color: ${template.backgroundColor};
            color: ${template.textColor};
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
            font-size: 14pt;
            ${template.headerStyle}
          }
          .content-container {
            ${template.containerStyle}
          }
          .recipient {
            margin-bottom: 20px;
          }
          .personal-info {
            margin: 15px 0;
          }
          .signature {
            margin-top: 30px;
            ${template.signatureStyle}
          }
          .date {
            text-align: right;
            margin-bottom: 20px;
          }
          ol {
            margin-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          .experience-list {
            margin: 15px 0;
          }
          .experience-item {
            margin-bottom: 15px;
            padding-left: 15px;
            border-left: 2px solid ${template.accentColor};
          }
          @media print {
            body {
              margin: 0.5cm;
              padding: 0;
              background-color: white !important;
              color: black !important;
              font-size: 11pt;
            }
            .header {
              color: black !important;
            }
            .experience-item {
              border-left-color: #333 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">${heading}</div>
        <div class="content-container">
          ${content}
        </div>
      </body>
    </html>
  `;
};

// Template for CV
export const cvHtmlTemplate = (data: any): string => {
  const { language, templateId = 'classic', workExperiences = [] } = data;
  const isIndonesian = language === 'id';
  
  // Get template style
  const template = CV_STYLES[templateId as keyof typeof CV_STYLES] || CV_STYLES.classic;
  
  // Determine heading based on language
  const heading = 'CURRICULUM VITAE';
  
  // Create skill and language lists
  const skills = data.skills ? data.skills.split(',').map((skill: string) => 
    `<li>${skill.trim()}</li>`).join('') : '';
  
  const languages = data.languages ? data.languages.split(',').map((lang: string) => 
    `<li>${lang.trim()}</li>`).join('') : '';
  
  // Format work experiences
  const formatWorkExperiences = () => {
    if (!workExperiences || workExperiences.length === 0) {
      return isIndonesian
        ? "<p><em>Belum ada pengalaman kerja yang ditambahkan</em></p>"
        : "<p><em>No work experience added</em></p>";
    }
    
    const experienceItems = workExperiences.map((exp: CVWorkExperience) => {
      const jobTitle = exp.jobTitle || '';
      const company = exp.company || '';
      const period = exp.workStart ? `${exp.workStart} - ${exp.workEnd || (isIndonesian ? 'Sekarang' : 'Present')}` : '';
      const responsibilities = exp.responsibilities || '';
      
      return `
        <div class="experience-item">
          <p><strong>${jobTitle}</strong> – ${company} ${period ? `(${period})` : ''}</p>
          <ul>
            <li>${responsibilities}</li>
          </ul>
        </div>
      `;
    }).join('');
    
    return experienceItems;
  };
  
  // Generate content based on language
  let content = '';
  
  if (isIndonesian) {
    content = `
      <div class="section">
        <h2>Informasi Pribadi</h2>
        <div class="section-content">
          <p>
            <strong>Nama:</strong> ${data.name}<br>
            <strong>Tempat, Tanggal Lahir:</strong> ${data.birthPlace}, ${data.birthDate}<br>
            <strong>Alamat:</strong> ${data.address}<br>
            <strong>Nomor Telepon:</strong> ${data.phone}<br>
            <strong>Email:</strong> ${data.email}<br>
            ${data.linkedin ? `<strong>LinkedIn:</strong> ${data.linkedin}` : ''}
          </p>
        </div>
      </div>
      
      <div class="section">
        <h2>Ringkasan Profesional</h2>
        <div class="section-content">
          <p>${data.summary}</p>
        </div>
      </div>
      
      <div class="section">
        <h2>Pendidikan</h2>
        <div class="section-content">
          <p>
            <strong>${data.degree}</strong> – ${data.university} (${data.yearStart} - ${data.yearEnd})<br>
            ${data.gpa ? `<strong>IPK:</strong> ${data.gpa}` : ''}
          </p>
        </div>
      </div>
      
      <div class="section">
        <h2>Pengalaman Kerja</h2>
        <div class="section-content experience-list">
          ${formatWorkExperiences()}
        </div>
      </div>
      
      <div class="section">
        <h2>Keterampilan</h2>
        <div class="section-content">
          <ul>${skills}</ul>
        </div>
      </div>
      
      <div class="section">
        <h2>Bahasa</h2>
        <div class="section-content">
          <ul>${languages}</ul>
        </div>
      </div>
      
      <div class="section">
        <h2>Referensi</h2>
        <div class="section-content">
          <p>Tersedia atas permintaan.</p>
        </div>
      </div>
    `;
  } else {
    content = `
      <div class="section">
        <h2>Personal Information</h2>
        <div class="section-content">
          <p>
            <strong>Full Name:</strong> ${data.name}<br>
            <strong>Place and Date of Birth:</strong> ${data.birthPlace}, ${data.birthDate}<br>
            <strong>Address:</strong> ${data.address}<br>
            <strong>Phone Number:</strong> ${data.phone}<br>
            <strong>Email:</strong> ${data.email}<br>
            ${data.linkedin ? `<strong>LinkedIn:</strong> ${data.linkedin}` : ''}
          </p>
        </div>
      </div>
      
      <div class="section">
        <h2>Professional Summary</h2>
        <div class="section-content">
          <p>${data.summary}</p>
        </div>
      </div>
      
      <div class="section">
        <h2>Education</h2>
        <div class="section-content">
          <p>
            <strong>${data.degree}</strong> – ${data.university} (${data.yearStart} - ${data.yearEnd})<br>
            ${data.gpa ? `<strong>GPA:</strong> ${data.gpa}` : ''}
          </p>
        </div>
      </div>
      
      <div class="section">
        <h2>Work Experience</h2>
        <div class="section-content experience-list">
          ${formatWorkExperiences()}
        </div>
      </div>
      
      <div class="section">
        <h2>Skills</h2>
        <div class="section-content">
          <ul>${skills}</ul>
        </div>
      </div>
      
      <div class="section">
        <h2>Languages</h2>
        <div class="section-content">
          <ul>${languages}</ul>
        </div>
      </div>
      
      <div class="section">
        <h2>References</h2>
        <div class="section-content">
          <p>Available upon request.</p>
        </div>
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${heading}</title>
        <style>
          body {
            font-family: ${template.fontFamily};
            font-size: ${template.fontSize};
            line-height: 1.5;
            margin: 1cm 0.8cm; /* Reduced side margins */
            background-color: ${template.backgroundColor};
            color: ${template.textColor};
          }
          .header {
            ${template.headerStyle}
            margin-bottom: 25px;
            font-size: 16pt;
          }
          .section {
            margin-bottom: 20px;
          }
          h2 {
            font-size: 14pt;
            padding-bottom: 5px;
            margin-bottom: 10px;
            ${template.sectionStyle}
          }
          .section-content {
            ${template.sectionContentStyle}
          }
          .experience-list {
            margin-top: 10px;
          }
          .experience-item {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dotted #cccccc;
          }
          .experience-item:last-child {
            border-bottom: none;
          }
          .experience-item ul {
            margin-top: 5px;
          }
          ul {
            margin-top: 5px;
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          @media print {
            body {
              margin: 0.5cm;
              padding: 0;
              background-color: white !important;
              color: black !important;
              font-size: 11pt;
            }
            h2 {
              color: black !important;
              background-color: white !important;
            }
            .experience-item {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">${heading}</div>
        ${content}
      </body>
    </html>
  `;
};

// Template for Resignation Letter
export const resignationHtmlTemplate = (data: any): string => {
  const { language, templateId = 'simple', reasons = [], otherReason = '' } = data;
  const isIndonesian = language === 'id';
  
  // Get template style
  const template = RESIGNATION_STYLES[templateId as keyof typeof RESIGNATION_STYLES] || RESIGNATION_STYLES.simple;
  
  // Determine heading and footer based on language
  const heading = isIndonesian ? 'Surat Pengunduran Diri' : 'Resignation Letter';
  const date = new Date().toLocaleDateString(isIndonesian ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Generate reasons list
  const reasonItems = reasons.map((reasonId: string) => {
    let reasonText = '';
    if (reasonId === 'other') {
      reasonText = otherReason;
    } else {
      reasonText = isIndonesian 
        ? REASON_TEXT.id[reasonId as keyof typeof REASON_TEXT.id] 
        : REASON_TEXT.en[reasonId as keyof typeof REASON_TEXT.en];
    }
    return `<li>${reasonText}</li>`;
  }).join('');
  
  // Generate content based on language
  let content = '';
  
  if (isIndonesian) {
    content = `
      <div class="date" style="text-align: left;">
        <p>${date}</p>
      </div>
      
      <div class="recipient">
        <p>Kepada Yth.<br>
        ${data.recipientName ? data.recipientName + ' - ' : ''}${data.companyName}<br>
        ${data.companyAddress}</p>
      </div>
      
      <p>Dengan hormat,</p>
      
      <p>Melalui surat ini, saya ingin menyampaikan pengunduran diri saya dari posisi ${data.position} di ${data.companyName}, terhitung mulai tanggal ${data.lastWorkingDate}.</p>
      
      <p>Adapun alasan pengunduran diri saya adalah sebagai berikut:</p>
      <ul>
        ${reasonItems}
      </ul>
      
      <p>Saya ingin mengucapkan terima kasih kepada ${data.companyName} atas kesempatan, pengalaman, serta pembelajaran yang sangat berharga selama saya bekerja di sini. Saya juga berterima kasih kepada seluruh rekan kerja atas kerja sama dan dukungannya.</p>
      
      <p>Saya berkomitmen untuk menyelesaikan tanggung jawab saya selama masa transisi dan akan membantu memastikan kelancaran proses pergantian sebelum tanggal efektif pengunduran diri saya. Saya berharap hubungan baik antara saya dan ${data.companyName} tetap terjaga di masa mendatang.</p>
      
      <p>Sekali lagi, saya ucapkan terima kasih atas kesempatan yang telah diberikan.</p>
      
      <div class="signature">
        <p>Hormat saya,<br><br><br><br>
        ${data.name}</p>
      </div>
    `;
  } else {
    content = `
      <div class="date" style="text-align: left;">
        <p>${date}</p>
      </div>
      
      <div class="recipient">
        <p>Dear ${data.recipientName || 'Hiring Manager'},</p>
      </div>
      
      <p>I am writing to formally resign from my position as ${data.position} at ${data.companyName}, effective ${data.lastWorkingDate}.</p>
      
      <p>The reason for my resignation is as follows:</p>
      <ul>
        ${reasonItems}
      </ul>
      
      <p>I sincerely appreciate the opportunities, experiences, and support I have received during my tenure at ${data.companyName}. I am especially grateful for the collaboration and friendships with my colleagues.</p>
      
      <p>I am committed to ensuring a smooth transition and will do my best to complete my responsibilities before my departure. I hope to maintain a positive relationship with ${data.companyName} in the future.</p>
      
      <p>Once again, thank you for the invaluable experience and support during my time at ${data.companyName}.</p>
      
      <div class="signature">
        <p>Best regards,<br><br><br><br>
        ${data.name}</p>
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${heading}</title>
        <style>
          body {
            font-family: ${template.fontFamily};
            font-size: ${template.fontSize};
            line-height: 1.5;
            margin: 1cm 0.8cm; /* Reduced side margins */
            background-color: ${template.backgroundColor};
            color: ${template.textColor};
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
            font-size: 14pt;
            ${template.headerStyle}
          }
          .content-container {
            ${template.containerStyle}
          }
          .recipient {
            margin-bottom: 20px;
          }
          .signature {
            margin-top: 30px;
            ${template.signatureStyle}
          }
          .date {
            text-align: left;
            margin-bottom: 20px;
          }
          ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          @media print {
            body {
              margin: 0.5cm;
              padding: 0;
              background-color: white !important;
              color: black !important;
              font-size: 11pt;
            }
            .header {
              color: black !important;
              background-color: white !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">${heading}</div>
        <div class="content-container">
          ${content}
        </div>
      </body>
    </html>
  `;
};

// Main function to generate HTML based on document type
export const generateTemplateHTML = (data: any, documentType: string): string => {
  switch (documentType) {
    case 'jobApplication':
      return jobApplicationHtmlTemplate(data);
    case 'cv':
      return cvHtmlTemplate(data);
    case 'resignation':
      return resignationHtmlTemplate(data);
    default:
      throw new Error(`Unsupported document type: ${documentType}`);
  }
};