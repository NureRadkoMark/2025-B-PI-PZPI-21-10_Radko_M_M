import React, { useEffect, useRef, useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { getLocalizedString } from '../locale/lang';
import '../styles/Footer.css';

const Footer = () => {
    const footerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const language = localStorage.getItem('language') || 'en';

    useEffect(() => {
        const handleScroll = async () => {
            setIsVisible(window.pageYOffset > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            checkFooterPosition();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        checkFooterPosition();
    }, []);

    const checkFooterPosition = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const bodyHeight = document.body.scrollHeight;
        const footerHeight = footerRef.current?.clientHeight || 0;
        const contentHeight = Math.max(documentHeight, bodyHeight) - footerHeight;
        setIsVisible(contentHeight > windowHeight || window.pageYOffset > 0);
    };

    return (
        <footer ref={footerRef} className={`footer ${isVisible ? '' : 'sticky'}`}>
            <div className="footer-content">
                <div className="footer-left">
                    <p>{getLocalizedString(language, "FollowUs")}</p>
                    <div className="social-icons">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                    </div>
                </div>

                <div className="footer-links">
                    <div className="footer-columns">
                        <ul>
                            <li><a href="/privacy-policy">{getLocalizedString(language, "PrivacyPolicy")}</a></li>
                            <li><a href="/terms-of-use">{getLocalizedString(language, "TermsOfUse")}</a></li>
                            <li><a href="/faq">{getLocalizedString(language, "FAQ")}</a></li>
                        </ul>
                        <ul>
                            <li><a href="/support">{getLocalizedString(language, "Support")}: mark.radko@nure.ua</a></li>
                            <li><a href="/contact">{getLocalizedString(language, "ContactUs")}</a></li>
                            <li><a href="/about-us">{getLocalizedString(language, "About")}</a></li>
                            <li><a href="/report">{getLocalizedString(language, "ReportProblem")}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-right">
                    <p>{getLocalizedString(language, "CreatedBy")} Mark Radko</p>
                    <p>&copy; {new Date().getFullYear()} Park4Flow</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
