import * as DocumentPicker from 'expo-document-picker';
import * as TextExtractor from 'expo-text-extractor';
import { PDFDocument } from 'pdf-lib';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clearResume, ResumeData, setExtractedText, setPdfJsonData, setProcessing, setResumeData } from '../../store/resumeSlice';

export default function UploadResume() {
  const dispatch = useDispatch();
  const { currentResume, isProcessing } = useSelector((state: RootState) => state.resume);
  const [localResumeData, setLocalResumeData] = useState<ResumeData | null>(null);

  console.log('Current Resume from Redux:', currentResume);

  const pickDocument = async (): Promise<void> => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        
        // Check if it's a supported file type
        const supportedTypes = ['.pdf'];
        const fileExtension = asset.name.toLowerCase().substring(asset.name.lastIndexOf('.'));
        
        if (!supportedTypes.includes(fileExtension)) {
          Alert.alert('Invalid file', 'Please select a PDF or Word document');
          return;
        }

        const response = await fetch(asset.uri);
        const arrayBuffer = await response.arrayBuffer();

        let pageCount = 1;
        if (fileExtension === '.pdf') {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
          pageCount = pages.length;
        }

        const resumeData: ResumeData = {
          name: asset.name,
          size: asset.size ?? 0,
          uri: asset.uri,
          pageCount: pageCount,
          uploadDate: new Date().toISOString(),
        };

        setLocalResumeData(resumeData);
        Alert.alert('Success', 'Document uploaded successfully!');
      } else {
        Alert.alert('Cancelled', 'File selection was cancelled');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Unknown error occurred');
    }
  };

  const extractTextFromPDF = async (uri: string): Promise<{ text: string; jsonData: any }> => {
    try {
      // Step 1: Convert PDF to images
      const images = await convertPdfToImages(uri);
      
      // Step 2: Extract text from each image using OCR
      let allExtractedText = '';
      const extractedData: any = {
        pages: [],
        totalText: '',
        extractionDate: new Date().toISOString(),
        method: 'OCR via expo-text-extractor'
      };

      for (let i = 0; i < images.length; i++) {
        const imageUri = images[i];
        
        // Extract text from the image
        const extractedTextArray = await TextExtractor.extractTextFromImage(imageUri);
        const extractedText = Array.isArray(extractedTextArray) 
          ? extractedTextArray.join(' ') 
          : extractedTextArray;
        
        if (extractedText && extractedText.trim()) {
          allExtractedText += `\n--- Page ${i + 1} ---\n${extractedText}\n`;
          
          extractedData.pages.push({
            pageNumber: i + 1,
            imageUri: imageUri,
            extractedText: extractedText,
            confidence: 'high' // expo-text-extractor doesn't provide confidence scores
          });
        }
      }

      extractedData.totalText = allExtractedText.trim();

      return {
        text: allExtractedText.trim() || 'No text could be extracted from the PDF images.',
        jsonData: extractedData
      };
    } catch (error: any) {
      // Handle the case where PDF-to-image conversion is not implemented
      if (error.message && error.message.includes('PDF-to-image conversion is not yet implemented')) {
        const fallbackData = {
          pages: [],
          totalText: '',
          extractionDate: new Date().toISOString(),
          method: 'Framework Ready - PDF-to-image conversion needed',
          status: 'incomplete',
          message: error.message
        };

        const fallbackText = `PDF uploaded successfully!

File: ${uri.split('/').pop()}
Upload Date: ${new Date().toLocaleString()}

⚠️ PDF-to-Image Conversion Required

The PDF has been uploaded and stored, but text extraction requires PDF-to-image conversion which is not yet implemented.

To enable full OCR text extraction, implement one of these options:
1. Backend Service: Send PDF to your server for image conversion
2. Native Module: Use react-native-pdf-to-image (may need custom linking)
3. Cloud API: Use services like Google Cloud Vision, AWS Textract
4. WebView: Use PDF.js in a WebView for conversion

Current Status: File stored, ready for text extraction once conversion is implemented.`;

        return {
          text: fallbackText,
          jsonData: fallbackData
        };
      }
      
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  };

  const convertPdfToImages = async (pdfUri: string): Promise<string[]> => {
    try {
      // For now, we'll implement a fallback approach since we don't have actual PDF-to-image conversion
      // In a real implementation, you would use:
      // 1. A backend service to convert PDF to images
      // 2. A native module like react-native-pdf-to-image
      // 3. A cloud service that provides PDF-to-image APIs
      
      // Since we don't have actual image conversion yet, we'll throw an informative error
      // that explains the limitation and provides guidance
      throw new Error(
        'PDF-to-image conversion is not yet implemented. ' +
        'To enable full OCR text extraction, you need to implement PDF-to-image conversion. ' +
        'Options: 1) Backend service, 2) Native module, 3) Cloud API, 4) WebView with PDF.js'
      );
    } catch (error) {
      throw new Error(`Failed to convert PDF to images: ${error}`);
    }
  };

  const handleSaveResume = async (): Promise<void> => {
    if (!localResumeData) {
      Alert.alert('Error', 'No document to save');
      return;
    }

    try {
      dispatch(setProcessing(true));
      
      // Extract text from the document
      let extractedText = '';
      let pdfJsonData = null;
      const fileExtension = localResumeData.name.toLowerCase().substring(localResumeData.name.lastIndexOf('.'));
      
      if (fileExtension === '.pdf') {
        const extractionResult = await extractTextFromPDF(localResumeData.uri);
        extractedText = extractionResult.text;
        pdfJsonData = extractionResult.jsonData;
      } else {
        // For Word documents, you would need additional libraries
        extractedText = "Text extraction from Word documents requires additional setup.";
      }

      // Create the final resume data with extracted text and JSON data
      const finalResumeData: ResumeData = {
        ...localResumeData,
        extractedText: extractedText,
        pdfJsonData: pdfJsonData,
      };

      // Save to Redux store
      dispatch(setResumeData(finalResumeData));
      dispatch(setExtractedText(extractedText));
      if (pdfJsonData) {
        dispatch(setPdfJsonData(pdfJsonData));
      }
      
      Alert.alert('Success', 'Resume data saved successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to save resume data');
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleClearResume = (): void => {
    setLocalResumeData(null);
    dispatch(clearResume());
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
   <SafeAreaView style={styles.container} edges={['top','bottom']}>
     <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload Resume</Text>
        
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickDocument}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Processing...' : 'Select Document'}
          </Text>
        </TouchableOpacity>

        {localResumeData && (
          <View style={styles.documentInfo}>
            <Text style={styles.sectionTitle}>Uploaded Document:</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                <Text style={styles.label}>Name: </Text>
                {localResumeData.name}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.label}>Size: </Text>
                {formatFileSize(localResumeData.size)}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.label}>Pages: </Text>
                {localResumeData.pageCount}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.label}>Uploaded: </Text>
                {new Date(localResumeData.uploadDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]} 
                onPress={handleSaveResume}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Save Resume</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.clearButton]} 
                onPress={handleClearResume}
                disabled={isProcessing}
              >
                <Text style={styles.actionButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentResume && currentResume.extractedText && (
          <View style={styles.extractedTextContainer}>
            <Text style={styles.sectionTitle}>OCR Extracted Text:</Text>
            <View style={styles.textCard}>
              <Text style={styles.extractedText}>
                {currentResume.extractedText}
              </Text>
            </View>
            {currentResume.pdfJsonData && currentResume.pdfJsonData.method && (
              <Text style={styles.extractionMethod}>
                Extraction Method: {currentResume.pdfJsonData.method}
              </Text>
            )}
          </View>
        )}

        {currentResume && currentResume.pdfJsonData && (
          <View style={styles.jsonDataContainer}>
            <Text style={styles.sectionTitle}>OCR Processing Data:</Text>
            <View style={styles.jsonCard}>
              <Text style={styles.jsonData}>
                {JSON.stringify(currentResume.pdfJsonData, null, 2)}
              </Text>
            </View>
        </View>
      )}
    </View>
    </ScrollView>
   </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  documentInfo: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  extractedTextContainer: {
    marginTop: 20,
  },
  textCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  extractedText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  extractionMethod: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  jsonDataContainer: {
    marginTop: 20,
  },
  jsonCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 300,
  },
  jsonData: {
    fontSize: 12,
    lineHeight: 16,
    color: '#333',
    fontFamily: 'monospace',
  },
});