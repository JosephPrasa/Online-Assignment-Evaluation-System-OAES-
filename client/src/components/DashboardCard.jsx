import React from 'react';

const DashboardCard = ({ title, value, icon, color, bgColor, details }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div className="col-xl-3 col-md-6 mb-4">
            <div
                className="card border-0 shadow-sm h-100 transition-hover overflow-hidden position-relative"
                style={{ borderRadius: '16px', cursor: details ? 'pointer' : 'default' }}
                onMouseEnter={() => details && setIsHovered(true)}
                onMouseLeave={() => details && setIsHovered(false)}
            >
                {/* Primary Decorative Background Circle */}
                <div
                    style={{
                        position: 'absolute',
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        backgroundColor: color || '#2563eb',
                        opacity: isHovered ? '0.12' : '0.06',
                        top: '-40px',
                        right: '-40px',
                        zIndex: 0,
                        transition: 'all 0.5s ease'
                    }}
                />
                {/* Secondary Decorative Background Circle */}
                <div
                    style={{
                        position: 'absolute',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: color || '#2563eb',
                        opacity: isHovered ? '0.08' : '0.04',
                        bottom: '-20px',
                        left: '-20px',
                        zIndex: 0,
                        transition: 'all 0.5s ease'
                    }}
                />

                <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
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
                            <i className={`bi ${icon} animate__animated animate__pulse animate__infinite`} style={{ fontSize: '1.5rem', animationDuration: '3s' }}></i>
                        </div>
                    </div>

                    <div className="position-relative overflow-hidden" style={{ height: '50px' }}>
                        <div
                            className="transition-all"
                            style={{
                                transform: isHovered && details ? 'translateY(-100%)' : 'translateY(0)',
                                opacity: isHovered && details ? 0 : 1,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <h4 className="fw-bold mb-1 text-dark">{value}</h4>
                            <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>
                                {title}
                            </p>
                        </div>

                        {details && (
                            <div
                                className="position-absolute top-0 w-100 transition-all"
                                style={{
                                    transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div className="d-flex justify-content-between gap-1 mt-1">
                                    {Object.entries(details).map(([key, val]) => (
                                        <div key={key} className="text-center">
                                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{val}</div>
                                            <div className="text-muted extra-small fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>{key}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
