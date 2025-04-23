import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

const Chatbox = ({ productName, price, material }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showChatbox, setShowChatbox] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // State for typing animation
  const [productDetails, setProductDetails] = useState({
    productName: "",
    price: "NA",
    material: "",
  });

  useEffect(() => {
    setProductDetails({ productName, price, material });

    const chatboxTimeout = setTimeout(() => {
      setShowChatbox(true);
    }, 3000);

    return () => {
      clearTimeout(chatboxTimeout);
    };
  }, [productName, price, material]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    try {
      setIsTyping(true);

      const response = await fetch(
        "https://eco-cart-backendnode.onrender.com/chatbot-getRating",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: input,
            productName: productDetails.productName,
            price: productDetails.price,
            material: productDetails.material,
          }),
        }
      );

      const data = await response.json();

      setTimeout(() => {
        setIsTyping(false);
        simulateTypingAnimation(data.response);
      }, 1500);
    } catch (error) {
      console.error("Error communicating with chatbot:", error);
      setIsTyping(false);
      const botMessage = {
        sender: "bot",
        text: "An error occurred. Please try again later.",
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const simulateTypingAnimation = (text) => {
    let index = 0;
    const botMessage = { sender: "bot", text: "" };
    setMessages((prev) => [...prev, botMessage]);

    const interval = setInterval(() => {
      if (index < text.length) {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.sender === "bot") {
            lastMessage.text = text.slice(0, index + 1); // Append the next character
          }
          return updatedMessages;
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Adjust typing speed here
  };

  if (!showChatbox) return null;

  return (
    <KeyboardAvoidingView
      style={styles.chatbox}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />
      {isTyping && (
        <View style={[styles.message, styles.botMessage]}>
          <ActivityIndicator size="small" color="#198754" />
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about the product..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  chatbox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginTop: 16,
    width: "100%",
    height: "auto",
    padding: 16,
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  message: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#198754",
    borderRadius: 20,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#27ae60",
    borderRadius: 15,
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 25,
    padding: 12,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#198754",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Chatbox;