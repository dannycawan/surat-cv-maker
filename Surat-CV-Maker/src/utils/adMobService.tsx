import * as Device from 'expo-device';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize, InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// Ad unit IDs
const BANNER_AD_UNIT_ID = 'ca-app-pub-6721734106426198/3624406467';
const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-6721734106426198/6838561461';

// Banner Ad Component with placeholder
export const AdBanner = () => {
  const [adState, setAdState] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  // Use test IDs in development, YOUR IDs in production
  const adUnitId = __DEV__ ? TestIds.BANNER : BANNER_AD_UNIT_ID;

  return (
    <View style={styles.adContainer}>
      {adState === 'loading' && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Ad is loading...</Text>
        </View>
      )}
      
      {adState === 'error' && (
        <View style={[styles.placeholder, styles.placeholderError]}>
          <Text style={styles.placeholderText}>Advertisement</Text>
        </View>
      )}
      
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner Ad loaded');
          setAdState('loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner Ad failed to load:', error);
          setAdState('error');
        }}
      />
    </View>
  );
};

// Rate limiting helper for interstitial ads
class AdThrottler {
  private lastAdShownTime: number = 0;
  private MIN_INTERVAL_MS: number = 3 * 60 * 1000; // 3 minutes between ads
  
  canShowAd(): boolean {
    const now = Date.now();
    if (now - this.lastAdShownTime >= this.MIN_INTERVAL_MS) {
      this.lastAdShownTime = now;
      return true;
    }
    return false;
  }
  
  resetTimer() {
    this.lastAdShownTime = Date.now();
  }
}

// Interstitial Ad Manager with rate limiting
class InterstitialAdManager {
  private interstitialAd: InterstitialAd | null = null;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private adUnitId: string;
  private throttler: AdThrottler = new AdThrottler();
  private retryCount: number = 0;
  private MAX_RETRIES: number = 3;

  constructor() {
    this.adUnitId = __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT_ID;
    this.initialize();
  }

  private initialize() {
    this.interstitialAd = InterstitialAd.createForAdRequest(this.adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Unsubscribe previous listeners
    this.interstitialAd.removeAllListeners();

    // Subscribe to ad events
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      this.isLoaded = true;
      this.isLoading = false;
      this.retryCount = 0;
      console.log('Interstitial ad loaded');
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error:', error);
      this.isLoaded = false;
      this.isLoading = false;
      
      // Implement exponential backoff for retries
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 60000); // Capped at 1 minute
        console.log(`Retrying ad load in ${delay/1000} seconds (attempt ${this.retryCount})`);
        setTimeout(() => this.loadAd(), delay);
      }
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      this.isLoaded = false;
      this.loadAd();
    });

    this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log('Interstitial ad opened');
      this.throttler.resetTimer(); // Reset the timer when ad is shown
    });

    // Load initial ad
    this.loadAd();
  }

  public loadAd() {
    if (!this.isLoaded && !this.isLoading && this.interstitialAd) {
      console.log('Loading interstitial ad...');
      this.isLoading = true;
      this.interstitialAd.load();
    }
  }

  public showAd(): boolean {
    // Check if enough time has passed since the last ad
    if (!this.throttler.canShowAd()) {
      console.log('Throttled: Not showing ad due to rate limiting');
      return false;
    }
    
    if (this.isLoaded && this.interstitialAd) {
      console.log('Showing interstitial ad...');
      this.interstitialAd.show();
      return true;
    } else {
      console.log('Interstitial ad not ready. Attempting to load for next time.');
      this.loadAd();
      return false;
    }
  }
}

// Create styles for ad components
const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    height: 70, // Fixed height to prevent layout shifts
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderError: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  placeholderText: {
    color: '#888888',
    fontSize: 12,
  }
});

// Create and export singleton interstitial ad manager
export const interstitialAdManager = new InterstitialAdManager();