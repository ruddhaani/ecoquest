import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/Avatar';
import RichTextEditor from '../../components/RichTextEditor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '../../assets/icons';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { getSupabaseFileUri } from '../../services/imageService';
import { createOrUpdatePost } from '../../services/postService';
import { Video } from 'expo-av';
import { createOrUpdateGoal, getDailyPostDetail, getGoalCompletionDetails } from '../../services/goalService';

const NewPost = () => {
  const post = useLocalSearchParams();
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [goal, setGoal] = useState(null);
  const [goalCompleted, setGoalCompleted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  console.log(goal);

  useEffect(() => {
    if (goal?.goalid) {
      fetchCompletion();
    }
  }, [goal?.goalid]);

  const fetchData = async () => {
    const result = await getDailyPostDetail();
    if (result.success) {
      setGoal(result.data);
    }
  };

  const fetchCompletion = useCallback(async () => {
    if (!user?.id || !goal?.goalid) return;
    const result = await getGoalCompletionDetails(user.id, goal.goalid);
    setGoalCompleted(result.success);
  }, [user?.id, goal?.goalid]);

  const onPick = useCallback(async (isImage) => {
    let mediaconfig = {
      mediaTypes: isImage ? ['images'] : ['videos'],
      allowsEditing: true,
      quality: 0.7,
    };
    let result = await ImagePicker.launchImageLibraryAsync(mediaconfig);
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  }, []);

  const fileUri = useMemo(() => (file ? getFileUri(file) : null), [file]);
  const fileType = useMemo(() => (file ? getFileType(file) : null), [file]);
  const isLocal = useMemo(() => (file ? isLocalFile(file) : null), [file]);

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert('Post', 'Please choose an image or enter post body!');
      return;
    }

    setLoading(true);
    let data = { file, body: bodyRef.current, userId: user?.id };
    if (post?.id) data.id = post.id;

    let res = await createOrUpdatePost(data);
    let goalData = { userid: user?.id, postid: res?.data.id, goalid: goal?.goalid };
    await createOrUpdateGoal(goalData);

    setLoading(false);
    if (res.success) {
      setFile(null);
      bodyRef.current = '';
      editorRef.current?.setContentHTML('');
      router.back();
    } else {
      Alert.alert('Post', "Post couldn't be uploaded!");
    }
  };

  if (goalCompleted && (!post || Object.keys(post).length === 0)) {
    return (
      <ScreenWrapper bg='white'>
        <View style={styles.container}>
          <Header title="Daily Goal" />
          <View style={styles.completedMsgContainer}>
            <Text style={styles.completedMsg}>The goal is</Text>
            <Text style={[styles.completedMsg, { color: theme.colors.primary }]}>completed!</Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg='white'>
      <View style={styles.container}>
        <Header title="Daily Goal" />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          <View style={styles.goal}>
            <Text style={styles.goalText}>{goal?.goals?.title}</Text>
          </View>
          <View style={styles.header}>
            <Avatar uri={user?.image} size={hp(6.5)} rounded={theme.radius.xl} />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user?.name}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>
          <View style={styles.textEditor}>
            <RichTextEditor editorRef={editorRef} onChange={body => (bodyRef.current = body)} />
          </View>
          {file && (
            <View style={styles.file}>
              {fileType === 'video' ? (
                <Video style={{ flex: 1 }} source={{ uri: fileUri }} useNativeControls resizeMode='cover' isLooping />
              ) : (
                <Image source={{ uri: fileUri }} resizeMode='cover' style={{ flex: 1 }} />
              )}
              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icon name="delete" size={22} color="white" />
              </Pressable>
            </View>
          )}
          <View style={styles.media}>
            <Text style={styles.addImageText}>Add to your post</Text>
            <View style={styles.mediaIcons}>
              {goal?.goals?.type === 'image' && (
                <TouchableOpacity onPress={() => onPick(true)}>
                  <Icon name="image" size={30} color={theme.colors.dark} />
                </TouchableOpacity>
              )}
              {goal?.goals?.type === 'video' && (
                <TouchableOpacity onPress={() => onPick(false)}>
                  <Icon name="video" size={30} color={theme.colors.dark} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
        <Button title={post?.id ? "Update" : "Post"} buttonStyle={{ height: hp(6.2) }} loading={loading} onPress={onSubmit} />
      </View>
    </ScreenWrapper>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  completedMsgContainer: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  completedMsg: {
    fontSize: hp(2.3),
    marginTop: 10,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text
  },
  goal: {
    paddingHorizontal: wp(4),
    margin: 10
  },
  goalText: {
    textAlign: 'center',
    fontSize: hp(2.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.primaryDark,
  },
  imageIcon: {
    borderRadius: theme.radius.md
  },
  file: {
    height: hp(30),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous'
  },
  video: {

  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'rgba(255,0,0,0.6)'
  },

  textEditor: {

  },
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray
  },
  mediaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  title: {
    fontSize: hp(2.5),
    textAlign: 'center',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15
  }

})