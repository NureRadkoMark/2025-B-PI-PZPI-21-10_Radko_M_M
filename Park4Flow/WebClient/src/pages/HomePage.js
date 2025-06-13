import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiMapPin, FiClock, FiDollarSign, FiShield, FiPieChart, FiUsers, FiSmartphone, FiDatabase } from 'react-icons/fi';
import '../styles/HomePage.css';

const FeatureCard = ({ icon, title, description }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView();

    React.useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 50 }
            }}
            transition={{ duration: 0.5 }}
            className="feature-card"
        >
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
        </motion.div>
    );
};

const HomePage = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView();

    React.useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Revolutionizing Parking Management
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="hero-subtitle"
                    >
                        Smart, efficient, and user-friendly parking solutions for modern cities and businesses
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <button className="btn btn-primary">Request Demo</button>
                        <button className="btn btn-secondary">Learn More</button>
                    </motion.div>
                </div>
                <motion.div
                    className="hero-image"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <img src={'client/public/icons/placeholder.png'} alt="Parking system dashboard" />
                </motion.div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={controls}
                    variants={{
                        visible: { opacity: 1, y: 0 },
                        hidden: { opacity: 0, y: 50 }
                    }}
                    transition={{ duration: 0.5 }}
                    className="about-content"
                >
                    <h2>About Park4Flow</h2>
                    <p>
                        Park4Flow is a comprehensive parking management system designed to optimize parking operations,
                        enhance user experience, and maximize revenue. Our solution combines cutting-edge
                        technology with intuitive design to deliver the most advanced parking management platform.
                    </p>
                    <div className="stats-container">
                        <div className="stat-item">
                            <h3>250+</h3>
                            <p>Clients Worldwide</p>
                        </div>
                        <div className="stat-item">
                            <h3>1M+</h3>
                            <p>Daily Transactions</p>
                        </div>
                        <div className="stat-item">
                            <h3>99.9%</h3>
                            <p>System Uptime</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>Key Features</h2>
                <div className="features-grid">
                    <FeatureCard
                        icon={<FiMapPin size={32} />}
                        title="Real-Time Monitoring"
                        description="Track parking space availability in real-time with our advanced sensors and cameras."
                    />
                    <FeatureCard
                        icon={<FiClock size={32} />}
                        title="Automated Billing"
                        description="Seamless payment processing with multiple payment options and automated receipts."
                    />
                    <FeatureCard
                        icon={<FiDollarSign size={32} />}
                        title="Revenue Optimization"
                        description="Dynamic pricing models to maximize your parking revenue during peak hours."
                    />
                    <FeatureCard
                        icon={<FiShield size={32} />}
                        title="Security Integration"
                        description="Integrated security features including license plate recognition and surveillance."
                    />
                    <FeatureCard
                        icon={<FiPieChart size={32} />}
                        title="Advanced Analytics"
                        description="Comprehensive reports and analytics to help you make data-driven decisions."
                    />
                    <FeatureCard
                        icon={<FiUsers size={32} />}
                        title="Customer Management"
                        description="Loyalty programs and customer relationship tools to enhance user experience."
                    />
                </div>
            </section>

            {/* Product Showcase */}
            <section className="product-section">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="product-image"
                >
                    <img src={'client/public/icons/placeholder.png'} alt="Park4Flow dashboard" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="product-content"
                >
                    <h2>Powerful Management Dashboard</h2>
                    <p>
                        Our intuitive dashboard gives you complete control over your parking operations.
                        Monitor occupancy, manage reservations, adjust pricing, and generate reports - all from one centralized platform.
                    </p>
                    <ul className="feature-list">
                        <li>Real-time parking space monitoring</li>
                        <li>Automated alerts and notifications</li>
                        <li>Customizable reporting tools</li>
                        <li>Staff management and permissions</li>
                        <li>Integration with third-party systems</li>
                    </ul>
                </motion.div>
            </section>

            {/* Mobile App Section */}
            <section className="mobile-section">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mobile-content"
                >
                    <h2>Mobile Experience</h2>
                    <p>
                        The Park4Flow mobile app puts parking management in the palm of your hand.
                        Drivers can find, reserve, and pay for parking effortlessly, while operators
                        can manage facilities on the go.
                    </p>
                    <div className="app-features">
                        <div className="app-feature">
                            <FiSmartphone size={24} />
                            <span>Find available parking spots</span>
                        </div>
                        <div className="app-feature">
                            <FiClock size={24} />
                            <span>Extend parking time remotely</span>
                        </div>
                        <div className="app-feature">
                            <FiDollarSign size={24} />
                            <span>Multiple payment options</span>
                        </div>
                        <div className="app-feature">
                            <FiDatabase size={24} />
                            <span>Parking history and receipts</span>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mobile-image"
                >
                    <img src={'/icons/MobileApp.png'} alt="Park4Flow mobile app" />
                </motion.div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="cta-content"
                >
                    <h2>Ready to Transform Your Parking Operations?</h2>
                    <p>
                        Join hundreds of businesses and municipalities that trust Park4Flow for their parking management needs.
                    </p>
                    <button className="btn btn-primary">Get Started Today</button>
                </motion.div>
            </section>
        </div>
    );
};

export default HomePage;