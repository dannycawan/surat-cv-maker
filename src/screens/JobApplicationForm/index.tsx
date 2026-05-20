/*
Purpose: Job application letter creation/edit form with draft handling, validation, template choice, and preview navigation.
Caller: Root stack route JobApplicationForm from src/navigation/index.tsx.
Dependencies: React Navigation, React Native Paper, AsyncStorage draft service, validation helpers, template metadata, AdMob service.
Main Functions: JobApplicationForm component, form field handlers, draft save/load flow, hardware back confirmation.
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
    Divider
} from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation';
import { getDraft, saveDraft } from '../../utils/storageService';
import { JOB_APPLICATION_TEMPLATES } from '../../constants/templates';
import { interstitialAdManager } from '../../utils/adMobService';
import theme from '../../theme';
import { FAB } from 'react-native-paper';

// Interface for work experience
interface WorkExperience {
    id: string;
    company: string;
    position: string;
    duration: string;
    achievements: string;
}

// Add interface for supporting document
interface SupportingDocument {
    id: string;
    name: string;
}

// Update the form data interface
interface FormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    companyName: string;
    companyAddress: string;
    position: string;
    recipientName: string;
    workExperiences: WorkExperience[];
    supportingDocuments: SupportingDocument[];
    language: 'id' | 'en';
    templateId: string;
}

type JobApplicationFormRouteProp = RouteProp<RootStackParamList, 'JobApplicationForm'>;
type JobApplicationFormNavigationProp = StackNavigationProp<RootStackParamList>;

const FORM_STEPS = [
    'Informasi Dasar',
    'Detail Perusahaan',
    'Pengalaman Kerja',
    'Paragraf & Lampiran',
    'Pratinjau'
];

const inputTheme = {
    colors: {
      text: theme.colors.black,
      placeholder: theme.colors.medium,
      primary: theme.colors.primary,
      error: theme.colors.error,
      background: theme.colors.white,
    }
  };

const JobApplicationForm = () => {
    const navigation = useNavigation<JobApplicationFormNavigationProp>();
    const route = useRoute<JobApplicationFormRouteProp>();
    const insets = useSafeAreaInsets();
    const { draftId } = route.params || {};

    // State management
    const [currentStep, setCurrentStep] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        companyName: '',
        companyAddress: '',
        position: '',
        recipientName: '',
        workExperiences: [],
        supportingDocuments: [
            { id: '1', name: 'Daftar Riwayat Hidup (CV)' },
            { id: '2', name: 'Fotokopi Ijazah' }
        ],
        language: 'id',
        templateId: JOB_APPLICATION_TEMPLATES[0].id
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Experience form state
    const [experienceFormVisible, setExperienceFormVisible] = useState(false);
    const [currentExperience, setCurrentExperience] = useState<WorkExperience>({
        id: '',
        company: '',
        position: '',
        duration: '',
        achievements: ''
    });
    const [isEditingExperience, setIsEditingExperience] = useState(false);

    // Load draft data if editing existing draft
    useEffect(() => {
        const loadDraftData = async () => {
            if (draftId) {
                const draft = await getDraft('jobApplication', draftId);
                if (draft) {
                    // Handle old format data (backward compatibility)
                    if (draft.data.previousCompany && !draft.data.workExperiences) {
                        const legacyExperience = {
                            id: Date.now().toString(),
                            company: draft.data.previousCompany || '',
                            position: draft.data.position || '',
                            duration: draft.data.experience || '',
                            achievements: draft.data.achievements || ''
                        };
                        
                        draft.data.workExperiences = [legacyExperience];
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
    const handleInputChange = (field: keyof FormData, value: string | WorkExperience[] | SupportingDocument[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setHasUnsavedChanges(true);

        // Clear error for the field if it exists
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                    [field]: ''
            }));
            }
    };
    
    // Function to handle experience input changes
    const handleExperienceChange = (experienceId: string, field: keyof WorkExperience, value: string) => {
        setFormData(prev => ({
            ...prev,
            workExperiences: prev.workExperiences.map(exp => 
                exp.id === experienceId ? { ...exp, [field]: value } : exp
            )
        }));
        setHasUnsavedChanges(true);
    };
    
    // Function to handle adding a new experience
    const handleAddExperience = () => {
        setCurrentExperience({
            id: Date.now().toString(),
            company: '',
            position: '',
            duration: '',
            achievements: ''
        });
        setIsEditingExperience(false);
        setExperienceFormVisible(true);
    };
    
    // Function to handle editing an existing experience
    const handleEditExperience = (experience: WorkExperience) => {
        setCurrentExperience({...experience});
        setIsEditingExperience(true);
        setExperienceFormVisible(true);
    };
    
    // Function to save the current experience
    const handleSaveExperience = () => {
        // Validate experience
        if (!currentExperience.company || !currentExperience.position) {
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
        setExperienceFormVisible(false);
    };
    
    // Function to cancel adding/editing experience
    const handleCancelExperience = () => {
        setExperienceFormVisible(false);
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
            if (!formData.name || !formData.email || !formData.companyName || !formData.position) {
                setErrors({
                    ...errors,
                    name: !formData.name ? 'Nama harus diisi' : '',
                    email: !formData.email ? 'Email harus diisi' : '',
                    companyName: !formData.companyName ? 'Nama perusahaan harus diisi' : '',
                    position: !formData.position ? 'Posisi harus diisi' : ''
                });
                return;
            }

            // Create draft title from name and position
            const draftTitle = `${formData.name} - ${formData.position} di ${formData.companyName}`;

            // Save the draft (use existing draftId if editing)
            await saveDraft('jobApplication', formData, draftTitle, draftId);

            // Reset unsaved changes flag
            setHasUnsavedChanges(false);
            
            // Show interstitial ad after successful save
            interstitialAdManager.showAd();

            // Show success message and navigate back
            Alert.alert(
                'Berhasil',
                'Draft surat lamaran berhasil disimpan',
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
            documentType: 'jobApplication',
            data: formData,
            fromJobApplicationForm: true
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
                        <Text style={styles.formTitle}>Informasi Dasar</Text>
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
                            label="Nama Penerima Surat (HRD/Atasan)"
                            value={formData.recipientName}
                            onChangeText={(text) => handleInputChange('recipientName', text)}
                            style={[styles.input, { backgroundColor: theme.colors.white }]}
                            mode="outlined"
                            left={<TextInput.Icon icon="account-tie" color={theme.colors.primary} />}
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
                            label="Nomor Telepon"
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange('phone', text)}
                            style={[styles.input, { backgroundColor: theme.colors.white }]}
                            mode="outlined"
                            keyboardType="phone-pad"
                            left={<TextInput.Icon icon="phone" color={theme.colors.primary} />}
                            error={!!errors.phone}
                            theme={inputTheme}
                        />
                        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

                        <TextInput
                            label="Alamat"
                            value={formData.address}
                            onChangeText={(text) => handleInputChange('address', text)}
                            style={[styles.input, { backgroundColor: theme.colors.white }]}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            left={<TextInput.Icon icon="home" color={theme.colors.primary} />}
                            error={!!errors.address}
                            theme={inputTheme}
                        />
                        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

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
                            label="Posisi yang Dilamar"
                            value={formData.position}
                            onChangeText={(text) => handleInputChange('position', text)}
                            style={[styles.input, { backgroundColor: theme.colors.white }]}
                            mode="outlined"
                            left={<TextInput.Icon icon="briefcase" color={theme.colors.primary} />}
                            error={!!errors.position}
                            theme={inputTheme}
                        />
                        {errors.position ? <Text style={styles.errorText}>{errors.position}</Text> : null}
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
                                                    <Text style={styles.experiencePosition}>{experience.position}</Text>
                                                    {experience.duration && (
                                                        <Text style={styles.experienceDuration}>{experience.duration}</Text>
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
                                            {experience.achievements && (
                                                <>
                                                    <Divider style={styles.experienceDivider} />
                                                    <Text style={styles.experienceAchievements}>{experience.achievements}</Text>
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
                        
                        {!experienceFormVisible ? (
                        <Button 
                            mode="contained" 
                            icon="plus" 
                            onPress={handleAddExperience}
                            style={styles.addExperienceButton}
                        >
                            Tambah Pengalaman
                        </Button>
                        ) : (
                            <Card style={styles.experienceFormCard}>
                                <Card.Content>
                                    <Text style={styles.experienceFormTitle}>
                                        {isEditingExperience ? 'Edit Pengalaman Kerja' : 'Tambah Pengalaman Kerja'}
                                    </Text>
                                    
                                    <TextInput
                                        label="Nama Perusahaan"
                                        value={currentExperience.company}
                                        onChangeText={(text) => setCurrentExperience({...currentExperience, company: text})}
                                        style={[styles.input, { backgroundColor: theme.colors.white }]}
                                        mode="outlined"
                                        left={<TextInput.Icon icon="domain" color={theme.colors.primary} />}
                                        theme={inputTheme}
                                    />
                                    
                                    <TextInput
                                        label="Posisi/Jabatan"
                                        value={currentExperience.position}
                                        onChangeText={(text) => setCurrentExperience({...currentExperience, position: text})}
                                        style={[styles.input, { backgroundColor: theme.colors.white }]}
                                        mode="outlined"
                                        left={<TextInput.Icon icon="briefcase" color={theme.colors.primary} />}
                                        theme={inputTheme}
                                    />
                                    
                                    <TextInput
                                        label="Lama Bekerja (e.g., 2 tahun, 2020-2022)"
                                        value={currentExperience.duration}
                                        onChangeText={(text) => setCurrentExperience({...currentExperience, duration: text})}
                                        style={[styles.input, { backgroundColor: theme.colors.white }]}
                                        mode="outlined"
                                        left={<TextInput.Icon icon="clock-outline" color={theme.colors.primary} />}
                                        theme={inputTheme}
                                    />
                                    
                                    <TextInput
                                        label="Pencapaian"
                                        value={currentExperience.achievements}
                                        onChangeText={(text) => setCurrentExperience({...currentExperience, achievements: text})}
                                        style={[styles.input, { backgroundColor: theme.colors.white }]}
                                        mode="outlined"
                                        multiline
                                        numberOfLines={4}
                                        left={<TextInput.Icon icon="trophy" color={theme.colors.primary} />}
                                        theme={inputTheme}
                                    />
                                    
                                    <View style={styles.formActions}>
                                        <Button 
                                            mode="outlined" 
                                            onPress={handleCancelExperience}
                                            style={styles.formButton}
                                        >
                                            Batal
                                        </Button>
                                        <Button 
                                            mode="contained" 
                                            onPress={handleSaveExperience}
                                            style={styles.formButton}
                                        >
                                            Simpan
                                        </Button>
                                    </View>
                                </Card.Content>
                            </Card>
                        )}
                                </View>
                );

            case 3: // Paragraf & Lampiran
                return (
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Paragraf & Lampiran</Text>
                        
                        <Text style={styles.sectionTitle}>Paragraf 2</Text>
                        <View style={styles.paragraphContainer}>
                            <Text style={styles.paragraphText}>
                                Sebagai bahan pertimbangan, bersama ini saya lampirkan:
                            </Text>
                            </View>

                        <Text style={styles.sectionTitle}>Berkas Yang Dilampirkan</Text>
                        <Text style={styles.sectionSubtitle}>Hapus jika tidak ada</Text>
                        
                        {formData.supportingDocuments.map((doc, index) => (
                            <View key={doc.id} style={styles.documentItem}>
                                <TextInput
                                    value={doc.name}
                                    onChangeText={(text) => {
                                        const newDocs = [...formData.supportingDocuments];
                                        newDocs[index].name = text;
                                        handleInputChange('supportingDocuments', newDocs);
                                    }}
                                    style={[styles.input, { backgroundColor: theme.colors.white, flex: 1 }]}
                                    mode="outlined"
                                    theme={inputTheme}
                                />
                                <IconButton
                                    icon="delete"
                                    iconColor={theme.colors.error}
                                    size={24}
                                    onPress={() => {
                                        const newDocs = formData.supportingDocuments.filter(d => d.id !== doc.id);
                                        handleInputChange('supportingDocuments', newDocs);
                                    }}
                                />
                            </View>
                        ))}
                        
                        <View style={styles.attachmentButtons}>
                            <Button
                                mode="outlined"
                                onPress={() => {
                                    const filteredDocs = formData.supportingDocuments.filter(doc => doc.name.trim() !== '');
                                    handleInputChange('supportingDocuments', filteredDocs);
                                }}
                                style={[styles.attachmentButton, styles.removeButton]}
                                icon="minus"
                            >
                                Hapus
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => {
                                    const newDoc = {
                                        id: Date.now().toString(),
                                        name: ''
                                    };
                                    handleInputChange('supportingDocuments', [...formData.supportingDocuments, newDoc]);
                                }}
                                style={[styles.attachmentButton, styles.addButton]}
                                icon="plus"
                            >
                                Tambah
                            </Button>
                        </View>

                        <Text style={styles.sectionTitle}>Paragraf Penutup</Text>
                        <View style={styles.paragraphContainer}>
                            <Text style={styles.paragraphText}>
                                Demikian surat lamaran kerja ini saya tulis dengan jujur dan sungguh-sungguh. Saya sangat berharap agar diberikan kesempatan untuk bekerja di perusahaan Bapak/Ibu.
                            </Text>
                        </View>

                        <Text style={styles.sectionTitle}>Tujuan Penerima Surat</Text>
                        <TextInput
                            label="Nama Penerima / Jabatan"
                            value={formData.recipientName}
                            onChangeText={(text) => handleInputChange('recipientName', text)}
                            style={[styles.input, { backgroundColor: theme.colors.white }]}
                            mode="outlined"
                            placeholder="Contoh: HRD PT Gresik Cipta Persada"
                            left={<TextInput.Icon icon="account-tie" color={theme.colors.primary} />}
                            theme={inputTheme}
                        />
                    </View>
                );

            case 4: // Review
                return (
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Tinjauan</Text>

                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewSectionTitle}>Data Pribadi</Text>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Nama:</Text>
                                <Text style={styles.reviewValue}>{formData.name || '—'}</Text>
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
                                <Text style={styles.reviewLabel}>Alamat:</Text>
                                <Text style={styles.reviewValue}>{formData.address || '—'}</Text>
                            </View>
                        </View>

                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewSectionTitle}>Detail Perusahaan</Text>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Perusahaan:</Text>
                                <Text style={styles.reviewValue}>{formData.companyName || '—'}</Text>
                            </View>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Alamat:</Text>
                                <Text style={styles.reviewValue}>{formData.companyAddress || '—'}</Text>
                            </View>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Posisi:</Text>
                                <Text style={styles.reviewValue}>{formData.position || '—'}</Text>
                            </View>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Penerima:</Text>
                                <Text style={styles.reviewValue}>{formData.recipientName || '—'}</Text>
                            </View>
                        </View>

                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewSectionTitle}>Pengalaman Kerja</Text>
                            {formData.workExperiences.length > 0 ? (
                                formData.workExperiences.map((exp, index) => (
                                    <View key={exp.id} style={styles.reviewExperience}>
                                        <View style={styles.reviewItem}>
                                            <Text style={styles.reviewLabel}>Perusahaan {index + 1}:</Text>
                                            <Text style={styles.reviewValue}>{exp.company}</Text>
                                        </View>
                                        <View style={styles.reviewItem}>
                                            <Text style={styles.reviewLabel}>Posisi:</Text>
                                            <Text style={styles.reviewValue}>{exp.position}</Text>
                                        </View>
                                        {exp.duration && (
                                            <View style={styles.reviewItem}>
                                                <Text style={styles.reviewLabel}>Durasi:</Text>
                                                <Text style={styles.reviewValue}>{exp.duration}</Text>
                                            </View>
                                        )}
                                        {exp.achievements && (
                                            <View style={styles.reviewItem}>
                                                <Text style={styles.reviewLabel}>Pencapaian:</Text>
                                                <Text style={styles.reviewValue}>{exp.achievements}</Text>
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyReviewText}>Tidak ada pengalaman kerja yang ditambahkan</Text>
                            )}
                        </View>

                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewSectionTitle}>Dokumen Pendukung</Text>
                            {formData.supportingDocuments.length > 0 ? (
                                formData.supportingDocuments.map((doc, index) => (
                                    <View key={doc.id} style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>Dokumen {index + 1}:</Text>
                                        <Text style={styles.reviewValue}>{doc.name}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyReviewText}>Tidak ada dokumen yang ditambahkan</Text>
                            )}
                        </View>
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
                        {draftId ? 'Edit Surat Lamaran' : 'Buat Surat Lamaran'}
                    </Text>
                    <View style={styles.backButton} />
                </View>
            </LinearGradient>

            <View style={styles.stepLabelContainer}>
                <Text style={styles.stepLabel}>{FORM_STEPS[currentStep]}</Text>
                <Text style={styles.stepCounter}>Langkah {currentStep + 1} dari {FORM_STEPS.length}</Text>
            </View>

            {renderStepIndicator()}

            <KeyboardAwareScrollView style={styles.scrollContainer}>
                {renderFormStep()}
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
        color: theme.colors.black,
      },
    inputText: {
        color: theme.colors.black,
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
    experienceAchievements: {
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
    reviewSection: {
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    reviewSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: theme.colors.primary,
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
        flex: 1,
        marginLeft: 4,
        backgroundColor: theme.colors.secondary,
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
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        color: theme.colors.medium,
        marginBottom: 16,
        opacity: 0.7,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.light,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.black,
        marginTop: 24,
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.medium,
        marginBottom: 12,
    },
    paragraphContainer: {
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    paragraphText: {
        fontSize: 14,
        color: theme.colors.black,
        lineHeight: 20,
    },
    attachmentButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 16,
    },
    attachmentButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    removeButton: {
        borderColor: theme.colors.error,
    },
    addButton: {
        borderColor: theme.colors.primary,
    },
    experienceFormCard: {
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.light,
    },
    experienceFormTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 16,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    formButton: {
        marginLeft: 8,
        minWidth: 100,
    }
});

export default JobApplicationForm;
