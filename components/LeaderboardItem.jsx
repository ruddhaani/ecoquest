import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Avatar from './Avatar';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return { icon: "🏆", color: "#FFD700" }; // Gold
    case 2:
      return { icon: "🥈", color: "#C0C0C0" }; // Silver
    case 3:
      return { icon: "🥉", color: "#CD7F32" }; // Bronze
    default:
      return { icon: "🎖️", color: "#A0A0A0" }; // Normal
  }
};

const LeaderboardItem = ({ item, rank }) => {
  const { icon, color } = getRankStyle(rank);

  return (
    <TouchableOpacity style={styles.container}>
      {/* Rank Icon */}
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { color }]}>{icon}</Text>
      </View>

      {/* User Avatar */}
      <Avatar uri={item?.user?.image} size={hp(6)} />

      {/* User Details */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item?.user?.name || "Unknown"}</Text>
      </View>

      {/* Score */}
      <Text style={styles.score}>{item?.score}</Text>
    </TouchableOpacity>
  );
};

export default LeaderboardItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(2),
    borderRadius: theme.radius.lg,
    backgroundColor: "#FFF", // Light Background
    borderWidth: 1,
    borderColor: "#E0E0E0", // Soft Border
    marginBottom: hp(1),
    shadowColor: "#D3D3D3",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Subtle Elevation for Android
  },
  rankContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  rankText: {
    fontSize: hp(2.8),
  },
  userInfo: {
    flex: 1,
    marginLeft: wp(2),
  },
  userName: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: "#333", // Dark Gray
  },
  score: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: "#555", // Slightly Dark Gray
  },
});
