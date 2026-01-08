import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  illustration: React.ReactNode;
}

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      title: 'Welcome to Efficiensa KDS',
      subtitle: 'Kitchen Display System',
      description: 'Streamline your kitchen operations with real-time order management. View, track, and complete orders efficiently.',
      icon: 'restaurant-outline',
      color: '#162570',
      illustration: (
        <View style={styles.illustrationContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#162570' }]}>
            <Ionicons name="restaurant-outline" size={50} color="#fff" />
          </View>
          <View style={styles.featureBadges}>
            <View style={[styles.featureBadge, { backgroundColor: '#4F7DF3' }]}>
              <Ionicons name="eye" size={16} color="#fff" />
              <Text style={styles.featureBadgeText}>View</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: '#2B9EDE' }]}>
              <Ionicons name="list" size={16} color="#fff" />
              <Text style={styles.featureBadgeText}>Track</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: '#34C759' }]}>
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.featureBadgeText}>Complete</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: '#FF9500' }]}>
              <Ionicons name="timer" size={16} color="#fff" />
              <Text style={styles.featureBadgeText}>Timing</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: '#AF52DE' }]}>
              <Ionicons name="sync" size={16} color="#fff" />
              <Text style={styles.featureBadgeText}>Real-time</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 2,
      title: 'Real-Time Order Display',
      subtitle: 'Never Miss an Order',
      description: 'Orders appear instantly as they\'re placed. Color-coded priority and timing indicators help you stay on top of every ticket.',
      icon: 'notifications-outline',
      color: '#4F7DF3',
      illustration: (
        <View style={styles.illustrationContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#4F7DF3' }]}>
            <Ionicons name="notifications" size={50} color="#fff" />
          </View>
          <View style={styles.menuGrid}>
            <View style={[styles.menuCard, { backgroundColor: '#dcfce7', borderColor: '#34C759' }]}>
              <Ionicons name="receipt" size={24} color="#34C759" />
              <Text style={styles.menuCardText}>Order #42</Text>
              <Text style={[styles.menuCardPrice, { color: '#34C759' }]}>2:30</Text>
            </View>
            <View style={[styles.menuCard, { backgroundColor: '#fef3c7', borderColor: '#FF9500' }]}>
              <Ionicons name="receipt" size={24} color="#FF9500" />
              <Text style={styles.menuCardText}>Order #43</Text>
              <Text style={[styles.menuCardPrice, { color: '#FF9500' }]}>5:45</Text>
            </View>
            <View style={[styles.menuCard, { backgroundColor: '#fee2e2', borderColor: '#FF3B30' }]}>
              <Ionicons name="receipt" size={24} color="#FF3B30" />
              <Text style={styles.menuCardText}>Order #44</Text>
              <Text style={[styles.menuCardPrice, { color: '#FF3B30' }]}>8:20</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 3,
      title: 'Multi-Monitor Support',
      subtitle: 'Organize Your Kitchen Workflow',
      description: 'Assign different stations to separate displays. Grill, fry, prep, and expo can each have their own dedicated screen.',
      icon: 'tv-outline',
      color: '#2B9EDE',
      illustration: (
        <View style={styles.illustrationContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#2B9EDE' }]}>
            <Ionicons name="tv-outline" size={50} color="#fff" />
          </View>
          <View style={styles.cartPreview}>
            <Text style={styles.customizeTitle}>Kitchen Stations</Text>
            <View style={styles.modifierItem}>
              <View style={styles.modifierCheck}>
                <Ionicons name="desktop-outline" size={18} color="#FF9500" />
              </View>
              <Text style={styles.modifierName}>Grill Station</Text>
              <Text style={[styles.modifierPrice, { color: '#FF9500' }]}>Screen 1</Text>
            </View>
            <View style={styles.modifierItem}>
              <View style={styles.modifierCheck}>
                <Ionicons name="desktop-outline" size={18} color="#4F7DF3" />
              </View>
              <Text style={styles.modifierName}>Fry Station</Text>
              <Text style={[styles.modifierPrice, { color: '#4F7DF3' }]}>Screen 2</Text>
            </View>
            <View style={styles.modifierItem}>
              <View style={styles.modifierCheck}>
                <Ionicons name="desktop-outline" size={18} color="#34C759" />
              </View>
              <Text style={styles.modifierName}>Prep Station</Text>
              <Text style={[styles.modifierPrice, { color: '#34C759' }]}>Screen 3</Text>
            </View>
            <View style={styles.modifierItem}>
              <View style={styles.modifierCheck}>
                <Ionicons name="desktop-outline" size={18} color="#AF52DE" />
              </View>
              <Text style={styles.modifierName}>Expo Display</Text>
              <Text style={[styles.modifierPrice, { color: '#AF52DE' }]}>Screen 4</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 4,
      title: 'Order Management',
      subtitle: 'Touch to Complete Items',
      description: 'Tap items as they\'re prepared. Mark orders complete with a single touch. Track timing and performance metrics.',
      icon: 'hand-left-outline',
      color: '#34C759',
      illustration: (
        <View style={styles.illustrationContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#34C759' }]}>
            <Ionicons name="hand-left" size={50} color="#fff" />
          </View>
          <View style={styles.cartPreview}>
            <View style={styles.cartItem}>
              <Text style={styles.cartItemName}>✓ Burger - Well Done</Text>
              <Text style={[styles.cartItemPrice, { color: '#34C759' }]}>Done</Text>
            </View>
            <View style={styles.cartItem}>
              <Text style={styles.cartItemName}>✓ Large Fries</Text>
              <Text style={[styles.cartItemPrice, { color: '#34C759' }]}>Done</Text>
            </View>
            <View style={styles.cartItem}>
              <Text style={styles.cartItemName}>○ Side Salad</Text>
              <Text style={[styles.cartItemPrice, { color: '#FF9500' }]}>Prep</Text>
            </View>
            <View style={styles.cartDivider} />
            <View style={styles.cartTotal}>
              <Text style={styles.cartTotalText}>Order #42 - Table 5</Text>
            </View>
            <View style={styles.payNowButton}>
              <Ionicons name="checkmark-done" size={18} color="#fff" />
              <Text style={styles.payNowText}>Complete Order</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 5,
      title: 'Bump Bar & Gestures',
      subtitle: 'Hands-Free Control',
      description: 'Use bump bar shortcuts or swipe gestures for quick navigation. Keep your hands free and your kitchen moving.',
      icon: 'swap-horizontal-outline',
      color: '#AF52DE',
      illustration: (
        <View style={styles.illustrationContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#AF52DE' }]}>
            <Ionicons name="swap-horizontal" size={50} color="#fff" />
          </View>
          <View style={styles.successGraphics}>
            <View style={styles.successElement}>
              <Ionicons name="arrow-back" size={32} color="#4F7DF3" />
              <Text style={styles.successLabel}>Previous</Text>
            </View>
            <View style={styles.successElement}>
              <Ionicons name="checkmark-circle" size={32} color="#34C759" />
              <Text style={styles.successLabel}>Bump</Text>
            </View>
            <View style={styles.successElement}>
              <Ionicons name="arrow-forward" size={32} color="#4F7DF3" />
              <Text style={styles.successLabel}>Next</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 6,
      title: 'Ready to Go!',
      subtitle: 'Your Kitchen, Optimized',
      description: 'Faster ticket times, fewer errors, and better coordination. Let\'s get your kitchen running at peak efficiency.',
      icon: 'rocket-outline',
      color: '#FF9500',
      illustration: (
        <View style={styles.illustrationContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF9500' }]}>
            <Ionicons name="rocket" size={50} color="#fff" />
          </View>
          <View style={styles.successGraphics}>
            <Animated.View style={[styles.successElement, { transform: [{ scale: slideAnim }] }]}>
              <Ionicons name="flash" size={40} color="#FF9500" />
              <Text style={styles.successLabel}>Faster</Text>
            </Animated.View>
            <Animated.View style={[styles.successElement, { transform: [{ scale: slideAnim }] }]}>
              <Ionicons name="checkmark-done" size={40} color="#34C759" />
              <Text style={styles.successLabel}>Accurate</Text>
            </Animated.View>
            <Animated.View style={[styles.successElement, { transform: [{ scale: slideAnim }] }]}>
              <Ionicons name="people" size={40} color="#4F7DF3" />
              <Text style={styles.successLabel}>Synced</Text>
            </Animated.View>
          </View>
        </View>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      scrollViewRef.current?.scrollTo({
        x: prevSlide * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(slideIndex);
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      console.log('Onboarding completed successfully');
      // The RootNavigator will handle the state change automatically
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    }
  };

  const skipOnboarding = () => {
    Alert.alert(
      "Skip Onboarding",
      "Are you sure you want to skip the tutorial? You can always access help from the settings menu later.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Skip",
          style: "destructive",
          onPress: completeOnboarding
        }
      ]
    );
  };

  // Animation for the last slide
  React.useEffect(() => {
    if (currentSlide === slides.length - 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentSlide, slideAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={skipOnboarding} 
          style={styles.skipButton}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                currentSlide === index && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.slidesContainer}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { backgroundColor: slide.color + '10' }]}>
            <View style={styles.slideContent}>
              {slide.illustration}
              
              <View style={styles.textContent}>
                <Text style={[styles.title, { color: slide.color }]}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          onPress={handlePrev}
          style={[styles.navButton, styles.prevButton, currentSlide === 0 && styles.navButtonDisabled]}
          disabled={currentSlide === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentSlide === 0 ? '#ccc' : '#666'} />
          <Text style={[styles.navButtonText, currentSlide === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.navButton, styles.nextButton, { backgroundColor: slides[currentSlide].color }]}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  progressDotActive: {
    backgroundColor: '#162570',
    width: 24,
  },
  placeholder: {
    width: 50,
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.01,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.45,
    width: '100%',
  },
  iconCircle: {
    width: Math.min(100, SCREEN_WIDTH * 0.25),
    height: Math.min(100, SCREEN_WIDTH * 0.25),
    borderRadius: Math.min(50, SCREEN_WIDTH * 0.125),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  illustrationDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  featureBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: SCREEN_HEIGHT * 0.02,
    maxWidth: SCREEN_WIDTH * 0.8,
    paddingHorizontal: 10,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  featureBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuGrid: {
    flexDirection: 'row',
    gap: Math.min(12, SCREEN_WIDTH * 0.03),
    marginTop: SCREEN_HEIGHT * 0.02,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  menuCard: {
    width: Math.min(90, SCREEN_WIDTH * 0.22),
    height: Math.min(100, SCREEN_HEIGHT * 0.12),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  menuCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  menuCardPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2B9EDE',
  },
  cartPreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Math.min(16, SCREEN_WIDTH * 0.04),
    marginTop: SCREEN_HEIGHT * 0.02,
    width: Math.min(280, SCREEN_WIDTH * 0.75),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  cartItemName: {
    fontSize: 14,
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2B9EDE',
  },
  cartDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  cartTotal: {
    alignItems: 'center',
  },
  cartTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#162570',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  paymentCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  successGraphics: {
    flexDirection: 'row',
    gap: Math.min(16, SCREEN_WIDTH * 0.04),
    marginTop: SCREEN_HEIGHT * 0.02,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  successElement: {
    width: Math.min(80, SCREEN_WIDTH * 0.2),
    height: Math.min(90, SCREEN_HEIGHT * 0.11),
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  customizeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#162570',
    marginBottom: 12,
    textAlign: 'center',
  },
  modifierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  modifierCheck: {
    width: 24,
    alignItems: 'center',
  },
  modifierName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  modifierPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2B9EDE',
  },
  payNowButton: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  payNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: SCREEN_HEIGHT * 0.015,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  title: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    color: '#777',
    textAlign: 'center',
    lineHeight: Math.min(20, SCREEN_HEIGHT * 0.025),
    maxWidth: SCREEN_WIDTH * 0.85,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: '#f5f5f5',
  },
  nextButton: {
    backgroundColor: '#162570',
  },
  navButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OnboardingScreen;