// src/templates/jobApplication.ts

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  achievements: string;
}

export interface JobApplicationData {
  name: string;
  address: string;
  phone: string;
  email: string;
  companyName: string;
  companyAddress: string;
  position: string;
  recipientName?: string;
  workExperiences?: WorkExperience[];
  supportingDocuments?: {
    id: string;
    name: string;
  }[];
  language: 'id' | 'en';
}

export const generateJobApplicationLetter = (data: JobApplicationData): string => {
  // Format work experiences
  const formatWorkExperiences = (experiences: WorkExperience[], isIndonesian: boolean): string => {
    if (!experiences || experiences.length === 0) {
      return isIndonesian 
        ? "Saya memiliki pengalaman yang relevan dengan posisi ini."
        : "I have relevant experience for this position.";
    }

    const header = isIndonesian
      ? "Berikut adalah pengalaman kerja saya:"
      : "Below is my work experience:";

    const experienceItems = experiences.map((exp, index) => {
      const position = exp.position || "Staff";
      const company = exp.company;
      const duration = exp.duration;
      const achievements = exp.achievements;

      return isIndonesian
        ? `${index + 1}. ${position} di ${company}${duration ? ` (${duration})` : ''} \n   ${achievements || 'Bertanggung jawab untuk berbagai tugas penting.'}`
        : `${index + 1}. ${position} at ${company}${duration ? ` (${duration})` : ''} \n   ${achievements || 'Responsible for various important tasks.'}`;
    }).join('\n\n');

    return `${header}\n\n${experienceItems}`;
  };

  // Add current date for both Indonesian and English versions
  const date = new Date().toLocaleDateString(
    data.language === 'id' ? 'id-ID' : 'en-US', 
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  if (data.language === 'id') {
    return `
${date}

Kepada Yth.
${data.companyName}
${data.companyAddress}

Dengan hormat,

Sehubungan dengan informasi mengenai lowongan kerja untuk posisi ${data.position} di ${data.companyName}, Maka dari itu, bersamaan dengan surat ini, saya hendak melamar untuk posisi yang lowong tersebut.

${formatWorkExperiences(data.workExperiences || [], true)}

Berikut biodata diri saya.

Nama: ${data.name}
Alamat: ${data.address}
Telepon: ${data.phone}
Email: ${data.email}

Berikut saya lampirkan dokumen pendukung sebagai bahan pertimbangan:
${data.supportingDocuments ? data.supportingDocuments.map((doc, i) => `${i+1}. ${doc.name}`).join('\n') : 
`1. Daftar Riwayat Hidup (CV)
2. Fotokopi Ijazah`}

Demikian surat lamaran yang sudah saya buat. Besar harapan saya agar dapat melanjutkan proses rekrutmen ini. Atas Perhatian dari Bapak/Ibu, saya ucapkan banyak terima kasih.

Hormat saya,
${data.name}`;
  } else {
    return `
${date}

Dear ${data.recipientName || 'Hiring Manager'},

I am writing to express my interest in the ${data.position} at ${data.companyName}, as advertised. With this letter, I would like to apply for the opportunity to contribute my skills and experience to your team.

${formatWorkExperiences(data.workExperiences || [], false)}

Below are my personal details:
* Full Name: ${data.name}
* Address: ${data.address}
* Phone Number: ${data.phone}
* Email: ${data.email}

I have attached the following documents for your consideration:
${data.supportingDocuments ? data.supportingDocuments.map((doc, i) => `${i+1}. ${doc.name}`).join('\n') : 
`1. Resume/Curriculum Vitae (CV)
2. Copy of Diploma`}

I would be honored to have the opportunity to discuss my qualifications further in an interview. Please feel free to contact me via ${data.email} or ${data.phone}.

Thank you for your time and consideration. I look forward to your response.

Sincerely,
${data.name}`;
  }
};