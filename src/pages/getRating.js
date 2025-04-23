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
import AnimatedCard from '../components/animatedCard';

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
    // console.log('[INFO] Starting analysis for product link:', productLink);

    try {
      setStatusMessage('🔗 Sending request to scrape product data...');
      // console.log('[INFO] Sending request to scrape product data...');
      const response = await axios.post(
        'https://scrapping-relay.onrender.com/scrape',
        { url: productLink }
      );

      // console.log('[INFO] Scrape response:', response.data);
      const { image_url, material, title, price } = response.data;

      if (!material || !title) {
        console.error('[ERROR] Missing material or title in scrape response:', response.data);
        setError('Failed to fetch product data. Please try again.');
        setStatusMessage('❌ Failed to fetch product data.');
        return;
      }

      setProductData({ image_url, material, title, price });
      setStatusMessage('📊 Analyzing eco-score...');
      // console.log('[INFO] Product data set successfully:', { image_url, material, title, price });
      await rateEco(title, price, material, image_url, productLink);
    } catch (err) {
      console.error('[ERROR] Error during scraping:', err.message);
      setError('Network error: Unable to connect to the server. Please check your connection.');
      setStatusMessage('❌ Network error during scraping.');
    } finally {
      setLoading(false);
      // console.log('[INFO] Finished analysis process.');
    }
  };

  const rateEco = async (title, price, material, image_url, link) => {
    try {
      setStatusMessage('📊 Sending data for eco-score analysis...');
      // console.log('[INFO] Sending data for eco-score analysis:', { title, material });

      const response = await axios.post(
        'https://eco-cart-backendnode.onrender.com/gemini-getRating',
        { title, material }
      );

      // console.log('[INFO] Eco-score response::::::::::', response.data);

      // Extract and process the rating value
      const rating = parseInt(response.data.rating, 10); // Convert to a number
      const { description, category } = response.data;
      

      // console.log('[INFO] Eco-score data:', { rating });
      setProductData({
        image_url,
        material,
        title,
        price,
        rating,
        description,
        link,
      });
      
      
      if (rating >= 3) {
        setStatusMessage('✅ Product is eco-friendly!');
        // console.log('[INFO] Product is eco-friendly:', { rating, description });
      } else {
        setStatusMessage('🔍 Searching for better alternatives...');
        // console.log('[INFO] Product is not eco-friendly. Searching for alternatives...');
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
      const response = await axios.post(
        'https://eco-cart-backendnode.onrender.com/search-product',
        { query: category }
      );

      const alternatives = response.data.products || [];
      const top3Links = alternatives.slice(0, 3).map((product) => product.link);

      for (const link of top3Links) {
        setStatusMessage(`🔗 Scraping alternative product`);
        const scrapeResponse = await axios.post(
          'https://scrapping-relay.onrender.com/scrape',
          { url: link }
        );

        const { image_url, material, title, price } = scrapeResponse.data;

        // Send the scraped data for rating
        const ratingResponse = await axios.post(
          'https://eco-cart-backendnode.onrender.com/gemini-getRating',
          { title, material }
        );

        const { rating, description } = ratingResponse.data;

        // Add the rated alternative product to the list
        setAlternativeProducts((prev) => [
          ...prev,
          { image_url, material, title, price, link, rating, description },
        ]);
      }

      setStatusMessage('✅ Alternatives fetched and rated successfully.');
    } catch (err) {
      console.error('Error fetching or rating alternatives:', err); // Log error for debugging
      setError('Failed to fetch or rate alternatives.');
      setStatusMessage('❌ Error fetching or rating alternatives.');
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
          <AnimatedCard {...productData} />
        </View>
      )}

      {alternativeProducts.length > 0 && (
        <View style={styles.alternatives}>
          <Text style={styles.alternativesTitle}>Better Alternatives</Text>
          <FlatList
            data={alternativeProducts}
            style={styles.alternativesList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.alternativeCardContainer}>
                <ProductCard 
                  name={item.title}
                  link={item.link}
                  img={item.image_url}
                  rating={item.rating}
                  material={item.material}
                  price={item.price}
                  rating_description={item.description} // Assuming description is the rating description
                
                />
              </View>
            )}
            horizontal // Enable horizontal scrolling
            showsHorizontalScrollIndicator={false} // Hide the scroll indicator
            contentContainerStyle={styles.alternativeList} // Add padding for horizontal scrolling
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
    backgroundColor: '#e9f5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#198754',
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
    borderRadius: 30,
    height: 60,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#198754',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
    width: '50%',
    alignSelf: 'center',
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
    width: '100%',
  },
  alternatives: {
    marginTop: 16,
    width: '90%',
    alignSelf: 'center',
  },
  alternativesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alternativeCardContainer: {
    width: 400, // Match the width of home screen cards
    marginRight: -150,
  },
});

export default GetRating;