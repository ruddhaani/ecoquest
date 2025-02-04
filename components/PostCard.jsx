import { Alert, Share, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { theme } from '../constants/theme'
import { hp, stripHtmlTags, wp } from '../helpers/common'
import Avatar from './Avatar'
import moment from 'moment'
import { TouchableOpacity } from 'react-native'
import Icon from '../assets/icons'
import RenderHTML from 'react-native-render-html';
import { Image } from 'expo-image'
import { downloadFile, getSupabaseFileUri } from '../services/imageService'
import { createPostLike, removePostLike } from '../services/postService'
import Loading from '../components/Loading'
import { Video } from 'expo-av'
import { updateUserScore } from '../services/scoreService'
import { addLikeScore, removeLikeScore } from '../helpers/scoreMechanism'

const PostCard = ({ item, currentUser, router, hasShadow = true, showMoreIcon = true, showDelete = false, onDelete = () => { }, onEdit = () => { } }) => {

    useEffect(() => {
        setLikes(item?.postLikes);
    }, []);

    const shadowStyles = {
        shadowOffset: {
            width: 0,
            height: 2
        },

        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1,
    }

    const textStyles = {
        color: theme.colors.dark,
        fontSize: hp(1.75)
    }

    const tagsStyles = {
        div: textStyles,
        p: textStyles,
        ol: textStyles,
        h1: {
            color: theme.colors.dark
        },
        h4: {
            color: theme.colors.dark
        }
    }

    const createdAt = moment(item?.created_at).format('MMM D')
    const [likes, setLikes] = useState([]);
    const liked = likes.filter(like => like.userId == currentUser?.id)[0] ? true : false;
    const [loading, setLoading] = useState(false);

    const openPostDetails = () => {
        if (!showMoreIcon) {
            return null;
        }
        router.push({
            pathname: '/(main)/postDetails', // Path to your modal screen
            params: {
                postId: item?.id, // Passing the postId as a parameter
            },
        });
    }

    const onLike = async () => {
        let newLikes = [...likes];
        if (liked) {
            newLikes = newLikes.filter(like => like.userId !== currentUser?.id);
            setLikes(newLikes);

            let res = await removePostLike(item?.id, currentUser?.id);
            let updateScoreRes = await updateUserScore(item?.user?.id , removeLikeScore);
            if (!res.success) {
                Alert.alert('Post', "Couldn't unlike the post!");
            }
        } else {
            const data = {
                userId: currentUser?.id,
                postId: item?.id,
            };

            newLikes.push(data);
            setLikes(newLikes);

            let res = await createPostLike(data);
            let updateScoreRes = await updateUserScore(item?.user?.id , addLikeScore);
            if (!res.success) {
                Alert.alert('Post', "Couldn't like the post!");
            }


        }
    }

    const onShare = async () => {
        let content = { message: stripHtmlTags(item?.body) };
        if (item?.file) {
            setLoading(true);
            let url = await downloadFile(getSupabaseFileUri(item?.file).uri);
            setLoading(false);
            content.url = url;
            console.log('downloading ...');
        }

        console.log(content);
        Share.share(content);
    }

    const handlePostDelete = () => {
        Alert.alert('Confirm', "Are you sure you want to delete the comment?", [
            {
                text: 'Cancel',
                onPress: () => console.log('cancelled'),
                style: 'cancel'
            },
            {
                text: 'Delete',
                onPress: () => onDelete(item),
                style: 'destructive'
            }
        ])
    }

    return (
        <View style={[styles.container, hasShadow && shadowStyles]}>
            <View style={styles.header}>
                {/* user info and post time */}
                <View style={styles.userInfo}>
                    <Avatar
                        size={hp(4.5)}
                        uri={item?.user?.image}
                        rounded={theme.radius.md}
                    />

                    <View style={{ gap: 2 }}>
                        <Text style={styles.username}>
                            {item?.user?.name}
                        </Text>
                        <Text style={styles.postTime}>{createdAt}</Text>
                    </View>
                </View>
                {
                    showMoreIcon && (
                        <TouchableOpacity onPress={openPostDetails}>
                            <Icon name="threeDotsHorizontal" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
                        </TouchableOpacity>
                    )
                }

                {
                    showDelete && currentUser.id == item?.userId && (
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => onEdit(item)}>
                                <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handlePostDelete}>
                                <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
                            </TouchableOpacity>
                        </View>
                    )
                }

            </View>

            {/* post body and media */}

            <View style={styles.content}>
                <View style={styles.postBody}>
                    <Text>
                        {
                            item?.body && (
                                <RenderHTML contentWidth={wp(100)}
                                    source={{ html: item?.body }}
                                    tagsStyles={tagsStyles}
                                />
                            )
                        }
                    </Text>
                </View>

                {/* post image */}
                {
                    item?.file && item?.file?.includes('postImages') && (
                        <Image
                            source={getSupabaseFileUri(item?.file)}
                            transition={100}
                            style={styles.postMedia}
                            contentFit='cover'
                        />
                    )
                }

                {/* post Video */}

                {
                    item?.file && item?.file?.includes('postVideos') && (
                        <Video 
                            style = {[styles.postMedia , {height : hp(30)}]}
                            source={getSupabaseFileUri(item?.file)}
                            useNativeControls
                            resizeMode='cover'
                            isLooping
                        />
                    )
                }
            </View>

            {/* like , comment & share */}
            <View style={styles.footer}>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onLike}>
                        <Icon name="heart" size={24} fill={liked ? theme.colors.rose : 'transparent'} color={liked ? theme.colors.rose : theme.colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.count}>
                        {
                            likes?.length
                        }
                    </Text>
                </View>

                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={openPostDetails}>
                        <Icon name="comment" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.count}>
                        {
                            item?.comments[0].count
                        }
                    </Text>
                </View>

                <View style={styles.footerButton}>
                    {
                        loading ? (
                            <Loading size='small' />
                        ) : (
                            <TouchableOpacity onPress={onShare}>
                                <Icon name="share" size={24} />
                            </TouchableOpacity>
                        )
                    }

                </View>
            </View>
        </View>
    )
}

export default PostCard

const styles = StyleSheet.create({
    postMedia: {
        height: hp(40),
        width: '100%',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
    },
    postBody: {
        marginLeft: 5,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    footerButton: {
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    count: {
        color: theme.colors.text,
        fontSize: hp(1.8),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    username: {
        fontSize: hp(1.7),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium,
    },
    postTime: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium,
    },
    content: {
        gap: 10,
    },
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: theme.radius.xxl * 1.1,
        borderCurve: 'continuous',
        padding: 10,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: theme.colors.gray,
        shadowColor: '#000'
    }
})