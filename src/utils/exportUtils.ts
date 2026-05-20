/*
Purpose: Converts generated document data into HTML, PDF, or shareable document files.
Caller: Preview screen export actions and any future document export flows.
Dependencies: expo-print, expo-file-system legacy API, expo-sharing, HTML template generators.
Main Functions: generateHTML, exportToPdf, exportToDocx.
Side Effects: Writes temporary files to app document storage and opens the native share sheet.
*/

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { printToFileAsync } from 'expo-print';
import { 
  jobApplicationHtmlTemplate, 
  cvHtmlTemplate, 
  resignationHtmlTemplate 
} from '../templates/htmlTemplates';

// Function to generate HTML based on document type
export const generateHTML = (data: any, documentType: string): string => {
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

// Function to export document as PDF
export const exportToPdf = async (data: any, documentType: string, title: string, filename: string): Promise<void> => {
  try {
    // Generate HTML using the appropriate template
    const html = generateHTML(data, documentType);
    
    // Generate PDF file
    const { uri } = await printToFileAsync({
      html: html,
      base64: false,
    });
    
    // Create a path for the PDF file in the documents directory
    const pdfFileName = `${filename.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const pdfPath = `${FileSystem.documentDirectory}${pdfFileName}`;
    
    // Copy the file to the documents directory
    await FileSystem.copyAsync({
      from: uri,
      to: pdfPath,
    });
    
    // Share the PDF file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${title}`,
        UTI: 'com.adobe.pdf',
      });
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export const exportToDocx = async (data: any, documentType: string, title: string, filename: string): Promise<void> => {
  try {
    // Generate HTML using the appropriate template
    const html = generateHTML(data, documentType);
    
    // Generate file with DOCX extension (still HTML content for MVP)
    const docxFileName = `${filename.replace(/\s+/g, '_')}_${Date.now()}.docx`;
    const docxPath = `${FileSystem.documentDirectory}${docxFileName}`;
    
    // Write the HTML content to a file
    await FileSystem.writeAsStringAsync(docxPath, html, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Share the file with DOCX mime type
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(docxPath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: `Share ${title}`,
        UTI: 'org.openxmlformats.wordprocessingml.document',
      });
    }
  } catch (error) {
    console.error('Error exporting document:', error);
    throw error;
  }
};
