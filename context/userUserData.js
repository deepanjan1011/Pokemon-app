import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import {useState} from 'react';

export const useUserData = () => {
    const {user} = useUser();
    const [userDetails, setUserDetails] = useState(null);
    const fetchUserDetails = async() => {
        if(!user) return;

        try {
            const res = await axios.get(`/api/user/${user.sub}`);
            setUserDetails(res.data);

        } catch (error) {
            console.log("Error in fetchUserDetails", error);
            
        }
    }


    const perfomAction = async(userId, pokemon, action) => {
        setUserDetails((prev) => {
            const updatedBookmarks =
              action === "bookmark"
                ? prev.bookmarks.includes(pokemon) // Is it already bookmarked?
                  ? prev.bookmarks.filter((p) => p !== pokemon) // if yes then remove it
                  : [...prev.bookmarks, pokemon] // if no then add it
                : prev.bookmarks; // no change in bookmarks
    
            const updatedLikes =
              action === "like"
                ? prev.liked.includes(pokemon) // Is it already liked?
                  ? prev.liked.filter((p) => p !== pokemon) // if yes then remove it
                  : [...prev.liked, pokemon] // if no then add it
                : prev.liked; // no change in likes
    
            return {
              ...prev,
              bookmarks: updatedBookmarks,
              liked: updatedLikes,
            };
          });
        try {
            await axios.post("/api/pokemon",{
                userId,
                pokemon,
                action,
            });
        } catch (error) {
            console.log("Error in performAction", error);
            fetchUserDetails(userId);
        }
    };
    console.log("userDetails", userDetails);
    
    return {userDetails, perfomAction, fetchUserDetails};
};