import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useState, useEffect } from "react";

export const useUserData = () => {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState(() => {
    // Initialize from localStorage if available
    const savedDetails = localStorage.getItem('userDetails');
    return savedDetails ? JSON.parse(savedDetails) : null;
  });

  const fetchUserDetails = async () => {
    if (!user) return;

    try {
      const res = await axios.get(`/api/user/${user.sub}`);
      const userData = res.data;
      setUserDetails(userData);
      // Persist the data in localStorage
      localStorage.setItem('userDetails', JSON.stringify(userData));
    } catch (error) {
      console.log("Error in fetchUserDetails", error);
    }
  };

  const performAction = async (userId, pokemon, action) => {
    try {
      setUserDetails((prev) => {
        if (!prev) {
          return {
            bookmarks: [],
            liked: [],
          };
        }

        const updatedBookmarks =
          action === "bookmark"
            ? prev.bookmarks.includes(pokemon)
              ? prev.bookmarks.filter((p) => p !== pokemon)
              : [...prev.bookmarks, pokemon]
            : prev.bookmarks;

        const updatedLikes =
          action === "like"
            ? prev.liked.includes(pokemon)
              ? prev.liked.filter((p) => p !== pokemon)
              : [...prev.liked, pokemon]
            : prev.liked;

        // Persist the updated user details to localStorage
        localStorage.setItem('userDetails', JSON.stringify({
          ...prev,
          bookmarks: updatedBookmarks,
          liked: updatedLikes,
        }));

        return {
          ...prev,
          bookmarks: updatedBookmarks,
          liked: updatedLikes,
        };
      });

      await axios.post("/api/pokemon", { userId, pokemon, action });
    } catch (error) {
      console.log("Error in performAction", error);
      fetchUserDetails(userId);
    }
  };

  useEffect(() => {
    if (!userDetails) {
      fetchUserDetails();
    }
  }, [user, userDetails]);

  return { userDetails, performAction, fetchUserDetails };
};
