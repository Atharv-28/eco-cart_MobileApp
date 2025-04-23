import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCard from '../components/animatedCard';

export default function LensSearchPage() {
  const [selectedFile, setSelectedFile] = useState(null); // Stores the image URI
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);

  // Handle image selection and upload to Cloudinary
  const handleFileSelect = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.IMAGE,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;

      try {
        const formData = new FormData();
        formData.append('file', {
          uri: localUri,
          type: 'image/jpeg',
          name: 'upload.jpg',
        });
        formData.append('upload_preset', 'ck4cetvf');

        const cloudinaryResponse = await fetch(
          'https://api.cloudinary.com/v1_1/dhnplptdz/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to upload image to Cloudinary');
        }

        const cloudinaryData = await cloudinaryResponse.json();
        setSelectedFile(cloudinaryData.secure_url);
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      }
    }
  };

  // Fetch product details and alternatives
  const fetchImageDetails = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    try {
      console.log('[DEBUG] Sending Cloudinary URL to backend:', selectedFile);

      // Send the Cloudinary URL to the backend
      const response = await fetch('https://eco-cart-backendnode.onrender.com/gemini-ecoLens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: selectedFile }),
      });

      if (!response.ok) {
        console.error('[ERROR] Backend analysis failed:', response.status, response.statusText);
        throw new Error('Analysis failed');
      }

      const analysis = await response.json();
      console.log('[DEBUG] Backend response:', analysis);

      // Combine brand and product into one query
      const query = analysis.product;
      console.log('[DEBUG] Combined query:', query);

      // Fetch alternatives using the combined query
      const alternativesResponse = await fetch(
        'https://eco-cart-backendnode.onrender.com/search-product',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        }
      );

      if (!alternativesResponse.ok) {
        console.error('[ERROR] Fetching alternatives failed:', alternativesResponse.status, alternativesResponse.statusText);
        throw new Error('Failed to fetch alternatives');
      }

      const alternativesData = await alternativesResponse.json();
      console.log('[DEBUG] Alternatives response:', alternativesData);

      // Get the first product from alternatives
      const firstProduct = alternativesData.products[0];
      console.log('[DEBUG] First product from alternatives:', firstProduct);

      if (firstProduct) {
        console.log('[DEBUG] Sending first product link to scrape endpoint...');

        // Send the first product link to the scrape endpoint
        const scrapeResponse = await axios.post(
          'https://scrapping-relay.onrender.com/scrape',
          { url: firstProduct.link }
        );

        const { image_url, material, title, price } = scrapeResponse.data;
        console.log('[DEBUG] Scrape response:', { image_url, material, title, price });

        if (!material || !title) {
          console.error('[ERROR] Missing material or title in scrape response:', scrapeResponse.data);
          setError('Failed to fetch product data. Please try again.');
          return;
        }

        console.log('[DEBUG] Sending scraped data to getGeminiRating endpoint...');

        // Send the scraped data to the getGeminiRating endpoint
        const ratingResponse = await axios.post(
          'https://eco-cart-backendnode.onrender.com/gemini-getRating',
          { title, material }
        );

        const { rating, description } = ratingResponse.data;
        console.log('[DEBUG] Rating response:', { rating, description });

        // Update the product state with the final data
        setProduct({
          name: title,
          price,
          material,
          rating,
          desc: description,
          img: image_url,
          link: firstProduct.link,
        });
      }

      // Set all alternatives
      setAlternatives(alternativesData.products);
    } catch (err) {
      console.error('[ERROR] An error occurred:', err.message);
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
      console.log(product);
      
      console.log('[DEBUG] Finished processing.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null); // Clear the selected image
    setProduct(null); // Clear the main product
    setAlternatives([]); // Clear the alternatives
    setError(''); // Clear any error messages
    console.log('[DEBUG] Reset button clicked. States cleared.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>EcoLens</Text>
      <Text style={styles.subHeader}>Scan Products for Sustainability Insights</Text>

      {/* Upload Area */}
      <TouchableOpacity style={styles.uploadArea} onPress={handleFileSelect}>
        {selectedFile ? (
          <Image source={{ uri: selectedFile }} style={styles.imagePreview} />
        ) : (
          <View style={styles.uploadContent}>
            <Ionicons name="cloud-upload-outline" size={50} color="#198754" />
            <Text style={styles.uploadText}>Tap to Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Analyze Button */}
      {selectedFile && (
        <>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={fetchImageDetails}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze Product</Text>
            )}
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Main Product */}
      {product && (
        <View style={styles.productContainer}>
          <Text style={styles.sectionHeader}>Product Found</Text>
                  <View style={styles.productCard}>
          
          <AnimatedCard
          style={styles.productCardChild}
            image_url={product.img}
            title={product.name}
            price={product.price}
            material={product.material}
            link={product.link}
            rating={product.rating}
            description={product.desc}
          />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e8f5e9',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#198754',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: 16,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#198754',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#198754',
    marginTop: 8,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  analyzeButton: {
    backgroundColor: '#198754',
    padding: 12,
    alignSelf: 'center',
    width: '50%',
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  productContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    height: 800,
    shadowRadius: 4,
    width: '100%',
    alignSelf: 'center',
    elevation: 3, // For Android shadow
  },
  productCard: {
    margin: 16,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    height: "90%",
    marginLeft: -180,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#198754',
    marginBottom: 8,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#dc3545', // Red color for reset
    padding: 12,
    alignSelf: 'center',
    width: '50%',
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});