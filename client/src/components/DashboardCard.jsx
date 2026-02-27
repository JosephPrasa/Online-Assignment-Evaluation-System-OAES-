import React from 'react';

const DashboardCard = ({ title, value, icon, color, bgColor }) => {
    return (
        <div className="col-xl-3 col-md-6 mb-4">
            <div className="bento-widget h-100 p-4">
                <div className="widget-header mb-3">
                    <div className="title-icon" style={{ backgroundColor: bgColor || '#f1f5f9', color: color || '#2563eb' }}>
                        <i className={`bi ${icon}`}></i>
                    </div>
                </div>
                <div>
                    <div className="metric-large-command mt-0" style={{ fontSize: '2.2rem' }}>{value}</div>
                    <div className="metric-subtitle-command text-uppercase" style={{ letterSpacing: '0.05em' }}>
                        {title}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
