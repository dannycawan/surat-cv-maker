import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import { Text, Surface, Title, Paragraph, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../../navigation';
// Removed unused CardContainer import
import theme from '../../theme';
import { AdBanner } from '../../utils/adMobService'; // Ensure this import is correct

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define a type for valid Ionicons names
type IoniconsName = keyof typeof Ionicons.glyphMap;

type HomeScreenNavigationProp = StackNavigationProp<MainTabParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [activeTip, setActiveTip] = useState<number | null>(null);

  // Feature card items with properly typed icons
  const features = [
    {
      title: 'Surat Lamaran Kerja',
      description: 'Buat surat lamaran kerja profesional untuk meningkatkan peluang karir',
      icon: 'document-text' as IoniconsName,
      color: theme.colors.primary,
      screen: 'JobApplication',
    },
    {
      title: 'Curriculum Vitae (CV)',
      description: 'Buat CV yang menarik perhatian HRD dengan template modern',
      icon: 'person-circle' as IoniconsName,
      color: theme.colors.secondary,
      screen: 'CV',
    },
    {
      title: 'Surat Pengunduran Diri',
      description: 'Buat surat pengunduran diri yang profesional dan etis',
      icon: 'exit' as IoniconsName,
      color: theme.colors.info,
      screen: 'Resignation',
    },
  ];

  // Tips data with properly typed icons
  const tips = [
    {
      id: 1,
      title: 'Surat Lamaran Impresif',
      content: 'Sesuaikan surat lamaran dengan perusahaan dan posisi yang dituju. Hindari penggunaan template umum yang tidak personal.',
      icon: 'bulb' as IoniconsName,
    },
    {
      id: 2,
      title: 'CV yang Menonjol',
      content: 'Tonjolkan pencapaian spesifik dengan angka dan hasil konkret, bukan hanya daftar tugas dan tanggung jawab.',
      icon: 'star' as IoniconsName,
    },
    {
      id: 3,
      title: 'Pengunduran Diri Profesional',
      content: 'Selalu bersikap positif dan berterima kasih atas pengalaman yang didapat dalam surat pengunduran diri.',
      icon: 'thumbs-up' as IoniconsName,
    },
  ];

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 60], // Adjust min height if needed
    extrapolate: 'clamp',
  });

  // Interactive animation for feature cards
  const getFeatureAnimatedStyle = (index: number) => {
    return {
      transform: [
        {
          scale: activeFeature === index ? 0.98 : 1
        }
      ],
      backgroundColor: activeFeature === index
        ? `${features[index].color}10` // Use template literal for opacity
        : theme.colors.white,
      borderColor: features[index].color,
      borderWidth: activeFeature === index ? 2 : 1,
    };
  };

  // Animation for tip cards
  const getTipAnimatedStyle = (index: number) => {
    return {
      backgroundColor: activeTip === index
        ? '#f5f5f5'
        : theme.colors.white,
      borderLeftWidth: 3,
      borderLeftColor: activeTip === index
        ? theme.colors.primary
        : 'transparent',
    };
  };

  return (
    <View style={styles.container}>
      {/* Use theme color for status bar */}
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* Floating Header */}
      <Animated.View
        style={[
          styles.floatingHeader,
          {
            opacity: headerOpacity,
            height: headerHeight,
          }
        ]}
      >
        <Text style={styles.headerTitle}>Surat & CV Maker</Text>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* App Title */}
        <View style={styles.titleContainer}>
          <Title style={styles.appTitle}>Surat & CV Maker</Title>
          <View style={styles.titleDivider} />
          <Text style={styles.appSubtitle}>
            Buat dokumen profesional dengan mudah
          </Text>
        </View>

        {/* Hero Section */}
        <Surface style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Title style={styles.heroTitle}>Dokumen Profesional dalam Genggaman</Title>
              <Paragraph style={styles.heroDescription}>
                Buat surat lamaran, CV, dan surat pengunduran diri berkualitas dengan cepat dan mudah
              </Paragraph>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => navigation.navigate('JobApplication')}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Mulai Sekarang</Text>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
            <Image
              source={require('../../../assets/document-illustration.png')} // Ensure this path is correct
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        </Surface>

        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fitur Utama</Text>
            <View style={styles.sectionDivider} />
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.featureCard,
                  getFeatureAnimatedStyle(index) // Apply animation style
                ]}
                onPress={() => navigation.navigate(feature.screen as keyof MainTabParamList)}
                onPressIn={() => setActiveFeature(index)}
                onPressOut={() => setActiveFeature(null)}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: `${feature.color}20` } // Use template literal for opacity
                  ]}
                >
                  <Ionicons name={feature.icon} size={32} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription} numberOfLines={2}>
                  {feature.description}
                </Text>
                <View style={styles.featureButton}>
                  <Text style={[styles.featureButtonText, { color: feature.color }]}>
                    Buat Sekarang
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={feature.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tips & Panduan</Text>
            <View style={styles.sectionDivider} />
          </View>

          <Surface style={styles.tipsCard}>
            {tips.map((tip, index) => (
              <React.Fragment key={tip.id}>
                {index > 0 && <Divider style={styles.tipDivider} />}
                <TouchableOpacity
                  style={[styles.tipContainer, getTipAnimatedStyle(index)]} // Apply animation style
                  onPressIn={() => setActiveTip(index)}
                  onPressOut={() => setActiveTip(null)}
                  activeOpacity={0.8}
                >
                  <View style={styles.tipIconContainer}>
                    <Ionicons
                      name={tip.icon}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}> {/* Removed Animated prefix */}
                      {tip.content}
                    </Text>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Surface>
        </View>

        {/* Ad Banner Section */}
        <View style={styles.adContainer}>
           <AdBanner /> {/* Render the Ad Banner component */}
        </View>

      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight, // Use theme background
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary, // Use theme primary color
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 4, // Keep elevation for Android shadow
    shadowColor: theme.colors.black, // Use theme black for shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white, // Use theme white for text
  },
  scrollContainer: {
    paddingTop: theme.spacing.xl, // Use theme spacing
    paddingBottom: theme.spacing.xxl, // Use theme spacing
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.l, // Use theme spacing
    paddingHorizontal: theme.spacing.m, // Use theme spacing
    paddingTop: theme.spacing.xxl, // Adjust top padding considering no fixed header initially
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: theme.colors.medium,
    textAlign: 'center',
    marginTop: theme.spacing.s, // Use theme spacing
  },
  titleDivider: {
    width: 60,
    height: 4,
    backgroundColor: theme.colors.primary,
    marginVertical: theme.spacing.m, // Use theme spacing
    borderRadius: theme.borderRadius.s, // Use theme border radius
  },
  heroCard: {
    marginHorizontal: theme.spacing.m, // Use theme spacing
    borderRadius: theme.borderRadius.l, // Use theme border radius
    overflow: 'hidden',
    elevation: theme.shadows.small.elevation, // Use theme shadow
    backgroundColor: theme.colors.white, // Use theme white background
  },
  heroContent: {
    flexDirection: 'row',
    padding: theme.spacing.m, // Use theme spacing
    alignItems: 'center', // Align items vertically
  },
  heroTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: theme.spacing.s, // Use theme spacing
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black, // Use theme text color
    marginBottom: theme.spacing.s, // Use theme spacing
  },
  heroDescription: {
    fontSize: 14,
    color: theme.colors.medium, // Use theme text color
    marginBottom: theme.spacing.m, // Use theme spacing
    lineHeight: 20, // Improve readability
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary, // Use theme color
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.m, // Use theme spacing
    borderRadius: theme.borderRadius.m, // Use theme border radius
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    marginRight: theme.spacing.xs, // Use theme spacing
    fontSize: theme.typography.fontSizes.s, // Use theme font size
  },
  heroImage: {
    width: 100, // Adjusted size
    height: 100, // Adjusted size
    marginLeft: theme.spacing.s, // Add some margin
  },
  sectionContainer: {
    marginTop: theme.spacing.xl, // Use theme spacing
    paddingHorizontal: theme.spacing.m, // Use theme spacing
  },
  sectionHeader: {
    marginBottom: theme.spacing.m, // Use theme spacing
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black, // Use theme text color
  },
  sectionDivider: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primary, // Use theme color
    marginTop: theme.spacing.s, // Use theme spacing
    borderRadius: theme.borderRadius.s, // Use theme border radius
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (SCREEN_WIDTH - (theme.spacing.m * 2) - theme.spacing.m) / 2, // Calculate width based on spacing
    backgroundColor: theme.colors.white, // Use theme background
    borderRadius: theme.borderRadius.l, // Use theme border radius
    padding: theme.spacing.m, // Use theme spacing
    marginBottom: theme.spacing.m, // Use theme spacing
    elevation: theme.shadows.small.elevation, // Use theme shadow
    shadowColor: theme.shadows.small.shadowColor,
    shadowOffset: theme.shadows.small.shadowOffset,
    shadowOpacity: theme.shadows.small.shadowOpacity,
    shadowRadius: theme.shadows.small.shadowRadius,
    borderColor: theme.colors.light, // Add default border
    borderWidth: 1, // Add default border
  },
  featureIconContainer: {
    width: 50, // Adjusted size
    height: 50, // Adjusted size
    borderRadius: 25, // Adjusted radius
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m, // Use theme spacing
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black, // Use theme text color
    marginBottom: theme.spacing.xs, // Use theme spacing
  },
  featureDescription: {
    fontSize: 12,
    color: theme.colors.medium, // Use theme text color
    marginBottom: theme.spacing.m, // Use theme spacing
    height: 32, // Fixed height for consistency
    lineHeight: 16, // Improve readability
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto', // Pushes button to the bottom
  },
  featureButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: theme.spacing.xs, // Use theme spacing
  },
  tipsCard: {
    borderRadius: theme.borderRadius.l, // Use theme border radius
    overflow: 'hidden',
    elevation: theme.shadows.small.elevation, // Use theme shadow
    backgroundColor: theme.colors.white, // Use theme background
  },
  tipContainer: {
    flexDirection: 'row',
    padding: theme.spacing.m, // Use theme spacing
    alignItems: 'center', // Center items vertically
  },
  tipIconContainer: {
    width: 40, // Adjusted size
    height: 40, // Adjusted size
    borderRadius: 20, // Adjusted radius
    backgroundColor: `${theme.colors.primary}15`, // Use primary with opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m, // Use theme spacing
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.black, // Use theme text color
    marginBottom: theme.spacing.xs, // Use theme spacing
  },
  tipDescription: {
    fontSize: 14,
    color: theme.colors.medium, // Use theme text color
    lineHeight: 20, // Improve readability
  },
  tipDivider: {
    height: 1,
    backgroundColor: theme.colors.light, // Use theme light color for divider
    marginHorizontal: theme.spacing.m, // Add horizontal margin
  },
  adContainer: { // Style for the Ad Banner container
    marginTop: theme.spacing.l, // Add space above the banner
    marginBottom: theme.spacing.m, // Add space below the banner
    alignItems: 'center', // Center the banner horizontally
  },
});

export default HomeScreen;