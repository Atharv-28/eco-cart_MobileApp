import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/productCard';
import AnimatedCard from '../components/animatedCard';

export default function LensSearch() {
  const [selectedFile, setSelectedFile] = useState(null); // Stores the image URI
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);

  // Handle image selection
  const handleFileSelect = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.IMAGE, // Updated to use MediaType
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0].uri); // Set the selected image URI
    }
  };

  // Fetch product details and alternatives
  const fetchImageDetails = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    try {
      // Simulate sending the image to the backend
      const response = await fetch('https://eco-cart-backendnode.onrender.com/gemini-ecoLens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: selectedFile }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const analysis = await response.json();
      console.log('Backend response:', analysis.product);

      // Fetch alternatives
      const alternativesResponse = await fetch(
        'https://eco-cart-backendnode.onrender.com/search-product',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: analysis.product }),
        }
      );

      const alternativesData = await alternativesResponse.json();
      const topAlternative = alternativesData.products[0];

      // Scrape product details
      const scrapeResponse = await fetch('http://flvpdqnklo.ap.loclx.io/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: topAlternative.link }),
      });

      if (!scrapeResponse.ok) throw new Error('Failed to scrape product data');

      const scrapedData = await scrapeResponse.json();
      console.log('Scraped data:', scrapedData);

      // Get rating for the scraped product
      const ratingResponse = await fetch(
        'https://eco-cart-backendnode.onrender.com/gemini-getRating',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scrapedData),
        }
      );

      if (!ratingResponse.ok) throw new Error('Failed to get rating');

      const ratingData = await ratingResponse.json();
      console.log('Rating data:', ratingData);

      // Set the main product
      setProduct({
        name: scrapedData.title,
        price: scrapedData.price,
        material: scrapedData.material,
        rating: ratingData.rating,
        desc: ratingData.description,
        img: scrapedData.image_url,
        link: topAlternative.link,
      });

      // Set alternatives
      setAlternatives(alternativesData.products);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
      )}

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Main Product */}
      {product && (
        <View style={styles.productContainer}>
          <Text style={styles.sectionHeader}>Product Found</Text>
          <AnimatedCard
            img={product.img}
            name={product.name}
            price={product.price}
            material={product.material}
            link={product.link}
            rating={product.rating}
            rating_description={product.desc}
          />
        </View>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <View style={styles.alternativesContainer}>
          <Text style={styles.sectionHeader}>Eco-Friendly Alternatives</Text>
          <FlatList
            data={alternatives}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <ProductCard
                name={item.title}
                link={item.link}
                img={item.image_url}
                rating={item.rating}
                material={item.material}
                price={item.price}
                rating_description={item.description}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.alternativesList}
          />
        </View>
      )}
    </View>
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
    borderRadius: 8,
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
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#198754',
    marginBottom: 8,
  },
  alternativesContainer: {
    marginTop: 16,
  },
  alternativesList: {
    paddingHorizontal: 8,
  },
});