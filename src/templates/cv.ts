interface WorkExperience {
  id: string;
  company: string;
  jobTitle: string;
  workStart: string;
  workEnd: string;
  responsibilities: string;
}

interface CVData {
  name: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  linkedin: string;
  summary: string;
  degree: string;
  university: string;
  yearStart: string;
  yearEnd: string;
  gpa: string;
  workExperiences: WorkExperience[];
  skills: string;
  languages: string;
  language: 'id' | 'en';
}

export const generateCV = (data: CVData): string => {
  // Format work experiences
  const formatWorkExperiences = (experiences: WorkExperience[], isIndonesian: boolean): string => {
    if (!experiences || experiences.length === 0) {
      return '';
    }

    return experiences.map((exp, index) => {
      const jobTitle = exp.jobTitle || '-';
      const company = exp.company || '-';
      const period = exp.workStart ? `${exp.workStart} - ${exp.workEnd || (isIndonesian ? 'Sekarang' : 'Present')}` : '';
      const responsibilities = exp.responsibilities || (isIndonesian ? 'Melaksanakan berbagai tugas sesuai dengan jabatan.' : 'Performed various duties according to the position.');
      
      return `${index + 1}. ${jobTitle} – ${company} (${period})
   * ${responsibilities}`;
    }).join('\n\n');
  };

  // Create skills and languages lists
  const formatList = (items: string): string => {
    if (!items) return '';
    return items.split(',').map(item => `* ${item.trim()}`).join('\n');
  };

  if (data.language === 'id') {
    return `
CURRICULUM VITAE

Informasi Pribadi
* Nama: ${data.name}
* Tempat, Tanggal Lahir: ${data.birthPlace}, ${data.birthDate}
* Alamat: ${data.address}
* Nomor Telepon: ${data.phone}
* Email: ${data.email}
${data.linkedin ? `* LinkedIn: ${data.linkedin}` : ''}

Ringkasan Profesional
${data.summary}

Pendidikan
* ${data.degree} – ${data.university} (${data.yearStart} - ${data.yearEnd})
${data.gpa ? `* IPK: ${data.gpa}` : ''}

Pengalaman Kerja
${formatWorkExperiences(data.workExperiences, true)}

Keterampilan
${formatList(data.skills)}

Bahasa
${formatList(data.languages)}

Referensi
Tersedia atas permintaan.`;
  } else {
    return `
CURRICULUM VITAE

Personal Information
* Full Name: ${data.name}
* Place and Date of Birth: ${data.birthPlace}, ${data.birthDate}
* Address: ${data.address}
* Phone Number: ${data.phone}
* Email: ${data.email}
${data.linkedin ? `* LinkedIn: ${data.linkedin}` : ''}

Professional Summary
${data.summary}

Education
* ${data.degree} – ${data.university} (${data.yearStart} - ${data.yearEnd})
${data.gpa ? `* GPA: ${data.gpa}` : ''}

Work Experience
${formatWorkExperiences(data.workExperiences, false)}

Skills
${formatList(data.skills)}

Languages
${formatList(data.languages)}

References
Available upon request.`;
  }
};