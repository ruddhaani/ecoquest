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