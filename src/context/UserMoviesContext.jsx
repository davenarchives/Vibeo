import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const UserMoviesContext = createContext();

export const UserMoviesProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const [totalWatchTime, setTotalWatchTime] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setWatchlist([]);
            setContinueWatching([]);
            setTotalWatchTime(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        const userRef = doc(db, 'users', currentUser.uid);

        // REAL-TIME LISTENER
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setWatchlist(data.watchlist || []);
                setContinueWatching(data.continueWatching || []);
                setTotalWatchTime(data.totalWatchTime || 0);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user movies:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Helper functions (copied and adapted from the former hook)

    const addToWatchlist = async (movie, status = 'planning') => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const movieWithStatus = {
                ...movie,
                status,
                genre_ids: movie.genre_ids || []
            };
            await updateDoc(userRef, {
                watchlist: arrayUnion(movieWithStatus)
            });
            return true;
        } catch (error) {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const movieWithStatus = {
                    ...movie,
                    status,
                    genre_ids: movie.genre_ids || []
                };
                await setDoc(userRef, { watchlist: arrayUnion(movieWithStatus) }, { merge: true });
                return true;
            } catch (innerError) {
                console.error("Error adding to watchlist:", innerError);
                return false;
            }
        }
    };

    const removeFromWatchlist = async (movie) => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const exactMovie = watchlist.find(m => m.id === movie.id);
            if (!exactMovie) return false;

            await updateDoc(userRef, {
                watchlist: arrayRemove(exactMovie)
            });
            return true;
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            return false;
        }
    };

    const isWatchlisted = (movieId) => {
        return watchlist.some(m => m.id === Number(movieId));
    };

    const getWatchlistStatus = (movieId) => {
        const movie = watchlist.find(m => m.id === Number(movieId));
        return movie ? movie.status : null;
    };

    const updateWatchlistStatus = async (movie, newStatus) => {
        if (!currentUser) return false;

        const simpleMovie = {
            id: movie.id,
            title: movie.title || movie.name,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date || movie.first_air_date,
            genre_ids: movie.genre_ids || []
        };

        const existingMovie = watchlist.find(m => m.id === Number(movie.id));

        if (existingMovie) {
            if (existingMovie.status === newStatus) return true;
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    watchlist: arrayRemove(existingMovie)
                });

                const updatedMovie = { ...simpleMovie, status: newStatus };
                await updateDoc(userRef, {
                    watchlist: arrayUnion(updatedMovie)
                });
                return true;
            } catch (error) {
                console.error("Error updating watchlist status:", error);
                return false;
            }
        } else {
            return await addToWatchlist(simpleMovie, newStatus);
        }
    };

    const toggleWatchlist = async (movie) => {
        if (!movie) return false;
        const simpleMovie = {
            id: movie.id,
            title: movie.title || movie.name,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date || movie.first_air_date,
            genre_ids: movie.genre_ids || []
        };

        if (isWatchlisted(movie.id)) {
            return await removeFromWatchlist(simpleMovie);
        } else {
            return await addToWatchlist(simpleMovie, 'planning');
        }
    };

    const addToContinueWatching = async (movie) => {
        if (!currentUser || !movie) return;
        const simpleMovie = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            timestamp: Date.now()
        };

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            let currentList = userSnap.exists() ? (userSnap.data().continueWatching || []) : [];
            currentList = currentList.filter(m => m.id !== movie.id);
            currentList.unshift(simpleMovie);
            if (currentList.length > 20) currentList = currentList.slice(0, 20);
            await setDoc(userRef, { continueWatching: currentList }, { merge: true });
        } catch (error) {
            console.error("Error adding to continue watching:", error);
        }
    };

    const removeFromContinueWatching = async (movieId) => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const newList = continueWatching.filter(m => m.id !== Number(movieId));
            await updateDoc(userRef, { continueWatching: newList });
            return true;
        } catch (error) {
            console.error("Error removing from continue watching:", error);
            return false;
        }
    };

    const addWatchTime = async (seconds) => {
        if (!currentUser || typeof seconds !== 'number' || seconds <= 0) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { totalWatchTime: increment(seconds) }, { merge: true });
        } catch (error) {
            console.error("Error updating watch time:", error);
        }
    };

    const clearWatchHistory = async () => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { continueWatching: [] });
            return true;
        } catch (error) {
            console.error("Error clearing watch history:", error);
            return false;
        }
    };

    const clearWatchlist = async () => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { watchlist: [] });
            return true;
        } catch (error) {
            console.error("Error clearing watchlist:", error);
            return false;
        }
    };

    const value = {
        watchlist,
        continueWatching,
        totalWatchTime,
        loading,
        isWatchlisted,
        getWatchlistStatus,
        updateWatchlistStatus,
        toggleWatchlist,
        addToContinueWatching,
        addWatchTime,
        removeFromContinueWatching,
        clearWatchHistory,
        clearWatchlist
    };

    return (
        <UserMoviesContext.Provider value={value}>
            {children}
        </UserMoviesContext.Provider>
    );
};

export const useUserMoviesContext = () => {
    const context = useContext(UserMoviesContext);
    if (!context) {
        throw new Error('useUserMoviesContext must be used within a UserMoviesProvider');
    }
    return context;
};
