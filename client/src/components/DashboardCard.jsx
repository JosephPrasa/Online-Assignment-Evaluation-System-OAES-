import React from 'react';

const DashboardCard = ({ title, value, icon, color, bgColor }) => {
    return (
        <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100 transition-hover" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                                width: '52px',
                                height: '52px',
                                backgroundColor: bgColor || '#f8fafc',
                                color: color || '#2563eb'
                            }}
                        >
                            <i className={`bi ${icon}`} style={{ fontSize: '1.5rem' }}></i>
                        </div>
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">{value}</h4>
                        <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>
                            {title}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
