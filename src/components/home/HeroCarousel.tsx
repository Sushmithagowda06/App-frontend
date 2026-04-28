import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";

const data = [
  {
    id: "1",
    title: "Start your journey",
    subtitle: "Increase your healthspan with guided care",
  },
  {
    id: "2",
    title: "Track daily fitness",
    subtitle: "Monitor your health and stay consistent",
  },
  {
    id: "3",
    title: "Consult doctors",
    subtitle: "Get expert advice anytime, anywhere",
  },
];

const HeroCarousel = () => {
  const flatListRef = useRef<any>(null);
  const currentIndex = useRef(0);

  const [index, setIndex] = useState(0);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 520;

  const progress = useRef(new Animated.Value(0)).current;

  // 🔥 Dot loading animation
  const startProgress = () => {
    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      goToNextSlide();
    });
  };

  const goToNextSlide = () => {
    const nextIndex =
      (currentIndex.current + 1) % data.length;

    flatListRef.current?.scrollToOffset({
      offset: nextIndex * width,
      animated: true,
    });

    currentIndex.current = nextIndex;
    setIndex(nextIndex);
  };

  useEffect(() => {
    startProgress();
  }, [index]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          currentIndex.current = newIndex;
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }, isSmallScreen && styles.slideMobile]}>
            {/* TEXT */}
            <View style={[styles.textContainer, isSmallScreen && styles.textContainerMobile]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

          </View>
        )}
      />

      {/* 🔥 DOT LOADER */}
      <View style={styles.dots}>
        {data.map((_, i) => {
          const widthAnim =
            i === index
              ? progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                })
              : i < index
              ? 20
              : 0;

          return (
            <View key={i} style={styles.dotBg}>
              <Animated.View
                style={[styles.dotFill, { width: widthAnim }]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default HeroCarousel;

const styles = StyleSheet.create({
 container: {
  minHeight: 280,
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,
  overflow: "hidden",
  backgroundColor: "#1A0B3D",
  paddingTop: 56,
  paddingBottom: 10,
},

  slide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  slideMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
  },

  textContainer: {
    flex: 0.55,
    paddingRight: 10,
    minWidth: "55%",
    alignItems: "flex-start",
    justifyContent: "center",
  },

  textContainerMobile: {
    flex: 1,
    paddingRight: 0,
    width: "100%",
    alignItems: "flex-start",
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "left",
  },

  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 6,
    width: "100%",
    textAlign: "left",
  },

  dots: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignSelf: "flex-start",
    left: 20,
  },

  dotBg: {
    width: 20,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    marginHorizontal: 4,
    overflow: "hidden",
  },

  dotFill: {
    height: 6,
    backgroundColor: "#fff",
  },
});