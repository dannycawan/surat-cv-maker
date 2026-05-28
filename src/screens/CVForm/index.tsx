/*
Purpose: CV creation/edit form screen with draft loading, validation, template selection, and preview navigation.
Caller: Root stack route CVForm from src/navigation/index.tsx.
Dependencies: React Navigation, React Native Paper, AsyncStorage draft service, validation helpers, template metadata, AdMob service.
Main Functions: CVForm component, form field handlers, draft save/load flow, hardware back confirmation.
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
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TextInput,
  IconButton,
  Button,
  Card,
  Avatar,
  Divider
} from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation';
import { getDraft, saveDraft } from '../../utils/storageService';
import { CV_TEMPLATES } from '../../constants/templates';
import { AdBanner, interstitialAdManager } from '../../utils/adMobService';
import theme from '../../theme';

// Interface for work experience
interface WorkExperience {
  id: string;
  company: string;
  jobTitle: string;
  workStart: string;
  workEnd: string;
  responsibilities: string;
}

type CVFormRouteProp = RouteProp<RootStackParamList, 'CVForm'>;
type CVFormNavigationProp = StackNavigationProp<RootStackParamList>;

const FORM_STEPS = ['Data Pribadi', 'Pendidikan', 'Pengalaman', 'Keterampilan', 'Tinjauan'];

const inputTheme = {
  colors: {
    text: theme.colors.black,
    placeholder: theme.colors.medium,
    primary: theme.colors.primary,
    error: theme.colors.error,
    background: theme.colors.white, 
  }
};

const CVForm = () => {
  const navigation = useNavigation<CVFormNavigationProp>();
  const route = useRoute<CVFormRouteProp>();
  const insets = useSafeAreaInsets();
  const { draftId } = route.params || {};
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthPlace: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
    linkedin: '',
    summary: '',
    degree: '',
    university: '',
    yearStart: '',
    yearEnd: '',
    gpa: '',
    workExperiences: [] as WorkExperience[],
    skills: '',
    languages: '',
    language: 'id' as 'id' | 'en',
    templateId: CV_TEMPLATES[0].id
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Experience modal state
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<WorkExperience>({
    id: '',
    company: '',
    jobTitle: '',
    workStart: '',
    workEnd: '',
    responsibilities: ''
  });
  
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  
  // Load draft data if editing existing draft
  useEffect(() => {
    const loadDraftData = async () => {
      if (draftId) {
        const draft = await getDraft('cv', draftId);
        if (draft) {
          // Handle old format data (backward compatibility)
          if (draft.data.company && !draft.data.workExperiences) {
            const legacyExperience = {
              id: Date.now().toString(),
              company: draft.data.company || '',
              jobTitle: draft.data.jobTitle || '',
              workStart: draft.data.workStart || '',
              workEnd: draft.data.workEnd || '',
              responsibilities: draft.data.responsibilities || ''
            };
            
            draft.data.workExperiences = [legacyExperience];
            
            // Remove old fields to avoid duplication
            delete draft.data.company;
            delete draft.data.jobTitle;
            delete draft.data.workStart;
            delete draft.data.workEnd;
            delete draft.data.responsibilities;
          }
          
          setFormData(draft.data);
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
  
  // Function to handle experience input changes
  const handleExperienceChange = (field: string, value: string) => {
    setCurrentExperience(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Function to open experience modal for adding
  const handleAddExperience = () => {
    setCurrentExperience({
      id: Date.now().toString(),
      company: '',
      jobTitle: '',
      workStart: '',
      workEnd: '',
      responsibilities: ''
    });
    setIsEditingExperience(false);
    setExperienceModalVisible(true);
  };
  
  // Function to open experience modal for editing
  const handleEditExperience = (experience: WorkExperience) => {
    setCurrentExperience(experience);
    setIsEditingExperience(true);
    setExperienceModalVisible(true);
  };
  
  // Function to save experience from modal
  const handleSaveExperience = () => {
    // Validate experience
    if (!currentExperience.company || !currentExperience.jobTitle) {
      Alert.alert('Error', 'Perusahaan dan posisi harus diisi');
      return;
    }
    
    setFormData(prevData => {
      let updatedExperiences;
      
      if (isEditingExperience) {
        // Update existing experience
        updatedExperiences = prevData.workExperiences.map(exp => 
          exp.id === currentExperience.id ? currentExperience : exp
        );
      } else {
        // Add new experience
        updatedExperiences = [...prevData.workExperiences, currentExperience];
      }
      
      return {
        ...prevData,
        workExperiences: updatedExperiences
      };
    });
    
    setHasUnsavedChanges(true);
    setExperienceModalVisible(false);
  };
  
  // Function to delete an experience
  const handleDeleteExperience = (id: string) => {
    Alert.alert(
      'Hapus Pengalaman',
      'Apakah Anda yakin ingin menghapus pengalaman kerja ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setFormData(prevData => ({
              ...prevData,
              workExperiences: prevData.workExperiences.filter(exp => exp.id !== id)
            }));
            setHasUnsavedChanges(true);
          }
        }
      ]
    );
  };
  
  // Function to handle saving the draft
  const handleSaveDraft = async () => {
    try {
      // Validate required fields first
      if (!formData.name || !formData.email || !formData.university || !formData.degree) {
        setErrors({
          ...errors,
          name: !formData.name ? 'Nama harus diisi' : '',
          email: !formData.email ? 'Email harus diisi' : '',
          university: !formData.university ? 'Universitas/Institusi harus diisi' : '',
          degree: !formData.degree ? 'Gelar/Pendidikan harus diisi' : ''
        });
        return;
      }
      
      // Create draft title from name
      const draftTitle = `CV - ${formData.name}`;
      
      // Save the draft (use existing draftId if editing)
      await saveDraft('cv', formData, draftTitle, draftId);
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
      
      // Show an interstitial ad after successfully saving
      interstitialAdManager.showAd();
      
      // Show success message and navigate back
      Alert.alert(
        'Berhasil',
        'Draft CV berhasil disimpan',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Gagal menyimpan draft. Silakan coba lagi.');
    }
  };
  
  // Function to handle preview
  const handlePreview = () => {
    navigation.navigate('Preview', {
      documentType: 'cv',
      data: formData
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
            
            <View style={styles.row}>
              <TextInput
                label="Tempat Lahir"
                value={formData.birthPlace}
                onChangeText={(text) => handleInputChange('birthPlace', text)}
                style={[styles.input, styles.inputHalf]}
                mode="outlined"
                left={<TextInput.Icon icon="map-marker" color={theme.colors.primary} />}
                theme={inputTheme}
              />
              
              <TextInput
                label="Tanggal Lahir"
                value={formData.birthDate}
                onChangeText={(text) => handleInputChange('birthDate', text)}
                placeholder="DD/MM/YYYY"
                style={[styles.input, styles.inputHalf]}
                mode="outlined"
                left={<TextInput.Icon icon="calendar" color={theme.colors.primary} />}
                theme={inputTheme}
              />
            </View>
            
            <TextInput
              label="Alamat"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="home" color={theme.colors.primary} />}
              theme={inputTheme}
            />
            
            <TextInput
              label="Nomor Telepon"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" color={theme.colors.primary} />}
              theme={inputTheme}
            />
            
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
              error={!!errors.email}
              theme={inputTheme}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            
            <TextInput
              label="LinkedIn (Opsional)"
              value={formData.linkedin}
              onChangeText={(text) => handleInputChange('linkedin', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              left={<TextInput.Icon icon="linkedin" color={theme.colors.primary} />}
              theme={inputTheme}
            />
            
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
      
      case 1: // Education
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Pendidikan</Text>
            <TextInput
              label="Gelar/Tingkat Pendidikan"
              value={formData.degree}
              onChangeText={(text) => handleInputChange('degree', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              left={<TextInput.Icon icon="school" color={theme.colors.primary} />}
              placeholder="Contoh: S1 Teknik Informatika"
              error={!!errors.degree}
              theme={inputTheme}
            />
            {errors.degree ? <Text style={styles.errorText}>{errors.degree}</Text> : null}
            
            <TextInput
              label="Universitas/Institusi"
              value={formData.university}
              onChangeText={(text) => handleInputChange('university', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              left={<TextInput.Icon icon="domain" color={theme.colors.primary} />}
              error={!!errors.university}
              theme={inputTheme}
            />
            {errors.university ? <Text style={styles.errorText}>{errors.university}</Text> : null}
            
            <View style={styles.row}>
              <TextInput
                label="Tahun Mulai"
                value={formData.yearStart}
                onChangeText={(text) => handleInputChange('yearStart', text)}
                style={[styles.input, styles.inputHalf]}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="calendar-arrow-right" color={theme.colors.primary} />}
                theme={inputTheme}
              />
              
              <TextInput
                label="Tahun Selesai"
                value={formData.yearEnd}
                onChangeText={(text) => handleInputChange('yearEnd', text)}
                style={[styles.input, styles.inputHalf]}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="calendar-arrow-left" color={theme.colors.primary} />}
                theme={inputTheme}
              />
            </View>
            
            <TextInput
              label="IPK (Opsional)"
              value={formData.gpa}
              onChangeText={(text) => handleInputChange('gpa', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Icon icon="numeric" color={theme.colors.primary} />}
              theme={inputTheme}
            />
            
            <TextInput
              label="Ringkasan Profesional"
              value={formData.summary}
              onChangeText={(text) => handleInputChange('summary', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              multiline
              numberOfLines={4}
              left={<TextInput.Icon icon="text" color={theme.colors.primary} />}
              placeholder="Tuliskan ringkasan singkat tentang diri dan tujuan karir Anda"
              theme={inputTheme}
            />
          </View>
        );
      
      case 2: // Work Experience
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Pengalaman Kerja</Text>
            
            {formData.workExperiences.length > 0 ? (
              <View style={styles.experienceList}>
                {formData.workExperiences.map((experience, index) => (
                  <Card key={experience.id} style={styles.experienceCard}>
                    <Card.Content>
                      <View style={styles.experienceHeader}>
                        <View>
                          <Text style={styles.experienceCompany}>{experience.company}</Text>
                          <Text style={styles.experiencePosition}>{experience.jobTitle}</Text>
                          {experience.workStart && (
                            <Text style={styles.experienceDuration}>
                              {experience.workStart} - {experience.workEnd || 'Sekarang'}
                            </Text>
                          )}
                        </View>
                        <View style={styles.experienceActions}>
                          <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => handleEditExperience(experience)}
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            onPress={() => handleDeleteExperience(experience.id)}
                          />
                        </View>
                      </View>
                      {experience.responsibilities && (
                        <>
                          <Divider style={styles.experienceDivider} />
                          <Text style={styles.experienceResponsibilities}>{experience.responsibilities}</Text>
                        </>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ) : (
              <View style={styles.emptyExperience}>
                <Text style={styles.emptyText}>Belum ada pengalaman kerja yang ditambahkan</Text>
              </View>
            )}
            
            <Button 
              mode="contained" 
              icon="plus" 
              onPress={handleAddExperience}
              style={styles.addExperienceButton}
            >
              Tambah Pengalaman
            </Button>
            
            {/* Experience Modal */}
            <Modal
              visible={experienceModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setExperienceModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>
                    {isEditingExperience ? 'Edit Pengalaman Kerja' : 'Tambah Pengalaman Kerja'}
                  </Text>
                  
                  <TextInput
                    label="Nama Perusahaan"
                    value={currentExperience.company}
                    onChangeText={(text) => handleExperienceChange('company', text)}
                    style={[styles.input, { backgroundColor: theme.colors.white }]}
                    mode="outlined"
                    left={<TextInput.Icon icon="domain" color={theme.colors.primary} />}
                    theme={inputTheme}
                  />
                  
                  <TextInput
                    label="Posisi/Jabatan"
                    value={currentExperience.jobTitle}
                    onChangeText={(text) => handleExperienceChange('jobTitle', text)}
                    style={[styles.input, { backgroundColor: theme.colors.white }]}
                    mode="outlined"
                    left={<TextInput.Icon icon="briefcase" color={theme.colors.primary} />}
                    theme={inputTheme}
                  />
                  
                  <View style={styles.row}>
                    <TextInput
                      label="Tahun Mulai"
                      value={currentExperience.workStart}
                      onChangeText={(text) => handleExperienceChange('workStart', text)}
                      style={[styles.input, styles.inputHalf]}
                      mode="outlined"
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="calendar-arrow-right" color={theme.colors.primary} />}
                      theme={inputTheme}
                    />
                    
                    <TextInput
                      label="Tahun Selesai"
                      value={currentExperience.workEnd}
                      onChangeText={(text) => handleExperienceChange('workEnd', text)}
                      style={[styles.input, styles.inputHalf]}
                      mode="outlined"
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="calendar-arrow-left" color={theme.colors.primary} />}
                      theme={inputTheme}
                    />
                  </View>
                  
                  <TextInput
                    label="Tanggung Jawab & Pencapaian"
                    value={currentExperience.responsibilities}
                    onChangeText={(text) => handleExperienceChange('responsibilities', text)}
                    style={[styles.input, { backgroundColor: theme.colors.white }]}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    left={<TextInput.Icon icon="trophy" color={theme.colors.primary} />}
                    theme={inputTheme}
                  />
                  
                  <View style={styles.modalActions}>
                    <Button 
                      mode="outlined" 
                      onPress={() => setExperienceModalVisible(false)}
                      style={styles.modalButton}
                    >
                      Batal
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={handleSaveExperience}
                      style={styles.modalButton}
                    >
                      Simpan
                    </Button>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        );

      case 3: // Skills & Languages
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Keterampilan & Bahasa</Text>
            <TextInput
              label="Keterampilan"
              value={formData.skills}
              onChangeText={(text) => handleInputChange('skills', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              multiline
              numberOfLines={4}
              left={<TextInput.Icon icon="wrench" color={theme.colors.primary} />}
              placeholder="Daftar keterampilan Anda, pisahkan dengan koma (contoh: Microsoft Office, Desain Grafis, HTML/CSS)"
              theme={inputTheme}
            />
            
            <TextInput
              label="Bahasa yang Dikuasai"
              value={formData.languages}
              onChangeText={(text) => handleInputChange('languages', text)}
              style={[styles.input, { backgroundColor: theme.colors.white }]}
              mode="outlined"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="translate" color={theme.colors.primary} />}
              placeholder="Daftar bahasa yang Anda kuasai, pisahkan dengan koma (contoh: Bahasa Indonesia, Bahasa Inggris, Bahasa Jepang)"
              theme={inputTheme}
            />
          </View>
        );
      
      case 4: // Review
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
                  <Text style={styles.reviewLabel}>Tempat, Tanggal Lahir:</Text>
                  <Text style={styles.reviewValue}>
                    {formData.birthPlace ? `${formData.birthPlace}${formData.birthDate ? ', ' + formData.birthDate : ''}` : '—'}
                  </Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Email:</Text>
                  <Text style={styles.reviewValue}>{formData.email || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Telepon:</Text>
                  <Text style={styles.reviewValue}>{formData.phone || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Bahasa:</Text>
                  <Text style={styles.reviewValue}>{formData.language === 'id' ? 'Bahasa Indonesia' : 'Bahasa Inggris'}</Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={styles.reviewCard}>
              <Card.Title title="Pendidikan" left={(props) => <Avatar.Icon {...props} icon="school" />} />
              <Card.Content>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Gelar:</Text>
                  <Text style={styles.reviewValue}>{formData.degree || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Universitas:</Text>
                  <Text style={styles.reviewValue}>{formData.university || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Tahun:</Text>
                  <Text style={styles.reviewValue}>
                    {formData.yearStart ? `${formData.yearStart} - ${formData.yearEnd || 'Sekarang'}` : '—'}
                  </Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>IPK:</Text>
                  <Text style={styles.reviewValue}>{formData.gpa || '—'}</Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={styles.reviewCard}>
              <Card.Title title="Pengalaman Kerja" left={(props) => <Avatar.Icon {...props} icon="briefcase" />} />
              <Card.Content>
                {formData.workExperiences.length > 0 ? (
                  formData.workExperiences.map((exp, index) => (
                    <View key={exp.id} style={styles.reviewExperience}>
                      <View style={styles.reviewItem}>
                        <Text style={styles.reviewLabel}>Perusahaan {index + 1}:</Text>
                        <Text style={styles.reviewValue}>{exp.company}</Text>
                      </View>
                      <View style={styles.reviewItem}>
                        <Text style={styles.reviewLabel}>Posisi:</Text>
                        <Text style={styles.reviewValue}>{exp.jobTitle}</Text>
                      </View>
                      <View style={styles.reviewItem}>
                        <Text style={styles.reviewLabel}>Periode:</Text>
                        <Text style={styles.reviewValue}>
                          {exp.workStart ? `${exp.workStart} - ${exp.workEnd || 'Sekarang'}` : '—'}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyReviewText}>Tidak ada pengalaman kerja yang ditambahkan</Text>
                )}
              </Card.Content>
            </Card>
            
            <Card style={styles.reviewCard}>
              <Card.Title title="Keterampilan & Bahasa" left={(props) => <Avatar.Icon {...props} icon="wrench" />} />
              <Card.Content>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Keterampilan:</Text>
                  <Text style={styles.reviewValue}>{formData.skills || '—'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Bahasa:</Text>
                  <Text style={styles.reviewValue}>{formData.languages || '—'}</Text>
                </View>
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
            {draftId ? 'Edit CV' : 'Buat CV'}
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
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.white,
    color: theme.colors.black, // Explicitly set text color
  },
  inputText: {
    color: theme.colors.black,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputHalf: {
    width: '48%',
  },
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
  // Experience styles
  experienceList: {
    marginBottom: 16,
  },
  experienceCard: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  experienceCompany: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  experiencePosition: {
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: 2,
  },
  experienceDuration: {
    fontSize: 12,
    color: theme.colors.medium,
    marginTop: 2,
  },
  experienceActions: {
    flexDirection: 'row',
  },
  experienceDivider: {
    marginVertical: 8,
  },
  experienceResponsibilities: {
    fontSize: 14,
    color: theme.colors.black,
    lineHeight: 20,
  },
  emptyExperience: {
    backgroundColor: theme.colors.white,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: theme.colors.medium,
    fontSize: 14,
    textAlign: 'center',
  },
  addExperienceButton: {
    marginBottom: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
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
  reviewExperience: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light,
    marginBottom: 12,
  },
  emptyReviewText: {
    color: theme.colors.medium,
    fontStyle: 'italic',
    textAlign: 'center',
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

export default CVForm;
