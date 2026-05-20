// src/templates/resignation.ts

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
  
  interface ResignationData {
    name: string;
    position: string;
    companyName: string;
    companyAddress: string;
    recipientName: string;
    lastWorkingDate: string;
    otherReason: string;
    reasons: string[];
    language: 'id' | 'en';
  }
  
  export const generateResignationLetter = (data: ResignationData): string => {
    const reasonTexts = data.reasons.map(reasonId => {
      if (reasonId === 'other') {
        return data.otherReason;
      }
      return data.language === 'id' 
        ? REASON_TEXT.id[reasonId as keyof typeof REASON_TEXT.id] 
        : REASON_TEXT.en[reasonId as keyof typeof REASON_TEXT.en];
    });
  
    if (data.language === 'id') {
      return `
  Kepada Yth.
  ${data.recipientName ? data.recipientName + ' - ' : ''}${data.companyName}
  ${data.companyAddress}
  
  Dengan hormat,
  
  Melalui surat ini, saya ingin menyampaikan pengunduran diri saya dari posisi ${data.position} di ${data.companyName}, terhitung mulai tanggal ${data.lastWorkingDate}.
  
  Adapun alasan pengunduran diri saya adalah sebagai berikut:
  ${reasonTexts.map(text => `* ${text}`).join('\n')}
  
  Saya ingin mengucapkan terima kasih kepada ${data.companyName} atas kesempatan, pengalaman, serta pembelajaran yang sangat berharga selama saya bekerja di sini. Saya juga berterima kasih kepada seluruh rekan kerja atas kerja sama dan dukungannya.
  
  Saya berkomitmen untuk menyelesaikan tanggung jawab saya selama masa transisi dan akan membantu memastikan kelancaran proses pergantian sebelum tanggal efektif pengunduran diri saya. Saya berharap hubungan baik antara saya dan ${data.companyName} tetap terjaga di masa mendatang.
  
  Sekali lagi, saya ucapkan terima kasih atas kesempatan yang telah diberikan.
  
  Hormat saya,
  ${data.name}`;
    } else {
      return `
  Dear ${data.recipientName || 'Hiring Manager'},
  
  I am writing to formally resign from my position as ${data.position} at ${data.companyName}, effective ${data.lastWorkingDate}.
  
  The reason for my resignation is as follows:
  ${reasonTexts.map(text => `* ${text}`).join('\n')}
  
  I sincerely appreciate the opportunities, experiences, and support I have received during my tenure at ${data.companyName}. I am especially grateful for the collaboration and friendships with my colleagues.
  
  I am committed to ensuring a smooth transition and will do my best to complete my responsibilities before my departure. I hope to maintain a positive relationship with ${data.companyName} in the future.
  
  Once again, thank you for the invaluable experience and support during my time at ${data.companyName}.
  
  Best regards,
  ${data.name}`;
    }
  };