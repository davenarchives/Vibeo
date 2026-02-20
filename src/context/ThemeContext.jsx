import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default to 'default' (VibeReel) or read from localStorage
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('vibereel-theme') || 'default';
    });

    useEffect(() => {
        // Persist to localStorage
        localStorage.setItem('vibereel-theme', theme);

        // Apply to body for CSS selectors
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const value = {
        theme,
        setTheme,
        availableThemes: [
            { id: 'default', name: 'VibeReel' },
            { id: 'ocean', name: 'Ocean' },
            { id: 'crimson', name: 'Crimson' },
            { id: 'forest', name: 'Forest' },
            { id: 'midnight', name: 'Midnight' },
        ]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
