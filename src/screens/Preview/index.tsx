// src/screens/Preview/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Animated,
  Share,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  BackHandler,
  Clipboard
} from 'react-native';
import { 
  Text,
  Portal,
  Modal,
  Button,
  FAB,
  Snackbar,
  ProgressBar,
  IconButton
} from 'react-native-paper';
import { RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation';
import { generateJobApplicationLetter } from '../../templates/jobApplication';
import { generateCV } from '../../templates/cv';
import { generateResignationLetter } from '../../templates/resignation';
import { exportToPdf, exportToDocx } from '../../utils/exportUtils';
import { generateTemplateHTML } from '../../templates/htmlTemplates';
import WebView from 'react-native-webview';
import theme from '../../theme';
import { interstitialAdManager } from '../../utils/adMobService';

type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'Preview'>;

interface PreviewScreenProps {
  route: PreviewScreenRouteProp;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  // States
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [htmlContent, setHtmlContent] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { documentType, data } = route.params;
  
  let documentContent = '';
  let documentTitle = '';
  let fileName = '';
  
  // Generate document content based on the type
  switch (documentType) {
    case 'jobApplication':
      documentContent = generateJobApplicationLetter(data);
      documentTitle = data.language === 'id' ? 'Surat Lamaran Kerja' : 'Job Application Letter';
      fileName = `Lamaran_${data.name}`;
      break;
    case 'cv':
      documentContent = generateCV(data);
      documentTitle = 'Curriculum Vitae (CV)';
      fileName = `CV_${data.name}`;
      break;
    case 'resignation':
      documentContent = generateResignationLetter(data);
      documentTitle = data.language === 'id' ? 'Surat Pengunduran Diri' : 'Resignation Letter';
      fileName = `Pengunduran_${data.name}`;
      break;
  }
  
  // Generate HTML content when component mounts or when document type or data changes
  useEffect(() => {
    try {
      const html = generateTemplateHTML(data, documentType);
      // Add additional CSS to improve document appearance
      const enhancedHtml = html.replace(
        '</head>',
        `<style>
          body {
            padding: 20px;
            line-height: 1.6;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #333;
            background-color: #fcfcfc;
          }
          .experience-item {
            margin-bottom: 16px;
            padding-left: 18px;
            border-left: 2px solid #4361EE30;
          }
          p {
            margin-bottom: 12px;
          }
          ul, ol {
            padding-left: 30px;
            margin-bottom: 16px;
          }
          li {
            margin-bottom: 8px;
          }
          @media print {
            body {
              background-color: white;
            }
          }
        </style></head>`
      );
      setHtmlContent(enhancedHtml);
    } catch (error) {
      console.error('Error generating HTML:', error);
      setSnackbarMessage('Gagal membuat tampilan HTML');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  }, [documentType, data]);
  
  // Handle back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (fabOpen) {
          setFabOpen(false);
          return true;
        }
        if (menuVisible) {
          setMenuVisible(false);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [fabOpen, menuVisible])
  );
  
  // Simulate export progress
  useEffect(() => {
    if (exporting) {
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.1;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [exporting]);
  
  // Reset export progress when done
  useEffect(() => {
    if (exportProgress >= 1) {
      setTimeout(() => {
        setExporting(null);
        setExportProgress(0);
      }, 500);
    }
  }, [exportProgress]);
  
  const handleExportPDF = async () => {
    setExporting('pdf');
    setLoading(true);
    setFabOpen(false);
    
    try {
      await exportToPdf(data, documentType, documentTitle, fileName);
      setSnackbarMessage('Dokumen PDF berhasil dibuat');
      setSnackbarVisible(true);
      
      // Show interstitial ad after successful export
      interstitialAdManager.showAd();
    } catch (error) {
      setSnackbarMessage('Gagal membuat file PDF. Silakan coba lagi.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportDOCX = async () => {
    setExporting('docx');
    setLoading(true);
    setFabOpen(false);
    
    try {
      await exportToDocx(data, documentType, documentTitle, fileName);
      setSnackbarMessage('Dokumen DOCX berhasil dibuat');
      setSnackbarVisible(true);
      
      // Show interstitial ad after successful export
      interstitialAdManager.showAd();
    } catch (error) {
      setSnackbarMessage('Gagal membuat file dokumen. Silakan coba lagi.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyText = async () => {
    setFabOpen(false);
    try {
      await Clipboard.setString(documentContent);
      setSnackbarMessage('Teks berhasil disalin');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error copying text:', error);
      setSnackbarMessage('Gagal menyalin teks');
      setSnackbarVisible(true);
    }
  };
  
  const handleShare = async () => {
    setFabOpen(false);
    try {
      await Share.share({
        message: documentContent,
        title: documentTitle,
      });
      setSnackbarMessage('Dokumen dibagikan');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error sharing document:', error);
      setSnackbarMessage('Gagal membagikan dokumen');
      setSnackbarVisible(true);
    }
  };
  
  const renderHeader = () => {
    const topPadding = insets.top;
    
    return (
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={theme.colors.primary} 
          translucent={false} // Set to false to prevent transparency issues
        />
        
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={theme.colors.white} 
              />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>{documentTitle}</Text>
            
            {/* Removed headerActions with the zoom and delete buttons */}
            <View style={styles.backButton} />
          </View>
          
          <View style={styles.documentLabel}>
            <MaterialCommunityIcons 
              name={
                documentType === 'jobApplication' 
                  ? 'file-document-outline' 
                  : documentType === 'cv' 
                    ? 'account-details' 
                    : 'exit-to-app'
              } 
              size={18} 
              color={theme.colors.white} 
            />
            <Text style={styles.documentLabelText}>{documentTitle}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };
  
  const renderExportingOverlay = () => {
    if (!exporting) return null;
    
    return (
      <View style={styles.exportingOverlay}>
        <View style={styles.exportingContainer}>
          <MaterialCommunityIcons 
            name={exporting === 'pdf' ? 'file-pdf-box' : 'file-word-box'} 
            size={40} 
            color={exporting === 'pdf' ? theme.colors.error : theme.colors.info}
          />
          <Text style={styles.exportingTitle}>
            {exporting === 'pdf' ? 'Membuat file PDF' : 'Membuat file DOCX'}
          </Text>
          <ProgressBar 
            progress={exportProgress} 
            color={exporting === 'pdf' ? theme.colors.error : theme.colors.info} 
            style={styles.exportingProgress}
          />
          <Text style={styles.exportingStatus}>
            {exportProgress < 1 ? 'Memproses dokumen...' : 'Selesai!'}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderDocument = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat dokumen...</Text>
        </View>
      );
    }
    
    // Enhanced WebView with improved styling
    const userAgent = Platform.OS === 'android' ? 'Chrome/97.0.4692.99 Mobile' : undefined;
    const scaledHtml = htmlContent.replace(
      '<head>',
      `<head>
      <meta name="viewport" content="width=device-width, initial-scale=${zoomLevel}, maximum-scale=5.0, user-scalable=yes" />
      <style>
        html, body {
          overflow-x: hidden;
          width: 100%;
        }
        .content-container, .section-content {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      </style>`
    );
    
    return (
      <View style={styles.documentContainer}>
        <WebView
          source={{ html: scaledHtml }}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          userAgent={userAgent}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
        />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <View style={[styles.content, { marginTop: 0 }]}>
        {renderDocument()}
      </View>
      
      {/* Only show FAB when not previewing from JobApplicationForm */}
      {!('fromJobApplicationForm' in route.params && route.params.fromJobApplicationForm === true) && (
        <FAB.Group
          visible={true}
          open={fabOpen}
          icon={fabOpen ? 'close' : 'dots-vertical'}
          actions={[
            {
              icon: 'file-pdf-box',
              label: 'Export PDF',
              onPress: handleExportPDF,
              color: theme.colors.error,
              style: { backgroundColor: '#FFFFFF' }
            },
            {
              icon: 'file-word-box',
              label: 'Export DOCX',
              onPress: handleExportDOCX,
              color: theme.colors.info,
              style: { backgroundColor: '#FFFFFF' }
            },
            {
              icon: 'content-copy',
              label: 'Copy Teks',
              onPress: handleCopyText,
              color: theme.colors.medium,
              style: { backgroundColor: '#FFFFFF' }
            },
            {
              icon: 'share-variant',
              label: 'Bagikan',
              onPress: handleShare,
              color: theme.colors.success,
              style: { backgroundColor: '#FFFFFF' }
            },
            {
              icon: 'printer',
              label: 'Cetak',
              onPress: () => {
                setSnackbarMessage('Fitur cetak tidak tersedia di versi ini');
                setSnackbarVisible(true);
              },
              color: theme.colors.secondary,
              style: { backgroundColor: '#FFFFFF' }
            }
          ]}
          fabStyle={styles.fab}
          color={theme.colors.white}
          onStateChange={({ open }) => setFabOpen(open)}
        />
      )}
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: 'Tutup',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
      
      <Portal>
        {renderExportingOverlay()}
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Make sure this is a solid color
  },
  // Header styles
  header: {
    width: '100%',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: theme.colors.primary, // Add this to ensure no transparent areas
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  documentLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
  },
  documentLabelText: {
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 8,
    fontWeight: '500',
  },
  // Content styles
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.medium,
  },
  // Document styles
  documentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 0, // No rounded corners for full-screen effect
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  // FAB styles
  fab: {
    backgroundColor: theme.colors.primary,
  },
  // Export overlay styles
  exportingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  exportingContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  exportingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 16,
  },
  exportingProgress: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  exportingStatus: {
    marginTop: 12,
    color: theme.colors.medium,
  },
  // Snackbar styles
  snackbar: {
    marginBottom: 16,
  },
});

export default PreviewScreen;