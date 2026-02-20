import React, { memo } from 'react';
import './styles.css';

const StatusCard = memo(({ icon, label, value, color = "rgba(168,85,247,0.18)" }) => {
    return (
        <div className="status-card">
            {/* Icon badge — background color is injected via the `color` prop */}
            <div
                className="sc-icon"
                style={{ background: color }}
                aria-hidden="true"
            >
                {icon}
            </div>

            {/* Text content */}
            <div>
                <p className="sc-label">{label}</p>
                <p className="sc-value">{value}</p>
            </div>
        </div>
    );
});

export default StatusCard;
