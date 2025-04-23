import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import axios from 'axios';
import ProductCard from '../components/productCard';

const GetRating = () => {
  const [productLink, setProductLink] = useState('');
  const [productData, setProductData] = useState(null);
  const [alternativeProducts, setAlternativeProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiSteps, setAiSteps] = useState([]);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(''); // New state for status messages

  const handleRatingFetch = async () => {
    setLoading(true);
    setAiSteps([]);
    setAlternativeProducts([]);
    setError(null);
    setStatusMessage('🌱 Starting analysis...');
    console.log('[INFO] Starting analysis for product link:', productLink);

    try {
      setStatusMessage('🔗 Sending request to scrape product data...');
      console.log('[INFO] Sending request to scrape product data...');
      const response = await axios.post(
        'https://scrapping-relay.onrender.com/scrape',
        { url: productLink }
      );

      console.log('[INFO] Scrape response:', response.data);
      const { image_url, material, title, price } = response.data;

      if (!material || !title) {
        console.error('[ERROR] Missing material or title in scrape response:', response.data);
        setError('Failed to fetch product data. Please try again.');
        setStatusMessage('❌ Failed to fetch product data.');
        return;
      }

      setProductData({ image_url, material, title, price });
      setStatusMessage('📊 Analyzing eco-score...');
      console.log('[INFO] Product data set successfully:', { image_url, material, title, price });
      await rateEco(title, price, material, image_url, productLink);
    } catch (err) {
      console.error('[ERROR] Error during scraping:', err.message);
      setError('Network error: Unable to connect to the server. Please check your connection.');
      setStatusMessage('❌ Network error during scraping.');
    } finally {
      setLoading(false);
      console.log('[INFO] Finished analysis process.');
    }
  };

  const rateEco = async (title, price, material, image_url, link) => {
    try {
      setStatusMessage('📊 Sending data for eco-score analysis...');
      console.log('[INFO] Sending data for eco-score analysis:', { title, material });
      const response = await axios.post(
        'https://eco-cart-backendnode.onrender.com/gemini-getRating',
        { title, material }
      );

      console.log('[INFO] Eco-score response:', response.data);
      const { rating, description, category } = response.data;

      if (rating >= 3) {
        setProductData({
          image_url,
          material,
          title,
          price,
          rating,
          description,
          link,
        });
        setStatusMessage('✅ Product is eco-friendly!');
        console.log('[INFO] Product is eco-friendly:', { rating, description });
      } else {
        setStatusMessage('🔍 Searching for better alternatives...');
        console.log('[INFO] Product is not eco-friendly. Searching for alternatives...');
        await suggestAlternative(category);
      }
    } catch (err) {
      console.error('[ERROR] Error during eco-score analysis:', err.message);
      setError('Failed to fetch rating. Please try again.');
      setStatusMessage('❌ Error during eco-score analysis.');
    }
  };

  const suggestAlternative = async (category) => {
    try {
      setStatusMessage('🔍 Fetching alternative products...');
      console.log('Fetching alternative products...');
      const response = await axios.post(
        'https://eco-cart-backendnode.onrender.com/search-product',
        { query: category }
      );

      console.log('Alternatives response:', response.data); // Log response for debugging
      const alternatives = response.data.products || [];
      const top3Links = alternatives.slice(0, 3).map((product) => product.link);

      for (const link of top3Links) {
        setStatusMessage(`🔗 Scraping alternative product: ${link}`);
        const response = await axios.post(
          'https://scrapping-relay.onrender.com/scrape',
          { url: link }
        );

        const { image_url, material, title, price } = response.data;

        setAlternativeProducts((prev) => [
          ...prev,
          { image_url, material, title, price, link },
        ]);
      }
      setStatusMessage('✅ Alternatives fetched successfully.');
    } catch (err) {
      console.error('Error fetching alternatives:', err); // Log error for debugging
      setError('Failed to fetch alternatives.');
      setStatusMessage('❌ Error fetching alternatives.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Check Eco-Friendliness</Text>
      <Text style={styles.subtitle}>
        Paste a product link to check sustainability 🌱
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter product link..."
        value={productLink}
        onChangeText={setProductLink}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRatingFetch}
        disabled={loading} // Disable button while loading
      >
        <Text style={styles.buttonText}>
          {loading ? 'Analyzing...' : 'Analyze Sustainability'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Display status message */}
      {statusMessage && <Text style={styles.statusMessage}>{statusMessage}</Text>}

      <View style={styles.aiSteps}>
        {aiSteps.map((step, index) => (
          <Text key={index} style={styles.aiStep}>
            {step}
          </Text>
        ))}
      </View>

      {productData && (
        <View style={styles.productCard}>
          <ProductCard {...productData} />
        </View>
      )}

      {alternativeProducts.length > 0 && (
        <View style={styles.alternatives}>
          <Text style={styles.alternativesTitle}>Better Alternatives</Text>
          <FlatList
            data={alternativeProducts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <ProductCard {...item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 16,
    textAlign: 'center',
  },
  aiSteps: {
    marginBottom: 16,
  },
  aiStep: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  productCard: {
    marginBottom: 16,
  },
  alternatives: {
    marginTop: 16,
  },
  alternativesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default GetRating;