import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
    try {
        if(post.file && typeof post.file == 'object'){
            let isImage = post?.file?.type == 'image';
            let folderName = isImage ? 'postImages' : 'postVideos';

            let fileResult = await uploadFile(folderName , post?.file.uri , isImage);

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

        return {success : true , data : data};
    } catch (error) {
        return {success : false , msg : 'Could not create your post!'};
    }
}

export const fetchPosts = async (limit = 10, userId) => {
    try {
      console.log(`Fetching posts for user: ${userId} with limit: ${limit}`);
  
      let query = supabase
        .from("posts")
        .select(
          `
           *,
           user: users (id, name, image),
           postLikes (*),
           comments (count)
         `
        )
        .order("created_at", { ascending: false })
        .limit(limit);
  
      if (userId) {
        query = query.eq("userId", userId);
      }
  
      const { data, error } = await query;
      console.log("Fetched data:", data);
  
      if (error) {
        console.error("Fetch error:", error);
        return { success: false, msg: "Could not fetch the posts!" };
      }
  
      return { success: true, data };
    } catch (error) {
      console.error("Catch block error:", error);
      return { success: false, msg: "Could not fetch the posts!" };
    }
  };
  

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

export const removePost = async (postId) => {
    try {
       
       const {error} = await supabase
       .from('posts')
       .delete()
       .eq('id' , postId);

       if(error){
        return {success : false , msg : 'Could not remove the post!'};            
       }
       return {success : true};
    } catch (error) {
        return {success : false , msg : 'Could not remove the post!'};
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
