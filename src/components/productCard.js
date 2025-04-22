import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons

const ProductCard = (props) => {
  const { name, link, img, rating, rating_description, material } = props;

  const ratingStars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: img }}
          style={styles.image}
        />
        {rating >= 3 && (
          <Image
            source={require('../assets/eco-badge.png')}
            style={styles.ecoBadge}
          />
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {name}
          </Text>
          <TouchableOpacity onPress={() => link && Linking.openURL(link)}>
            <Ionicons name="link-outline" size={20} color="#007bff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.material}>
          <Text style={styles.bold}>Material:</Text> {material}
        </Text>

        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {ratingStars.map((filled, index) =>
              filled ? (
                <Ionicons
                  key={index}
                  name="star"
                  size={16}
                  color="#198754"
                  style={styles.star}
                />
              ) : (
                <Ionicons
                  key={index}
                  name="star-outline"
                  size={16}
                  color="#198754"
                  style={styles.star}
                />
              )
            )}
          </View>
          <Text style={styles.ratingText}>({rating})</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {rating_description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    width: '48%', // Adjust width to fit two cards in a row
  },
  imageContainer: {
    position: 'relative',
    height: 120, // Reduced height
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#198754',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 'bold',
  },
  ecoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
  },
  cardBody: {
    padding: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 4,
  },
  material: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  star: {
    marginRight: 1,
  },
  ratingText: {
    fontSize: 12,
    color: '#6c757d',
  },
  description: {
    fontSize: 10,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});

export default ProductCard;