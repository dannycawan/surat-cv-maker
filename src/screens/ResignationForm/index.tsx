/*
Purpose: Resignation letter creation/edit form with draft handling, validation, template choice, and preview navigation.
Caller: Root stack route ResignationForm from src/navigation/index.tsx.
Dependencies: React Navigation, React Native Paper, AsyncStorage draft service, validation helpers, template metadata, AdMob service.
Main Functions: ResignationForm component, form field handlers, draft save/load flow, hardware back confirmation.
Side Effects: Reads/writes local drafts, shows alerts/ads, intercepts Android hardware back while unsaved changes exist.
*/

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  BackHandler,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TextInput,
  IconButton,
  Button,
  Card,
  Avatar,
  Checkbox
} from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation';
import { getDraft, saveDraft } from '../../utils/storageService';
import { RESIGNATION_TEMPLATES } from '../../constants/templates';
import { AdBanner, interstitialAdManager } from '../../utils/adMobService';
import theme from '../../theme';

type ResignationFormRouteProp = RouteProp<RootStackParamList, 'ResignationForm'>;
type ResignationFormNavigationProp = StackNavigationProp<RootStackParamList>;

const FORM_STEPS = ['Data Pribadi', 'Detail Perusahaan', 'Alasan', 'Tinjauan'];

const inputTheme = {
  colors: {
    text: theme.colors.black,
    placeholder: theme.colors.medium,
    primary: theme.colors.primary,
    error: theme.colors.error,
    background: theme.colors.white, // Explicitly set background
  }
};

// Reasons for resignation
const REASONS = {
  id: [
    { id: 'personal', label: 'Alasan Pribadi' },
    { id: 'career', label: 'Kesempatan Karier Lain' },
    { id: 'education', label: 'Melanjutkan Pendidikan' },
    { id: 'health', label: 'Kesehatan' },
    { id: 'relocation', label: 'Pindah Domisili' },
    { id: 'other', label: 'Alasan Lainnya' },
  ],
  en: [
    { id: 'personal', label: 'Personal Reasons' },
    { id: 'career', label: 'Career Opportunity Elsewhere' },
    { id: 'education', label: 'Further Education' },
    { id: 'health', label: 'Health Reasons' },
    { id: 'relocation', label: 'Relocation' },
    { id: 'other', label: 'Other Reasons' },
  ]
};

const ResignationForm = () => {
  const navigation = useNavigation<ResignationFormNavigationProp>();
  const route = useRoute<ResignationFormRouteProp>();
  const insets = useSafeAreaInsets();
  const { draftId } = route.params || {};
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    companyName: '',
    companyAddress: '',
    recipientName: '',
    lastWorkingDate: '',
    otherReason: '',
    language: 'id' as 'id' | 'en',
    templateId: RESIGNATION_TEMPLATES[0].id
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Load draft data if editing existing draft
  useEffect(() => {
    const loadDraftData = async () => {
      if (draftId) {
        const draft = await getDraft('resignation', draftId);
        if (draft) {
          setFormData(draft.data);
          setSelectedReasons(draft.data.reasons || []);
        }
      }
    };
    
    loadDraftData();
  }, [draftId]);
  
  // Handle back button press to prevent accidental data loss
  useEffect(() => {
    const handleBackPress = () => {
      if (hasUnsavedChanges) {
        confirmGoBack();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      backSubscription.remove();
    };
  }, [hasUnsavedChanges]);
  
  // Function to handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
    
    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);
    
    // Clear error when field is edited
    setErrors(prevErrors => {
      if (prevErrors[field]) {
        return {
          ...prevErrors,
          [field]: ''
        };
      }
      return prevErrors;
    });
  }, []);
  
  // Toggle reason selection
  const toggleReason = useCallback((reasonId: string) => {
    setSelectedReasons(prevReasons => {
      if (prevReasons.includes(reasonId)) {
        return prevReasons.filter(id => id !== reasonId);
      } else {
        return [...prevReasons, reasonId];
      }
    });
    
    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);
    
    // Clear reason error if any reason is selected
    if (errors.reasons) {
      setErrors(prev => ({ ...prev, reasons: '' }));
    }
  }, [errors.reasons]);
  
  // Function to handle saving the draft
  const handleSaveDraft = async () => {
    try {
      // Validate required fields first
      if (!formData.name || !formData.position || !formData.companyName || selectedReasons.length === 0) {
        setErrors({
          ...errors,
          name: !formData.name ? 'Nama harus diisi' : '',
          position: !formData.position ? 'Posisi harus diisi' : '',
          companyName: !formData.companyName ? 'Nama perusahaan harus diisi' : '',
          reasons: selectedReasons.length === 0 ? 'Pilih minimal satu alasan' : ''
        });
        return;
      }
      
      // Validate other reason field if selected
      if (selectedReasons.includes('other') && !formData.otherReason) {
        setErrors({
          ...errors,
          otherReason: 'Alasan lainnya harus diisi'
        });
        return;
      }
      
      // Create draft title from name and position
      const draftTitle = `${formData.name} - ${formData.position} di ${formData.companyName}`;
      
      // Combine data with selected reasons
      const dataToSave = { ...formData, reasons: selectedReasons };
      
      // Save the draft (use existing draftId if editing)
      await saveDraft('resignation', dataToSave, draftTitle, draftId);
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
      
      // Show interstitial ad after successful save
      interstitialAdManager.showAd();
      
      // Show success message and navigate back
      Alert.alert(
        'Berhasil',
        'Draft surat pengunduran diri berhasil disimpan',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Gagal menyimpan draft. Silakan coba lagi.');
    }
  };
  
  // Function to handle preview
  const handlePreview = () => {
    // Combine data with selected reasons
    const dataToPreview = { ...formData, reasons: selectedReasons };
    
    navigation.navigate('Preview', {
      documentType: 'resignation',
      data: dataToPreview
    });
  };
  
  // Function to confirm going back if there are unsaved changes
  const confirmGoBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Perubahan Belum Disimpan',
        'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin kembali?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Ya, Kembali', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  // Render form step
  const renderFormStep = () => {
    const reasonsToDisplay = formData.language === 'id' ? REASONS.id : REASONS.en;
    
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Informasi Pribadi</Text>
            <TextInput
              label="Nama Lengkap"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              left={<TextInput.Icon icon="account" color={theme.colors.primary} />}
              error={!!errors.name}
              theme={inputTheme}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            
            <TextInput
              label="Posisi/Jabatan"
              value={formData.position}
              onChangeText={(text) => handleInputChange('position', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              left={<TextInput.Icon icon="briefcase" color={theme.colors.primary} />}
              error={!!errors.position}
              theme={inputTheme}
            />
            {errors.position ? <Text style={styles.errorText}>{errors.position}</Text> : null}
            
            <View style={styles.languageSelector}>
              <Text style={styles.languageTitle}>Bahasa</Text>
              <View style={styles.languageOptions}>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    formData.language === 'id' && styles.selectedLanguage
                  ]}
                  onPress={() => handleInputChange('language', 'id')}
                >
                  <Text style={formData.language === 'id' ? styles.selectedLanguageText : styles.languageText}>
                    Bahasa Indonesia
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    formData.language === 'en' && styles.selectedLanguage
                  ]}
                  onPress={() => handleInputChange('language', 'en')}
                >
                  <Text style={formData.language === 'en' ? styles.selectedLanguageText : styles.languageText}>
                    Bahasa Inggris
                  </Text>
                </TouchableOpacity>
                </View>
            </View>
          </View>
        );
      
      case 1: // Company Details
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Detail Perusahaan</Text>
            <TextInput
              label="Nama Perusahaan"
              value={formData.companyName}
              onChangeText={(text) => handleInputChange('companyName', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              left={<TextInput.Icon icon="office-building" color={theme.colors.primary} />}
              error={!!errors.companyName}
              theme={inputTheme}
            />
            {errors.companyName ? <Text style={styles.errorText}>{errors.companyName}</Text> : null}
            
            <TextInput
              label="Alamat Perusahaan"
              value={formData.companyAddress}
              onChangeText={(text) => handleInputChange('companyAddress', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="map-marker" color={theme.colors.primary} />}
              error={!!errors.companyAddress}
              theme={inputTheme}
            />
            {errors.companyAddress ? <Text style={styles.errorText}>{errors.companyAddress}</Text> : null}
            
            <TextInput
              label="Nama Penerima Surat (HRD/Atasan)"
              value={formData.recipientName}
              onChangeText={(text) => handleInputChange('recipientName', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              left={<TextInput.Icon icon="account-tie" color={theme.colors.primary} />}
              theme={inputTheme}
            />
            
            <TextInput
              label="Tanggal Terakhir Bekerja (DD/MM/YYYY)"
              value={formData.lastWorkingDate}
              onChangeText={(text) => handleInputChange('lastWorkingDate', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              left={<TextInput.Icon icon="calendar" color={theme.colors.primary} />}
              theme={inputTheme}
            />
          </View>
        );
      
      case 2: // Reasons for Resignation
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Alasan Pengunduran Diri</Text>
            <Text style={styles.helpText}>Pilih satu atau lebih alasan:</Text>
            
            {errors.reasons ? <Text style={[styles.errorText, { marginBottom: 12 }]}>{errors.reasons}</Text> : null}
            
            <View style={styles.reasonsList}>
              {reasonsToDisplay.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={styles.reasonItem}
                  onPress={() => toggleReason(reason.id)}
                >
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      status={selectedReasons.includes(reason.id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleReason(reason.id)}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.reasonText}>{reason.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedReasons.includes('other') && (
              <TextInput
                label="Jelaskan Alasan Lainnya"
                value={formData.otherReason}
                onChangeText={(text) => handleInputChange('otherReason', text)}
                style={[styles.input, { backgroundColor: theme.colors.white }]}
                mode="outlined"
                multiline
                numberOfLines={4}
                left={<TextInput.Icon icon="text" color={theme.colors.primary} />}
                error={!!errors.otherReason}
                theme={inputTheme}
              />
            )}
            {errors.otherReason ? <Text style={styles.errorText}>{errors.otherReason}</Text> : null}
          </View>
        );
      
      case 3: // Review
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Tinjauan Informasi</Text>
            
            <Card style={styles.reviewCard}>
              <Card.Title title="Informasi Pribadi" left={(props) => <Avatar.Icon {...props} icon="account" />} />
              <Card.Content>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Nama:</Text>
                  <Text style={styles.reviewValue}>{formData.name || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Posisi:</Text>
                  <Text style={styles.reviewValue}>{formData.position || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Bahasa:</Text>
                  <Text style={styles.reviewValue}>{formData.language === 'id' ? 'Bahasa Indonesia' : 'Bahasa Inggris'}</Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={styles.reviewCard}>
              <Card.Title title="Detail Perusahaan" left={(props) => <Avatar.Icon {...props} icon="office-building" />} />
              <Card.Content>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Perusahaan:</Text>
                  <Text style={styles.reviewValue}>{formData.companyName || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Penerima:</Text>
                  <Text style={styles.reviewValue}>{formData.recipientName || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Tanggal Terakhir:</Text>
                  <Text style={styles.reviewValue}>{formData.lastWorkingDate || '—'}</Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={styles.reviewCard}>
              <Card.Title title="Alasan Pengunduran Diri" left={(props) => <Avatar.Icon {...props} icon="information" />} />
              <Card.Content>
                {selectedReasons.length > 0 ? (
                  <View>
                    {selectedReasons.map((reasonId) => {
                      const reason = reasonsToDisplay.find(r => r.id === reasonId);
                      if (reasonId === 'other') {
                        return (
                          <View key={reasonId} style={styles.reviewItem}>
                            <Text style={styles.reviewLabel}>Alasan Lainnya:</Text>
                            <Text style={styles.reviewValue}>{formData.otherReason || '—'}</Text>
                          </View>
                        );
                      }
                      return (
                        <View key={reasonId} style={styles.reviewItem}>
                          <Text style={styles.reviewLabel}>Alasan:</Text>
                          <Text style={styles.reviewValue}>{reason?.label || '—'}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.emptyReview}>Tidak ada alasan yang dipilih</Text>
                )}
              </Card.Content>
            </Card>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  // Render form step indicators
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {FORM_STEPS.map((step, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <View 
                style={[
                  styles.stepConnector, 
                  currentStep >= index && styles.stepConnectorActive
                ]} 
              />
            )}
            <TouchableOpacity
              style={[
                styles.stepCircle,
                currentStep === index && styles.stepCircleActive,
                currentStep > index && styles.stepCircleCompleted
              ]}
              onPress={() => index <= currentStep && setCurrentStep(index)}
            >
              <Text 
                style={[
                  styles.stepNumber,
                  (currentStep === index || currentStep > index) && styles.stepNumberActive
                ]}
              >
                {currentStep > index ? '✓' : (index + 1)}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.white}
            size={24}
            onPress={confirmGoBack}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>
            {draftId ? 'Edit Surat Pengunduran Diri' : 'Buat Surat Pengunduran Diri'}
          </Text>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>
      
      <View style={styles.stepLabelContainer}>
        <Text style={styles.stepLabel}>{FORM_STEPS[currentStep]}</Text>
        <Text style={styles.stepCounter}>Langkah {currentStep + 1} dari {FORM_STEPS.length}</Text>
      </View>
      
      {renderStepIndicator()}
      
      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {renderFormStep()}
        <View style={styles.inlineAdContainer}>
          <AdBanner />
        </View>
      </KeyboardAwareScrollView>
      
      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={() => setCurrentStep(currentStep - 1)}
            style={styles.footerButton}
            icon="arrow-left"
          >
            Sebelumnya
          </Button>
        )}
        
        {currentStep < FORM_STEPS.length - 1 ? (
          <Button
            mode="contained"
            onPress={() => setCurrentStep(currentStep + 1)}
            style={[styles.footerButton, currentStep === 0 && styles.footerButtonFull]}
            icon="arrow-right"
            contentStyle={{ flexDirection: 'row-reverse' }}
          >
            Selanjutnya
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSaveDraft}
            style={styles.footerButton}
            icon="content-save"
          >
            Simpan
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Step indicator styles
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  stepCircleCompleted: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.light,
    marginHorizontal: 4,
  },
  stepConnectorActive: {
    backgroundColor: theme.colors.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.medium,
  },
  stepNumberActive: {
    color: theme.colors.white,
  },
  stepLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  stepCounter: {
    fontSize: 14,
    color: theme.colors.medium,
  },
  // Form styles
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  inlineAdContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.medium,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.white,
    color: theme.colors.black, 
  },
  inputText: {
    color: theme.colors.black,
  },
  // Reason selection styles
  reasonsList: {
    marginBottom: 16,
  },
  reasonItem: {
    marginBottom: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonText: {
    fontSize: 16,
    color: theme.colors.black,
    marginLeft: 8,
  },
  // Language selector styles
  languageSelector: {
    marginBottom: 16,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.black,
  },
  languageOptions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  languageOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.light,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedLanguage: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  languageText: {
    color: theme.colors.medium,
  },
  selectedLanguageText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 8,
  },
  // Review styles
  reviewCard: {
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewLabel: {
    width: 120,
    fontSize: 14,
    color: theme.colors.medium,
  },
  reviewValue: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.black,
    fontWeight: '500',
  },
  emptyReview: {
    color: theme.colors.medium,
    fontStyle: 'italic',
  },
  previewButtonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  previewButton: {
    width: '50%',
  },
  // Footer styles
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  footerButtonFull: {
    flex: 1,
    marginLeft: 'auto',
  },
});

export default ResignationForm;
