import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Default credentials for development/testing
const DEFAULT_CREDENTIALS = {
  terminalCode: 'DEMO-0001-ABCD',
};

const TerminalSetupScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'qr'
  const [terminalCode, setTerminalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const insets = useSafeAreaInsets();
  const [scanned, setScanned] = useState(false);

  // Check if terminal is already set up
  useEffect(() => {
    const checkTerminalSetup = async () => {
      try {
        // Check if terminal code is saved in AsyncStorage
        const savedCode = await AsyncStorage.getItem('terminalCode');
        if (savedCode) {
          // Auto-login if terminal is already set up
          console.log('Found saved terminal code, going to Main...');
          (navigation as any).reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (error) {
        console.error('Error checking terminal setup:', error);
      }
    };
    checkTerminalSetup();
  }, [navigation]);

  // Format terminal code with dashes
  const formatTerminalCode = (text: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Add dashes every 4 characters
    const formatted = cleaned
      .replace(/(\w{4})(?=\w)/g, '$1-')
      .substring(0, 14); // Limit to 12 chars + 2 dashes
    
    return formatted;
  };

  // Request camera permission for QR scanning
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to scan QR codes.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle manual login
  const handleManualLogin = async () => {
    if (!terminalCode.trim() || terminalCode.length < 14) {
      Alert.alert('Error', 'Please enter a complete Terminal Code (format: XXXX-XXXX-XXXX)');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check against default credentials (for development)
      // In production, this would be an API call
      const isValidCredentials = terminalCode.trim().toUpperCase() === DEFAULT_CREDENTIALS.terminalCode;
      
      if (isValidCredentials) {
        console.log('Terminal setup with:', { terminalCode });
        
        // Save terminal code for auto-login
        await AsyncStorage.setItem('terminalCode', terminalCode.trim().toUpperCase());
        console.log('Terminal code saved successfully');
        
        // Navigate to Main screen (terminal is now registered)
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'Invalid Terminal Code. Use DEMO-0001-ABCD for demo.');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please check your Terminal Code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle QR code scan
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    try {
      // Parse QR code data (assuming it contains terminal info)
      const qrData = JSON.parse(data);
      if (qrData.terminalCode) {
        setTerminalCode(formatTerminalCode(qrData.terminalCode));
        setActiveTab('manual'); // Switch to manual tab to show the filled data
        Alert.alert(
          'QR Code Scanned',
          'Terminal information has been loaded. Tap Login to continue.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Invalid QR code format');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code. Please scan a valid terminal QR code.');
    }
    
    // Reset scanned state after a delay
    setTimeout(() => setScanned(false), 2000);
  };

  const renderManualLogin = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Terminal Login</Text>
      <Text style={styles.subtitle}>
        Enter the Terminal Code from your Efficiensa web dashboard
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Terminal Code</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border }]}
          placeholder="XXXX-XXXX-XXXX"
          placeholderTextColor={theme.textMuted}
          value={terminalCode}
          onChangeText={(text) => setTerminalCode(formatTerminalCode(text))}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={14}
        />
      </View>

      <TouchableOpacity
        style={[styles.loginButton, { backgroundColor: theme.primary }, isLoading && styles.loginButtonDisabled]}
        onPress={handleManualLogin}
        disabled={isLoading}
      >
        <Text style={[styles.loginButtonText, { color: theme.textOnPrimary }]}>
          {isLoading ? 'Setting up...' : 'Setup Terminal'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.helpText, { color: theme.textMuted }]}>
        Don't have terminal credentials? Create them in your web dashboard at{' '}
        <Text style={[styles.linkText, { color: theme.secondary }]}>app.efficiensa.com</Text>
      </Text>
    </View>
  );

  const renderQRScanner = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>QR Code Scanner</Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.secondary }]}
            onPress={requestCameraPermission}
          >
            <Text style={[styles.permissionButtonText, { color: theme.textOnPrimary }]}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Camera Access Denied</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Please enable camera permission in your device settings to scan QR codes.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.secondary }]}
            onPress={requestCameraPermission}
          >
            <Text style={[styles.permissionButtonText, { color: theme.textOnPrimary }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.qrContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Scan QR Code</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Scan the QR code from your Efficiensa web dashboard for quick setup
        </Text>
        
        <View style={[styles.cameraContainer, { borderColor: theme.secondary }]}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          <View style={styles.overlay}>
            <View style={[styles.scanArea, { borderColor: theme.textOnPrimary }]} />
          </View>
        </View>

        <Text style={[styles.scanInstructions, { color: theme.textSecondary }]}>
          Position the QR code within the frame above
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
    {/* <SafeAreaView style={styles.container}> */}
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} translucent={false} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.primary }]}>
            <Text style={[styles.headerTitle, { color: theme.textOnPrimary }]}>Efficiensa KDS</Text>
            {/* <Text style={styles.headerSubtitle}>Point of Sale System</Text> */}
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabContainer, { backgroundColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'manual' && [styles.activeTab, { backgroundColor: theme.surface }]
              ]}
              onPress={() => setActiveTab('manual')}
            >
              <Text style={[
                styles.tabText,
                { color: theme.textSecondary },
                activeTab === 'manual' && { color: theme.primary, fontWeight: '600' }
              ]}>
                Manual Setup
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'qr' && [styles.activeTab, { backgroundColor: theme.surface }]
              ]}
              onPress={() => {
                setActiveTab('qr');
                if (hasPermission === null) {
                  requestCameraPermission();
                }
              }}
            >
              <Text style={[
                styles.tabText,
                { color: theme.textSecondary },
                activeTab === 'qr' && { color: theme.primary, fontWeight: '600' }
              ]}>
                QR Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'manual' ? renderManualLogin() : renderQRScanner()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
    paddingTop: 80,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    fontWeight: '500',
  },
  qrContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraContainer: {
    width: 280,
    height: 280,
    marginVertical: 30,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TerminalSetupScreen;

// import React, { useState } from 'react';
// import { 
//   KeyboardAvoidingView, 
//   Platform, 
//   Linking, 
//   StyleSheet, 
//   View, 
//   Image, 
//   StatusBar,
//   TouchableWithoutFeedback,
//   Keyboard,
//   ScrollView
// } from 'react-native';
// import { Text, TextInput, Button, useTheme } from 'react-native-paper';
// import { useAuth } from '../../hooks/useAuth';
// import { MaskedTextInput } from 'react-native-mask-text';
// import * as Animatable from 'react-native-animatable';
// import { useLanguage } from '../../i18n/LanguageContext';

// const LoginScreen: React.FC = () => {
//   const { applicationLogin } = useAuth();
//   const { t, language, setLanguage } = useLanguage();
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [phoneInputFocused, setPhoneInputFocused] = useState(false);
//   const [passwordInputFocused, setPasswordInputFocused] = useState(false);
//   const theme = useTheme();
  
//   // Refs for input navigation
//   const passwordRef = React.useRef<any>(null);
//   const phoneRef = React.useRef<any>(null);

//   const focusPassword = () => {
//     passwordRef.current?.focus();
//   };

//   const handleDismissKeyboard = () => {
//     Keyboard.dismiss();
//     setPhoneInputFocused(false);
//     setPasswordInputFocused(false);
//   };

//   const onLogin = async () => {
//     setError(null);
//     if (!phone.trim() || !password.trim()) {
//       setError(t('auth.errors.requiredFields'));
//       return;
//     }
//     setLoading(true);
//     const ok = await applicationLogin(phone.trim(), password.trim());
//     setLoading(false);
//     if (!ok) setError(t('auth.errors.invalidCredentials'));
//   };

//   const onForgot = () => {
//     Linking.openURL('https://www.efficiensa.com/');
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.inner}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//       >
//         <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
//           <ScrollView style={styles.scrollView} bounces={false} keyboardShouldPersistTaps="handled">
//             <View style={styles.header}>
//               <Image
//                 source={require('../../../assets/efficiensa-in-red.png')}
//                 style={styles.logo}
//               />
//             </View>

//             <View style={styles.content}>
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 ref={phoneRef}
//                 mode="outlined"
//                 placeholder={t('auth.placeholders.phone')}
//                 label={<Text style={{ backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 12, fontSize: 16, fontWeight: '500' }}>{t('auth.phoneNumber')}</Text>}
//                 value={phone}
//                 error={!!error}
//                 keyboardType="numeric"
//                 returnKeyType="next"
//                 onSubmitEditing={focusPassword}
//                 outlineStyle={[
//                 styles.inputOutline,
//                 phoneInputFocused && { borderColor: '#EA3425' }
//                 ]}
//                 contentStyle={[
//                 styles.inputContent,
//                 { justifyContent: 'center', textAlignVertical: 'center' }
//                 ]}
//                 outlineColor={phoneInputFocused ? '#EA3425' : '#6B7280'}
//                 activeOutlineColor="#EA3425"
//                 // left={<TextInput.Icon style={{ paddingLeft: 12 }} icon="phone" color={phoneInputFocused ? '#EA3425' : '#6B7280'} />}
//                 onFocus={() => setPhoneInputFocused(true)}
//                 onBlur={() => setPhoneInputFocused(false)}
//                 dense
//                 render={({ style, ...props }) => (
//                 <MaskedTextInput
//                   {...props}
//                   mask="(999) 999-9999"
//                   onChangeText={(masked: string, unmasked: string) => {
//                   setPhone(unmasked);
//                   }}
//                   style={[
//                   style,
//                   styles.maskedInput,
//                   { textAlignVertical: 'center', height: 70, paddingVertical: 0 }
//                   ]}
//                   placeholder={t('auth.placeholders.phone')}
//                 />
//                 )}
//                 style={[
//                 styles.input,
//                 { textAlignVertical: 'center', height: 70, paddingVertical: 0 }
//                 ]}
//               />
//             </View>

//             <View style={styles.inputWrapper}>
//               <TextInput
//                 ref={passwordRef}
//                 mode="outlined"
//                 label={<Text style={{ backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 12, fontSize: 16, fontWeight: '500' }}>{t('auth.password')}</Text>}
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry={!passwordVisible}
//                 returnKeyType="done"
//                 onSubmitEditing={onLogin}
//                 outlineStyle={[
//                 styles.inputOutline,
//                 passwordInputFocused && { borderColor: '#ff4444' }
//                 ]}
//                 contentStyle={[
//                 styles.inputContent,
//                 { justifyContent: 'center', textAlignVertical: 'center' }
//                 ]}
//                 outlineColor={passwordInputFocused ? '#ff4444' : '#6B7280'}
//                 activeOutlineColor="#ff4444"
//                 // left={<TextInput.Icon icon="lock" color={passwordInputFocused ? '#EA3425' : '#6B7280'} />}
//                 onFocus={() => setPasswordInputFocused(true)}
//                 onBlur={() => setPasswordInputFocused(false)}
//                 right={
//                 <TextInput.Icon
//                   icon={passwordVisible ? "eye-off" : "eye"}
//                   style={{ width: 40 }}
//                   onPress={() => setPasswordVisible(!passwordVisible)}
//                   color={passwordInputFocused ? '#ff4444' : '#6B7280'}
//                 />
//                 }
//                 style={[
//                 styles.input,
//                 { textAlignVertical: 'center', height: 60, paddingVertical: 0 }
//                 ]}
//                 error={!!error}
//                 dense
//               />
//             </View>

//             {error && (
//                 <Animatable.Text
//                 animation="shake"
//                 style={styles.error}
//                 >
//                 {error}
//                 </Animatable.Text>
//             )}

//             <Button 
//                 mode="contained" 
//                 onPress={onLogin} 
//                 loading={loading} 
//                 disabled={loading} 
//                 style={[styles.loginBtn, { backgroundColor: '#f90606ff' }]}
//                 labelStyle={{ color: '#fff', fontSize: 15, fontFamily: 'Roboto', letterSpacing: 1 }}
//             >
//                 {loading ? t('auth.signingIn') : t('auth.signIn')}
//             </Button>

//             <Button 
//                 mode="text" 
//                 onPress={onForgot}
//                 textColor="#f11f0cff"
//                 style={styles.forgotBtn}
//             >
//                 {t('auth.forgotPassword')}
//             </Button>

//             <View style={styles.helpContainer}>
//                 <View style={styles.helpLeftContainer}>
//                     <Button 
//                         mode="outlined" 
//                         onPress={() => Linking.openURL('https://www.efficiensa.com/help')}
//                         style={[styles.contactBtn, { borderColor: '#EA3425' }]}
//                         textColor="#EA3425"
//                     >
//                         {t('auth.needHelp')}
//                     </Button>
//                 </View>
//                 <View style={styles.helpRightContainer}>
//                     <Button
//                         mode="outlined"
//                         onPress={() => setLanguage(language === 'en' ? 'es' : 'en')}
//                         style={[styles.langBtn, { borderColor: '#EA3425' }]}
//                         textColor="#EA3425"
//                     >
//                         {/* <TextInput.Icon icon="translate" color="#EA3425" /> */}
//                         {language.toUpperCase()}
//                     </Button>
//                 </View>
//             </View>

//             <Text style={styles.versionText}>
//               Version 1.0.0
//             </Text>
//             </View>
//           </ScrollView>
//         </TouchableWithoutFeedback>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
//   };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   inner: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 80,
//   },
//   header: {
//     alignItems: 'center',
//     paddingTop: 60,
//     paddingBottom: 40,
//   },
//   logo: {
//     width: '30%',
//     aspectRatio: 3.5, // Keeps logo ratio, adjusts height automatically
//     resizeMode: 'contain',
//     // marginBottom: 24,
//     maxWidth: 320,
//     minWidth: 180,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 32,
//     // paddingTop: 32,
//   },
//   inputWrapper: {
//     marginBottom: 24,
//     width: '100%',
//   },
//   input: {
//     backgroundColor: 'transparent',
//     // fontSize: 18,
//     display: 'flex',
//     justifyContent: 'center',
//     // paddingVertical: 4,
//     // alignItems: 'center',
//     // borderRadius: 0,
//     minHeight: 70,
//     maxHeight: 70,
//   },
//   inputOutline: {
//     borderRadius: 15,
//     // color: '#ff4444',
//   },
//   inputContent: {
//     fontSize: 16,
//     // paddingVertical: 40,
//     // justifyContent: 'center',
//     // alignContent: 'center',
//     alignItems: 'center',
//     // lineHeight: 10,
//     // height: 70,
//   },
//   maskedInput: {
//     fontSize: 17,
//     color: '#000',
//     // backgroundColor: 'transparent',
//     // lineHeight: 18,
//     // height: 52,
//   },
//   error: {
//     color: '#d32f2f',
//     textAlign: 'center',
//     marginBottom: 24,
//     fontSize: 14,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     padding: 12,
//     borderRadius: 8,
//     marginHorizontal: 16,
//   },
//   loginBtn: {
//     color: '#fff',
//     marginTop: 6,
//     marginBottom: 16,
//     paddingVertical: 6,
//     borderRadius: 30,
//     elevation: 2,
//     marginHorizontal: 30,
//   },
//   forgotBtn: {
//     marginBottom: 24,
//   },
//   helpContainer: {
//     marginTop: 'auto',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginHorizontal: 16,
//     paddingTop: 24,
//     marginBottom: 16,
//   },
//   helpLeftContainer: {
//     flex: 1,
//     marginRight: 8,
//   },
//   helpRightContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   contactBtn: {
//     borderWidth: 1,
//     borderRadius: 20,
//     flex: 1,
//   },
//   langBtn: {
//     borderWidth: 1,
//     borderRadius: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//   },
//   versionText: {
//     textAlign: 'center',
//     marginTop: 24,
//     marginBottom: 16,
//     opacity: 0.6,
//     fontSize: 12,
//     color: '#000000',
//   },
// });

// export default LoginScreen;
