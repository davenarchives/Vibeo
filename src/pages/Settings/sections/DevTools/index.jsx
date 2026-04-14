import React, { useState } from 'react';
import { 
    Terminal, RotateCcw, Trash2, Power, 
    Zap, Sliders, Globe, AlertTriangle, 
    Navigation, Plus, Minus, Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserMoviesContext } from '@/context/UserMoviesContext';
import { useLayout } from '@/context/LayoutContext';
import { triggerError } from '@/components/common/ErrorToast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import './styles.css';

const DevToolsSection = () => {
    const { currentUser } = useAuth();
    const { 
        clearWatchlist, 
        clearWatchHistory, 
        activityPoints 
    } = useUserMoviesContext();
    const { 
        simulatedLatency, setSimulatedLatency,
        animationsEnabled, setAnimationsEnabled,
    } = useLayout();

    const [isResetting, setIsResetting] = useState(false);

    const handleResetOnboarding = async () => {
        if (!currentUser) return;
        if (!window.confirm("Reset onboarding status? This will wipe favorites and force re-do wizard.")) return;
        setIsResetting(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { onboarded: false, favoriteMovies: [] });
            triggerError('Onboarding reset! Redirecting...', 'success');
            setTimeout(() => window.location.href = '/onboarding', 1000);
        } catch (error) {
            triggerError('Failed to reset onboarding', 'error');
            setIsResetting(false);
        }
    };

    const handleAdjustPoints = async (amount) => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const today = new Date().toISOString().split('T')[0];
            const currentPoints = (activityPoints && activityPoints[today]) || 0;
            const newPoints = Math.max(0, currentPoints + amount);
            
            await updateDoc(userRef, {
                [`activityPoints.${today}`]: newPoints
            });
            triggerError(`Points adjusted: ${amount > 0 ? '+' : ''}${amount}`, 'success');
        } catch (error) {
            triggerError('Failed to adjust points', 'error');
        }
    };

    const handleClearLibrary = async () => {
        if (!window.confirm("Clear all Watchlist and History data?")) return;
        const s1 = await clearWatchlist();
        const s2 = await clearWatchHistory();
        if (s1 && s2) triggerError('Library wiped', 'success');
    };

    return (
        <div className="settings-section devtools-section">
            <div className="section-header">
                <h2><Terminal size={20} /> Developer Dashboard</h2>
                <p>Advanced utilities for debugging, simulation, and manual state override.</p>
            </div>

            <div className="dev-grid">
                {/* 1. Simulation Lab */}
                <div className="dev-card">
                    <div className="card-title">
                        <Sliders size={18} />
                        <h3>Simulation Lab</h3>
                    </div>
                    <div className="card-body">
                        <div className="dev-toggle-row">
                            <div className="toggle-info">
                                <strong>High Latency</strong>
                                <span>Inject 2s delay into AI & Search</span>
                            </div>
                            <button 
                                className={`dev-toggle-btn ${simulatedLatency ? 'active' : ''}`}
                                onClick={() => setSimulatedLatency(!simulatedLatency)}
                            >
                                {simulatedLatency ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <div className="dev-toggle-row">
                            <div className="toggle-info">
                                <strong>Motion FX</strong>
                                <span>Global UI animations</span>
                            </div>
                            <button 
                                className={`dev-toggle-btn ${animationsEnabled ? 'active' : ''}`}
                                onClick={() => setAnimationsEnabled(!animationsEnabled)}
                            >
                                {animationsEnabled ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Quick Navigation */}
                <div className="dev-card">
                    <div className="card-title">
                        <Navigation size={18} />
                        <h3>Fast Travel</h3>
                    </div>
                    <div className="card-body nav-pills">
                        <button onClick={() => window.location.href = '/'}>Home</button>
                        <button onClick={() => window.location.href = '/smart-search'}>Smart Search</button>
                        <button onClick={() => window.location.href = '/taste-matcher'}>Taste Matcher</button>
                        <button onClick={() => window.location.href = '/theme-store'}>Theme Store</button>
                        <button onClick={() => window.location.href = '/docs'}>API Docs</button>
                    </div>
                </div>

                {/* 3. Points & Gamification */}
                <div className="dev-card">
                    <div className="card-title">
                        <Zap size={18} />
                        <h3>State Override</h3>
                    </div>
                    <div className="card-body">
                        <div className="points-manager">
                            <div className="label">Daily Points:</div>
                            <div className="actions">
                                <button onClick={() => handleAdjustPoints(-10)}><Minus size={14} /></button>
                                <button onClick={() => handleAdjustPoints(10)}><Plus size={14} /> 10</button>
                                <button onClick={() => handleAdjustPoints(50)}><Plus size={14} /> 50</button>
                            </div>
                        </div>
                        <button className="dev-link-btn" onClick={handleResetOnboarding}>
                            <RotateCcw size={14} /> Force Fresh Onboarding
                        </button>
                    </div>
                </div>

                {/* 4. Danger Zone */}
                <div className="dev-card card-danger">
                    <div className="card-title">
                        <AlertTriangle size={18} />
                        <h3>Danger Zone</h3>
                    </div>
                    <div className="card-body">
                        <button className="dev-action-btn danger" onClick={handleClearLibrary}>
                            <Trash2 size={14} /> Clear Entire Library
                        </button>
                        <button className="dev-action-btn danger">
                            <Power size={14} /> Reset Activity & Streaks
                        </button>
                    </div>
                </div>
            </div>

            <div className="dev-card debug-card">
                <div className="card-title">
                    <Info size={18} />
                    <h3>System Environment</h3>
                </div>
                <div className="debug-grid">
                    <div className="debug-item">
                        <span className="label">User ID:</span>
                        <span className="value">{currentUser?.uid || 'anonymous'}</span>
                    </div>
                    <div className="debug-item">
                        <span className="label">Email:</span>
                        <span className="value">{currentUser?.email}</span>
                    </div>
                    <div className="debug-item">
                        <span className="label">Environment:</span>
                        <span className="value">{import.meta.env.MODE}</span>
                    </div>
                    <div className="debug-item">
                        <span className="label">Build Date:</span>
                        <span className="value">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevToolsSection;
