import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Replace Bootstrap icons with Ionicons
// import Chatbox from './Chatbox'; // Import Chatbox componentk

export default function AnimatedCard(props) {
  const { id, title, link, image_url, rating, description, material, price } = props;
  const [animatedName, setAnimatedName] = useState('');
  const [filledStars, setFilledStars] = useState(0);
  const [showChatbox, setShowChatbox] = useState(false);
  const slideAnim = useState(new Animated.Value(100))[0]; // Animation for sliding

//   console.log(rating);
  
  useEffect(() => {
    if (!title || typeof title !== 'string') {
      setAnimatedName('No Title');
      return;
    }

    let nameIndex = 0;
    const nameInterval = setInterval(() => {
      if (nameIndex < title.length) {
        setAnimatedName((prev) => prev + title[nameIndex]);
        nameIndex++;        
      } else {
        clearInterval(nameInterval);
      }
    }, 50);

    return () => clearInterval(nameInterval);
  }, [title]);

  useEffect(() => {
    if (typeof title !== 'string' || typeof rating !== 'number' || rating < 0) return;
  
    setFilledStars(0); // Reset before starting animation
  
    // Animate the stars
    let starIndex = 1;
    const starInterval = setInterval(() => {
      if (starIndex < Math.round(rating)) {
        setFilledStars((prev) => prev + 1);
        starIndex++;
      } else {
        clearInterval(starInterval);
      }
    }, 500); // 0.5s delay for each star
  
    // Slide in chatbox after 3s
    const chatboxTimeout = setTimeout(() => {
      setShowChatbox(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 3000);
  
    return () => {
      clearInterval(starInterval);
      clearTimeout(chatboxTimeout);
    };
  }, [title, rating]);
  

  useEffect(() => {
    if (typeof rating !== 'number' || rating < 0) {
      console.error('[ERROR] Invalid rating value:', rating);
      return;
    }
  
    let starIndex = 0;
    const starInterval = setInterval(() => {
      if (starIndex < Math.round(rating)) {
        setFilledStars((prev) => prev + 1);
        starIndex++;
      } else {
        clearInterval(starInterval);
      }
    }, 500); // 0.5s delay for each star
  
    return () => clearInterval(starInterval);
  }, [rating]);
  

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateX: slideAnim }] }, // Slide animation
        ]}
      >
        {/* Product Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image_url } } // Use placeholder if `img` is missing
            style={styles.image}
            resizeMode="contain"
          />

          {rating >= 3 && (
            <Image
              source={require('../assets/eco-badge.png')}
              style={styles.ecoBadge}
            />
          )}
        </View>

        {/* Product Details Section */}
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            {/* Animated Name */}
            <Text style={styles.title} numberOfLines={2}>
              {animatedName}
            </Text>
            <TouchableOpacity onPress={() => link && Linking.openURL(link)}>
              <Ionicons name="link-outline" size={20} color="#007bff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.material}>
            <Text style={styles.bold}>Material:</Text> {material}
          </Text>
          <Text style={styles.price}>
            <Text style={styles.bold}>Price:</Text> {price}
          </Text>

          {/* Animated Stars */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {Array.from({ length: 5 }, (_, index) =>
                index < filledStars ? (
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

          {/* Animated Description */}
          <TypingEffect text={description} />
        </View>
      </Animated.View>

      {/* Chatbox */}
      {/* {showChatbox && <Chatbox productName={animatedName} price={price} material={material} />} */}
    </View>
  );
}

// Typing Effect Component
const TypingEffect = ({ text = '' }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (typeof text !== 'string') return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  return <Text style={styles.description}>{displayedText}</Text>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 240,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
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
    width: 48,
    height: 48,
  },
  cardBody: {
    padding: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  material: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6c757d',
  },
  description: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});
