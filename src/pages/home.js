import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../util/config';
import ProductCard from '../components/productCard';
import { Ionicons } from '@expo/vector-icons'; // For pagination icons
import Chatbox from '../components/chatBot'; // Import the ChatBot component

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false); // State to toggle ChatBot
  const itemsPerPage = 15;

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    return products.filter(prod =>
      prod.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination controls
  const Pagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={styles.paginationButton}
        onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? '#ccc' : '#198754'} />
      </TouchableOpacity>
      <Text style={styles.paginationText}>
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity
        style={styles.paginationButton}
        onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? '#ccc' : '#198754'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a product..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Products List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : paginatedProducts.length > 0 ? (
        <>
          <FlatList
            data={paginatedProducts}
            key={'two-columns'} // Add a static key to prevent the error
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ProductCard {...item} />}
            numColumns={2} // Display two products per row
            columnWrapperStyle={styles.row} // Style for rows
            contentContainerStyle={styles.productList}
          />
          {totalPages > 1 && <Pagination />}
        </>
      ) : (
        <Text style={styles.noProductsText}>No products found.</Text>
      )}

      {/* ChatBot */}
      {isChatOpen ? (
        <Animated.View style={styles.chatBotContainer}>
          <Chatbox productName="Sample Product" price="100" material="Plastic" />
          <TouchableOpacity
            style={styles.closeChatButton}
            onPress={() => setIsChatOpen(false)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <TouchableOpacity
          style={styles.chatIcon}
          onPress={() => setIsChatOpen(true)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5e9',
    padding: 16,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productList: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between', // Space between items in a row
    marginBottom: 16,
  },
  loader: {
    marginTop: 32,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 32,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  paginationButton: {
    padding: 8,
  },
  paginationText: {
    fontSize: 16,
    color: '#6c757d',
    marginHorizontal: 16,
  },
  chatIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#198754',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBotContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeChatButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#198754',
    padding: 8,
    borderRadius: 50,
  },
});

export default Home;
