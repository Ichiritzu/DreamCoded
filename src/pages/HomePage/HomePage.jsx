import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css'; // These imports can be moved to App.js if you prefer
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HomePage.css';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

const CarouselRow = ({ title, filter }) => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    // Simplified loading state logic
    useEffect(() => {
        setLoading(true);
        const apiUrl = `https://dreamcoded.com/api.php?limit=12&filter=${filter}&t=${Date.now()}`;
        fetch(apiUrl)
            .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
            .then((data) => {
                setApps(data.projects || []);
            })
            .catch(() => { /* Handle error if needed */ })
            .finally(() => setLoading(false));
    }, [filter]);

    const getAvatarSrc = (app) => {
        if (app.author_avatar_url) {
            return `https://dreamcoded.com${app.author_avatar_url}?v=${Date.now()}`;
        } else {
            return `https://ui-avatars.com/api/?name=${app.author}&background=161b22&color=c9d1d9&size=24`;
        }
    };

    return (
        <section className="carousel-section-wrapper">
            <h2 className="carousel-section-title">{title}</h2>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={1.25}
                centeredSlides={true}
                pagination={{ clickable: true }}
                navigation={true}
                breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 20, centeredSlides: false },
                    1024: { slidesPerView: 3, spaceBetween: 30, centeredSlides: false },
                }}
                className="mySwiper"
            >
                {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                        <SwiperSlide key={idx}><SkeletonCard /></SwiperSlide>
                    ))
                ) : (
                    apps.map((app) => (
                        <SwiperSlide key={app.id}>
                            {/* NEW CARD STRUCTURE: The entire card is one link */}
                            <Link to={`/project/${app.id}`} className="card">
                                <div className="card-image-container">
                                    <img src={app.image_url} alt={app.title} loading="lazy" className="card-image" />
                                    <div className="card-hover-overlay">
                                        <span>View Project</span>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{app.title}</h3>
                                    <div className="card-footer">
                                        <div className="card-author">
                                            <img 
                                                src={getAvatarSrc(app)} 
                                                alt={app.author} 
                                                className="card-avatar"
                                            />
                                            <span>{app.author}</span>
                                        </div>
                                        <div className="card-stats">
                                            <span>❤️ {app.total_likes}</span>
                                            <span>👁️ {app.total_views}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))
                )}
            </Swiper>
        </section>
    );
};


const HomePage = () => {
    return (
        <div className="dc-page">
            <section className="dc-hero">
                <h1 className="dc-title">DreamCoded</h1>
                <p className="dc-sub">Where digital dreams become interactive reality.</p>
            </section>
            
            <div className="page-content-wrapper">
                <CarouselRow title="Trending Projects" filter="trending" />
                <CarouselRow title="Newest Submissions" filter="newest" />
            </div>
        </div>
    );
};

export default HomePage;