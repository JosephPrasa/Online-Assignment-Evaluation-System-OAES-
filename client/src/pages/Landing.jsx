import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Landing = () => {
    const user = authService.getCurrentUser();

    return (
        <div className="landing-page position-relative overflow-hidden bg-light" style={{ minHeight: '100vh' }}>
            {/* Hero Section */}
            <div className="container py-5 mt-5">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6">
                        <h1 className="display-3 fw-bold mb-4 text-dark anim-fade-in">
                            Online Assignment <br />
                            <span className="text-primary">Evaluation System</span>
                        </h1>
                        <p className="lead mb-5 text-muted anim-slide-up">
                            A comprehensive platform for students to submit assignments and faculty to evaluate them with ease. Streamlining academics through technology.
                        </p>
                        <div className="d-grid gap-3 d-sm-flex justify-content-sm-start">
                            {user ? (
                                <Link
                                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'}
                                    className="btn btn-primary btn-lg px-4 gap-3 shadow-sm"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-primary btn-lg px-4 gap-3 shadow-sm">
                                        Login to Portal
                                    </Link>
                                    <button className="btn btn-outline-secondary btn-lg px-4 border-2">
                                        Learn More
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="col-lg-6 d-none d-lg-block">
                        <div className="position-relative">
                            <img
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                alt="Students working"
                                className="img-fluid rounded-4 shadow-lg anim-float"
                                style={{ transform: 'rotate(2deg)' }}
                            />
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10 rounded-4" style={{ transform: 'translate(-15px, 15px)', zIndex: -1 }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-5 mt-5 border-top">
                <div className="container py-5">
                    <div className="row g-4 text-center">
                        <div className="col-md-4">
                            <div className="p-4 rounded-3 hover-shadow-lg transition-all border">
                                <i className="bi bi-cloud-upload text-primary display-4 mb-3 d-block"></i>
                                <h3 className="h4 mb-3">Easy Submission</h3>
                                <p className="text-muted">Students can upload assignments in various formats securely and quickly.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-4 rounded-3 hover-shadow-lg transition-all border">
                                <i className="bi bi-check2-circle text-primary display-4 mb-3 d-block"></i>
                                <h3 className="h4 mb-3">Fast Evaluation</h3>
                                <p className="text-muted">Faculty can review, grade, and provide detailed feedback in real-time.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-4 rounded-3 hover-shadow-lg transition-all border">
                                <i className="bi bi-graph-up text-primary display-4 mb-3 d-block"></i>
                                <h3 className="h4 mb-3">Progress Tracking</h3>
                                <p className="text-muted">Comprehensive reports and dashboards to track academic growth.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .anim-fade-in { animation: fadeIn 1s ease-out; }
                .anim-slide-up { animation: slideUp 0.8s ease-out; }
                .anim-float { animation: floating 3s ease-in-out infinite; }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes floating {
                    0% { transform: translateY(0px) rotate(2deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(2deg); }
                }

                .transition-all { transition: all 0.3s ease; }
                .hover-shadow-lg:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.175); }
            `}</style>
        </div>
    );
};

export default Landing;
