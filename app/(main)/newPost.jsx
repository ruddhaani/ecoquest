import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from '../../components/Header'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../../components/Avatar'
import RichTextEditor from '../../components/RichTextEditor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Icon from '../../assets/icons'
import Button from '../../components/Button'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'react-native'
import { getSupabaseFileUri } from '../../services/imageService'
import { createOrUpdatePost } from '../../services/postService'
import { Video } from 'expo-av'
import { createOrUpdateGoal, getDailyPostDetail, getGoalCompletionDetails } from '../../services/goalService'

const NewPost = () => {
  const post = useLocalSearchParams();
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(file);
  const [goal, setGoal] = useState(null);
  const [goalCompleted, setGoalCompleted] = useState(false);

  const fetchData = async () => {
      // Ensure loading starts
    const result = await getDailyPostDetail();
    if (result.success) {
      setGoal(result.data);
    }
     // Stop loading after data is set
  };

  const fetchCompletion = async () => {
    if (!user?.id || !goal?.goalid) {
      console.warn("User ID or Goal ID is undefined. Skipping fetchCompletion.");
      return;
    }

    
    const result = await getGoalCompletionDetails(user.id, goal.goalid);
    

    if (!result.success) {
      setGoalCompleted(false);
      console.log('updated as false');
    } else {
      setGoalCompleted(true);
      console.log('updated as true');
    }
  };


  useEffect(() => {
    if (goal) {
      fetchCompletion();
    }
  }, [goal]);

  useEffect(() => {
    fetchData();
    if (post && post.id) {
      bodyRef.current = post.body;
      setFile(post.file || null);
      setTimeout(() => {
        editorRef?.current.setContentHTML(post.body);
      }, 300);
    }
  }, [])

  const onPick = async (isImage , useCamera = false) => {
    let mediaconfig = {
      mediaTypes: isImage ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.7,
    };
  
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync(mediaconfig);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(mediaconfig);
    }
  
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  }

  const isLocalFile = file => {
    if (!file) return null;
    if (typeof file == 'object') return true;

    return false;
  }

  const getFileUri = file => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }

    return getSupabaseFileUri(file)?.uri;
  }

  const getFileType = file => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type;
    }

    if (file.includes('postImage')) {
      return 'image';
    }

    return 'video';
  }

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert('Post', 'Please choose an image or   post body!');
    }

    let data = {
      file,
      body: bodyRef.current,
      userId: user?.id,
    }



    if (post && post.id) data.id = post.id;

    // console.log(goal);


    // console.log(goalData);

    setLoading(true);

    let res = await createOrUpdatePost(data);
    // console.log(res);

    let goalData = {
      userid: user?.id,
      postid: res?.data.id,
      goalid: goal?.goalid
    }

    // console.log(goalData);
    let goalRes = await createOrUpdateGoal(goalData);

    console.log("status", goalCompleted);

    // console.log(goalRes);
    setLoading(false);
    if (res.success) {
      setFile(null);
      bodyRef.current = '';
      editorRef.current?.setContentHTML('');
      router.back();
    } else {
      Alert.alert('Post', "Post couldn't be uploaded!")
    }
  }

  
  if (goalCompleted && (!post || Object.keys(post).length === 0)) {
    return (
      <ScreenWrapper bg='white'>
        <View style={styles.container}>
          <Header title="Daily Challenge" />
          <View style={styles.completedMsgContainer}>
            <Text style={styles.completedMsg}>The challenge is</Text>
            <Text style={[styles.completedMsg, { color: theme.colors.primary }]}>completed!</Text>
          </View>
        </View>
      </ScreenWrapper>
    )
  }
  return (
    <ScreenWrapper bg='white'>
      <View style={styles.container}>
        <Header title="Daily Challenge" />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          <View style={styles.goal}>
            <Text style={styles.goalText}>
              {
                goal?.goals?.title
              }
            </Text>
          </View>
          {/* avatar */}
          <View style={styles.header}>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl} />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>
                {
                  user &&
                  user.name
                }
              </Text>

              <Text style={styles.publicText}>
                Public
              </Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <RichTextEditor editorRef={editorRef} onChange={body => bodyRef.current = body} />
          </View>

          {
            file && (
              <View style={styles.file}>
                {
                  getFileType(file) == 'video' ? (
                    <Video
                      style={{ flex: 1 }}
                      source={{
                        uri: getFileUri(file)
                      }}
                      useNativeControls
                      resizeMode='cover'
                      isLooping
                    />
                  ) : (
                    <Image source={{ uri: getFileUri(file) }} resizeMode='cover' style={{ flex: 1 }} />

                  )
                }
                <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                  <Icon name="delete" size={22} color="white" />
                </Pressable>
              </View>
            )
          }

          <View style={styles.media}>
            <Text style={styles.addImageText}>Add to your post</Text>
            
              {
                goal?.goals?.type == 'image' && (
                  <View style={styles.mediaIcons}>
                  <TouchableOpacity onPress={() => onPick(true)}>
                    <Icon name="image" size={30} color={theme.colors.dark} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => onPick(true , true)}>
                    <Icon name="camera" size={30} color={theme.colors.dark} />
                  </TouchableOpacity>
                  </View>
                )
              }

              {
                goal?.goals?.type == 'video' && (
                  <View style={styles.mediaIcons}>
                  <TouchableOpacity onPress={() => onPick(false)}>
                    <Icon name="video" size={30} color={theme.colors.dark} />
                  </TouchableOpacity>
                  </View>
                )
              }



            
          </View>
        </ScrollView>

        <Button title={post && post.id ? "Update" : "Post"} buttonStyle={{ height: hp(6.2) }} loading={loading} onPress={onSubmit} />
      </View>

    </ScreenWrapper>
  )
}


export default NewPost

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