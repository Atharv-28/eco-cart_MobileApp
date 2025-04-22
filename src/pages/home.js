import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../util/config';
import ProductCard from '../components/productCard';
import { Ionicons } from '@expo/vector-icons'; // For pagination icons

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
        <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? '#ccc' : '#007bff'} />
      </TouchableOpacity>
      <Text style={styles.paginationText}>
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity
        style={styles.paginationButton}
        onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? '#ccc' : '#007bff'} />
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
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ProductCard {...item} />}
            contentContainerStyle={styles.productList}
          />
          {totalPages > 1 && <Pagination />}
        </>
      ) : (
        <Text style={styles.noProductsText}>No products found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    marginTop: 16,
  },
  paginationButton: {
    padding: 8,
  },
  paginationText: {
    fontSize: 16,
    color: '#6c757d',
    marginHorizontal: 16,
  },
});

export default Home;