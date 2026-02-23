import React from 'react';

const DashboardCard = ({ title, value, icon, color, bgColor }) => {
    return (
        <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100 p-2" style={{ borderRadius: '16px' }}>
                <div className="card-body d-flex align-items-center">
                    <div>
                        <p className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.05em' }}>{title}</p>
                        <h2 className="fw-bold mb-0">{value}</h2>
                    </div>
                    <div
                        className="ms-auto rounded-3 d-flex align-items-center justify-content-center"
                        style={{ width: '54px', height: '54px', backgroundColor: bgColor || '#f8f9fa', color: color || '#0d6efd' }}
                    >
                        <i className={`bi ${icon} fs-3`}></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
