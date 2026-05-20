// In src/screens/CV/index.tsx, modify the renderHeader function and remove search state

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  FAB,
  Divider,
  Avatar,
  Card,
  Button
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation';
import { AdBanner } from '../../utils/adMobService';
import { getDraftList, deleteDraft, DraftItem } from '../../utils/storageService';
import theme from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CVScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CVScreen = () => {
  const navigation = useNavigation<CVScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // State management
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load drafts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDrafts();
    }, [])
  );
  
  // Function to load drafts
  const loadDrafts = async () => {
    setLoading(true);
    try {
      const draftsList = await getDraftList('cv');
      setDrafts(draftsList.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle draft deletion
  const handleDeleteDraft = async (draftId: string) => {
    Alert.alert(
      'Hapus Draft',
      'Apakah Anda yakin ingin menghapus draft ini?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDraft('cv', draftId);
              setDrafts(drafts.filter(draft => draft.id !== draftId));
            } catch (error) {
              console.error('Error deleting draft:', error);
              Alert.alert('Error', 'Gagal menghapus draft. Silakan coba lagi.');
            }
          }
        }
      ]
    );
  };
  
  // Function to handle draft preview
  const handlePreviewDraft = (draft: DraftItem) => {
    navigation.navigate('Preview', {
      documentType: 'cv',
      data: draft.data
    });
  };
  
  // Function to handle draft editing
  const handleEditDraft = (draft: DraftItem) => {
    navigation.navigate('CVForm', { draftId: draft.id });
  };
  
  // Function to handle creating a new draft
  const handleCreateNewDraft = () => {
    navigation.navigate('CVForm', {});
  };
  
  // Render header with animation
  const renderHeader = () => {
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    
    const headerHeight = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 60],
      extrapolate: 'clamp',
    });
    
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        
        {/* Fixed header that appears when scrolling */}
        <Animated.View style={[
          styles.fixedHeader, 
          { height: headerHeight, opacity: headerOpacity, paddingTop: insets.top }
        ]}>
          <Text style={styles.fixedHeaderTitle}>Curriculum Vitae (CV)</Text>
        </Animated.View>
        
        {/* Main header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Curriculum Vitae (CV)</Text>
              <Text style={styles.headerSubtitle}>Buat CV profesional dengan mudah</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Avatar.Icon 
                size={40} 
                icon="arrow-left" 
                color={theme.colors.white} 
                style={styles.headerIcon} 
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </>
    );
  };
  
  // Render draft list item
  const renderDraftItem = ({ item }: { item: DraftItem }) => {
    const date = new Date(item.timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    const time = new Date(item.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return (
      <Card style={styles.draftCard}>
        <Card.Content>
          <View style={styles.draftHeader}>
            <View style={styles.draftIcon}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.draftInfo}>
              <Text style={styles.draftTitle} numberOfLines={1}>{item.title}</Text>
              <View style={styles.draftMeta}>
                <View style={styles.chipContainer}>
                  <Text style={styles.degreeText}>
                    {item.data.degree || 'Tidak ada gelar'}
                  </Text>
                </View>
                <Text style={styles.draftDate}>{date} · {time}</Text>
              </View>
            </View>
          </View>
        </Card.Content>
        <Divider style={styles.draftDivider} />
        <Card.Actions style={styles.draftActions}>
          <Button 
            mode="text" 
            compact 
            icon="eye" 
            onPress={() => handlePreviewDraft(item)}
            style={styles.draftButton}
          >
            Pratinjau
          </Button>
          <Button 
            mode="text" 
            compact 
            icon="pencil" 
            onPress={() => handleEditDraft(item)}
            style={styles.draftButton}
          >
            Edit
          </Button>
          <Button 
            mode="text" 
            compact 
            icon="delete" 
            onPress={() => handleDeleteDraft(item.id)}
            style={styles.draftButton}
            color={theme.colors.error}
          >
            Hapus
          </Button>
        </Card.Actions>
      </Card>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Draft Saya</Text>
            <Text style={styles.sectionSubtitle}>{drafts.length} curriculum vitae</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}></Text>
            </View>
          ) : drafts.length > 0 ? (
            <View style={styles.draftsList}>
              {drafts.map((draft) => (
                <React.Fragment key={draft.id}>
                  {renderDraftItem({ item: draft })}
                </React.Fragment>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="file-document-outline" size={60} color={theme.colors.light} />
              <Text style={styles.emptyTitle}>Tidak ada draft</Text>
              <Text style={styles.emptyText}>Buat curriculum vitae pertama Anda</Text>
              <Button 
                mode="contained" 
                onPress={handleCreateNewDraft} 
                style={styles.emptyButton}
                icon="plus"
              >
                Buat Baru
              </Button>
            </View>
          )}
        </View>
        
        <View style={styles.adContainer}>
          <AdBanner />
        </View>
      </Animated.ScrollView>
      
      <FAB
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        icon="plus"
        color={theme.colors.white}
        onPress={handleCreateNewDraft}
      />
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 16,
  },
  fixedHeaderTitle: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Content styles
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.medium,
  },
  // Draft item styles
  draftsList: {
    marginTop: 8,
  },
  draftCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
  },
  draftIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  draftInfo: {
    flex: 1,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black, // Explicitly set black text
    marginBottom: 4,
  },
  draftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // Important to prevent overflow
    marginVertical: 4, // Added vertical margin
  },
  chipContainer: {
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginVertical: 2,
  },
  positionText: {
    fontSize: 12,
    color: theme.colors.primary, // Use primary color for good visibility
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  degreeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    includeFontPadding: false, // Important for Android
    textAlignVertical: 'center', // Important for Android
  },
  draftDate: {
    fontSize: 12,
    color: theme.colors.medium, // Medium gray for secondary text
  },
  draftDivider: {
    marginVertical: 8,
  },
  draftActions: {
    justifyContent: 'space-between',
  },
  draftButton: {
    marginHorizontal: 0,
  },
  // Empty state styles
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.medium,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.medium,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 8,
  },
  // FAB styles
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: theme.colors.primary,
  },
  // Ad container
  adContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
});

export default CVScreen;