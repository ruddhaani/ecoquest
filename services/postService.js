import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
    try {
        if(post.file && typeof post.file == 'object'){
            let folderName = 'postImages';

            let fileResult = await uploadFile(folderName , post?.file.uri);

            if(fileResult.success){
                post.file = fileResult.data;
            }else{
                return fileResult;
            }
        }

        const {data , error} = await supabase
        .from('posts')
        .upsert(post)
        .select()
        .single();

        if(error){
            return {success : false , msg : 'Could not create your post!'};
        }

        return {success : true , msg : 'Successfully posted!'};
    } catch (error) {
        return {success : false , msg : 'Could not create your post!'};
    }
}

export const fetchPosts = async (limit=10) => {
    try {
       const {data, error} = await supabase
       .from('posts')
       .select(`
            *,
            user: users (id , name , image),
            postLikes (*),
            comments (count)
        `)
       .order('created_at' , {ascending: false})
       .limit(limit);

       if(error){
        return {success : false , msg : 'Could not fetch the posts!'};            
       }
       return {success : true , data : data};
    } catch (error) {
        return {success : false , msg : 'Could not fetch the posts!'};
    }
}

export const fetchSinglePost = async (postId) => {
    try {
       const {data, error} = await supabase
       .from('posts')
       .select(`
            *,
            user: users (id , name , image),
            postLikes (*),
            comments (*, user: users(id , name , image))
        `)
       .eq('id' , postId)
       .order('created_at' , {ascending : false , foreignTable: 'comments'})
       .single();

       if(error){
        return {success : false , msg : 'Could not fetch the details of posts!'};            
       }
       return {success : true , data : data};
    } catch (error) {
        return {success : false , msg : 'Could not fetch the details of posts!'};
    }
}

export const createPostLike = async (postLike) => {
    try {
       
       const {data , error} = await supabase
       .from('postLikes')
       .insert(postLike)
       .select()
       .single(); 

       if(error){
        return {success : false , msg : 'Could not like the post!'};            
       }
       return {success : true , data : data};
    } catch (error) {
        return {success : false , msg : 'Could not like the post!'};
    }
}

export const removePostLike = async (postId , userId) => {
    try {
       
       const {error} = await supabase
       .from('postLikes')
       .delete()
       .eq('userId' , userId)
       .eq('postId' , postId);

       if(error){
        return {success : false , msg : 'Could not remove the post like!'};            
       }
       return {success : true};
    } catch (error) {
        return {success : false , msg : 'Could not remove the post like!'};
    }
}

export const createComment = async (comment) => {
    try {
       
       const {data , error} = await supabase
       .from('comments')
       .insert(comment)
       .select()
       .single(); 

       if(error){
        return {success : false , msg : 'Could not create your comment!'};            
       }
       return {success : true , data : data};
    } catch (error) {
        return {success : false , msg : 'Could not create your comment!'};
    }
}

export const removeComment = async (commentId) => {
    try {
       
       const {error} = await supabase
       .from('comments')
       .delete()
       .eq('id' , commentId);
       

       if(error){
        return {success : false , msg : 'Could not remove the comment!'};            
       }
       return {success : true , data : {commentId}};
    } catch (error) {
        return {success : false , msg : 'Could not remove the comment!'};
    }
}
