import { useQuery } from '@tanstack/react-query';
import { fetchTMDB } from '../api/tmdbClient';
import { MOOD_MOVIES } from '../data/moodData';

export const useMovieDetail = (id, type = 'movie') => {
    // 1. Fetch Movie Details, Credits, and Videos
    const { data: movie, isLoading: loadingMovie, error: movieError } = useQuery({
        queryKey: [type, id],
        queryFn: async () => {
            // Check local first
            const local = MOOD_MOVIES.find(m => m.id === Number(id));
            if (local) return local;

            const [details, credits, videosRes, imagesRes, reviewsRes, releaseRes] = await Promise.all([
                fetchTMDB(`/${type}/${id}`),
                fetchTMDB(`/${type}/${id}/credits`),
                fetchTMDB(`/${type}/${id}/videos`),
                fetchTMDB(`/${type}/${id}/images?include_image_language=en,null`),
                fetchTMDB(`/${type}/${id}/reviews`),
                fetchTMDB(`/${type}/${id}/${type === 'movie' ? 'release_dates' : 'content_ratings'}`),
            ]);

            if (!details) throw new Error(`${type} not found`);

            // Extract director
            const director = credits?.crew?.find(member => member.job === 'Director')
                || credits?.crew?.find(member => member.department === 'Directing');

            // Extract official YouTube trailer
            const trailer = videosRes?.results?.find(
                vid => vid.site === 'YouTube' && vid.type === 'Trailer'
            );

            // Extract US Certification
            let certification = null;
            if (type === 'movie') {
                const usRelease = releaseRes?.results?.find(r => r.iso_3166_1 === 'US');
                certification = usRelease?.release_dates?.find(rd => rd.certification)?.certification;
            } else {
                const usRating = releaseRes?.results?.find(r => r.iso_3166_1 === 'US');
                certification = usRating?.rating;
            }

            return {
                ...details,
                cast: (credits?.cast || []).slice(0, 20),
                director: director?.name || null,
                trailerKey: trailer?.key || null,
                backdrops: imagesRes?.backdrops?.slice(0, 15) || [],
                reviews: reviewsRes?.results?.slice(0, 3) || [],
                certification: certification || (details.adult ? 'R' : 'PG-13'),
            };
        },
        enabled: !!id, // Only run if ID exists
    });

    // 2. Fetch Similar Movies
    const { data: similar = [] } = useQuery({
        queryKey: ['similar', type, id],
        queryFn: async () => {
            const data = await fetchTMDB(`/${type}/${id}/similar`);
            return data?.results?.slice(0, 12) || [];
        },
        enabled: !!id,
    });

    return {
        movie,
        similar,
        loading: loadingMovie,
        error: movieError ? movieError.message : null
    };
};
